
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BlogDataManager, BlogPost } from '@/lib/blog-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedBackground from '@/components/animated-background';
import { motion } from 'framer-motion';
import { Calendar, PenTool, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  name?: string;
  bio?: string;
  profilePhoto?: string;
  createdAt?: string;
  totalPosts?: number;
  totalLikes?: number;
  totalComments?: number;
}

export default function UserProfilePage() {
  const { user: currentUser } = useAuth();
  const params = useParams();
  const username = params?.username as string;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async (username: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to fetch from MongoDB API first
      try {
        const response = await fetch(`/api/user/getByUsername?username=${encodeURIComponent(username)}`);
        if (response.ok) {
          const data = await response.json();
          const userData: UserProfile = {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            name: data.user.name,
            bio: data.user.bio,
            profilePhoto: data.user.profilePhoto,
            createdAt: data.user.joinDate,
            totalPosts: data.user.stats?.totalPosts || 0,
            totalLikes: data.user.stats?.totalLikes || 0,
            totalComments: data.user.stats?.totalComments || 0
          };
          setUser(userData);
          setPosts(data.posts || []);
          return;
        }
      } catch (apiError) {
        console.warn('API fetch failed, trying localStorage fallback:', apiError);
      }
      
      // Fallback to localStorage
      const allUsers = JSON.parse(localStorage.getItem('blogapp_users') || '[]');
      const foundUser = allUsers.find((u: any) => u.username.toLowerCase() === username.toLowerCase());
      
      if (foundUser) {
        const userPosts = BlogDataManager.getPostsByAuthor(foundUser.id);
        const allPosts = BlogDataManager.getAllPosts();
        
        // Calculate statistics
        const totalLikes = userPosts.reduce((total, post) => total + (post.likes?.length || 0), 0);
        const totalComments = allPosts.reduce((total, post) => {
          return total + (post.comments?.filter(comment => comment.authorId === foundUser.id).length || 0);
        }, 0);
        
        const userData: UserProfile = {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          name: foundUser.name,
          bio: foundUser.bio,
          profilePhoto: foundUser.profilePhoto,
          createdAt: foundUser.createdAt,
          totalPosts: userPosts.length,
          totalLikes,
          totalComments
        };
        
        setUser(userData);
        setPosts(userPosts);
      } else {
        setError('User not found');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchUserProfile(username);
    }
  }, [username]);

  // Add test users for development (can be called from browser console)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).createTestUsers = () => {
        const testUsers = [
          {
            id: '1751640396689',
            username: 'john_doe',
            email: 'john.doe@example.com',
            password: 'password123',
            name: 'John Doe',
            bio: 'Software developer and tech enthusiast',
            profilePhoto: '',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '1751640396690',
            username: 'jane_smith',
            email: 'jane.smith@example.com',
            password: 'password123',
            name: 'Jane Smith',
            bio: 'UI/UX Designer with a passion for creating beautiful interfaces',
            profilePhoto: '',
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '1751640396691',
            username: 'alex_wilson',
            email: 'alex.wilson@example.com',
            password: 'password123',
            name: 'Alex Wilson',
            bio: 'Full-stack developer and coffee lover ☕',
            profilePhoto: '',
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        const existingUsers = JSON.parse(localStorage.getItem('blogapp_users') || '[]');
        testUsers.forEach(testUser => {
          const userExists = existingUsers.find((u: any) => u.username === testUser.username);
          if (!userExists) {
            existingUsers.push(testUser);
          }
        });
        localStorage.setItem('blogapp_users', JSON.stringify(existingUsers));
        console.log('Test users created:', testUsers.map(u => u.username));
        console.log('You can now search for: john_doe, jane_smith, alex_wilson');
      };
    }
  }, []);

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-semibold text-foreground">Loading user profile...</h1>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">{error || 'User not found'}</h1>
          <p className="text-muted-foreground mb-6">The user "{username}" could not be found.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
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
          className="mb-12"
        >
          <Card className="shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border/50">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="mx-auto mb-4 relative"
              >
                <Avatar className="w-32 h-32 mx-auto border-4 border-primary/20">
                  <AvatarImage src={user.profilePhoto} alt={user.username} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-4xl">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <CardTitle className="text-3xl font-bold text-foreground">
                {user.username}
              </CardTitle>
              {user.name && (
                <p className="text-muted-foreground mt-2">{user.name}</p>
              )}
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-3 max-w-md mx-auto">{user.bio}</p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <Badge variant="secondary" className="text-sm bg-primary/10 text-primary border-primary/20 p-2 justify-center">
                  <PenTool className="w-3 h-3 mr-1" />
                  {user.totalPosts || posts.length} Posts
                </Badge>
                <Badge variant="secondary" className="text-sm bg-red-500/10 text-red-600 border-red-500/20 p-2 justify-center">
                  ❤️ {user.totalLikes || 0} Likes
                </Badge>
                <Badge variant="secondary" className="text-sm bg-blue-500/10 text-blue-600 border-blue-500/20 p-2 justify-center">
                  💬 {user.totalComments || 0} Comments
                </Badge>
                <Badge variant="secondary" className="text-sm bg-green-500/10 text-green-600 border-green-500/20 p-2 justify-center">
                  📅 {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Member'}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <div className="space-y-6">
          <div className="text-center">
            <Button className="border border-purple-500 bg-transparent shadow-inner shadow-purple-500/50 text-white hover:bg-transparent">Posts</Button>
          </div>
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">This user has not posted anything yet.</p>
            </div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/post/${post.id}`}>
                  <Card className="bg-card/90 backdrop-blur-sm border-2 border-border/50 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer">
                    <CardHeader>
                      <CardTitle>{post.title}</CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="truncate">{post.content}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
