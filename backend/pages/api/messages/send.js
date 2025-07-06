const connectDB = require('../../../mongodb');
const User = require('../../../models/User');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
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
    
    const { recipientId, content } = req.body;

    // Validate input
    if (!recipientId || !content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Recipient and message content are required' });
    }

    if (content.trim().length > 1000) {
      return res.status(400).json({ message: 'Message content too long (max 1000 characters)' });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Don't allow sending messages to self
    if (decoded.userId === recipientId) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    const senderId = decoded.userId;
    const messageId = new ObjectId();
    const timestamp = new Date();

    const message = {
      _id: messageId,
      senderId,
      recipientId,
      content: content.trim(),
      timestamp,
      read: false
    };

    // Update or create conversation for sender
    const sender = await User.findById(senderId);
    const senderConversationIndex = sender.conversations.findIndex(
      conv => conv.participant.toString() === recipientId
    );

    if (senderConversationIndex !== -1) {
      // Update existing conversation
      sender.conversations[senderConversationIndex].messages.push(message);
      sender.conversations[senderConversationIndex].lastMessage = {
        content: content.trim(),
        timestamp,
        senderId
      };
    } else {
      // Create new conversation
      sender.conversations.push({
        participant: recipientId,
        messages: [message],
        lastMessage: {
          content: content.trim(),
          timestamp,
          senderId
        }
      });
    }

    // Update or create conversation for recipient
    const recipientConversationIndex = recipient.conversations.findIndex(
      conv => conv.participant.toString() === senderId
    );

    if (recipientConversationIndex !== -1) {
      // Update existing conversation
      recipient.conversations[recipientConversationIndex].messages.push(message);
      recipient.conversations[recipientConversationIndex].lastMessage = {
        content: content.trim(),
        timestamp,
        senderId
      };
    } else {
      // Create new conversation
      recipient.conversations.push({
        participant: senderId,
        messages: [message],
        lastMessage: {
          content: content.trim(),
          timestamp,
          senderId
        }
      });
    }

    // Save both users
    await Promise.all([
      sender.save(),
      recipient.save()
    ]);

    res.status(201).json({ 
      message: 'Message sent successfully',
      messageId: messageId.toString(),
      timestamp
    });
  } catch (error) {
    console.error('Send message error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
}
