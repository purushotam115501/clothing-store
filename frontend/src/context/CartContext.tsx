'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  productName: string;
  price: number; // discounted price at time of adding
  quantity: number;
  size: string;
  color: string;
  image: string;
  stock: number;
}

interface CartContextType {
  cart: CartItem[];
  couponCode: string;
  discountPercent: number;
  shippingCost: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  applyCoupon: (code: string) => boolean;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('clothing_store_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse saved cart');
      }
    }
  }, []);

  // Sync cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('clothing_store_cart', JSON.stringify(newCart));
  };

  const addToCart = (newItem: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    const existingIndex = cart.findIndex(
      item => 
        item.productId === newItem.productId && 
        item.size === newItem.size && 
        item.color === newItem.color
    );

    let updatedCart = [...cart];

    if (existingIndex > -1) {
      // Update quantity
      const newQty = updatedCart[existingIndex].quantity + quantity;
      if (newQty <= newItem.stock) {
        updatedCart[existingIndex].quantity = newQty;
      } else {
        updatedCart[existingIndex].quantity = newItem.stock;
      }
    } else {
      // Add new
      updatedCart.push({ ...newItem, quantity });
    }

    saveCart(updatedCart);
  };

  const removeFromCart = (productId: string, size: string, color: string) => {
    const updatedCart = cart.filter(
      item => !(item.productId === productId && item.size === size && item.color === color)
    );
    saveCart(updatedCart);
  };

  const updateQuantity = (productId: string, size: string, color: string, quantity: number) => {
    const updatedCart = cart.map(item => {
      if (item.productId === productId && item.size === size && item.color === color) {
        return { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  const applyCoupon = (code: string) => {
    const codeClean = code.trim().toUpperCase();
    if (codeClean === 'DISCOUNT10') {
      setCouponCode('DISCOUNT10');
      setDiscountPercent(10);
      return true;
    } else if (codeClean === 'WELCOME20') {
      setCouponCode('WELCOME20');
      setDiscountPercent(20);
      return true;
    } else if (codeClean === 'SALE30') {
      setCouponCode('SALE30');
      setDiscountPercent(30);
      return true;
    }
    return false;
  };

  const clearCart = () => {
    saveCart([]);
    setCouponCode('');
    setDiscountPercent(0);
  };

  // Computations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  // Free shipping above $100, otherwise flat $5.99
  const shippingCost = cart.length === 0 ? 0 : (subtotal - discountAmount > 100 ? 0 : 5.99);
  const total = subtotal - discountAmount + shippingCost;

  const value = {
    cart,
    couponCode,
    discountPercent,
    shippingCost,
    subtotal,
    discountAmount,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
