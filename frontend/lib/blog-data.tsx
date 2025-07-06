'use client';

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  content: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  image?: string;
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  likes: string[]; // Array of user IDs who liked
  saves: string[]; // Array of user IDs who saved
  comments: Comment[];
}

export class BlogDataManager {
  private static STORAGE_KEY = 'blogapp_posts';

  static getAllPosts(): BlogPost[] {
    console.log('BlogDataManager: Getting all posts');
    const posts = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    console.log('BlogDataManager: Found', posts.length, 'posts');
    
    // Add backward compatibility for existing posts
    const normalizedPosts = posts.map((post: any) => ({
      ...post,
      likes: post.likes || [],
      saves: post.saves || [],
      comments: post.comments || [],
      authorAvatar: post.authorAvatar || null,
    }));
    
    return normalizedPosts.sort((a: BlogPost, b: BlogPost) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static createPost(post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'saves' | 'comments'>): BlogPost {
    console.log('BlogDataManager: Creating new post by', post.authorUsername);
    const newPost: BlogPost = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: [],
      saves: [],
      comments: [],
    };

    const posts = this.getAllPosts();
    posts.unshift(newPost);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
    
    console.log('BlogDataManager: Post created successfully with ID:', newPost.id);
    return newPost;
  }

  static updatePost(id: string, updates: Partial<BlogPost>): BlogPost | null {
    console.log('BlogDataManager: Updating post with ID:', id);
    const posts = this.getAllPosts();
    const index = posts.findIndex(p => p.id === id);
    
    if (index === -1) {
      console.log('BlogDataManager: Post not found for update');
      return null;
    }

    const updatedPost = {
      ...posts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    posts[index] = updatedPost;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
    
    console.log('BlogDataManager: Post updated successfully');
    return updatedPost;
  }

  static deletePost(id: string): boolean {
    console.log('BlogDataManager: Deleting post with ID:', id);
    const posts = this.getAllPosts();
    const filteredPosts = posts.filter(p => p.id !== id);
    
    if (filteredPosts.length === posts.length) {
      console.log('BlogDataManager: Post not found for deletion');
      return false;
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredPosts));
    console.log('BlogDataManager: Post deleted successfully');
    return true;
  }

  static getPostsByAuthor(authorId: string): BlogPost[] {
    console.log('BlogDataManager: Getting posts by author:', authorId);
    const posts = this.getAllPosts();
    return posts.filter(p => p.authorId === authorId);
  }

  static toggleLike(postId: string, userId: string): boolean {
    const posts = this.getAllPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) return false;
    
    const likeIndex = post.likes.indexOf(userId);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(userId);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
    return true;
  }

  static toggleSave(postId: string, userId: string): boolean {
    const posts = this.getAllPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) return false;
    
    const saveIndex = post.saves.indexOf(userId);
    if (saveIndex > -1) {
      post.saves.splice(saveIndex, 1);
    } else {
      post.saves.push(userId);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
    return true;
  }

  static addComment(postId: string, userId: string, username: string, content: string): Comment | null {
    const posts = this.getAllPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) return null;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      postId,
      authorId: userId,
      authorUsername: username,
      content,
      createdAt: new Date().toISOString(),
    };
    
    post.comments.push(newComment);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
    return newComment;
  }

  static getSavedPosts(userId: string): BlogPost[] {
    const posts = this.getAllPosts();
    return posts.filter(p => p.saves.includes(userId));
  }

  static deleteComment(postId: string, commentId: string): boolean {
    const posts = this.getAllPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) return false;
    
    const commentIndex = post.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return false;
    
    post.comments.splice(commentIndex, 1);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
    return true;
  }
}
