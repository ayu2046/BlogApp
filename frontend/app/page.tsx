'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { BlogDataManager, BlogPost, Comment } from '@/lib/blog-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import AnimatedBackground from '@/components/animated-background';
import { motion } from 'framer-motion';
import { PlusCircle, Edit, Trash2, Image, User, Calendar, Heart, MessageCircle, Bookmark, Upload, Send, PenTool, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { UsernameLink, ClickableUsername } from '@/components/username-link';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [commentInputs, setCommentInputs] = useState<{[postId: string]: string}>({});
  const [showComments, setShowComments] = useState<{[postId: string]: boolean}>({});

  useEffect(() => {
    console.log('Home: Loading blog posts');
    loadPosts();
  }, []);

  const loadPosts = () => {
    const allPosts = BlogDataManager.getAllPosts();
    console.log('Home: Loaded', allPosts.length, 'posts');
    setPosts(allPosts);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create a local URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, image: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = () => {
    console.log('Home: Creating new post');
    if (!user) return;

    if (formData.title.trim() && formData.content.trim()) {
      BlogDataManager.createPost({
        title: formData.title,
        content: formData.content,
        image: formData.image,
        authorId: user.id,
        authorUsername: user.username,
        authorAvatar: user.profilePhoto,
      });

      setFormData({ title: '', content: '', image: '' });
      setImageFile(null);
      setIsCreateMode(false);
      loadPosts();
    }
  };

  const handleUpdatePost = () => {
    console.log('Home: Updating post', editingPost?.id);
    if (!editingPost) return;

    BlogDataManager.updatePost(editingPost.id, {
      title: formData.title,
      content: formData.content,
      image: formData.image,
    });

    setFormData({ title: '', content: '', image: '' });
    setImageFile(null);
    setEditingPost(null);
    loadPosts();
  };

  const handleDeletePost = (postId: string) => {
    console.log('Home: Deleting post', postId);
    BlogDataManager.deletePost(postId);
    loadPosts();
  };

  const startEdit = (post: BlogPost) => {
    console.log('Home: Starting edit for post', post.id);
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      image: post.image || '',
    });
    setIsCreateMode(false);
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setFormData({ title: '', content: '', image: '' });
    setImageFile(null);
    setIsCreateMode(false);
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    BlogDataManager.toggleLike(postId, user.id);
    loadPosts();
  };

  const handleSave = (postId: string) => {
    if (!user) return;
    BlogDataManager.toggleSave(postId, user.id);
    loadPosts();
  };

  const handleComment = (postId: string) => {
    if (!user || !commentInputs[postId]?.trim()) return;
    
    BlogDataManager.addComment(postId, user.id, user.username, commentInputs[postId]);
    setCommentInputs({ ...commentInputs, [postId]: '' });
    loadPosts();
  };

  const toggleComments = (postId: string) => {
    setShowComments({ ...showComments, [postId]: !showComments[postId] });
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    if (!user) return;
    
    const confirmed = window.confirm('Are you sure you want to delete this comment?');
    if (confirmed) {
      BlogDataManager.deleteComment(postId, commentId);
      loadPosts();
    }
  };

  const canDeleteComment = (post: BlogPost, comment: Comment) => {
    if (!user) return false;
    // User can delete their own comments or if they're the post author
    return comment.authorId === user.id || post.authorId === user.id;
  };

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md mx-4"
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center"
            >
              <PenTool className="w-12 h-12 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-foreground">Welcome to BlogApp</h1>
            <p className="text-xl text-muted-foreground">
              Join our community of creators and share your ideas with the world.
            </p>
          </div>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Please log in or create an account to view and create blog posts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4" data-macaly="hero-title">
            Share Your Ideas
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-macaly="hero-description">
            A modern blogging platform where creativity meets community. Write, share, and connect with fellow creators.
          </p>
        </motion.div>

        {/* Create Post Section */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PlusCircle className="w-5 h-5" />
                  <span>{editingPost ? 'Edit Post' : 'Create New Post'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(isCreateMode || editingPost) ? (
                  <div className="space-y-4">
                    <Input
                      placeholder="Post title..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="text-lg"
                    />
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm text-muted-foreground">Upload Image (optional)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      {formData.image && (
                        <div className="relative">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFormData({ ...formData, image: '' });
                              setImageFile(null);
                            }}
                            className="absolute top-2 right-2"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="min-h-32"
                    />
                    <div className="flex space-x-2">
                      <Button
                        onClick={editingPost ? handleUpdatePost : handleCreatePost}
                        disabled={!formData.title.trim() || !formData.content.trim()}
                      >
                        {editingPost ? 'Update Post' : 'Publish Post'}
                      </Button>
                      <Button variant="outline" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setIsCreateMode(true)} className="w-full">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create New Post
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Blog Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-muted-foreground text-lg">No posts yet. Be the first to share your thoughts!</p>
            </motion.div>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="transform transition-all duration-200"
              >
                <Card className="bg-card/90 backdrop-blur-sm border-2 border-border/50 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                  {/* Post Header */}
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10 border-2 border-border/30">
                          <AvatarImage src={post.authorAvatar} alt={post.authorUsername} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {post.authorUsername.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <UsernameLink username={post.authorUsername}>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-sm font-medium hover:bg-primary/20 transition-colors cursor-pointer">
                              {post.authorUsername}
                            </Badge>
                          </UsernameLink>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {user && user.id === post.authorId && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(post)}
                            className="hover:bg-blue-500/10 hover:border-blue-500/30"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                            className="hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {/* Post Title */}
                    <CardTitle className="text-2xl font-bold text-foreground mt-4 mb-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  
                  {/* Post Content */}
                  <CardContent className="space-y-4">
                    <div className={`flex ${post.image ? 'gap-6' : ''} ${post.image ? 'flex-col sm:flex-row' : ''}`}>
                      {/* Image */}
                      {post.image && (
                        <div className="sm:w-48 sm:flex-shrink-0">
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-32 sm:h-40 object-cover rounded-lg shadow-md"
                            data-macaly={`post-image-${post.id}`}
                          />
                        </div>
                      )}
                      
                      {/* Content */}
                      <div className="flex-1">
                        <p className="text-foreground text-lg leading-relaxed whitespace-pre-wrap font-medium">
                          {post.content}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleLike(post.id)}
                          className={`transition-colors ${
                            post.likes.includes(user.id) 
                              ? 'text-red-500 hover:text-red-600' 
                              : 'text-muted-foreground hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${post.likes.includes(user.id) ? 'fill-current' : ''}`} />
                          <span>{post.likes.length}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleComments(post.id)}
                          className="text-muted-foreground hover:text-blue-500 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          <span>{post.comments.length}</span>
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleSave(post.id)}
                          className={`transition-colors ${
                            post.saves.includes(user.id) 
                              ? 'text-yellow-500 hover:text-yellow-600' 
                              : 'text-muted-foreground hover:text-yellow-500'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 mr-1 ${post.saves.includes(user.id) ? 'fill-current' : ''}`} />
                          <span>{post.saves.length}</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Comments Section */}
                    {showComments[post.id] && (
                      <div className="pt-4 border-t border-border/50 space-y-4">
                        {/* Comment Input */}
                        <div className="flex space-x-3">
                          <Avatar className="w-8 h-8 border border-border/30">
                            <AvatarImage src={user.profilePhoto} alt={user.username} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex space-x-2">
                            <Input
                              placeholder="Write a comment..."
                              value={commentInputs[post.id] || ''}
                              onChange={(e) => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                              onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                              className="flex-1"
                            />
                            <Button 
                              size="sm" 
                              onClick={() => handleComment(post.id)}
                              disabled={!commentInputs[post.id]?.trim()}
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Comments List */}
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {post.comments.length === 0 ? (
                            <div className="text-center py-6">
                              <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
                            </div>
                          ) : (
                            post.comments.map((comment) => (
                              <div key={comment.id} className="flex space-x-3 group">
                                <Avatar className="w-8 h-8 border border-border/30">
                                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm">
                                    {comment.authorUsername.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-muted/50 rounded-lg p-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center space-x-2">
                                      <ClickableUsername username={comment.authorUsername} className="text-sm font-medium text-foreground" />
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    
                                    {/* Comment Actions */}
                                    {canDeleteComment(post, comment) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteComment(post.id, comment.id)}
                                        className="h-6 w-6 p-0 hover:bg-red-500/10 hover:text-red-500 opacity-60 hover:opacity-100 transition-all"
                                        title="Delete comment"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    )}
                                  </div>
                                  <p className="text-sm text-foreground">{comment.content}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}