// Test utility to populate sample users for testing search functionality

export const createTestUsers = () => {
  const testUsers = [
    {
      id: '1751640396689',
      username: 'john_doe',
      email: 'john.doe@example.com',
      password: 'password123',
      name: 'John Doe',
      profilePhoto: '',
      createdAt: new Date().toISOString()
    },
    {
      id: '1751640396690',
      username: 'jane_smith',
      email: 'jane.smith@example.com',
      password: 'password123',
      name: 'Jane Smith',
      profilePhoto: '',
      createdAt: new Date().toISOString()
    },
    {
      id: '1751640396691',
      username: 'alex_wilson',
      email: 'alex.wilson@example.com',
      password: 'password123',
      name: 'Alex Wilson',
      profilePhoto: '',
      createdAt: new Date().toISOString()
    },
    {
      id: '1751640396692',
      username: 'sarah_jones',
      email: 'sarah.jones@example.com',
      password: 'password123',
      name: 'Sarah Jones',
      profilePhoto: '',
      createdAt: new Date().toISOString()
    },
    {
      id: '1751640396693',
      username: 'mike_brown',
      email: 'mike.brown@example.com',
      password: 'password123',
      name: 'Mike Brown',
      profilePhoto: '',
      createdAt: new Date().toISOString()
    }
  ];

  // Get existing users
  const existingUsers = JSON.parse(localStorage.getItem('blogapp_users') || '[]');
  
  // Add test users if they don't exist
  testUsers.forEach(testUser => {
    const userExists = existingUsers.find((u: any) => u.username === testUser.username);
    if (!userExists) {
      existingUsers.push(testUser);
    }
  });

  // Save updated users list
  localStorage.setItem('blogapp_users', JSON.stringify(existingUsers));
  
  console.log('Test users created:', testUsers.map(u => u.username));
};

// Call this function in the browser console to create test users
if (typeof window !== 'undefined') {
  (window as any).createTestUsers = createTestUsers;
}
