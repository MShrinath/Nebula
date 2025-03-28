const API_BASE_URL = import.meta.env.VITE_BACKEND_URL + "/api";

export interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  isAdmin: boolean;
  registeredAt: string;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  username: string;
}

export const register = async (username: string, password: string, email: string, bio?: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email, bio }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }
  
  return data;
};

export const login = async (username: string, password: string): Promise<User> => {
  try {
    console.log('Attempting login with:', { username, password });
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    
    const data = await response.json();
    console.log('Login response:', { status: response.status, data });
    
    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }
    
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logout = async () => {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.json();
};

export const getProfile = async (id: number): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/profile/${id}`);
  if (!response.ok) throw new Error("Failed to fetch profile");
  return response.json();
};

export const updateProfile = async (id: number, bio: string, email: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/profile/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bio, email }),
  });
  if (!response.ok) throw new Error("Failed to update profile");
  return response.json();
};

export const getPosts = async (): Promise<Post[]> => {
  const response = await fetch(`${API_BASE_URL}/posts`);
  if (!response.ok) throw new Error("Failed to fetch posts");
  return response.json();
};

export const getUserPosts = async (userId: number): Promise<Post[]> => {
  const response = await fetch(`${API_BASE_URL}/posts/user/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch user posts");
  return response.json();
};

export const createPost = async (userId: number, content: string): Promise<Post> => {
  const response = await fetch(`${API_BASE_URL}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, content }),
  });
  if (!response.ok) throw new Error("Failed to create post");
  return response.json();
};

export const getAllUsers = async (userId: number): Promise<User[]> => {
  const response = await fetch(`${API_BASE_URL}/admin/users?userId=${userId}`);
  if (!response.ok) throw new Error("Failed to fetch users");
  return response.json();
}; 