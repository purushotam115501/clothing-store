'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

export default function FAQPage() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      q: 'How long does shipping take?',
      a: 'We ship orders within 1-2 business days. Delivery times typically take between 2 to 5 business days depending on your state and PIN code destination. Orders over $100 receive free shipping.'
    },
    {
      q: 'How can I return or exchange my items?',
      a: 'We offer a 15-day return and exchange window. To request a size change or return, you can contact our support team via email or click the WhatsApp Chat button on our footer. Items must be unworn and contain their original tags.'
    },
    {
      q: 'Which payment methods do you support?',
      a: 'We support multiple payment methods at checkout, including Cash on Delivery (COD), UPI (simulated VPA addresses), Razorpay, and Stripe.'
    },
    {
      q: 'Can I cancel an order after placing it?',
      a: 'Yes, you can cancel an order directly from your profile dashboard under "My Profile & Order History", provided the order status is still "Pending". Once the order has been shipped or delivered, it can no longer be self-cancelled.'
    },
    {
      q: 'Is my credit card or bank details secure?',
      a: 'Yes, this platform uses JWT tokens for session security and bcrypt for password hashing. However, please note that this is a simulated eCommerce application, and we do not collect or charge real credit cards or bank accounts.'
    }
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 w-full space-y-8 text-foreground">
      <div>
        <h1 className="text-3xl font-extrabold uppercase tracking-wide">Frequently Asked Questions</h1>
        <p className="text-xs text-muted-foreground mt-1">Quick answers to common inquiries about orders, returns, and payments.</p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div key={idx} className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="w-full p-4 flex items-center justify-between text-left focus:outline-none hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center space-x-3 pr-4">
                  <HelpCircle className="h-4.5 w-4.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wide">{faq.q}</span>
                </div>
                {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
              </button>
              
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-border pt-3 bg-muted/10 text-xs text-muted-foreground leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
