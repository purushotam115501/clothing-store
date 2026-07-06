'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, Ticket } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const {
    cart,
    couponCode,
    discountPercent,
    shippingCost,
    subtotal,
    discountAmount,
    total,
    removeFromCart,
    updateQuantity,
    applyCoupon
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    
    const success = applyCoupon(couponInput);
    if (success) {
      setCouponMessage({
        type: 'success',
        text: `Coupon applied! You got a discount.`
      });
      setCouponInput('');
    } else {
      setCouponMessage({
        type: 'error',
        text: 'Invalid coupon code. Try DISCOUNT10 or SALE30.'
      });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-6">
        <div className="inline-flex rounded-full bg-muted p-6 text-muted-foreground">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold uppercase tracking-wide">Your Cart is Empty</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            You have no items in your shopping bag. Explore our collections and find garments tailored for you.
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-block rounded bg-primary px-8 py-3.5 text-xs font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-colors shadow-md"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-wide uppercase">Shopping Bag ({cart.length})</h1>
        <p className="text-xs text-muted-foreground mt-1">Review items, adjust sizes, and apply discount codes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-border bg-card rounded-lg p-4 gap-4 text-foreground shadow-sm">
              
              {/* Product Thumbnail Info */}
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <img
                  src={item.image}
                  alt={item.productName}
                  className="h-20 w-15 object-cover object-center rounded border border-border bg-muted flex-shrink-0"
                />
                <div>
                  <Link href={`/product/${item.productId}`} className="hover:underline">
                    <h3 className="text-sm font-bold tracking-wide">{item.productName}</h3>
                  </Link>
                  <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                    Size: <strong className="text-foreground">{item.size}</strong> | Color: <strong className="text-foreground">{item.color}</strong>
                  </p>
                  <p className="text-xs font-bold mt-1 text-primary">${item.price.toFixed(2)}</p>
                </div>
              </div>

              {/* Quantity Changer */}
              <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-start">
                <div className="flex items-center border border-border rounded overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                    className="px-2.5 py-1 bg-muted hover:bg-border transition-colors font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                    className="px-2.5 py-1 bg-muted hover:bg-border transition-colors font-bold text-xs"
                  >
                    +
                  </button>
                </div>

                <div className="flex items-center space-x-6">
                  <span className="text-sm font-bold w-16 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.productId, item.size, item.color)}
                    className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Pricing Summary Panel */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-border pb-3">Order Summary</h3>

            {/* Calculations */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">${subtotal.toFixed(2)}</span>
              </div>
              
              {discountPercent > 0 && (
                <div className="flex justify-between text-green-500 font-semibold">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Shipping Cost</span>
                <span className="font-semibold text-foreground">
                  {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              
              <div className="border-t border-border pt-3 flex justify-between text-sm font-bold tracking-wide">
                <span>Grand Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Coupon Application input */}
            <form onSubmit={handleApplyCoupon} className="space-y-3 pt-3 border-t border-border">
              <label htmlFor="coupon-input" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Promo Coupon Code</label>
              <div className="flex space-x-2">
                <div className="relative flex-grow">
                  <input
                    id="coupon-input"
                    type="text"
                    placeholder="Enter code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full rounded border border-border bg-card py-2 px-3 pl-8 text-xs uppercase focus:outline-none"
                  />
                  <Ticket className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <button
                  type="submit"
                  className="rounded bg-primary px-4 py-2 text-xs font-bold text-primary-foreground uppercase hover:bg-neutral-900 transition-colors"
                >
                  Apply
                </button>
              </div>

              {couponCode && (
                <p className="text-[10px] text-green-600 font-semibold">Active code: {couponCode} applied!</p>
              )}
              {couponMessage && (
                <p className={`text-[10px] font-semibold ${couponMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {couponMessage.text}
                </p>
              )}
            </form>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center space-x-2 rounded bg-primary py-3.5 text-xs font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-all shadow-md focus:outline-none"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
