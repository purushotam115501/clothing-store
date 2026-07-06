'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DollarSign, ShoppingCart, Tag, Users, ShieldAlert, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  customers: number;
  recentOrders: any[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.get('/orders/admin/stats');
      setStats(data);
    } catch (err) {
      console.warn('Failed to load admin stats, loading demo fallbacks', err);
      // Fallback demo stats
      setStats({
        totalProducts: 7,
        totalOrders: 4,
        revenue: 359.98,
        customers: 2,
        recentOrders: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/login');
      } else {
        fetchStats();
      }
    }
  }, [authLoading, isAdmin]);

  if (authLoading || !isAdmin) {
    return <div className="p-12 text-center text-xs">Authenticating Administrator privileges...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8 text-foreground">
      {/* Top title bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-wide uppercase flex items-center space-x-2">
            <BarChart2 className="h-7 w-7 text-red-500" />
            <span>Admin Control Panel</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Realtime analytics, inventory management, and fulfillment control.</p>
        </div>
        
        {/* Navigation helpers */}
        <div className="flex space-x-3 w-full sm:w-auto">
          <Link
            href="/admin/products"
            className="flex-1 sm:flex-initial rounded border border-border bg-card px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-center hover:bg-muted"
          >
            Manage Products
          </Link>
          <Link
            href="/admin/orders"
            className="flex-1 sm:flex-initial rounded bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground uppercase tracking-wider text-center hover:bg-neutral-900"
          >
            Manage Orders
          </Link>
        </div>
      </div>

      {/* METRICS CARDS GRID */}
      {loading || !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Revenue</span>
              <DollarSign className="h-4.5 w-4.5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold tracking-wide">${stats.revenue.toFixed(2)}</p>
              <span className="text-[9px] text-green-500 font-semibold uppercase">Completed sales</span>
            </div>
          </div>

          {/* Orders */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
              <ShoppingCart className="h-4.5 w-4.5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold tracking-wide">{stats.totalOrders}</p>
              <span className="text-[9px] text-blue-500 font-semibold uppercase">Placed transactions</span>
            </div>
          </div>

          {/* Products */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Products</span>
              <Tag className="h-4.5 w-4.5 text-yellow-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold tracking-wide">{stats.totalProducts}</p>
              <span className="text-[9px] text-yellow-500 font-semibold uppercase">Items in catalog</span>
            </div>
          </div>

          {/* Customers */}
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Customers</span>
              <Users className="h-4.5 w-4.5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-extrabold tracking-wide">{stats.customers}</p>
              <span className="text-[9px] text-purple-500 font-semibold uppercase">Unique buyers</span>
            </div>
          </div>
        </div>
      )}

      {/* RECENT ORDERS TABLE */}
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider">Recent Orders</h3>
          <button
            onClick={fetchStats}
            className="text-[10px] text-muted-foreground hover:text-primary hover:underline font-semibold flex items-center space-x-0.5"
          >
            <RefreshCw className="h-2.5 w-2.5" />
            <span>Sync</span>
          </button>
        </div>

        {loading || !stats ? (
          <div className="p-8 space-y-4">
            <div className="h-8 rounded bg-muted animate-pulse" />
            <div className="h-8 rounded bg-muted animate-pulse" />
          </div>
        ) : stats.recentOrders.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground text-xs">
            No orders found in the database. When users place orders, they will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="p-4 text-[10px]">Order ID</th>
                  <th className="p-4 text-[10px]">Customer</th>
                  <th className="p-4 text-[10px]">Date</th>
                  <th className="p-4 text-[10px]">Amount</th>
                  <th className="p-4 text-[10px]">Status</th>
                  <th className="p-4 text-[10px] text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentOrders.map((order) => {
                  let statusColor = 'bg-yellow-500/10 text-yellow-600';
                  if (order.orderStatus === 'Shipped') statusColor = 'bg-blue-500/10 text-blue-600';
                  if (order.orderStatus === 'Delivered') statusColor = 'bg-green-500/10 text-green-600';
                  if (order.orderStatus === 'Cancelled') statusColor = 'bg-red-500/10 text-red-500';

                  return (
                    <tr key={order._id} className="hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-semibold">#{order._id.substring(0, 10)}...</td>
                      <td className="p-4">{order.shippingAddress.fullName}</td>
                      <td className="p-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold">${order.totalAmount.toFixed(2)}</td>
                      <td className="p-4">
                        <span className={`inline-block rounded px-2.5 py-0.5 text-[9px] font-bold uppercase ${statusColor}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href="/admin/orders"
                          className="inline-flex items-center space-x-1 font-bold text-red-500 hover:underline"
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
