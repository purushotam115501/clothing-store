'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, Search, ArrowUpDown, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { ProductCard } from '../../components/ProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  discount: number;
  category: string;
  images: string[];
  rating: number;
  sizes: string[];
  colors: string[];
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    _id: 'fallback_1',
    name: 'Premium Slim Fit Leather Jacket',
    price: 189.99,
    discount: 15,
    category: 'Men',
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80'],
    rating: 4.8,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Dark Brown']
  },
  {
    _id: 'fallback_2',
    name: 'Classic Linen Summer Dress',
    price: 79.99,
    discount: 0,
    category: 'Women',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80'],
    rating: 4.5,
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Beige', 'White']
  },
  {
    _id: 'fallback_3',
    name: 'Streetwear Graphic Hoodie',
    price: 64.99,
    discount: 20,
    category: 'New Arrival',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80'],
    rating: 4.6,
    sizes: ['M', 'L', 'XL'],
    colors: ['Off-White', 'Black']
  },
  {
    _id: 'fallback_4',
    name: 'Kids Comfort Sweat Set',
    price: 39.99,
    discount: 10,
    category: 'Kids',
    images: ['https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=600&q=80'],
    rating: 4.9,
    sizes: ['Free Size'],
    colors: ['Soft Pink', 'Mustard']
  },
  {
    _id: 'fallback_5',
    name: 'Tailored Wool Blend Blazer',
    price: 149.99,
    discount: 30,
    category: 'Sale',
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80'],
    rating: 4.7,
    sizes: ['S', 'M', 'L'],
    colors: ['Navy Pinstripe', 'Charcoal Gray']
  }
];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Search/Filter states
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync Category from searchParams URL directly
  useEffect(() => {
    setCategory(searchParams.get('category') || '');
  }, [searchParams]);

  const fetchFilteredProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      if (size) params.append('size', size);
      if (color) params.append('color', color);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (sort) params.append('sort', sort);

      const endpoint = `/products?${params.toString()}`;
      const data = await api.get(endpoint);
      setProducts(data);
    } catch (err) {
      console.warn('API fetch failed, filtering local fallback data', err);
      // Run fallback client-side filter
      let filtered = [...FALLBACK_PRODUCTS];
      if (search) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      }
      if (category) {
        filtered = filtered.filter(p => p.category === category);
      }
      if (size) {
        filtered = filtered.filter(p => p.sizes.includes(size));
      }
      if (color) {
        filtered = filtered.filter(p => p.colors.some(c => c.toLowerCase().includes(color.toLowerCase())));
      }
      if (minPrice) {
        filtered = filtered.filter(p => (p.price * (1 - p.discount/100)) >= Number(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(p => (p.price * (1 - p.discount/100)) <= Number(maxPrice));
      }
      
      // Sorting
      if (sort === 'priceAsc') {
        filtered.sort((a, b) => (a.price * (1 - a.discount/100)) - (b.price * (1 - b.discount/100)));
      } else if (sort === 'priceDesc') {
        filtered.sort((a, b) => (b.price * (1 - b.discount/100)) - (a.price * (1 - a.discount/100)));
      } else if (sort === 'bestSelling') {
        filtered.sort((a, b) => b.rating - a.rating);
      }
      setProducts(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [category, size, color, sort]); // Fetch on filter select

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFilteredProducts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setSize('');
    setColor('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    router.push('/shop');
  };

  const categoriesOptions = ['Men', 'Women', 'Kids', 'New Arrival', 'Sale'];
  const sizesOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  const colorsOptions = ['Black', 'White', 'Red', 'Blue', 'Beige', 'Gold', 'Grey'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
      {/* Header banner */}
      <div className="border-b border-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide uppercase">
            {category ? `${category} Collection` : 'Shop All Clothing'}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Refine, select, and find your perfect fit.</p>
        </div>
        
        {/* Search & Mobile Filter Toggle */}
        <div className="flex w-full md:w-auto items-center space-x-2">
          <form onSubmit={handleSearchSubmit} className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Search garments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 rounded border border-border bg-card px-3 py-2 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          </form>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center space-x-1 rounded border border-border bg-card px-3 py-2 text-xs font-semibold"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-8">
        
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden md:block space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <span className="text-xs font-bold uppercase tracking-wider">Filter Items</span>
            <button
              onClick={handleResetFilters}
              className="text-[10px] text-muted-foreground hover:text-primary hover:underline font-semibold flex items-center space-x-0.5"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Category</label>
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => setCategory('')}
                className={`text-left text-xs py-1 hover:text-primary transition-colors ${!category ? 'font-bold text-primary border-l-2 border-primary pl-2' : 'text-muted-foreground'}`}
              >
                All Categories
              </button>
              {categoriesOptions.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-left text-xs py-1 hover:text-primary transition-colors ${category === cat ? 'font-bold text-primary border-l-2 border-primary pl-2' : 'text-muted-foreground'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Size</label>
            <div className="flex flex-wrap gap-1.5">
              {sizesOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(size === s ? '' : s)}
                  className={`rounded border px-2.5 py-1 text-[10px] font-semibold transition-all ${
                    size === s ? 'bg-black text-white dark:bg-white dark:text-black border-primary' : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Color</label>
            <div className="flex flex-wrap gap-1.5">
              {colorsOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(color === c ? '' : c)}
                  className={`rounded border px-2.5 py-1 text-[10px] font-semibold transition-all ${
                    color === c ? 'bg-black text-white dark:bg-white dark:text-black border-primary' : 'border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Prices Range */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Price Range</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min ($)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded border border-border bg-card p-1.5 text-xs focus:outline-none"
              />
              <span className="text-muted-foreground text-xs">-</span>
              <input
                type="number"
                placeholder="Max ($)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded border border-border bg-card p-1.5 text-xs focus:outline-none"
              />
            </div>
            <button
              onClick={fetchFilteredProducts}
              className="w-full mt-2 rounded bg-primary py-2 text-[10px] font-bold tracking-widest text-primary-foreground uppercase hover:bg-neutral-900 transition-colors"
            >
              Apply Price
            </button>
          </div>
        </aside>

        {/* CATALOG RESULTS LISTING */}
        <main className="md:col-span-3 space-y-6">
          {/* Sorting panel */}
          <div className="flex items-center justify-between border-b border-border pb-4 text-xs">
            <span className="text-muted-foreground font-medium">{products.length} products found</span>
            <div className="flex items-center space-x-1.5">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="rounded border border-border bg-card p-1.5 text-xs focus:outline-none cursor-pointer"
              >
                <option value="newest">Sort: Newest</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="bestSelling">Best Rating</option>
              </select>
            </div>
          </div>

          {/* Catalog grid cards */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-muted-foreground">No clothing products match your filter search.</p>
              <button
                onClick={handleResetFilters}
                className="mt-4 rounded bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE DRAWER FILTERS */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 md:hidden animate-fade-in">
          <div className="w-80 h-full bg-card border-l border-border p-6 overflow-y-auto flex flex-col space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
              <button onClick={() => setShowMobileFilters(false)} className="text-xs font-bold uppercase">Close</button>
            </div>
            
            {/* Category */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase block">Categories</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setCategory(''); setShowMobileFilters(false); }}
                  className={`rounded px-3 py-1 text-xs ${!category ? 'bg-primary text-primary-foreground font-semibold' : 'border border-border text-foreground'}`}
                >
                  All
                </button>
                {categoriesOptions.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setCategory(cat); setShowMobileFilters(false); }}
                    className={`rounded px-3 py-1 text-xs ${category === cat ? 'bg-primary text-primary-foreground font-semibold' : 'border border-border text-foreground'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase block">Sizes</span>
              <div className="flex flex-wrap gap-2">
                {sizesOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => { setSize(size === s ? '' : s); setShowMobileFilters(false); }}
                    className={`rounded px-3 py-1 text-xs ${size === s ? 'bg-primary text-primary-foreground font-semibold' : 'border border-border text-foreground'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase block">Colors</span>
              <div className="flex flex-wrap gap-2">
                {colorsOptions.map(c => (
                  <button
                    key={c}
                    onClick={() => { setColor(color === c ? '' : c); setShowMobileFilters(false); }}
                    className={`rounded px-3 py-1 text-xs ${color === c ? 'bg-primary text-primary-foreground font-semibold' : 'border border-border text-foreground'}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Price slider */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase block">Price limits</span>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min ($)"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded border border-border bg-card p-2 text-xs"
                />
                <input
                  type="number"
                  placeholder="Max ($)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded border border-border bg-card p-2 text-xs"
                />
              </div>
              <button
                onClick={() => { fetchFilteredProducts(); setShowMobileFilters(false); }}
                className="w-full rounded bg-primary py-3 text-xs font-bold text-primary-foreground uppercase tracking-widest mt-2"
              >
                Apply Prices
              </button>
            </div>

            <button
              onClick={() => { handleResetFilters(); setShowMobileFilters(false); }}
              className="w-full rounded border border-border bg-transparent py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mt-auto"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading Catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
