'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Star, ShoppingCart, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  discount: number;
  category: string;
  images: string[];
  rating: number;
  stock?: number;
  sizes?: string[];
  colors?: string[];
}

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const router = useRouter();
  const { toggleWishlist, isInWishlist } = useAuth();
  const { addToCart } = useCart();

  const isFavorited = isInWishlist(product._id);
  const discountedPrice = product.price * (1 - product.discount / 100);
  const mainImage = product.images[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80';

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await toggleWishlist(product);
    } catch (err: any) {
      alert(err.message || 'Please login to add favorites');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    const itemData = {
      productId: product._id,
      productName: product.name,
      price: discountedPrice,
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0] || 'Default',
      image: mainImage,
      stock: product.stock || 10
    };
    addToCart(itemData, 1);
    alert(`${product.name} added to cart!`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    const itemData = {
      productId: product._id,
      productName: product.name,
      price: discountedPrice,
      size: product.sizes?.[0] || 'M',
      color: product.colors?.[0] || 'Default',
      image: mainImage,
      stock: product.stock || 10
    };
    addToCart(itemData, 1);
    router.push('/checkout');
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card text-foreground hover-scale shadow-sm">
      {/* Product Image Panel */}
      <Link href={`/product/${product._id}`} className="relative block aspect-[3/4] bg-muted overflow-hidden">
        {/* Discount Badge */}
        {product.discount > 0 && (
          <span className="absolute left-2 top-2 z-10 rounded bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            {product.discount}% OFF
          </span>
        )}
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute right-2 top-2 z-10 rounded-full bg-white/80 dark:bg-black/60 p-2 text-muted-foreground hover:text-red-500 transition-colors focus:outline-none"
          aria-label="Add to Wishlist"
        >
          <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
        </button>

        {/* Product Image */}
        <img
          src={mainImage}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Action Panel Hover */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex justify-between space-x-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center space-x-1 rounded bg-white py-2 text-xs font-bold text-black hover:bg-neutral-100 transition-colors focus:outline-none"
          >
            <ShoppingCart className="h-3 w-3" />
            <span>Add Cart</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 flex items-center justify-center space-x-1 rounded bg-black py-2 text-xs font-bold text-white hover:bg-neutral-900 border border-white/20 transition-colors focus:outline-none"
          >
            <CreditCard className="h-3 w-3" />
            <span>Buy Now</span>
          </button>
        </div>
      </Link>

      {/* Info details */}
      <div className="flex flex-col p-4 flex-grow">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">{product.category}</span>
        
        <Link href={`/product/${product._id}`} className="hover:underline">
          <h3 className="text-sm font-semibold tracking-wide truncate">{product.name}</h3>
        </Link>

        {/* Ratings */}
        <div className="flex items-center space-x-1 mt-1 mb-2">
          <div className="flex text-yellow-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-zinc-700'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-semibold text-muted-foreground">({product.rating.toFixed(1)})</span>
        </div>

        {/* Prices */}
        <div className="mt-auto flex items-baseline space-x-2">
          <span className="text-base font-bold tracking-wide">${discountedPrice.toFixed(2)}</span>
          {product.discount > 0 && (
            <span className="text-xs text-muted-foreground line-through">${product.price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};
