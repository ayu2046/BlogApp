'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { BlogDataManager } from '@/lib/blog-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { Camera, User, Mail, Save, BarChart3, FileText, Heart, MessageSquare, Calendar, Shuffle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AnimatedBackground from '@/components/animated-background';

export default function SettingsPage() {
  const { user, updateUser, isUsernameAvailable, isEmailAvailable } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    profilePhoto: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    joinDate: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        profilePhoto: user.profilePhoto || ''
      });
      
      // Calculate user stats
      const userPosts = BlogDataManager.getPostsByAuthor(user.id);
      const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
      const totalComments = userPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
      
      setStats({
        totalPosts: userPosts.length,
        totalLikes,
        totalComments,
        joinDate: new Date().toLocaleDateString() // You can store actual join date in user object
      });
    }
  }, [user]);

  const generateRandomAvatar = () => {
    const avatarOptions = [
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
      `https://api.dicebear.com/7.x/personas/svg?seed=${Math.random()}`,
      `https://api.dicebear.com/7.x/initials/svg?seed=${formData.username}`,
      `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random()}`,
      `https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random()}`
    ];
    
    const randomAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)];
    setFormData(prev => ({ ...prev, profilePhoto: randomAvatar }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePhoto: 'Image size must be less than 5MB' }));
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, profilePhoto: 'Please select a valid image file' }));
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profilePhoto: reader.result as string }));
        setErrors(prev => ({ ...prev, profilePhoto: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (formData.username !== user?.username && !isUsernameAvailable(formData.username)) {
      newErrors.username = 'Username is already taken';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email !== user?.email && !isEmailAvailable(formData.email)) {
      newErrors.email = 'Email is already in use';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      updateUser(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Please log in to access settings</h1>
          <Button onClick={() => router.push('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <Card className="bg-card/90 backdrop-blur-sm border-2 border-border/50">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <User className="w-6 h-6" />
                Account Settings
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Profile Settings */}
          <Card className="bg-card/90 backdrop-blur-sm border-2 border-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Profile Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Profile Photo Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Profile Photo</Label>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20 border-4 border-primary/20">
                      <AvatarImage src={formData.profilePhoto} alt="Profile" />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-2xl">
                        {formData.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Upload Photo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={generateRandomAvatar}
                        className="flex items-center gap-2"
                      >
                        <Shuffle className="w-4 h-4" />
                        Random Avatar
                      </Button>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {errors.profilePhoto && (
                    <p className="text-sm text-red-500">{errors.profilePhoto}</p>
                  )}
                </div>

                <Separator />

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Enter your username"
                    className={errors.username ? 'border-red-500' : ''}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Statistics */}
          <Card className="bg-card/90 backdrop-blur-sm border-2 border-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Account Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary/5 rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalPosts}</p>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                </div>
                <div className="text-center p-4 bg-red-500/5 rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalLikes}</p>
                  <p className="text-sm text-muted-foreground">Total Likes</p>
                </div>
                <div className="text-center p-4 bg-blue-500/5 rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    <MessageSquare className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalComments}</p>
                  <p className="text-sm text-muted-foreground">Total Comments</p>
                </div>
                <div className="text-center p-4 bg-green-500/5 rounded-lg border">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{stats.joinDate}</p>
                  <p className="text-sm text-muted-foreground">Member Since</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

