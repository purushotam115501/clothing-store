'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  wishlist: string[];
}

interface Product {
  _id: string;
  name: string;
  price: number;
  discount: number;
  category: string;
  images: string[];
  rating: number;
}

interface AuthContextType {
  user: User | null;
  wishlistItems: Product[];
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (name: string, password?: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user profile on startup
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('clothing_store_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await api.get('/auth/profile');
        setUser(profile);
        
        // Fetch full wishlist items
        const wishlist = await api.get('/auth/wishlist');
        setWishlistItems(wishlist);
      } catch (err) {
        console.error('Failed to load user session', err);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('clothing_store_token', res.token);
    setUser(res.user);
    
    // Fetch full wishlist
    const wishlist = await api.get('/auth/wishlist');
    setWishlistItems(wishlist);
  };

  const adminLogin = async (email: string, password: string) => {
    const res = await api.post('/auth/admin/login', { email, password });
    localStorage.setItem('clothing_store_token', res.token);
    setUser(res.user);
    setWishlistItems([]);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('clothing_store_token', res.token);
    setUser(res.user);
    setWishlistItems([]);
  };

  const logout = () => {
    localStorage.removeItem('clothing_store_token');
    setUser(null);
    setWishlistItems([]);
  };

  const updateProfile = async (name: string, password?: string) => {
    const res = await api.put('/auth/profile', { name, password });
    setUser(res.user);
  };

  const toggleWishlist = async (product: Product) => {
    if (!user) {
      throw new Error('Please login to add items to wishlist.');
    }

    const isFav = isInWishlist(product._id);
    if (isFav) {
      // Remove
      await api.delete(`/auth/wishlist/${product._id}`);
      setWishlistItems(prev => prev.filter(item => item._id !== product._id));
      setUser(prev => prev ? { ...prev, wishlist: prev.wishlist.filter(id => id !== product._id) } : null);
    } else {
      // Add
      await api.post('/auth/wishlist', { productId: product._id });
      setWishlistItems(prev => [...prev, product]);
      setUser(prev => prev ? { ...prev, wishlist: [...prev.wishlist, product._id] } : null);
    }
  };

  const isInWishlist = (productId: string) => {
    return user ? user.wishlist.includes(productId) : false;
  };

  const value = {
    user,
    wishlistItems,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    adminLogin,
    register,
    logout,
    updateProfile,
    toggleWishlist,
    isInWishlist
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
