const connectDB = require('../../../mongodb');
const User = require('../../../models/User');
const Post = require('../../../models/Post');
const Comment = require('../../../models/Comment');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();
    
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if userId is a valid MongoDB ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(userId);
    
    let user;
    if (isValidObjectId) {
      // MongoDB ObjectId format
      user = await User.findById(userId);
    } else {
      // localStorage ID format (fallback to error for now)
      console.log('Invalid ObjectId format, returning error');
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user statistics
    const [totalPosts, totalComments, savedPosts, totalLikes] = await Promise.all([
      // Total posts by user
      Post.countDocuments({ author: user._id, isPublished: true }),
      
      // Total comments by user
      Comment.countDocuments({ author: user._id, isDeleted: false }),
      
      // Total saved posts by user
      Post.countDocuments({ saves: user._id }),
      
      // Total likes received on user's posts
      Post.aggregate([
        { $match: { author: user._id, isPublished: true } },
        { $project: { likesCount: { $size: '$likes' } } },
        { $group: { _id: null, total: { $sum: '$likesCount' } } }
      ])
    ]);

    // Get follower and following counts
    const followerCount = user.followers ? user.followers.length : 0;
    const followingCount = user.following ? user.following.length : 0;

    // Get recent posts for activity
    const recentPosts = await Post.find({ 
      author: user._id, 
      isPublished: true 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('title createdAt likes comments');

    // Calculate engagement metrics
    const totalLikesReceived = totalLikes.length > 0 ? totalLikes[0].total : 0;
    const totalCommentsReceived = recentPosts.reduce((sum, post) => sum + post.comments.length, 0);

    const stats = {
      totalPosts,
      totalComments,
      savedPosts,
      totalLikesReceived,
      totalCommentsReceived,
      followerCount,
      followingCount,
      recentPosts: recentPosts.map(post => ({
        id: post._id,
        title: post.title,
        createdAt: post.createdAt,
        likes: post.likes.length,
        comments: post.comments.length
      })),
      joinedDate: user.createdAt,
      lastActive: user.updatedAt
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
