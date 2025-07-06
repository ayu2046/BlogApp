# Username Navigation System

This document explains the new username navigation system that intelligently redirects users when they click on usernames throughout the application.

## How It Works

When a user clicks on any username in the application, the system checks:
- If it's their own username → redirects to `/my-account`
- If it's another user's username → redirects to `/user/{username}`

## Components Available

### 1. `useUsernameNavigation` Hook

A custom hook that provides username navigation logic.

```tsx
import { useUsernameNavigation } from '@/hooks/use-username-navigation';

function MyComponent() {
  const { navigateToUser, getNavigationPath, isCurrentUser } = useUsernameNavigation();
  
  // Navigate programmatically
  const handleClick = () => {
    navigateToUser('someUsername');
  };
  
  // Get the path without navigating
  const path = getNavigationPath('someUsername');
  
  // Check if username belongs to current user
  const isCurrent = isCurrentUser('someUsername');
}
```

### 2. `UsernameLink` Component

A Link component that automatically handles username navigation.

```tsx
import { UsernameLink } from '@/components/username-link';

// Basic usage
<UsernameLink username="john_doe" />

// With custom children
<UsernameLink username="john_doe">
  <Badge>{username}</Badge>
</UsernameLink>

// With @ symbol
<UsernameLink username="john_doe" showAt />

// With custom styling
<UsernameLink 
  username="john_doe" 
  className="text-blue-500 hover:underline"
  onClick={() => console.log('Clicked!')}
/>
```

### 3. `ClickableUsername` Component

A clickable span (not a link) that handles username navigation.

```tsx
import { ClickableUsername } from '@/components/username-link';

// Basic usage
<ClickableUsername username="john_doe" />

// With @ symbol
<ClickableUsername username="john_doe" showAt />

// With custom styling
<ClickableUsername 
  username="john_doe" 
  className="font-medium text-primary"
/>
```

## Features

### Visual Indicators
- Current user's username appears with primary color and bold font
- Other usernames appear with standard styling
- Hover effects show appropriate navigation hints

### Accessibility
- Proper `title` attributes indicating where the link will navigate
- Keyboard navigation support
- Screen reader friendly

### Consistent Behavior
- Works the same way everywhere in the application
- Centralized logic for easy maintenance
- Proper routing and navigation handling

## Implementation Examples

### In Search Results
```tsx
// Navigation component already uses this
<div onClick={() => navigateToUser(username)}>
  {username}
</div>
```

### In Post Comments
```tsx
<ClickableUsername 
  username={comment.authorUsername} 
  className="text-sm font-medium text-foreground" 
/>
```

### In Post Author Display
```tsx
<UsernameLink username={post.authorUsername}>
  <Badge variant="secondary">
    {post.authorUsername}
  </Badge>
</UsernameLink>
```

## Updated Components

The following components have been updated to use the new system:

1. **Navigation Component** (`components/navigation.tsx`)
   - Search results now use intelligent navigation

2. **Main Page** (`app/page.tsx`)
   - Post author names in feed
   - Comment author names

3. **Post Page** (`app/post/[id]/page.tsx`)
   - Post author display

4. **My Account Page** (`app/my-account/page.tsx`)
   - Saved post author names

## Benefits

1. **Consistent UX**: Users always know where they'll end up when clicking usernames
2. **Intuitive**: Clicking your own username takes you to your account, not your public profile
3. **Maintainable**: Single source of truth for username navigation logic
4. **Extensible**: Easy to add new username displays throughout the app
5. **Accessible**: Proper semantic markup and navigation hints

## Future Enhancements

Potential improvements that could be added:

1. **User Profile Previews**: Hover cards showing user info
2. **User Status Indicators**: Online/offline status
3. **User Verification Badges**: Verified user indicators
4. **Mention System**: @mention functionality in comments
5. **User Following**: Quick follow/unfollow buttons

## Usage Guidelines

1. **Always use** the provided components for username display
2. **Don't hardcode** `/user/{username}` paths
3. **Use `UsernameLink`** when you need a proper link element
4. **Use `ClickableUsername`** when you need a clickable span
5. **Use the hook** for programmatic navigation or custom components
