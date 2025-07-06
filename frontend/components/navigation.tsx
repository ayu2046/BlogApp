'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useUsernameNavigation } from '@/src/hooks/use-username-navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Home, User, MessageCircle, LogOut, PenTool, Search, Menu, X, Shield, Settings, MoreVertical, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navigation() {
  const { user, logout, searchUsersByUsername } = useAuth();
  const router = useRouter();
  const { navigateToUser } = useUsernameNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Define performSearch function first
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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim()) {
      performSearch(debouncedQuery);
    } else {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
    }
  }, [debouncedQuery, performSearch]);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleUserClick = (username: string) => {
    // Use the username navigation hook for consistent behavior
    navigateToUser(username);
    
    // Clear search state
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setIsSearching(false);
    setDebouncedQuery('');
    setIsMobileMenuOpen(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
    setIsSearching(false);
    setDebouncedQuery('');
  };

  const NavigationLinks = ({ isMobile }: { isMobile?: boolean }) => (
    <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'items-center space-x-4'}`}>
      <Link href="/">
        <Button variant="ghost" className={isMobile ? 'w-full justify-start' : ''}>Home</Button>
      </Link>
      <Link href="/my-account">
        <Button variant="ghost" className={isMobile ? 'w-full justify-start' : ''}>My Account</Button>
      </Link>
      <Link href="/contact">
        <Button variant="ghost" className={isMobile ? 'w-full justify-start' : ''}>Contact</Button>
      </Link>
      {(user?.username === 'admin' || user?.email === 'admin@blogapp.com') && (
        <Link href="/admin">
          <Button variant="ghost" className={isMobile ? 'w-full justify-start' : ''}>Admin</Button>
        </Link>
      )}
    </div>
  );

  // Only render the navbar if user is logged in
  if (!user) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div whileHover={{ scale: 1.05 }} className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
              <PenTool className="w-6 h-6 text-white" />
            </motion.div>
            <span className="text-xl font-bold text-foreground">BlogApp</span>
          </Link>

          {/* Desktop Search & Nav */}
          <div className="hidden md:flex flex-1 items-center justify-center space-x-6">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search users by name, username, or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4"
              />
              {(searchQuery.trim() && (isSearching || hasSearched)) && (
                <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="p-4 text-center text-muted-foreground">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span>Searching...</span>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((u: any) => (
                      <div key={u.id} className="p-3 hover:bg-muted cursor-pointer flex items-center space-x-3 transition-colors duration-200" onClick={() => handleUserClick(u.username)}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {u.profilePhoto ? (
                            <img src={u.profilePhoto} alt={u.username} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            u.username.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium truncate">{u.username}</p>
                            {u.name && <span className="text-xs text-muted-foreground">({u.name})</span>}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          {u.bio && <p className="text-xs text-muted-foreground truncate mt-1">{u.bio}</p>}
                          {u.location && <p className="text-xs text-muted-foreground/80">📍 {u.location}</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No users found</p>
                      <p className="text-xs">Try searching by username, name, or email</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <NavigationLinks />
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Desktop user actions */}
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>

            {/* Mobile Menu Toggler */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <MoreVertical className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-md border-t border-border shadow-lg"
          >
            <div className="p-4 space-y-4">
              <div className="relative w-full mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users by name, username, or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-4"
                />
                 {(searchQuery.trim() && (isSearching || hasSearched)) && (
                  <div className="absolute top-full mt-1 w-full bg-card border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <span>Searching...</span>
                        </div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((u: any) => (
                        <div key={u.id} className="p-3 hover:bg-muted cursor-pointer flex items-center space-x-3 transition-colors duration-200" onClick={() => handleUserClick(u.username)}>
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {u.profilePhoto ? (
                              <img src={u.profilePhoto} alt={u.username} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              u.username.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium truncate">{u.username}</p>
                              {u.name && <span className="text-xs text-muted-foreground">({u.name})</span>}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                            {u.bio && <p className="text-xs text-muted-foreground truncate mt-1">{u.bio}</p>}
                            {u.location && <p className="text-xs text-muted-foreground/80">📍 {u.location}</p>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No users found</p>
                        <p className="text-xs">Try searching by username, name, or email</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <NavigationLinks isMobile />
              <div className="border-t border-border pt-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-500/10" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}