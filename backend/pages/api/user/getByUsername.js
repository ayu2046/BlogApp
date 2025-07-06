const connectDB = require('../../../mongodb');
const User = require('../../../models/User');
const Post = require('../../../models/Post');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: 'Username is required' });
  }

  console.log('Looking for user with username:', username);

  try {
    await connectDB();

    // Find user by username (case-insensitive)
    const user = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    }).select('-password -refreshToken'); // Exclude sensitive fields

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all posts by this user
    const posts = await Post.find({ authorId: user._id })
      .populate('authorId', 'username profilePhoto')
      .sort({ createdAt: -1 });

    // Transform posts to match frontend format
    const transformedPosts = posts.map(post => ({
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      image: post.image,
      authorId: post.authorId._id.toString(),
      authorUsername: post.authorId.username,
      authorAvatar: post.authorId.profilePhoto,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      likes: post.likes || [],
      saves: post.saves || [],
      comments: post.comments || []
    }));

    // Calculate user stats
    const totalLikes = transformedPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
    const totalComments = transformedPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);

    // Transform user data to match frontend format
    const userProfile = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      profilePhoto: user.profilePhoto,
      bio: user.bio || 'No bio available',
      location: user.location || 'Location not specified',
      phone: user.phone,
      joinDate: user.createdAt.toISOString(),
      socialMedia: user.socialMedia || {},
      stats: {
        totalPosts: transformedPosts.length,
        totalLikes,
        totalComments
      }
    };

    res.status(200).json({
      user: userProfile,
      posts: transformedPosts
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
