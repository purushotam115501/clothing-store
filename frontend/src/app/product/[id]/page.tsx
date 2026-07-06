'use client';

import React, { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, ShoppingBag, CreditCard, Heart, ChevronRight, AlertTriangle, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import { ReviewSection } from '../../../components/ReviewSection';
import { ProductCard } from '../../../components/ProductCard';

interface Review {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  category: string;
  sizes: string[];
  colors: string[];
  stock: number;
  images: string[];
  rating: number;
  reviews: Review[];
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    _id: 'fallback_1',
    name: 'Premium Slim Fit Leather Jacket',
    description: 'A premium-grade, hand-tailored leather jacket featuring heavy-duty zip closures and a quilted inner lining. Perfect for autumn and winter layering.',
    price: 189.99,
    discount: 15,
    category: 'Men',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?auto=format&fit=crop&w=600&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Black', 'Dark Brown'],
    stock: 12,
    rating: 4.8,
    reviews: [
      { userId: 'seed_u1', userName: 'John Doe', rating: 5, comment: 'Absolutely incredible quality. Feels heavy and premium.', createdAt: new Date().toISOString() },
      { userId: 'seed_u2', userName: 'Marcus K.', rating: 4, comment: 'Slightly tight in the shoulders but beautiful leather.', createdAt: new Date().toISOString() }
    ]
  },
  {
    _id: 'fallback_2',
    name: 'Classic Linen Summer Dress',
    description: 'Breathable, lightweight 100% pure organic linen dress with a side slit and functional front buttons. Ideal for warm sunny days and resort wear.',
    price: 79.99,
    discount: 0,
    category: 'Women',
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=600&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Beige', 'White', 'Sage Green'],
    stock: 25,
    rating: 4.5,
    reviews: [
      { userId: 'seed_u3', userName: 'Jane Smith', rating: 5, comment: 'Very soft linen. Keeps me cool and looks elegant.', createdAt: new Date().toISOString() }
    ]
  },
  {
    _id: 'fallback_3',
    name: 'Streetwear Graphic Hoodie',
    description: 'Heavyweight loopback cotton hood with custom modern artwork print, kangaroo pouch pocket, and double-layered hood. Relaxed streetwear fit.',
    price: 64.99,
    discount: 20,
    category: 'New Arrival',
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80'
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: ['Off-White', 'Black'],
    stock: 0, // out of stock
    rating: 4.6,
    reviews: []
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, toggleWishlist, isInWishlist } = useAuth();
  const { addToCart } = useCart();

  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});

  const fetchProductData = async () => {
    try {
      const data = await api.get(`/products/${productId}`);
      setProduct(data);
      setSelectedImage(data.images[0] || '');
      setSelectedSize(data.sizes[0] || 'M');
      setSelectedColor(data.colors[0] || 'Default');

      // Fetch similar products in category
      const catalog = await api.get(`/products?category=${data.category}`);
      setSimilarProducts(catalog.filter((p: any) => p._id !== data._id));
    } catch (err) {
      console.warn('Failed to fetch from API, loading fallback item', err);
      // Load fallback
      const found = FALLBACK_PRODUCTS.find(p => p._id === productId) || FALLBACK_PRODUCTS[0];
      setProduct(found);
      setSelectedImage(found.images[0] || '');
      setSelectedSize(found.sizes[0] || 'M');
      setSelectedColor(found.colors[0] || 'Default');
      
      // Load fallback similar
      setSimilarProducts(FALLBACK_PRODUCTS.filter(p => p._id !== found._id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  if (loading) {
    return <div className="p-12 text-center text-xs animate-pulse">Loading Product details...</div>;
  }

  if (!product) {
    return <div className="p-12 text-center text-xs text-red-500">Garment not found.</div>;
  }

  const isFavorited = isInWishlist(product._id);
  const discountedPrice = product.price * (1 - product.discount / 100);

  // Zoom Image hover helper
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({});
  };

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addToCart({
      productId: product._id,
      productName: product.name,
      price: discountedPrice,
      size: selectedSize,
      color: selectedColor,
      image: selectedImage,
      stock: product.stock
    }, quantity);
    alert('Product added to shopping cart!');
  };

  const handleBuyNow = () => {
    if (product.stock === 0) return;
    addToCart({
      productId: product._id,
      productName: product.name,
      price: discountedPrice,
      size: selectedSize,
      color: selectedColor,
      image: selectedImage,
      stock: product.stock
    }, quantity);
    router.push('/checkout');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-12">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/shop" className="hover:text-primary">Shop</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-bold">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* IMAGE GALLERY PANEL */}
        <div className="space-y-4">
          {/* Main Zoom image window */}
          <div
            className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border border-border bg-muted cursor-zoom-in"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={selectedImage}
              alt={product.name}
              style={zoomStyle}
              className="h-full w-full object-cover object-center transition-transform duration-100"
            />
            {product.discount > 0 && (
              <span className="absolute left-4 top-4 rounded bg-red-500 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails row */}
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto py-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 aspect-[3/4] rounded border overflow-hidden flex-shrink-0 bg-muted transition-all ${
                    selectedImage === img ? 'border-primary ring-1 ring-primary' : 'border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover object-center" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO SPECIFICATION DETAILS PANEL */}
        <div className="flex flex-col space-y-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-muted-foreground">{product.category}</span>
            <h1 className="text-3xl font-extrabold tracking-wide uppercase mt-1">{product.name}</h1>

            {/* Ratings Summary */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-zinc-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {product.rating.toFixed(1)} / 5.0 ({product.reviews.length} reviews)
              </span>
            </div>
          </div>

          {/* Price details */}
          <div className="border-t border-b border-border py-4 flex items-baseline space-x-4">
            <span className="text-3xl font-extrabold tracking-wide">${discountedPrice.toFixed(2)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">({product.discount}% Discount)</span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider">Description</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{product.description}</p>
          </div>

          {/* Stock Alerts */}
          <div>
            {product.stock === 0 ? (
              <div className="flex items-center space-x-2 text-red-500 text-xs font-bold uppercase tracking-wider">
                <AlertTriangle className="h-4 w-4" />
                <span>Sold Out</span>
              </div>
            ) : product.stock < 5 ? (
              <div className="flex items-center space-x-2 text-yellow-600 text-xs font-bold uppercase tracking-wider animate-pulse">
                <AlertTriangle className="h-4 w-4" />
                <span>Low Stock: Only {product.stock} items remaining!</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 text-green-600 text-xs font-semibold uppercase">
                <ShieldCheck className="h-4 w-4" />
                <span>In Stock & Ready to Ship</span>
              </div>
            )}
          </div>

          {/* Size & Color selectors */}
          <div className="grid grid-cols-2 gap-4">
            {/* Sizes selector */}
            <div className="space-y-2">
              <label htmlFor="size-select" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Size</label>
              <select
                id="size-select"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                disabled={product.stock === 0}
                className="w-full rounded border border-border bg-card p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50"
              >
                {product.sizes.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Colors selector */}
            <div className="space-y-2">
              <label htmlFor="color-select" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Color</label>
              <select
                id="color-select"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                disabled={product.stock === 0}
                className="w-full rounded border border-border bg-card p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer disabled:opacity-50"
              >
                {product.colors.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantity Selector & Action Panel */}
          {product.stock > 0 && (
            <div className="space-y-4 pt-2">
              {/* Quantity */}
              <div className="flex items-center space-x-3">
                <label htmlFor="qty-select" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</label>
                <div className="flex items-center border border-border rounded overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 bg-muted hover:bg-border transition-colors font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1 bg-muted hover:bg-border transition-colors font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 flex items-center justify-center space-x-2 rounded bg-muted py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-border transition-colors"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
                
                <button
                  onClick={handleBuyNow}
                  className="flex-1 flex items-center justify-center space-x-2 rounded bg-primary py-3.5 text-xs font-bold text-primary-foreground uppercase tracking-wider hover:bg-neutral-900 transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Buy Now</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product).catch(() => alert('Please login to save favorites.'))}
                  className={`rounded border border-border p-3.5 hover:bg-muted transition-colors ${
                    isFavorited ? 'text-red-500' : 'text-muted-foreground'
                  }`}
                  aria-label="Toggle Wishlist"
                >
                  <Heart className={`h-4.5 w-4.5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            </div>
          )}

          {/* Quick Info Trust points */}
          <div className="border-t border-border pt-4 grid grid-cols-2 gap-4 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span>Ships in 2-3 business days</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span>15 day exchange window</span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Section */}
      <ReviewSection
        productId={product._id}
        reviews={product.reviews}
        onReviewAdded={fetchProductData}
        isAuthenticated={!!user}
      />

      {/* SIMILAR PRODUCTS / RECOMMENDATIONS */}
      {similarProducts.length > 0 && (
        <div className="border-t border-border pt-12 space-y-6">
          <h3 className="text-lg font-bold uppercase tracking-wider">You May Also Like</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.slice(0, 4).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
