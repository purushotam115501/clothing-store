'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Truck, RefreshCw, ShieldCheck, Mail } from 'lucide-react';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  discount: number;
  category: string;
  images: string[];
  rating: number;
}

// Fallback seed products in case server is booting or offline
const FALLBACK_PRODUCTS: Product[] = [
  {
    _id: 'fallback_1',
    name: 'Premium Slim Fit Leather Jacket',
    price: 189.99,
    discount: 15,
    category: 'Men',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80'],
    rating: 4.8
  },
  {
    _id: 'fallback_2',
    name: 'Classic Linen Summer Dress',
    price: 79.99,
    discount: 0,
    category: 'Women',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80'],
    rating: 4.5
  },
  {
    _id: 'fallback_3',
    name: 'Streetwear Graphic Hoodie',
    price: 64.99,
    discount: 20,
    category: 'New Arrival',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80'],
    rating: 4.6
  },
  {
    _id: 'fallback_4',
    name: 'Kids Comfort Sweat Set',
    price: 39.99,
    discount: 10,
    category: 'Kids',
    images: ['https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80'],
    rating: 4.9
  }
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const data = await api.get('/products');
        setProducts(data);
      } catch (err) {
        console.warn('API error, displaying local fallbacks', err);
        setProducts(FALLBACK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  const categories = [
    { name: 'Men', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80', query: 'category=Men' },
    { name: 'Women', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=600&q=80', query: 'category=Women' },
    { name: 'Kids', image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80', query: 'category=Kids' },
    { name: 'New Arrivals', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80', query: 'category=New+Arrival' },
  ];

  const testimonials = [
    { name: 'Alex M.', role: 'Verified Buyer', comment: 'The fabrics are extremely high quality. The fit is exactly as stated. Very impressed by the minimalist aesthetic.', rating: 5 },
    { name: 'Sarah L.', role: 'Fashion Blogger', comment: 'Ordering was seamless. The simulated UPI payment portal was fast and my shipping confirmation arrived immediately!', rating: 5 },
    { name: 'David K.', role: 'Regular Customer', comment: 'Their leather jackets are gorgeous. Fits premium. Quick exchanges and professional customer care.', rating: 5 },
  ];

  return (
    <div className="flex flex-col space-y-16 pb-12">
      
      {/* 1. Large Hero Banner */}
      <section className="relative h-[80vh] w-full overflow-hidden bg-black">
        {/* Parallax Hero Image background */}
        <div className="absolute inset-0 opacity-70">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1920&q=80"
            alt="Hero Fashion Banner"
            className="h-full w-full object-cover object-center"
          />
        </div>
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        
        {/* Banner Content */}
        <div className="relative flex h-full items-center justify-start mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl space-y-6 text-white animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-yellow-400" />
              <span className="font-semibold tracking-wider uppercase">NEW SUMMER COLLECTION</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              ELEVATE YOUR DAILY WEAR
            </h1>
            <p className="text-sm sm:text-lg text-gray-300 font-light max-w-md leading-relaxed">
              Discover tailormade designs, refined patterns, and ultra-breathable linen elements built for warm climates.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center space-x-2 rounded bg-white px-6 py-3.5 text-xs font-bold text-black uppercase tracking-wider hover:bg-neutral-100 transition-colors shadow-lg"
              >
                <span>Shop Collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shop?category=Sale"
                className="inline-flex items-center justify-center space-x-2 rounded border border-white bg-transparent px-6 py-3.5 text-xs font-bold text-white uppercase tracking-wider hover:bg-white/10 transition-colors"
              >
                <span>Explore Sale</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Promo Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-zinc-900 to-black p-8 text-white shadow-xl dark:border dark:border-border">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs uppercase tracking-widest text-yellow-400 font-bold">Limited Time Promo Code</span>
              <h2 className="text-2xl font-bold tracking-wide">GET 30% OFF YOUR FIRST ORDER</h2>
              <p className="text-xs text-gray-400">Use checkout coupon code <strong className="text-white">SALE30</strong> at checkout screen.</p>
            </div>
            <Link
              href="/shop"
              className="rounded bg-white px-6 py-3 text-xs font-extrabold text-black uppercase tracking-wider hover:bg-neutral-100 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold uppercase tracking-wider">Browse Categories</h2>
          <p className="text-xs text-muted-foreground mt-1">Explore clothing curated by category.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, i) => (
            <Link
              key={i}
              href={`/shop?${cat.query}`}
              className="group relative overflow-hidden rounded-lg aspect-[4/5] bg-neutral-900 shadow-md"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="h-full w-full object-cover object-center opacity-70 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-base font-bold uppercase tracking-widest">{cat.name}</h3>
                <span className="text-[10px] tracking-wider text-gray-300 group-hover:underline inline-flex items-center space-x-1">
                  <span>Explore</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Collections (New Arrivals & Best Sellers) */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2">
          <div className="text-left">
            <h2 className="text-2xl font-bold uppercase tracking-wider">New Arrivals & Featured</h2>
            <p className="text-xs text-muted-foreground mt-1">Curated selection of our best and newest garment entries.</p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold uppercase tracking-wider hover:underline flex items-center space-x-1"
          >
            <span>View All Products</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. Trust Badges */}
      <section className="bg-muted py-12 w-full dark:bg-muted/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="rounded-full bg-card p-3 border border-border">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Free Delivery</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Free courier shipping across all state pin codes for checkout totals exceeding $100.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="rounded-full bg-card p-3 border border-border">
                <RefreshCw className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Easy Exchange</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Hassle-free return policy. Contact support on email or WhatsApp for a size change request within 15 days.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-3">
              <div className="rounded-full bg-card p-3 border border-border">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider">Secure Payment</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Integrations with premium payment gateways supporting COD, UPI, Stripe, and Razorpay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Customer Reviews */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold uppercase tracking-wider">What Our Clients Say</h2>
          <p className="text-xs text-muted-foreground mt-1">Feedback from verified customers globally.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-card p-6 shadow-sm text-foreground space-y-4 flex flex-col justify-between">
              <p className="text-xs text-muted-foreground leading-relaxed italic">"{t.comment}"</p>
              <div>
                <div className="font-semibold text-xs">{t.name}</div>
                <div className="text-[10px] text-muted-foreground">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
