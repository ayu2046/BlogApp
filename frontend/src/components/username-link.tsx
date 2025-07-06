'use client';

import React from 'react';
import Link from 'next/link';
import { useUsernameNavigation } from '@/src/hooks/use-username-navigation';
import { cn } from '@/lib/utils';

interface UsernameLinkProps {
  username: string;
  children?: React.ReactNode;
  className?: string;
  showAt?: boolean; // Whether to show @ symbol before username
  onClick?: () => void; // Additional onClick handler
}

/**
 * Reusable component for username links that automatically handles navigation
 * to either my-account (for current user) or user profile (for other users)
 */
export function UsernameLink({ 
  username, 
  children, 
  className, 
  showAt = false,
  onClick 
}: UsernameLinkProps) {
  const { navigateToUser, getNavigationPath, isCurrentUser } = useUsernameNavigation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateToUser(username);
    onClick?.();
  };

  const displayText = children || `${showAt ? '@' : ''}${username}`;
  const path = getNavigationPath(username);
  const isCurrent = isCurrentUser(username);

  return (
    <Link
      href={path}
      onClick={handleClick}
      className={cn(
        'hover:underline transition-colors',
        isCurrent 
          ? 'text-primary font-medium' 
          : 'text-foreground hover:text-primary',
        className
      )}
      title={isCurrent ? 'Go to my account' : `View ${username}'s profile`}
    >
      {displayText}
    </Link>
  );
}

/**
 * Simple clickable username component (not a link, just clickable)
 */
interface ClickableUsernameProps {
  username: string;
  children?: React.ReactNode;
  className?: string;
  showAt?: boolean;
  onClick?: () => void;
}

export function ClickableUsername({ 
  username, 
  children, 
  className, 
  showAt = false,
  onClick 
}: ClickableUsernameProps) {
  const { navigateToUser, isCurrentUser } = useUsernameNavigation();

  const handleClick = () => {
    navigateToUser(username);
    onClick?.();
  };

  const displayText = children || `${showAt ? '@' : ''}${username}`;
  const isCurrent = isCurrentUser(username);

  return (
    <span
      onClick={handleClick}
      className={cn(
        'cursor-pointer hover:underline transition-colors',
        isCurrent 
          ? 'text-primary font-medium' 
          : 'text-foreground hover:text-primary',
        className
      )}
      title={isCurrent ? 'Go to my account' : `View ${username}'s profile`}
    >
      {displayText}
    </span>
  );
}
