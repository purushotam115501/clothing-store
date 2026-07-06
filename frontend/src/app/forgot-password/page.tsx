'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccessMsg(res.message || 'Reset instructions have been simulated.');
      if (res.resetToken) {
        setResetToken(res.resetToken);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset request.');
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
          <h2 className="text-xl font-extrabold tracking-widest uppercase">Reset Password</h2>
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Enter your email to receive recovery parameters
          </p>
        </div>

        {successMsg ? (
          <div className="space-y-4">
            <div className="rounded-lg bg-green-500/10 p-4 border border-green-500/20 text-green-600 text-xs flex items-start space-x-2">
              <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Instructions Simulated!</p>
                <p className="text-muted-foreground leading-relaxed">{successMsg}</p>
                {resetToken && (
                  <p className="mt-2 text-[10px] bg-muted/50 p-2 rounded text-foreground font-mono">
                    Token: <strong className="font-bold select-all">{resetToken}</strong>
                  </p>
                )}
              </div>
            </div>

            <div className="rounded bg-muted/50 p-4 border border-border text-[11px] text-muted-foreground flex items-start space-x-2">
              <HelpCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
              <span>
                To complete password change, navigate to the password reset page using the button below.
              </span>
            </div>

            <Link
              href={`/reset-password?email=${encodeURIComponent(email)}`}
              className="w-full flex items-center justify-center space-x-2 rounded bg-primary py-3.5 text-xs font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-colors"
            >
              <span>Go to Password Reset</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Email Address</label>
              <div className="relative">
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@clothingstore.com"
                  className="w-full rounded border border-border bg-transparent py-2.5 px-3 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Mail className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-muted-foreground" />
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
              <span>{loading ? 'Requesting...' : 'Request Recovery'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
