'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pre-fill email from query param if available
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/reset-password', { email, password });
      setSuccessMsg(res.message || 'Password reset successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow py-12 px-4 bg-muted/20">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-xl text-foreground space-y-6">
        
        {/* Return to Sign In */}
        <Link href="/login" className="inline-flex items-center space-x-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Sign In</span>
        </Link>

        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-widest uppercase">Change Password</h2>
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Configure a new password for your account
          </p>
        </div>

        {successMsg ? (
          <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/20 text-green-600 text-xs flex items-start space-x-2">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Password Reset Successful!</p>
              <p className="text-muted-foreground leading-relaxed">{successMsg}</p>
              <p className="text-muted-foreground text-[10px]">Redirecting to Sign In...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Address */}
            <div>
              <label htmlFor="email-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Email Address</label>
              <div className="relative">
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@clothingstore.com"
                  className="w-full rounded border border-border bg-transparent py-2.5 px-3 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Mail className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="password-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">New Password</label>
              <div className="relative">
                <input
                  id="password-input"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded border border-border bg-transparent py-2.5 px-3 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Lock className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  id="confirm-password-input"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded border border-border bg-transparent py-2.5 px-3 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Lock className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 rounded bg-primary py-3.5 text-xs font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-colors focus:outline-none disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : 'Reset Password'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Loading recovery view...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
