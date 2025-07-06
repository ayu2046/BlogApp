const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('../../../mongodb');
const User = require('../../../models/User');

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, email, password, fullName } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  // Validate username length and format
  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ message: 'Username must be between 3 and 20 characters' });
  }

  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ message: 'Username can only contain letters, numbers, and underscores' });
  }

  // Validate JWT secret
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'Server configuration error: JWT_SECRET is required' });
  }

  try {
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate avatar URL using DiceBear
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName: fullName || username,
      avatar: avatarUrl,
      isEmailVerified: false, // In production, you'd want email verification
      preferences: {
        theme: 'dark',
        notifications: {
          email: true,
          push: true,
          marketing: false
        }
      }
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        username: newUser.username,
        email: newUser.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      avatar: newUser.avatar,
      bio: newUser.bio,
      location: newUser.location,
      website: newUser.website,
      socialLinks: newUser.socialLinks,
      followers: newUser.followers,
      following: newUser.following,
      postsCount: newUser.postsCount,
      isEmailVerified: newUser.isEmailVerified,
      preferences: newUser.preferences,
      createdAt: newUser.createdAt,
      isAdmin: newUser.isAdmin
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = handler;
