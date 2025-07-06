const connectDB = require('../../../mongodb');
const User = require('../../../models/User');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { q: query, all } = req.query;

  // If 'all' parameter is present, return all users
  if (all === 'true') {
    try {
      await connectDB();
      
      const users = await User.find({})
        .select('username email profilePhoto profilePicture avatar name fullName bio location createdAt')
        .sort({ createdAt: -1 }) // Sort by newest first
        .limit(100); // Reasonable limit for all users

      // Transform users to match frontend expectations
      const transformedUsers = users.map(user => ({
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profilePhoto: user.profilePhoto || user.profilePicture || user.avatar,
        name: user.name || user.fullName,
        bio: user.bio,
        location: user.location,
        createdAt: user.createdAt
      }));

      return res.status(200).json(transformedUsers);
    } catch (error) {
      console.error('Error fetching all users:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (!query || query.trim().length < 1) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    await connectDB();
    
    // Search users by multiple fields (username, name, fullName, email)
    const searchRegex = { $regex: query.trim(), $options: 'i' };
    
    const users = await User.find({
      $or: [
        { username: searchRegex },
        { name: searchRegex },
        { fullName: searchRegex },
        { email: searchRegex }
      ]
    })
    .select('username email profilePhoto profilePicture avatar name fullName bio location createdAt')
    .sort({ createdAt: -1 }) // Sort by newest first
    .limit(20); // Increased limit to show more results

    // Transform users to match frontend expectations
    const transformedUsers = users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      profilePhoto: user.profilePhoto || user.profilePicture || user.avatar,
      name: user.name || user.fullName,
      bio: user.bio,
      location: user.location,
      createdAt: user.createdAt
    }));

    res.status(200).json(transformedUsers);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
