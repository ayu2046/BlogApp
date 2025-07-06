import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

/**
 * Custom hook for handling username navigation logic
 * Redirects to my-account if it's the current user's username,
 * otherwise redirects to the user's profile page
 */
export function useUsernameNavigation() {
  const router = useRouter();
  const { user } = useAuth();

  const navigateToUser = (username: string) => {
    if (!username) return;

    // Check if the clicked username belongs to the current user
    if (user && user.username.toLowerCase() === username.toLowerCase()) {
      // Navigate to my-account page if it's the current user's username
      router.push('/my-account');
    } else {
      // Navigate to the user profile page if it's another user's username
      router.push(`/user/${username}`);
    }
  };

  const getNavigationPath = (username: string): string => {
    if (!username) return '/';
    
    if (user && user.username.toLowerCase() === username.toLowerCase()) {
      return '/my-account';
    } else {
      return `/user/${username}`;
    }
  };

  return {
    navigateToUser,
    getNavigationPath,
    isCurrentUser: (username: string) => 
      user ? user.username.toLowerCase() === username.toLowerCase() : false
  };
}
