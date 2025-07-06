'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AnimatedBackground from '@/components/animated-background';
import { BlogDataManager } from '@/lib/blog-data';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Edit, 
  Save, 
  X, 
  Camera, 
  Check, 
  AlertCircle, 
  Sparkles, 
  RefreshCw,
  FileText,
  MessageCircle,
  Bookmark,
  Heart,
  Users,
  Calendar,
  Activity,
  TrendingUp
} from 'lucide-react';
import { generateAvatar, generateGradientAvatar, avatarStyles } from '@/lib/avatar-utils';

interface UserStats {
  totalPosts: number;
  totalComments: number;
  savedPosts: number;
  totalLikesReceived: number;
  totalCommentsReceived: number;
  followerCount: number;
  followingCount: number;
  joinedDate: string;
  lastActive: string;
  recentPosts: {
    id: string;
    title: string;
    createdAt: string;
    likes: number;
    comments: number;
  }[];
}

export default function SettingsPage() {
  const { user, updateUser, isUsernameAvailable, isEmailAvailable, suggestUsernames } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    bio: '',
    profilePhoto: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [usernameValidation, setUsernameValidation] = useState({ isValid: true, message: '' });
  const [emailValidation, setEmailValidation] = useState({ isValid: true, message: '' });
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    setFormData({
      username: user.username,
      email: user.email,
      name: user.name || '',
      bio: user.bio || '',
      profilePhoto: user.profilePhoto || '',
    });

    // Fetch user statistics
    fetchUserStats();
  }, [user, router]);

  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      setStatsLoading(true);
      
      // Try API first, fallback to local data
      try {
        const response = await fetch(`/api/user/stats?userId=${user.id}`);
        if (response.ok) {
          const stats = await response.json();
          setUserStats(stats);
          return;
        }
      } catch (apiError) {
        console.warn('API not available, using local data');
      }
      
      // Calculate real statistics from BlogDataManager
      const allPosts = BlogDataManager.getAllPosts();
      const userPosts = BlogDataManager.getPostsByAuthor(user.id);
      const savedPosts = BlogDataManager.getSavedPosts(user.id);
      
      // Calculate total likes received on user's posts
      const totalLikesReceived = userPosts.reduce((total, post) => total + post.likes.length, 0);
      
      // Calculate total comments received on user's posts
      const totalCommentsReceived = userPosts.reduce((total, post) => total + post.comments.length, 0);
      
      // Calculate total comments made by user
      const totalComments = allPosts.reduce((total, post) => {
        return total + post.comments.filter(comment => comment.authorId === user.id).length;
      }, 0);
      
      // Get recent posts with engagement metrics
      const recentPosts = userPosts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(post => ({
          id: post.id,
          title: post.title,
          createdAt: post.createdAt,
          likes: post.likes.length,
          comments: post.comments.length
        }));
      
      const realStats: UserStats = {
        totalPosts: userPosts.length,
        totalComments,
        savedPosts: savedPosts.length,
        totalLikesReceived,
        totalCommentsReceived,
        followerCount: 0, // Not implemented in local storage
        followingCount: 0, // Not implemented in local storage
        joinedDate: user.createdAt || new Date().toISOString(),
        lastActive: new Date().toISOString(),
        recentPosts
      };
      
      setUserStats(realStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate username and email availability
      if (user && formData.username !== user.username && !isUsernameAvailable(formData.username)) {
        setError('Username is already taken');
        setIsLoading(false);
        return;
      }
      
      if (user && formData.email !== user.email && !isEmailAvailable(formData.email)) {
        setError('Email is already in use');
        setIsLoading(false);
        return;
      }
      
      // Try to update via API first
      try {
        const response = await fetch('/api/user/update', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id,
            ...formData
          })
        });
        
        if (response.ok) {
          const updatedUser = await response.json();
          updateUser(updatedUser);
          setSuccess('Profile updated successfully!');
          setIsEditing(false);
          return;
        }
      } catch (apiError) {
        console.warn('API update failed, falling back to localStorage');
      }
      
      // Fallback to localStorage update
      updateUser(formData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewAvatar = (style: string) => {
    const newAvatar = style === 'gradient' 
      ? generateGradientAvatar(formData.username)
      : generateAvatar(formData.username, style as any);
    setFormData({ ...formData, profilePhoto: newAvatar });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      setProfileImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData({ ...formData, profilePhoto: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUsernameChange = (value: string) => {
    setFormData({ ...formData, username: value });
    
    if (user && value !== user.username) {
      if (isUsernameAvailable(value)) {
        setUsernameValidation({ isValid: true, message: 'Username is available' });
      } else {
        setUsernameValidation({ isValid: false, message: 'Username is already taken' });
        setUsernameSuggestions(suggestUsernames(value));
      }
    } else {
      setUsernameValidation({ isValid: true, message: '' });
    }
  };

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value });
    
    if (user && value !== user.email) {
      if (isEmailAvailable(value)) {
        setEmailValidation({ isValid: true, message: 'Email is available' });
      } else {
        setEmailValidation({ isValid: false, message: 'Email is already in use' });
      }
    } else {
      setEmailValidation({ isValid: true, message: '' });
    }
  };

  const cancelEdit = () => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        name: user.name || '',
        bio: user.bio || '',
        profilePhoto: user.profilePhoto || '',
      });
    }
    setIsEditing(false);
    setUsernameValidation({ isValid: true, message: '' });
    setEmailValidation({ isValid: true, message: '' });
    setUsernameSuggestions([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
            <p className="text-muted-foreground">Manage your profile and view your account statistics</p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Profile Settings</TabsTrigger>
              <TabsTrigger value="stats">Account Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {/* Profile Information */}
              <Card className="shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border/50">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-foreground">Profile Information</CardTitle>
                      <CardDescription>Update your personal information and profile settings</CardDescription>
                    </div>
                    {!isEditing && (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {success && (
                    <Alert className="border-green-500/50 bg-green-500/10 mb-4">
                      <Check className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700 dark:text-green-400">
                        {success}
                      </AlertDescription>
                    </Alert>
                  )}
                  {error && (
                    <Alert className="border-red-500/50 bg-red-500/10 mb-4">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700 dark:text-red-400">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Profile Picture Section */}
                  <div className="flex items-center space-x-6 mb-6">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={formData.profilePhoto} alt={formData.username} />
                      <AvatarFallback className="text-lg">
                        {formData.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <h3 className="font-medium text-foreground">Profile Picture</h3>
                      <p className="text-sm text-muted-foreground">
                        {isEditing ? 'Generate a new avatar or upload a custom image' : 'Your current profile picture'}
                      </p>
                      {isEditing && (
                        <div className="space-y-2">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                            id="profile-image-upload"
                          />
                          <Button 
                            type="button"
                            variant="outline" 
                            size="sm" 
                            className="flex items-center space-x-2"
                            onClick={() => document.getElementById('profile-image-upload')?.click()}
                          >
                            <Camera className="w-4 h-4" />
                            <span>Upload Image</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Username */}
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-foreground">Username</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="username"
                          type="text"
                          value={formData.username}
                          onChange={(e) => handleUsernameChange(e.target.value)}
                          disabled={!isEditing}
                          className={`pl-10 h-12 ${
                            !usernameValidation.isValid ? 'border-red-500' : 
                            usernameValidation.message === 'Username is available' ? 'border-green-500' : ''
                          }`}
                          placeholder="Enter your username"
                        />
                      </div>
                      {usernameValidation.message && (
                        <p className={`text-sm ${
                          usernameValidation.isValid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {usernameValidation.message}
                        </p>
                      )}
                      {usernameSuggestions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Suggested usernames:</p>
                          <div className="flex flex-wrap gap-2">
                            {usernameSuggestions.map((suggestion) => (
                              <Badge 
                                key={suggestion} 
                                variant="outline" 
                                className="cursor-pointer hover:bg-accent"
                                onClick={() => handleUsernameChange(suggestion)}
                              >
                                {suggestion}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          disabled={!isEditing}
                          className={`pl-10 h-12 ${
                            !emailValidation.isValid ? 'border-red-500' : 
                            emailValidation.message === 'Email is available' ? 'border-green-500' : ''
                          }`}
                          placeholder="Enter your email"
                        />
                      </div>
                      {emailValidation.message && (
                        <p className={`text-sm ${
                          emailValidation.isValid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {emailValidation.message}
                        </p>
                      )}
                    </div>

                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!isEditing}
                        className="h-12"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-foreground">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        disabled={!isEditing}
                        className="min-h-[100px] resize-none"
                        placeholder="Tell us about yourself..."
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        {formData.bio.length}/500 characters
                      </p>
                    </div>

                    {/* Avatar Generation */}
                    {isEditing && (
                      <div className="space-y-3">
                        <Label className="text-foreground">Generate New Avatar</Label>
                        <div className="flex flex-wrap gap-2">
                          {avatarStyles.map((style) => (
                            <Button
                              key={style.key}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => generateNewAvatar(style.key as any)}
                              className="flex items-center space-x-2"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>{style.name}</span>
                            </Button>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => generateNewAvatar('gradient')}
                            className="flex items-center space-x-2"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Gradient</span>
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">Click any style to generate a new avatar based on your username</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {isEditing && (
                      <div className="flex space-x-2 pt-4">
                        <Button 
                          type="submit" 
                          disabled={isLoading || !usernameValidation.isValid || !emailValidation.isValid} 
                          className="flex items-center space-x-2"
                        >
                          <Save className="w-4 h-4" />
                          <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                        </Button>
                        <Button type="button" variant="outline" onClick={cancelEdit} className="flex items-center space-x-2">
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats" className="space-y-6">
              {/* Account Statistics */}
              {statsLoading ? (
                <Card className="shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-12">
                      <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading statistics...</span>
                    </div>
                  </CardContent>
                </Card>
              ) : userStats ? (
                <>
                  {/* Overview Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-8 h-8 text-blue-500" />
                          <div>
                            <p className="text-2xl font-bold text-foreground">{userStats.totalPosts}</p>
                            <p className="text-sm text-muted-foreground">Total Posts</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                          <MessageCircle className="w-8 h-8 text-green-500" />
                          <div>
                            <p className="text-2xl font-bold text-foreground">{userStats.totalComments}</p>
                            <p className="text-sm text-muted-foreground">Comments Made</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                          <Bookmark className="w-8 h-8 text-purple-500" />
                          <div>
                            <p className="text-2xl font-bold text-foreground">{userStats.savedPosts}</p>
                            <p className="text-sm text-muted-foreground">Saved Posts</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border/50">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-2">
                          <Heart className="w-8 h-8 text-red-500" />
                          <div>
                            <p className="text-2xl font-bold text-foreground">{userStats.totalLikesReceived}</p>
                            <p className="text-sm text-muted-foreground">Likes Received</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Engagement & Social Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Users className="w-5 h-5" />
                          <span>Social Stats</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Followers</span>
                          <span className="font-medium text-foreground">{userStats.followerCount}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Following</span>
                          <span className="font-medium text-foreground">{userStats.followingCount}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Comments Received</span>
                          <span className="font-medium text-foreground">{userStats.totalCommentsReceived}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Activity className="w-5 h-5" />
                          <span>Account Info</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Member Since</span>
                          <span className="font-medium text-foreground">{formatDate(userStats.joinedDate)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Last Active</span>
                          <span className="font-medium text-foreground">{formatRelativeTime(userStats.lastActive)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Engagement Rate</span>
                          <span className="font-medium text-foreground">
                            {userStats.totalPosts > 0 
                              ? Math.round((userStats.totalLikesReceived + userStats.totalCommentsReceived) / userStats.totalPosts * 10) / 10
                              : 0
                            }/post
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Posts */}
                  {userStats.recentPosts.length > 0 && (
                    <Card className="shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5" />
                          <span>Recent Posts Performance</span>
                        </CardTitle>
                        <CardDescription>Your latest posts and their engagement metrics</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {userStats.recentPosts.map((post, index) => (
                            <div key={post.id} className="flex items-center justify-between p-4 rounded-lg border bg-accent/20">
                              <div className="flex-1">
                                <h4 className="font-medium text-foreground truncate">{post.title}</h4>
                                <p className="text-sm text-muted-foreground">{formatRelativeTime(post.createdAt)}</p>
                              </div>
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                  <Heart className="w-4 h-4 text-red-500" />
                                  <span>{post.likes}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MessageCircle className="w-4 h-4 text-blue-500" />
                                  <span>{post.comments}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border/50">
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Unable to load statistics at this time.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
