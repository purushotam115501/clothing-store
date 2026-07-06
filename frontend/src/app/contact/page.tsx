'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate sending message
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 w-full space-y-12 text-foreground">
      <div>
        <h1 className="text-3xl font-extrabold uppercase tracking-wide">Contact Us</h1>
        <p className="text-xs text-muted-foreground mt-1">Get in touch with our customer assistance network.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Coordinates */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-border pb-3">Support Desks</h3>
            
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <MapPin className="h-4.5 w-4.5 text-primary flex-shrink-0" />
              <span>100 Fashion Avenue, Suite 400, New York, NY 10001</span>
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <Phone className="h-4.5 w-4.5 text-primary flex-shrink-0" />
              <span>+1 (800) 555-8899 (Mon-Fri 9:00 AM - 6:00 PM EST)</span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
              <Mail className="h-4.5 w-4.5 text-primary flex-shrink-0" />
              <span>support@modernthreads.com</span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-border pb-3 mb-3">Delivery Notes</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Standard shipments are processed automatically on business days. If you need to make corrections to a shipping address, please contact support immediately with your simulated Order ID.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-lg border border-border bg-card p-8 shadow-sm space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider border-b border-border pb-3">Send Message</h3>

          {success ? (
            <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/20 text-green-500 text-xs flex items-center space-x-2">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span>Your message was simulated and sent! We will get back to you soon.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Your Name</label>
                <input
                  id="name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border border-border bg-transparent p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="email-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Email Address</label>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border border-border bg-transparent p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="subject-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Subject</label>
                <input
                  id="subject-input"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded border border-border bg-transparent p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="message-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Message</label>
                <textarea
                  id="message-input"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded border border-border bg-transparent p-2.5 text-xs focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded bg-primary py-3 text-xs font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-colors flex items-center justify-center space-x-2"
              >
                <span>{submitting ? 'Sending...' : 'Send Message'}</span>
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
