import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Conversation, Message } from '@/server/models/Message';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      const messages = await Message.getConversationMessages(conversationId);
      return NextResponse.json({
        success: true,
        data: messages
      });
    }

    if (userId) {
      const conversations = await Conversation.getUserConversations(userId);
      return NextResponse.json({
        success: true,
        data: conversations
      });
    }

    return NextResponse.json(
      { success: false, error: 'User ID or Conversation ID required' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { senderId, receiverId, content, conversationId, type = 'farmer-farmer' } = body;

    if (!senderId || !content) {
      return NextResponse.json(
        { success: false, error: 'Sender ID and content are required' },
        { status: 400 }
      );
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    } else if (receiverId) {
      conversation = await Conversation.findOrCreateConversation(
        [senderId, receiverId],
        type
      );
    }

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    const message = new Message({
      conversation: conversation._id,
      sender: senderId,
      content
    });

    await message.save();
    await message.populate('sender', 'name profilePicture');
    
    conversation.updateLastMessage(content, senderId);
    await conversation.save();

    return NextResponse.json({
      success: true,
      data: message
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}