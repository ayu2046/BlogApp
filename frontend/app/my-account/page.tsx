'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedBackground from '@/components/animated-background';
import { BlogDataManager, BlogPost } from '@/lib/blog-data';
import { motion } from 'framer-motion';
import { PenTool, Bookmark, Heart, MessageCircle, Users, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ClickableUsername } from '@/components/username-link';

export default function MyAccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState({ 
    totalPosts: 0, 
    savedPosts: 0, 
    totalLikesReceived: 0,
    totalCommentsReceived: 0,
    totalCommentsMade: 0,
    joinDate: '' 
  });
  const [activeTab, setActiveTab] = useState('posts');
  const [userPosts, setUserPosts] = useState<BlogPost[]>([]);
  const [savedPosts, setSavedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const allPosts = BlogDataManager.getAllPosts();
    const userPostsData = BlogDataManager.getPostsByAuthor(user.id);
    const savedPostsData = BlogDataManager.getSavedPosts(user.id);
    
    // Calculate comprehensive statistics
    const totalLikesReceived = userPostsData.reduce((total, post) => total + post.likes.length, 0);
    const totalCommentsReceived = userPostsData.reduce((total, post) => total + post.comments.length, 0);
    const totalCommentsMade = allPosts.reduce((total, post) => {
      return total + post.comments.filter(comment => comment.authorId === user.id).length;
    }, 0);
    
    setUserPosts(userPostsData);
    setSavedPosts(savedPostsData);
    setUserStats({
      totalPosts: userPostsData.length,
      savedPosts: savedPostsData.length,
      totalLikesReceived,
      totalCommentsReceived,
      totalCommentsMade,
      joinDate: new Date(user.createdAt || Date.now()).toLocaleDateString(),
    });
  }, [user, router]);

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
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border/50">
            <CardHeader className="text-center">
                <Avatar className="w-32 h-32 mx-auto border-4 border-primary/20">
                  <AvatarImage src={user.profilePhoto} alt={user.username} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-4xl">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              <CardTitle className="text-3xl font-bold text-foreground mt-4">{user.username}</CardTitle>
              <CardDescription className="text-muted-foreground text-lg">
                Member since {userStats.joinDate}
              </CardDescription>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                <Badge variant="secondary" className="text-sm bg-primary/10 text-primary border-primary/20 p-2 justify-center">
                  <PenTool className="w-3 h-3 mr-1" />
                  {userStats.totalPosts} Posts
                </Badge>
                <Badge variant="secondary" className="text-sm bg-yellow-500/10 text-yellow-600 border-yellow-500/20 p-2 justify-center">
                  <Bookmark className="w-3 h-3 mr-1" />
                  {userStats.savedPosts} Saved
                </Badge>
                <Badge variant="secondary" className="text-sm bg-red-500/10 text-red-600 border-red-500/20 p-2 justify-center">
                  <Heart className="w-3 h-3 mr-1" />
                  {userStats.totalLikesReceived} Likes
                </Badge>
                <Badge variant="secondary" className="text-sm bg-blue-500/10 text-blue-600 border-blue-500/20 p-2 justify-center">
                  <MessageCircle className="w-3 h-3 mr-1" />
                  {userStats.totalCommentsReceived} Comments
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <Card className="shadow-lg bg-card/90 backdrop-blur-sm border-2 border-border/50">
            <CardHeader>
              <div className="flex space-x-2 border-b pb-4">
                <Button variant={activeTab === 'posts' ? 'default' : 'ghost'} onClick={() => setActiveTab('posts')} className="flex-1">My Posts</Button>
                <Button variant={activeTab === 'saved' ? 'default' : 'ghost'} onClick={() => setActiveTab('saved')} className="flex-1">Saved Posts</Button>
                <Button variant={activeTab === 'stats' ? 'default' : 'ghost'} onClick={() => setActiveTab('stats')} className="flex-1">Statistics</Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {userPosts.length > 0 ? userPosts.map(post => (
                    <Link key={post.id} href={`/post/${post.id}`}>
                      <Card className="bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</p>
                        </CardHeader>
                      </Card>
                    </Link>
                  )) : <p className="text-center text-muted-foreground py-4">You have not created any posts yet.</p>}
                </div>
              )}
              {activeTab === 'saved' && (
                <div className="space-y-4">
                  {savedPosts.length > 0 ? savedPosts.map(post => (
                     <Link key={post.id} href={`/post/${post.id}`}>
                      <Card className="bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-lg">{post.title}</CardTitle>
                           <p className="text-sm text-muted-foreground">by <ClickableUsername username={post.authorUsername} className="text-sm text-muted-foreground hover:text-primary" /></p>
                        </CardHeader>
                      </Card>
                    </Link>
                  )) : <p className="text-center text-muted-foreground py-4">You have no saved posts.</p>}
                </div>
              )}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  {/* Content Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <PenTool className="w-5 h-5 text-blue-600" />
                          <span>Content Created</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Posts</span>
                          <span className="font-semibold text-blue-600">{userStats.totalPosts}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Comments Made</span>
                          <span className="font-semibold text-blue-600">{userStats.totalCommentsMade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Posts Saved</span>
                          <span className="font-semibold text-blue-600">{userStats.savedPosts}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Heart className="w-5 h-5 text-green-600" />
                          <span>Engagement Received</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Likes</span>
                          <span className="font-semibold text-green-600">{userStats.totalLikesReceived}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Comments</span>
                          <span className="font-semibold text-green-600">{userStats.totalCommentsReceived}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Avg. per Post</span>
                          <span className="font-semibold text-green-600">
                            {userStats.totalPosts > 0 
                              ? Math.round(((userStats.totalLikesReceived + userStats.totalCommentsReceived) / userStats.totalPosts) * 10) / 10
                              : 0
                            }
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Account Information */}
                  <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span>Account Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Username</span>
                          <span className="font-semibold">{user.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email</span>
                          <span className="font-semibold">{user.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Member Since</span>
                          <span className="font-semibold">{userStats.joinDate}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Content Activity</span>
                          <span className="font-semibold">
                            {userStats.totalPosts > 0 || userStats.totalCommentsMade > 0 ? 'Active' : 'Getting Started'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Engagement Level</span>
                          <span className="font-semibold">
                            {userStats.totalLikesReceived + userStats.totalCommentsReceived > 10 ? 'High' : 
                             userStats.totalLikesReceived + userStats.totalCommentsReceived > 3 ? 'Medium' : 'Growing'}
                          </span>
                        </div>
                        {user.bio && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Bio</span>
                            <span className="font-semibold max-w-32 truncate">{user.bio}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}