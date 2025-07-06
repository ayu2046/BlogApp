const connectDB = require('../../../mongodb');
const User = require('../../../models/User');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get token from headers or use fallback for localStorage-based auth
    const token = req.headers.authorization?.split(' ')[1];
    const { userId } = req.body; // Fallback for localStorage auth
    
    let currentUserId;
    
    if (token) {
      // JWT-based authentication
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      currentUserId = decoded.userId;
    } else if (userId) {
      // localStorage-based authentication fallback
      currentUserId = userId;
    } else {
      return res.status(401).json({ message: 'No authentication provided' });
    }
    
    // Get update data from request body
    const { username, email, name, bio, profilePicture, profilePhoto, location, website, preferences } = req.body;
    
    // Validate inputs
    if (username && (username.length < 3 || username.length > 30)) {
      return res.status(400).json({ message: 'Username must be between 3 and 30 characters' });
    }
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    
    if (name && name.length > 100) {
      return res.status(400).json({ message: 'Name must be under 100 characters' });
    }
    
    if (bio && bio.length > 500) {
      return res.status(400).json({ message: 'Bio must be under 500 characters' });
    }
    
    // Check if username or email already exist (if being updated)
    if (username || email) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: currentUserId } },
          {
            $or: [
              username ? { username: username.toLowerCase() } : null,
              email ? { email: email.toLowerCase() } : null
            ].filter(Boolean)
          }
        ]
      });
      
      if (existingUser) {
        if (existingUser.username === username?.toLowerCase()) {
          return res.status(400).json({ message: 'Username already exists' });
        }
        if (existingUser.email === email?.toLowerCase()) {
          return res.status(400).json({ message: 'Email already exists' });
        }
      }
    }
    
    // Prepare update object
    const updateData = {};
    if (username !== undefined) updateData.username = username.toLowerCase();
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (preferences !== undefined) updateData.preferences = preferences;
    
    // Update user
    const user = await User.findByIdAndUpdate(
      currentUserId,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}
