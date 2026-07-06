'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Heart, User, Menu, X, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ThemeToggle } from './ThemeToggle';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, wishlistItems } = useAuth();
  const { cart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Men', path: '/shop?category=Men' },
    { name: 'Women', path: '/shop?category=Women' },
    { name: 'Kids', path: '/shop?category=Kids' },
    { name: 'New Arrival', path: '/shop?category=New+Arrival' },
    { name: 'Sale', path: '/shop?category=Sale' },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full luxury-glass border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold tracking-widest text-primary">
              M O D E R N T H R E A D S
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary ${
                    isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-muted-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Icons & Controls */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Wishlist */}
            <Link href="/wishlist" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white dark:bg-white dark:text-black">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile / Admin Login / Logout */}
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 p-2 text-muted-foreground hover:text-primary transition-colors">
                  <User className="h-5 w-5" />
                  <span className="text-xs font-semibold max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-1 hidden w-48 rounded-md border border-border bg-card p-1 shadow-lg group-hover:block">
                  {user.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center space-x-2 rounded-md px-4 py-2 text-sm text-red-500 hover:bg-muted transition-colors font-medium"
                    >
                      <ShieldAlert className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 rounded-md px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center space-x-2 rounded-md px-4 py-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="p-2 text-muted-foreground hover:text-primary transition-colors">
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-primary transition-colors">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white dark:bg-white dark:text-black">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-primary"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden luxury-glass border-t border-border px-4 py-3 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium uppercase tracking-wider py-2 border-b border-border/50 text-muted-foreground hover:text-primary"
              >
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-sm text-red-500 font-semibold border-b border-border/50"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm text-foreground border-b border-border/50"
                >
                  My Profile & Order History
                </Link>
                <Link
                  href="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm text-foreground border-b border-border/50 flex justify-between"
                >
                  <span>Wishlist</span>
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{wishlistCount}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center space-x-2 py-3 text-left text-sm text-muted-foreground font-semibold"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-sm text-primary font-semibold flex items-center space-x-2"
              >
                <User className="h-4 w-4" />
                <span>Login / Register</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
