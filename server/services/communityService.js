const CommunityGroup = require('../models/CommunityGroup');
const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');

class CommunityService {
  async createGroup(groupData, creatorId) {
    try {
      const group = new CommunityGroup({
        ...groupData,
        createdBy: creatorId,
        members: [{
          user: creatorId,
          role: 'admin',
          joinedAt: new Date(),
          isActive: true
        }]
      });

      await group.save();
      await group.populate('members.user', 'name profilePicture');
      return group;
    } catch (error) {
      throw new Error(`Failed to create group: ${error.message}`);
    }
  }

  async getRecommendedGroups(userId, limit = 10) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Get groups based on user's location and interests
      const locationGroups = await CommunityGroup.find({
        'location.state': user.state,
        privacy: 'public',
        isActive: true,
        'members.user': { $ne: userId }
      }).limit(5);

      // Get groups based on user's primary crop
      const cropGroups = await CommunityGroup.find({
        subcategory: user.primaryCrop,
        privacy: 'public',
        isActive: true,
        'members.user': { $ne: userId }
      }).limit(5);

      // Get trending groups
      const trendingGroups = await CommunityGroup.getTrendingGroups(5);

      const recommended = [...locationGroups, ...cropGroups, ...trendingGroups]
        .filter((group, index, self) => 
          index === self.findIndex(g => g._id.toString() === group._id.toString())
        )
        .slice(0, limit);

      return recommended;
    } catch (error) {
      throw new Error(`Failed to get recommended groups: ${error.message}`);
    }
  }

  async getFeedPosts(userId, page = 1, limit = 20) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      // Get user's groups
      const userGroups = await CommunityGroup.find({
        'members.user': userId,
        'members.isActive': true
      }).select('_id');

      const groupIds = userGroups.map(g => g._id);

      // Get posts from user's groups and location
      const posts = await CommunityPost.find({
        $or: [
          { group: { $in: groupIds } },
          { 'location.state': user.state },
          { group: null } // Public posts
        ],
        isActive: true
      })
      .populate('author', 'name profilePicture location role')
      .populate('group', 'name category')
      .populate('comments.author', 'name profilePicture')
      .sort({ createdAt: -1, score: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

      return posts;
    } catch (error) {
      throw new Error(`Failed to get feed posts: ${error.message}`);
    }
  }

  async createPost(postData, authorId) {
    try {
      const post = new CommunityPost({
        ...postData,
        author: authorId
      });

      await post.save();
      await post.populate('author', 'name profilePicture location role');
      await post.populate('group', 'name category');

      return post;
    } catch (error) {
      throw new Error(`Failed to create post: ${error.message}`);
    }
  }

  async getPostsByCategory(category, page = 1, limit = 20) {
    try {
      const posts = await CommunityPost.find({
        category,
        isActive: true
      })
      .populate('author', 'name profilePicture location')
      .populate('group', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

      return posts;
    } catch (error) {
      throw new Error(`Failed to get posts by category: ${error.message}`);
    }
  }

  async searchPosts(query, filters = {}, page = 1, limit = 20) {
    try {
      const searchQuery = {
        $text: { $search: query },
        isActive: true,
        ...filters
      };

      const posts = await CommunityPost.find(searchQuery)
        .populate('author', 'name profilePicture location')
        .populate('group', 'name')
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      return posts;
    } catch (error) {
      throw new Error(`Failed to search posts: ${error.message}`);
    }
  }

  async getTrendingPosts(timeframe = 7, limit = 10) {
    try {
      const posts = await CommunityPost.getTrending(limit, timeframe);
      
      await CommunityPost.populate(posts, [
        { path: 'author', select: 'name profilePicture location' },
        { path: 'group', select: 'name category' }
      ]);

      return posts;
    } catch (error) {
      throw new Error(`Failed to get trending posts: ${error.message}`);
    }
  }

  async getExpertAdvice(limit = 10) {
    try {
      // Get posts from users with expert role
      const expertPosts = await CommunityPost.find({
        isActive: true,
        type: { $in: ['tip', 'experience'] }
      })
      .populate({
        path: 'author',
        match: { role: 'expert' },
        select: 'name profilePicture location role expertise'
      })
      .populate('group', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

      return expertPosts.filter(post => post.author);
    } catch (error) {
      throw new Error(`Failed to get expert advice: ${error.message}`);
    }
  }

  async getGroupActivity(groupId, days = 7) {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const activity = await CommunityPost.aggregate([
        {
          $match: {
            group: groupId,
            createdAt: { $gte: since },
            isActive: true
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            posts: { $sum: 1 },
            comments: { $sum: { $size: '$comments' } },
            reactions: { $sum: { $size: '$reactions' } }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      return activity;
    } catch (error) {
      throw new Error(`Failed to get group activity: ${error.message}`);
    }
  }

  async moderatePost(postId, action, moderatorId) {
    try {
      const post = await CommunityPost.findById(postId);
      if (!post) throw new Error('Post not found');

      switch (action) {
        case 'approve':
          post.moderationStatus = 'approved';
          break;
        case 'reject':
          post.moderationStatus = 'rejected';
          post.isActive = false;
          break;
        case 'flag':
          post.moderationStatus = 'flagged';
          break;
        case 'pin':
          post.isPinned = true;
          break;
        case 'unpin':
          post.isPinned = false;
          break;
        case 'feature':
          post.isFeatured = true;
          break;
        default:
          throw new Error('Invalid moderation action');
      }

      await post.save();
      return post;
    } catch (error) {
      throw new Error(`Failed to moderate post: ${error.message}`);
    }
  }

  async getUserStats(userId) {
    try {
      const stats = await CommunityPost.aggregate([
        { $match: { author: userId, isActive: true } },
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            totalReactions: { $sum: { $size: '$reactions' } },
            totalComments: { $sum: { $size: '$comments' } },
            totalViews: { $sum: '$views' },
            resolvedQuestions: {
              $sum: { $cond: [{ $eq: ['$isResolved', true] }, 1, 0] }
            }
          }
        }
      ]);

      const userGroups = await CommunityGroup.countDocuments({
        'members.user': userId,
        'members.isActive': true
      });

      return {
        ...stats[0],
        groupsJoined: userGroups,
        helpfulnessScore: stats[0] ? Math.round(
          (stats[0].totalReactions + stats[0].resolvedQuestions * 5) / 
          Math.max(stats[0].totalPosts, 1)
        ) : 0
      };
    } catch (error) {
      throw new Error(`Failed to get user stats: ${error.message}`);
    }
  }
}

module.exports = new CommunityService();