'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

interface UsernameBaseLinkProps {
  username: string;
  className?: string;
  children?: React.ReactNode;
  showAtSymbol?: boolean;
}

interface UsernameLinkProps extends UsernameBaseLinkProps {
  as?: 'link' | 'button';
}

interface ClickableUsernameProps extends UsernameBaseLinkProps {
  onClick?: () => void;
}

export function UsernameLink({ 
  username, 
  className, 
  children, 
  showAtSymbol = false, 
  as = 'link' 
}: UsernameLinkProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    // Check if the clicked username belongs to the current user
    if (user && user.username.toLowerCase() === username.toLowerCase()) {
      // Navigate to my-account page if it's the current user's username
      router.push('/my-account');
    } else {
      // Navigate to the user profile page if it's another user's username
      router.push(`/user/${username}`);
    }
  };

  const displayName = showAtSymbol ? `@${username}` : username;
  const content = children || displayName;

  if (as === 'button') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "text-primary hover:text-primary/80 hover:underline transition-colors duration-200 cursor-pointer",
          className
        )}
      >
        {content}
      </button>
    );
  }

  // Determine the href based on whether it's the current user or not
  const href = user && user.username.toLowerCase() === username.toLowerCase() 
    ? '/my-account' 
    : `/user/${username}`;

  return (
    <Link
      href={href}
      className={cn(
        "text-primary hover:text-primary/80 hover:underline transition-colors duration-200",
        className
      )}
    >
      {content}
    </Link>
  );
}

export function ClickableUsername({ 
  username, 
  className, 
  children, 
  showAtSymbol = true, 
  onClick 
}: ClickableUsernameProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior - navigate to appropriate page
      if (user && user.username.toLowerCase() === username.toLowerCase()) {
        router.push('/my-account');
      } else {
        router.push(`/user/${username}`);
      }
    }
  };

  const displayName = showAtSymbol ? `@${username}` : username;
  const content = children || displayName;

  return (
    <span
      onClick={handleClick}
      className={cn(
        "text-primary hover:text-primary/80 hover:underline transition-colors duration-200 cursor-pointer inline-block",
        className
      )}
    >
      {content}
    </span>
  );
}

// Default export for backward compatibility
export default UsernameLink;
