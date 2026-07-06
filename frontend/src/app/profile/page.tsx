'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { User as UserIcon, Lock, Box, Calendar, CreditCard, ChevronDown, ChevronUp, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  image: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    mobileNumber: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, updateProfile, isAuthenticated } = useAuth();
  
  // Profile edit states
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Order history states
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await api.get('/orders/my-orders');
      setOrders(data);
    } catch (err) {
      console.warn('Failed to load order history from API', err);
      setOrders([]); // Fallback to empty
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSubmitting(true);
    try {
      await updateProfile(name, password || undefined);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      setPassword('');
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.post(`/orders/${orderId}/cancel`, {});
      alert('Order cancelled successfully.');
      fetchOrders(); // Refresh order listing
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    }
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-6">
        <div className="inline-flex rounded-full bg-muted p-6 text-muted-foreground">
          <UserIcon className="h-12 w-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold uppercase tracking-wide">Login Required</h1>
          <p className="text-xs text-muted-foreground">Please sign in to view your profile settings and order history.</p>
        </div>
        <Link href="/login" className="inline-block rounded bg-primary px-8 py-3.5 text-xs font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-colors shadow-md">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-wide uppercase">My Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">Manage profile parameters and track past transactions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* PROFILE FORM PANEL */}
        <div>
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-border pb-3">Account Information</h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label htmlFor="name-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Full Name</label>
                <div className="relative">
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded border border-border bg-transparent py-2.5 px-3 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <UserIcon className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label htmlFor="email-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Email Address (Readonly)</label>
                <div className="relative">
                  <input
                    id="email-input"
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full rounded border border-border bg-muted/50 py-2.5 px-3 pl-8 text-xs focus:outline-none opacity-80"
                  />
                  <Lock className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label htmlFor="password-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Change Password</label>
                <div className="relative">
                  <input
                    id="password-input"
                    type="password"
                    placeholder="Leave empty to keep current"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded border border-border bg-transparent py-2.5 px-3 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Lock className="absolute left-2.5 top-3.5 h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </div>

              {profileMsg && (
                <p className={`text-xs font-semibold ${profileMsg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {profileMsg.text}
                </p>
              )}

              <button
                type="submit"
                disabled={profileSubmitting}
                className="w-full rounded bg-primary py-3 text-xs font-bold text-primary-foreground uppercase tracking-wider hover:bg-neutral-900 transition-colors focus:outline-none disabled:opacity-50"
              >
                {profileSubmitting ? 'Saving changes...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>

        {/* ORDER HISTORY LIST PANEL */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider">Purchase History</h3>
            <button
              onClick={fetchOrders}
              className="text-[10px] text-muted-foreground hover:text-primary hover:underline font-semibold flex items-center space-x-0.5"
            >
              <RefreshCw className="h-2.5 w-2.5" />
              <span>Refresh</span>
            </button>
          </div>

          {ordersLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground">
              <Box className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-xs">No orders recorded yet under this customer account.</p>
              <Link href="/shop" className="mt-3 inline-block rounded bg-primary px-4 py-2 text-[10px] font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-all">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isExpanded = expandedOrderId === order._id;
                const dateStr = new Date(order.createdAt).toLocaleDateString();
                
                // Color badges for statuses
                let statusColor = 'bg-yellow-500/10 text-yellow-600';
                if (order.orderStatus === 'Shipped') statusColor = 'bg-blue-500/10 text-blue-600';
                if (order.orderStatus === 'Delivered') statusColor = 'bg-green-500/10 text-green-600';
                if (order.orderStatus === 'Cancelled') statusColor = 'bg-red-500/10 text-red-500';

                return (
                  <div key={order._id} className="rounded-lg border border-border bg-card text-foreground shadow-sm overflow-hidden transition-all">
                    {/* Collapsed top bar */}
                    <div
                      onClick={() => toggleExpandOrder(order._id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors text-xs"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-grow pr-4">
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Order ID</span>
                          <span className="font-bold">#{order._id.substring(0, 10)}...</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Date</span>
                          <span className="font-bold">{dateStr}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Total Amount</span>
                          <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-semibold uppercase">Status</span>
                          <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${statusColor}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                      <div>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="border-t border-border p-4 bg-muted/10 space-y-6 text-xs">
                        {/* Items listed */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Items</span>
                          <div className="divide-y divide-border">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center py-2">
                                <div className="flex items-center space-x-2">
                                  <img src={item.image} alt="" className="h-10 w-7.5 object-cover object-center rounded border border-border bg-muted flex-shrink-0" />
                                  <div>
                                    <p className="font-semibold">{item.productName}</p>
                                    <p className="text-[9px] text-muted-foreground uppercase">{item.size} | {item.color}</p>
                                  </div>
                                </div>
                                <span className="font-bold">x{item.quantity}</span>
                                <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shipping address & Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Shipping Coordinate</span>
                            <p className="text-muted-foreground leading-relaxed">
                              <strong>{order.shippingAddress.fullName}</strong><br />
                              {order.shippingAddress.address}, {order.shippingAddress.city}<br />
                              {order.shippingAddress.state} - {order.shippingAddress.pinCode}<br />
                              Phone: {order.shippingAddress.mobileNumber}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Payment Parameter</span>
                              <p className="text-muted-foreground">
                                Method: <strong>{order.paymentMethod}</strong> | Status: <strong>{order.paymentStatus}</strong>
                              </p>
                            </div>
                            
                            {/* Cancellation action */}
                            {order.orderStatus === 'Pending' && (
                              <div className="pt-2">
                                <button
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="rounded border border-red-500 px-4 py-2 text-[10px] font-bold text-red-500 uppercase hover:bg-red-500 hover:text-white transition-colors"
                                >
                                  Cancel Order
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
