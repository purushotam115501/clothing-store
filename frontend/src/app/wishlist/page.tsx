'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ProductCard } from '../../components/ProductCard';

export default function WishlistPage() {
  const { wishlistItems, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-6">
        <div className="inline-flex rounded-full bg-muted p-6 text-muted-foreground">
          <Heart className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold uppercase tracking-wide">Login Required</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Please log in to your account to view or edit items in your personal wishlist.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block rounded bg-primary px-8 py-3.5 text-xs font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-colors shadow-md"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-6">
        <div className="inline-flex rounded-full bg-muted p-6 text-muted-foreground">
          <Heart className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold uppercase tracking-wide">Your Wishlist is Empty</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tap the heart icon on any product in our catalog to save items you love here.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-block rounded bg-primary px-8 py-3.5 text-xs font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-colors shadow-md"
        >
          Browse Garments
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-wide uppercase">My Wishlist ({wishlistItems.length})</h1>
        <p className="text-xs text-muted-foreground mt-1">Review and manage your saved garments.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}
