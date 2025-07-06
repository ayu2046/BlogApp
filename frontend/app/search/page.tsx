'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, User, Users, Calendar, MapPin, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useUsernameNavigation } from '@/src/hooks/use-username-navigation';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  name?: string;
  bio?: string;
  profilePhoto?: string;
  location?: string;
  createdAt?: string;
}

export default function SearchPage() {
  const { user, searchUsersByUsername } = useAuth();
  const { navigateToUser } = useUsernameNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Load all users on component mount
  useEffect(() => {
    const loadAllUsers = async () => {
      setIsLoadingAll(true);
      try {
        // Search with empty string to get all users (we'll handle this in API)
        const response = await fetch('/api/user/search?q=&all=true');
        if (response.ok) {
          const users = await response.json();
          setAllUsers(users);
        }
      } catch (error) {
        console.error('Error loading all users:', error);
      } finally {
        setIsLoadingAll(false);
      }
    };

    if (user) {
      loadAllUsers();
    }
  }, [user]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query changes
  const performSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    setHasSearched(false);
    
    try {
      const results = await searchUsersByUsername(query);
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }, [searchUsersByUsername]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    } else {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
    }
  }, [debouncedQuery, performSearch]);

  const handleUserClick = (username: string) => {
    navigateToUser(username);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const displayedUsers = searchQuery.trim() ? searchResults : allUsers;
  const showSearchResults = searchQuery.trim() && hasSearched;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to search users</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Discover Users</h1>
          <p className="text-lg text-muted-foreground">
            Find and connect with users in the BlogApp community
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search users by name, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 h-12 text-lg border-2"
            />
          </div>
          
          {/* Search Status */}
          <div className="text-center mt-4">
            {isSearching && (
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            )}
            
            {!isSearching && searchQuery.trim() && (
              <p className="text-muted-foreground">
                {searchResults.length} user{searchResults.length !== 1 ? 's' : ''} found
              </p>
            )}
            
            {!searchQuery.trim() && !isLoadingAll && (
              <p className="text-muted-foreground">
                Showing all {allUsers.length} registered user{allUsers.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoadingAll && !searchQuery.trim() && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          </div>
        )}

        {/* Users Grid */}
        {!isLoadingAll && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedUsers.map((u) => (
              <Card key={u.id} className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group" onClick={() => handleUserClick(u.username)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={u.profilePhoto} alt={u.username} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold">
                        {u.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                          {u.username}
                        </CardTitle>
                        <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      {u.name && (
                        <p className="text-sm text-muted-foreground font-medium">{u.name}</p>
                      )}
                      <div className="flex items-center space-x-1 mt-1">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {u.bio && (
                    <CardDescription className="mb-3 text-sm overflow-hidden" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                      {u.bio}
                    </CardDescription>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      {u.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-20">{u.location}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Joined {formatDate(u.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoadingAll && displayedUsers.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">
              {showSearchResults ? 'No users found' : 'No users yet'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {showSearchResults 
                ? 'Try searching with different keywords like username, name, or email.'
                : 'Be the first to create an account and start blogging!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
