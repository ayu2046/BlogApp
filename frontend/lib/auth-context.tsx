'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  fullName?: string;
  bio?: string;
  profilePhoto?: string;
  profilePicture?: string;
  avatar?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    instagram?: string;
  };
  preferences?: {
    theme?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      marketing?: boolean;
    };
  };
  isEmailVerified?: boolean;
  lastLogin?: string;
  postsCount?: number;
  isAdmin?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
  isUsernameAvailable: (username: string) => boolean;
  isEmailAvailable: (email: string) => boolean;
  suggestUsernames: (baseUsername: string) => string[];
  searchUsersByUsername: (query: string) => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    console.log('AuthProvider: Loading user from localStorage');
    try {
      const savedUser = localStorage.getItem('blogapp_user');
      if (savedUser) {
        console.log('AuthProvider: Found saved user:', JSON.parse(savedUser));
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('AuthProvider: Error loading user from localStorage:', error);
    }
    setIsLoading(false);
    setIsHydrated(true);
  }, []);

  // Prevent hydration mismatch
  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('AuthProvider: Attempting login for:', email);
    
    try {
      // Try backend API first
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier: email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.user._id,
          username: data.user.username,
          email: data.user.email,
          name: data.user.name || data.user.fullName,
          fullName: data.user.fullName,
          bio: data.user.bio,
          profilePhoto: data.user.profilePhoto || data.user.profilePicture || data.user.avatar,
          location: data.user.location,
          website: data.user.website,
          socialLinks: data.user.socialLinks,
          preferences: data.user.preferences,
          isEmailVerified: data.user.isEmailVerified,
          lastLogin: data.user.lastLogin,
          postsCount: data.user.postsCount,
          isAdmin: data.user.isAdmin,
          createdAt: data.user.createdAt
        };
        
        setUser(userData);
        localStorage.setItem('blogapp_user', JSON.stringify(userData));
        localStorage.setItem('blogapp_token', data.token);
        console.log('AuthProvider: MongoDB login successful for:', userData.username);
        return true;
      }
    } catch (error) {
      console.warn('AuthProvider: MongoDB login failed, trying localStorage fallback:', error);
    }
    
    // Fallback to localStorage
    const users = JSON.parse(localStorage.getItem('blogapp_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      console.log('AuthProvider: localStorage login successful for:', foundUser.username);
      const userWithoutPassword = { ...foundUser };
      delete (userWithoutPassword as any).password;
      setUser(userWithoutPassword);
      localStorage.setItem('blogapp_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    console.log('AuthProvider: Login failed - user not found or incorrect password');
    return false;
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    console.log('AuthProvider: Attempting registration for:', username, email);
    
    try {
      // Try backend API first
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = {
          id: data.user._id,
          username: data.user.username,
          email: data.user.email,
          name: data.user.name || data.user.fullName,
          fullName: data.user.fullName,
          bio: data.user.bio,
          profilePhoto: data.user.profilePhoto || data.user.profilePicture || data.user.avatar,
          location: data.user.location,
          website: data.user.website,
          socialLinks: data.user.socialLinks,
          preferences: data.user.preferences,
          isEmailVerified: data.user.isEmailVerified,
          lastLogin: data.user.lastLogin,
          postsCount: data.user.postsCount,
          isAdmin: data.user.isAdmin,
          createdAt: data.user.createdAt
        };
        
        setUser(userData);
        localStorage.setItem('blogapp_user', JSON.stringify(userData));
        localStorage.setItem('blogapp_token', data.token);
        console.log('AuthProvider: MongoDB registration successful for:', userData.username);
        return true;
      } else {
        const errorData = await response.json();
        console.log('AuthProvider: MongoDB registration failed:', errorData.message);
        return false;
      }
    } catch (error) {
      console.warn('AuthProvider: MongoDB registration failed, trying localStorage fallback:', error);
    }
    
    // Fallback to localStorage
    const users = JSON.parse(localStorage.getItem('blogapp_users') || '[]');
    
    // Check if email or username already exists
    if (users.find((u: any) => u.email === email)) {
      console.log('AuthProvider: Registration failed - email already exists');
      return false;
    }
    
    if (users.find((u: any) => u.username === username)) {
      console.log('AuthProvider: Registration failed - username already exists');
      return false;
    }
    
    // Create new user with generated avatar
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password,
      profilePhoto: '', // Will be set by frontend when needed
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('blogapp_users', JSON.stringify(users));
    
    console.log('AuthProvider: localStorage registration successful for:', username);
    
    // Auto-login after registration
    const userWithoutPassword = { ...newUser };
    delete (userWithoutPassword as any).password;
    setUser(userWithoutPassword);
    localStorage.setItem('blogapp_user', JSON.stringify(userWithoutPassword));
    
    return true;
  };

  const logout = () => {
    console.log('AuthProvider: Logging out user');
    setUser(null);
    localStorage.removeItem('blogapp_user');
    localStorage.removeItem('blogapp_token');
  };

  const updateUser = async (updates: Partial<User>) => {
    console.log('AuthProvider: Updating user:', updates);
    if (!user) return;
    
    try {
      // Try MongoDB API first
      const token = localStorage.getItem('blogapp_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          userId: user.id,
          username: updates.username,
          email: updates.email,
          name: updates.name,
          bio: updates.bio,
          profilePhoto: updates.profilePhoto,
          location: updates.location,
          website: updates.website,
          preferences: updates.preferences
        }),
      });
      
      if (response.ok) {
        const updatedUserData = await response.json();
        const userData = {
          id: updatedUserData._id,
          username: updatedUserData.username,
          email: updatedUserData.email,
          name: updatedUserData.name || updatedUserData.fullName,
          fullName: updatedUserData.fullName,
          bio: updatedUserData.bio,
          profilePhoto: updatedUserData.profilePhoto || updatedUserData.profilePicture || updatedUserData.avatar,
          location: updatedUserData.location,
          website: updatedUserData.website,
          socialLinks: updatedUserData.socialLinks,
          preferences: updatedUserData.preferences,
          isEmailVerified: updatedUserData.isEmailVerified,
          lastLogin: updatedUserData.lastLogin,
          postsCount: updatedUserData.postsCount,
          isAdmin: updatedUserData.isAdmin,
          createdAt: updatedUserData.createdAt
        };
        
        setUser(userData);
        localStorage.setItem('blogapp_user', JSON.stringify(userData));
        console.log('AuthProvider: MongoDB update successful');
        return;
      }
    } catch (error) {
      console.warn('AuthProvider: MongoDB update failed, trying localStorage fallback:', error);
    }
    
    // Fallback to localStorage
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('blogapp_user', JSON.stringify(updatedUser));
    
    // Also update in users array
    const users = JSON.parse(localStorage.getItem('blogapp_users') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === user.id ? { ...u, ...updates } : u
    );
    localStorage.setItem('blogapp_users', JSON.stringify(updatedUsers));
    console.log('AuthProvider: localStorage update successful');
  };

  const isUsernameAvailable = (username: string): boolean => {
    const users = JSON.parse(localStorage.getItem('blogapp_users') || '[]');
    return !users.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
  };

  const isEmailAvailable = (email: string): boolean => {
    const users = JSON.parse(localStorage.getItem('blogapp_users') || '[]');
    return !users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  };

  const suggestUsernames = (baseUsername: string): string[] => {
    const suggestions: string[] = [];
    const cleanBase = baseUsername.toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
    
    for (let i = 1; i <= 5; i++) {
      const suggestion = `${cleanBase}${i}`;
      if (isUsernameAvailable(suggestion)) {
        suggestions.push(suggestion);
      }
    }
    
    // Add some creative variations
    const variations = [
      `${cleanBase}_user`,
      `${cleanBase}_${new Date().getFullYear()}`,
      `the_${cleanBase}`,
      `${cleanBase}_official`,
      `${cleanBase}_blog`
    ];
    
    variations.forEach(variation => {
      if (suggestions.length < 5 && isUsernameAvailable(variation)) {
        suggestions.push(variation);
      }
    });
    
    return suggestions;
  };

  const searchUsersByUsername = async (query: string): Promise<User[]> => {
    if (!query.trim()) return [];
    
    try {
      // Try MongoDB API first
      const response = await fetch(`/api/user/search?q=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const users = await response.json();
        return users;
      }
    } catch (error) {
      console.warn('AuthProvider: MongoDB search failed, trying localStorage fallback:', error);
    }
    
    // Fallback to localStorage
    try {
      const users = JSON.parse(localStorage.getItem('blogapp_users') || '[]');
      
      // Filter users based on username (case-insensitive partial match)
      const filteredUsers = users
        .filter((u: any) => u.username.toLowerCase().includes(query.toLowerCase()))
        .map((u: any) => ({
          id: u.id,
          username: u.username,
          email: u.email,
          profilePhoto: u.profilePhoto
        }))
        .slice(0, 10); // Limit to 10 results
      
      return filteredUsers;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      updateUser, 
      isLoading, 
      isUsernameAvailable, 
      isEmailAvailable, 
      suggestUsernames, 
      searchUsersByUsername 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}