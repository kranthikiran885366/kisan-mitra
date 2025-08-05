const express = require('express');
const AIConversation = require('../models/AIConversation');
const aiService = require('../services/aiService');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Start new conversation
router.post('/conversation/start', auth, async (req, res) => {
  try {
    const { language = 'en' } = req.body;
    const sessionId = uuidv4();
    
    const conversation = await AIConversation.createNewConversation(
      req.userId,
      sessionId,
      {
        preferences: { language },
        currentTopic: 'greeting'
      }
    );

    const welcomeMessage = await aiService.processMessage(
      'hello',
      req.userId,
      { language }
    );

    await conversation.addMessage(welcomeMessage.text, 'assistant', {
      intent: 'greeting',
      confidence: 1.0,
      language
    });

    res.json({
      success: true,
      data: {
        sessionId,
        conversationId: conversation._id,
        welcomeMessage: welcomeMessage.text,
        suggestedQuestions: await aiService.getSuggestedQuestions(req.userId, language)
      }
    });
  } catch (error) {
    console.error('Start conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start conversation',
      error: error.message
    });
  }
});

// Send message
router.post('/conversation/:sessionId/message', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, language = 'en' } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    let conversation = await AIConversation.getActiveConversation(req.userId, sessionId);
    
    if (!conversation) {
      conversation = await AIConversation.createNewConversation(
        req.userId,
        sessionId,
        { preferences: { language } }
      );
    }

    // Add user message
    await conversation.addMessage(message, 'user', { language });

    // Process with AI service
    const aiResponse = await aiService.processMessage(
      message,
      req.userId,
      {
        language,
        userProfile: conversation.context.userProfile,
        currentTopic: conversation.context.currentTopic
      }
    );

    // Add AI response
    await conversation.addMessage(aiResponse.text, 'assistant', {
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
      entities: aiResponse.entities,
      language
    });

    // Update conversation context
    conversation.context.currentTopic = aiResponse.intent;
    await conversation.save();

    res.json({
      success: true,
      data: {
        response: aiResponse.text,
        intent: aiResponse.intent,
        confidence: aiResponse.confidence,
        suggestedQuestions: await aiService.getSuggestedQuestions(req.userId, language)
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process message',
      error: error.message
    });
  }
});

// Get conversation history
router.get('/conversation/:sessionId/history', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50 } = req.query;

    const conversation = await AIConversation.getActiveConversation(req.userId, sessionId);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    const messages = conversation.messages
      .slice(-parseInt(limit))
      .map(msg => ({
        id: msg._id,
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.timestamp,
        metadata: msg.metadata
      }));

    res.json({
      success: true,
      data: {
        messages,
        context: conversation.context
      }
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversation history',
      error: error.message
    });
  }
});

// Get user's conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversations = await AIConversation.find({
      userId: req.userId,
      isActive: true
    })
    .sort({ lastActivity: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('sessionId lastActivity messages context')
    .lean();

    const formattedConversations = conversations.map(conv => ({
      sessionId: conv.sessionId,
      lastActivity: conv.lastActivity,
      messageCount: conv.messages.length,
      lastMessage: conv.messages.length > 0 ? 
        conv.messages[conv.messages.length - 1].text.substring(0, 100) + '...' : 
        'No messages',
      topic: conv.context.currentTopic || 'general'
    }));

    res.json({
      success: true,
      data: {
        conversations: formattedConversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await AIConversation.countDocuments({
            userId: req.userId,
            isActive: true
          })
        }
      }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get conversations',
      error: error.message
    });
  }
});

// Delete conversation
router.delete('/conversation/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const conversation = await AIConversation.findOneAndUpdate(
      { userId: req.userId, sessionId },
      { isActive: false },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete conversation',
      error: error.message
    });
  }
});

// Feedback on AI response
router.post('/feedback', auth, async (req, res) => {
  try {
    const { sessionId, messageId, feedback, rating } = req.body;

    const conversation = await AIConversation.findOne({
      userId: req.userId,
      sessionId,
      'messages._id': messageId
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const message = conversation.messages.id(messageId);
    if (message) {
      message.metadata.feedback = {
        rating: parseInt(rating),
        comment: feedback,
        timestamp: new Date()
      };
      await conversation.save();
    }

    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: error.message
    });
  }
});

module.exports = router;