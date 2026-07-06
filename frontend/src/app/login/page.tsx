'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, register, isAuthenticated } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/shop');
      }
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        setSuccessMsg('Logged in successfully!');
      } else {
        await register(name, email, password);
        setSuccessMsg('Account created successfully!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = () => {
    setEmail('admin@clothingstore.com');
    setPassword('admin123');
    setIsLogin(true);
  };

  const handleDemoCustomer = () => {
    setEmail('customer@clothingstore.com');
    setPassword('customer123');
    setIsLogin(true);
  };

  return (
    <div className="flex flex-col items-center justify-center flex-grow py-12 px-4 bg-muted/20">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-xl text-foreground space-y-6">
        
        {/* Header Tabs */}
        <div className="flex border-b border-border pb-1">
          <button
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${
              isLogin ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            className={`flex-1 pb-3 text-sm font-bold uppercase tracking-wider transition-colors ${
              !isLogin ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            }`}
          >
            Register
          </button>
        </div>

        {/* Brand logo details */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-extrabold tracking-widest uppercase">M O D E R N T H R E A D S</h2>
          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            {isLogin ? 'Access your curated wardrobe' : 'Join our luxury fashion network'}
          </p>
        </div>

        {/* Authentication form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name (Register only) */}
          {!isLogin && (
            <div>
              <label htmlFor="name-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Full Name</label>
              <div className="relative">
                <input
                  id="name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded border border-border bg-transparent py-2.5 px-3 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <UserIcon className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          )}

          {/* Email */}
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

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password-input" className="block text-xs font-semibold text-muted-foreground uppercase">Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-[10px] text-muted-foreground hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              )}
            </div>
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

          {errorMsg && (
            <p className="text-xs text-red-500 font-semibold">{errorMsg}</p>
          )}

          {successMsg && (
            <p className="text-xs text-green-500 font-semibold">{successMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 rounded bg-primary py-3.5 text-xs font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-colors focus:outline-none disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Sandbox Quick login triggers */}
        <div className="border-t border-border pt-6 space-y-3">
          <span className="block text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Simulated Sandbox Logins
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDemoCustomer}
              className="rounded border border-border bg-muted/50 py-2.5 text-[10px] font-bold text-muted-foreground hover:bg-muted hover:text-primary transition-all focus:outline-none"
            >
              Load Demo Customer
            </button>
            <button
              onClick={handleDemoAdmin}
              className="rounded border border-red-500/30 bg-red-50/10 py-2.5 text-[10px] font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all focus:outline-none"
            >
              Load Demo Admin
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
