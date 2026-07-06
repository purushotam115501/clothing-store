'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Box, Search, Calendar, User, ChevronDown, ChevronUp, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';

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

export default function AdminOrdersPage() {
  const router = useRouter();
  const { loading: authLoading, isAdmin } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const data = await api.get(`/orders/admin/all?${params.toString()}`);
      setOrders(data);
    } catch (err) {
      console.error('Failed to retrieve administrative orders list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAdmin) {
        router.push('/login');
      } else {
        fetchOrders();
      }
    }
  }, [authLoading, isAdmin, statusFilter]); // Auto-fetch on status change

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    if (!confirm(`Are you sure you want to mark order status as "${nextStatus}"?`)) return;
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: nextStatus });
      alert(`Order marked as ${nextStatus} successfully.`);
      fetchOrders(); // Refresh table
    } catch (err: any) {
      alert(err.message || 'Failed to update order status.');
    }
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  if (authLoading || !isAdmin) {
    return <div className="p-12 text-center text-xs">Authenticating Admin privileges...</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8 text-foreground">
      {/* Title */}
      <div className="space-y-1 border-b border-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/admin/dashboard" className="inline-flex items-center space-x-1 text-xs font-semibold text-muted-foreground hover:text-primary mb-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-wide uppercase">Order Fulfillment Logs</h1>
          <p className="text-xs text-muted-foreground">Manage user shipments, mark delivered orders, and handle cancellations.</p>
        </div>

        {/* Search controls */}
        <div className="flex w-full md:w-auto items-center space-x-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-grow sm:flex-grow-0">
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 rounded border border-border bg-card px-3 py-2.5 pl-9 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
          </form>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-border bg-card p-2.5 text-xs focus:outline-none cursor-pointer"
          >
            <option value="">Filter: All Orders</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* ORDERS LISTING ACCORDION */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold px-2">
          <span>Displaying {orders.length} transactions</span>
          <button onClick={fetchOrders} className="hover:text-primary flex items-center space-x-0.5">
            <RefreshCw className="h-3 w-3" />
            <span>Sync</span>
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="h-16 rounded-lg bg-muted animate-pulse" />
            <div className="h-16 rounded-lg bg-muted animate-pulse" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center text-muted-foreground text-xs">
            No customer transaction records match the active filters.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order._id;
              
              let statusBadge = 'bg-yellow-500/10 text-yellow-600';
              if (order.orderStatus === 'Shipped') statusBadge = 'bg-blue-500/10 text-blue-600';
              if (order.orderStatus === 'Delivered') statusBadge = 'bg-green-500/10 text-green-600';
              if (order.orderStatus === 'Cancelled') statusBadge = 'bg-red-500/10 text-red-500';

              return (
                <div key={order._id} className="rounded-lg border border-border bg-card text-foreground shadow-sm overflow-hidden">
                  
                  {/* Collapsed view top card */}
                  <div
                    onClick={() => toggleExpandOrder(order._id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/20 transition-all text-xs"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-grow pr-4">
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">ID</span>
                        <p className="font-bold">#{order._id.substring(0, 10)}...</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Customer</span>
                        <p className="font-semibold">{order.shippingAddress.fullName}</p>
                      </div>
                      <div className="hidden md:block">
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Date</span>
                        <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Charged</span>
                        <p className="font-bold text-primary">${order.totalAmount.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">Status</span>
                        <span className={`inline-block rounded px-2.5 py-0.5 text-[9px] font-extrabold uppercase ${statusBadge}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                    <div>
                      {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-muted-foreground" /> : <ChevronDown className="h-4.5 w-4.5 text-muted-foreground" />}
                    </div>
                  </div>

                  {/* Expanded view detail sheet */}
                  {isExpanded && (
                    <div className="border-t border-border p-5 bg-muted/10 space-y-6 text-xs leading-relaxed">
                      
                      {/* Product line items */}
                      <div className="space-y-3">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Apparel Items</span>
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

                      {/* Coordinates and controls */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                        {/* Shipping */}
                        <div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Shipping Coordinate</span>
                          <p className="text-muted-foreground">
                            Name: <strong>{order.shippingAddress.fullName}</strong><br />
                            Address: {order.shippingAddress.address}, {order.shippingAddress.city}<br />
                            Location: {order.shippingAddress.state} - {order.shippingAddress.pinCode}<br />
                            Phone: {order.shippingAddress.mobileNumber}<br />
                            Email: {order.shippingAddress.email}
                          </p>
                        </div>

                        {/* Processing control panel */}
                        <div className="space-y-4">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">Transaction Parameters</span>
                            <p className="text-muted-foreground mt-1">
                              Method: <strong>{order.paymentMethod}</strong> | Status: <strong>{order.paymentStatus}</strong>
                            </p>
                          </div>

                          {/* Fulfillment Actions */}
                          {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                            <div className="pt-2">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Fulfillment Actions</span>
                              <div className="flex flex-wrap gap-2.5">
                                {order.orderStatus === 'Pending' && (
                                  <button
                                    onClick={() => handleUpdateStatus(order._id, 'Shipped')}
                                    className="rounded bg-blue-600 px-4 py-2 font-bold text-white uppercase hover:bg-blue-700 transition-colors"
                                  >
                                    Ship Order
                                  </button>
                                )}
                                
                                {order.orderStatus === 'Shipped' && (
                                  <button
                                    onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                                    className="rounded bg-green-600 px-4 py-2 font-bold text-white uppercase hover:bg-green-700 transition-colors"
                                  >
                                    Deliver Order
                                  </button>
                                )}

                                <button
                                  onClick={() => handleUpdateStatus(order._id, 'Cancelled')}
                                  className="rounded border border-red-500 px-4 py-2 font-bold text-red-500 uppercase hover:bg-red-500 hover:text-white transition-colors"
                                >
                                  Cancel Order
                                </button>
                              </div>
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
  );
}
