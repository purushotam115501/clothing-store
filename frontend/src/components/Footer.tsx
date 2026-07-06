'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, PhoneCall } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="bg-black text-white dark:border-t dark:border-border mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold tracking-widest uppercase">M O D E R N T H R E A D S</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Premium curated fashion designed for the modern wardrobe. Simple lines, premium fabrics, and timeless styling since 2026.
            </p>
            {/* WhatsApp Contact Float Button Simulation */}
            <div className="pt-2">
              <a
                href="https://wa.me/1234567890?text=Hi!%20I'd%20like%20to%20inquire%20about%20your%20clothing%20collections."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-all shadow-md transform hover:-translate-y-0.5"
              >
                <PhoneCall className="h-4 w-4" />
                <span>WhatsApp Customer Chat</span>
              </a>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Shop Collections</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/shop?category=Men" className="hover:text-white transition-colors">Men's Apparel</Link></li>
              <li><Link href="/shop?category=Women" className="hover:text-white transition-colors">Women's Fashion</Link></li>
              <li><Link href="/shop?category=Kids" className="hover:text-white transition-colors">Kids Wear</Link></li>
              <li><Link href="/shop?category=New+Arrival" className="hover:text-white transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop?category=Sale" className="hover:text-white/80 text-red-400 transition-colors">Season Sale</Link></li>
            </ul>
          </div>

          {/* Info Pages */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Support & Trust</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faqs" className="hover:text-white transition-colors">Frequently Asked Questions (FAQ)</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 mb-4">Newsletter Subscription</h4>
            <p className="text-xs text-gray-400 mb-3">
              Subscribe to unlock 10% off your first order and receive previews of new seasonal collections.
            </p>
            {subscribed ? (
              <div className="rounded bg-zinc-800 p-2 text-xs text-green-400 border border-green-700/50">
                Success! Check your email for your 10% coupon code: <strong>WELCOME10</strong>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-sm items-center border-b border-gray-600 py-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                  className="w-full bg-transparent px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                  aria-label="Submit Newsletter"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-[10px] text-gray-500">
          <div>
            © {new Date().getFullYear()} Modern Threads Ltd. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <Link href="/privacy-policy" className="hover:underline">Privacy</Link>
            <Link href="/terms-conditions" className="hover:underline">Terms</Link>
            <Link href="/faqs" className="hover:underline">FAQs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
