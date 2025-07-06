const connectDB = require('../../../mongodb');
const User = require('../../../models/User');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await connectDB();

    // Get token from headers
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user's conversations
    const user = await User.findById(decoded.userId)
      .populate({
        path: 'conversations.participant',
        select: 'username displayName avatar'
      })
      .select('conversations');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Sort conversations by last message timestamp
    const conversations = user.conversations.sort((a, b) => 
      new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp)
    );

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}
