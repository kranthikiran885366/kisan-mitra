const express = require('express');
const CommunityGroup = require('../models/CommunityGroup');
const CommunityPost = require('../models/CommunityPost');
const communityService = require('../services/communityService');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/community/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Get community feed
router.get('/feed', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category } = req.query;
    
    let posts;
    if (type === 'trending') {
      posts = await communityService.getTrendingPosts(7, parseInt(limit));
    } else if (type === 'expert') {
      posts = await communityService.getExpertAdvice(parseInt(limit));
    } else if (category) {
      posts = await communityService.getPostsByCategory(category, parseInt(page), parseInt(limit));
    } else {
      posts = await communityService.getFeedPosts(req.userId, parseInt(page), parseInt(limit));
    }

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: posts.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get community feed',
      error: error.message
    });
  }
});

// Create new post
router.post('/posts', [
  auth,
  upload.array('attachments', 5),
  [
    body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
    body('content').trim().isLength({ min: 10, max: 5000 }).withMessage('Content must be 10-5000 characters'),
    body('type').isIn(['question', 'discussion', 'tip', 'experience', 'problem', 'success_story']).withMessage('Invalid post type'),
    body('category').isIn(['crops', 'livestock', 'equipment', 'weather', 'market', 'government', 'general']).withMessage('Invalid category')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, content, type, category, tags, groupId, location, metadata } = req.body;
    
    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      url: `/uploads/community/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 
            file.mimetype.startsWith('video/') ? 'video' : 'document',
      filename: file.originalname,
      size: file.size
    })) : [];

    const postData = {
      title,
      content,
      type,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      group: groupId || null,
      location: location ? JSON.parse(location) : null,
      metadata: metadata ? JSON.parse(metadata) : {},
      attachments,
      language: req.body.language || 'en'
    };

    const post = await communityService.createPost(postData, req.userId);

    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
});

// Get single post with comments
router.get('/posts/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await CommunityPost.findById(postId)
      .populate('author', 'name profilePicture location role expertise')
      .populate('group', 'name category')
      .populate('comments.author', 'name profilePicture role')
      .populate('reactions.user', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get post',
      error: error.message
    });
  }
});

// Add reaction to post
router.post('/posts/:postId/react', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { type = 'like' } = req.body;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.addReaction(req.userId, type);

    res.json({
      success: true,
      data: {
        reactionCount: post.reactionCount,
        userReaction: post.reactions.find(r => r.user.toString() === req.userId.toString())?.type || null
      }
    });
  } catch (error) {
    console.error('React to post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to react to post',
      error: error.message
    });
  }
});

// Add comment to post
router.post('/posts/:postId/comments', [
  auth,
  upload.array('attachments', 3),
  [body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be 1-1000 characters')]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { postId } = req.params;
    const { content } = req.body;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Process attachments
    const attachments = req.files ? req.files.map(file => ({
      url: `/uploads/community/${file.filename}`,
      type: file.mimetype.startsWith('image/') ? 'image' : 
            file.mimetype.startsWith('video/') ? 'video' : 'document',
      filename: file.originalname
    })) : [];

    await post.addComment(req.userId, content, attachments);
    await post.populate('comments.author', 'name profilePicture role');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      data: newComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

// Mark comment as answer
router.post('/posts/:postId/comments/:commentId/mark-answer', auth, async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Only post author can mark answers
    if (post.author.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only post author can mark answers'
      });
    }

    await post.markAsResolved(commentId);

    res.json({
      success: true,
      message: 'Comment marked as answer'
    });
  } catch (error) {
    console.error('Mark answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark answer',
      error: error.message
    });
  }
});

// Search posts
router.get('/search', auth, async (req, res) => {
  try {
    const { q, category, type, location, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const filters = {};
    if (category) filters.category = category;
    if (type) filters.type = type;
    if (location) filters['location.state'] = location;

    const posts = await communityService.searchPosts(q, filters, parseInt(page), parseInt(limit));

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: posts.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search posts',
      error: error.message
    });
  }
});

// Get community groups
router.get('/groups', auth, async (req, res) => {
  try {
    const { category, location, search, type = 'all', page = 1, limit = 20 } = req.query;

    let groups;
    
    if (type === 'recommended') {
      groups = await communityService.getRecommendedGroups(req.userId, parseInt(limit));
    } else if (type === 'trending') {
      groups = await CommunityGroup.getTrendingGroups(parseInt(limit));
    } else if (type === 'my') {
      groups = await CommunityGroup.find({
        'members.user': req.userId,
        'members.isActive': true
      }).populate('members.user', 'name profilePicture');
    } else {
      const query = { isActive: true };
      if (category) query.category = category;
      if (location) query['location.state'] = location;
      if (search) query.name = { $regex: search, $options: 'i' };

      groups = await CommunityGroup.find(query)
        .populate('createdBy', 'name profilePicture')
        .populate('members.user', 'name profilePicture')
        .sort({ memberCount: -1, createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));
    }

    res.json({
      success: true,
      data: groups,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: groups.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get groups',
      error: error.message
    });
  }
});

// Create new group
router.post('/groups', [
  auth,
  upload.single('avatar'),
  [
    body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Group name must be 3-100 characters'),
    body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
    body('category').isIn(['crop_specific', 'location_based', 'technique_based', 'general', 'expert_led', 'disease_support']).withMessage('Invalid category')
  ]
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const groupData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      subcategory: req.body.subcategory,
      privacy: req.body.privacy || 'public',
      location: req.body.location ? JSON.parse(req.body.location) : null,
      language: req.body.language || 'mixed',
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      avatar: req.file ? `/uploads/community/${req.file.filename}` : null
    };

    const group = await communityService.createGroup(groupData, req.userId);

    res.status(201).json({
      success: true,
      data: group,
      message: 'Group created successfully'
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group',
      error: error.message
    });
  }
});

// Join group
router.post('/groups/:groupId/join', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await CommunityGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (group.isMember(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Already a member of this group'
      });
    }

    group.addMember(req.userId);
    await group.save();

    res.json({
      success: true,
      message: 'Successfully joined the group'
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to join group',
      error: error.message
    });
  }
});

// Leave group
router.post('/groups/:groupId/leave', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await CommunityGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    if (!group.isMember(req.userId)) {
      return res.status(400).json({
        success: false,
        message: 'Not a member of this group'
      });
    }

    group.removeMember(req.userId);
    await group.save();

    res.json({
      success: true,
      message: 'Successfully left the group'
    });
  } catch (error) {
    console.error('Leave group error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave group',
      error: error.message
    });
  }
});

// Get group activity
router.get('/groups/:groupId/activity', auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { days = 7 } = req.query;

    const activity = await communityService.getGroupActivity(groupId, parseInt(days));

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Get group activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get group activity',
      error: error.message
    });
  }
});

// Get user stats
router.get('/users/:userId/stats', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const stats = await communityService.getUserStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user stats',
      error: error.message
    });
  }
});

// Get trending topics
router.get('/trending', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const trendingPosts = await communityService.getTrendingPosts(7, parseInt(limit));
    
    // Extract trending tags
    const allTags = await CommunityPost.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        posts: trendingPosts,
        tags: allTags
      }
    });
  } catch (error) {
    console.error('Get trending error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get trending content',
      error: error.message
    });
  }
});

module.exports = router;