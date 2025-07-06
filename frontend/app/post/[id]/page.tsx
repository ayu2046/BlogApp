
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { BlogDataManager, BlogPost } from '@/lib/blog-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AnimatedBackground from '@/components/animated-background';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { UsernameLink } from '@/components/username-link';

export default function PostPage() {
  const params = useParams();
  const id = params.id as string;

  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (id) {
      const allPosts = BlogDataManager.getAllPosts();
      const foundPost = allPosts.find((p) => p.id === id);
      setPost(foundPost);
    }
  }, [id]);

  if (!post) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground">Post not found</h1>
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
        >
          <Card className="bg-card/90 backdrop-blur-sm border-2 border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-4xl font-bold">{post.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground mt-2">
                <UsernameLink username={post.authorUsername} className="flex items-center space-x-2 hover:text-primary">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={post.authorAvatar} alt={post.authorUsername} />
                    <AvatarFallback>{post.authorUsername.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{post.authorUsername}</span>
                </UsernameLink>
                <span className="mx-2">•</span>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              {post.image && <img src={post.image} alt={post.title} className="w-full rounded-lg mb-4" />}
              <p>{post.content}</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
