'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, CheckCircle2, ShoppingBag, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { SimulatedPaymentModal } from '../../components/SimulatedPaymentModal';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, clearCart, couponCode, discountPercent } = useCart();

  // Shipping Form States
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Delivery' | 'UPI' | 'Razorpay' | 'Stripe'>('Cash on Delivery');

  // Simulated payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Finished order states
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setErrorMsg('');

    // Trigger simulated payment if card/UPI is selected
    if (paymentMethod !== 'Cash on Delivery') {
      setPaymentModalOpen(true);
      return;
    }

    // Process Cash on Delivery directly
    await createFinalOrder();
  };

  const createFinalOrder = async (paymentId?: string) => {
    setSubmitting(true);
    try {
      const orderPayload = {
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        shippingAddress: {
          fullName,
          mobileNumber,
          email,
          address,
          city,
          state,
          pinCode
        },
        paymentMethod,
        paymentId: paymentId || '',
        totalAmount: total
      };

      const res = await api.post('/orders', orderPayload);
      setPlacedOrder(res.order);
      clearCart();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to place order. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string) => {
    setPaymentModalOpen(false);
    await createFinalOrder(paymentId);
  };

  const handlePaymentFailure = (error: string) => {
    setPaymentModalOpen(false);
    setErrorMsg(`Payment simulation failed: ${error}`);
  };

  // SUCCESS SCREEN
  if (placedOrder) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6 animate-fade-in">
        <div className="inline-flex rounded-full bg-green-500/10 p-6 text-green-500">
          <CheckCircle2 className="h-16 w-16" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold uppercase tracking-wider text-green-600">Order Placed Successfully!</h1>
          <p className="text-sm font-semibold">Order ID: #{placedOrder._id}</p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
            Thank you for shopping with us! A confirmation email containing your shipping details has been simulated and sent to <strong className="text-foreground">{placedOrder.shippingAddress.email}</strong>.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 text-left space-y-4 max-w-sm mx-auto shadow-sm">
          <h3 className="text-xs font-bold uppercase border-b border-border pb-2">Delivery Coordinates</h3>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            {placedOrder.shippingAddress.fullName}<br />
            {placedOrder.shippingAddress.address}, {placedOrder.shippingAddress.city}<br />
            {placedOrder.shippingAddress.state} - {placedOrder.shippingAddress.pinCode}<br />
            Phone: {placedOrder.shippingAddress.mobileNumber}
          </p>
          <div className="flex justify-between text-xs font-bold border-t border-border pt-2">
            <span>Total Charged</span>
            <span>${placedOrder.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={() => router.push('/shop')}
          className="inline-block rounded bg-primary px-8 py-3.5 text-xs font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-colors shadow-md"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center space-y-6">
        <div className="inline-flex rounded-full bg-muted p-6 text-muted-foreground animate-pulse">
          <ShoppingBag className="h-12 w-12" />
        </div>
        <h1 className="text-xl font-bold uppercase tracking-wide">No Items for Checkout</h1>
        <Link href="/shop" className="inline-block rounded bg-primary px-6 py-2.5 text-xs font-bold text-primary-foreground uppercase tracking-wider hover:bg-neutral-900 transition-colors">
          Browse Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-8">
      
      {/* Return to cart */}
      <Link href="/cart" className="inline-flex items-center space-x-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Shopping Bag</span>
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold tracking-wide uppercase">Secured Checkout</h1>
        <p className="text-xs text-muted-foreground mt-1">Complete your delivery address and choose payment method.</p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* SHIPPING FORM */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-border pb-3">Shipping Address</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="full-name-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Full Name</label>
                <input
                  id="full-name-input"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full rounded border border-border bg-transparent p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="phone-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Phone Number</label>
                <input
                  id="phone-input"
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded border border-border bg-transparent p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="email-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Email Address</label>
                <input
                  id="email-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jane@example.com"
                  className="w-full rounded border border-border bg-transparent p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Street Address</label>
                <input
                  id="address-input"
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat, building, suite, or street coordinates"
                  className="w-full rounded border border-border bg-transparent p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="city-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">City</label>
                <input
                  id="city-input"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded border border-border bg-transparent p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="state-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">State / Province</label>
                <input
                  id="state-input"
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full rounded border border-border bg-transparent p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="zipcode-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">PIN / ZIP Code</label>
                <input
                  id="zipcode-input"
                  type="text"
                  required
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full rounded border border-border bg-transparent p-2.5 text-xs focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* PAYMENT METHODS SELECTOR */}
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider border-b border-border pb-3">Payment Method</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Cash on Delivery', desc: 'Pay at your door' },
                { name: 'UPI', desc: 'Pay with simulated UPI apps' },
                { name: 'Razorpay', desc: 'Simulated Card/Netbanking' },
                { name: 'Stripe', desc: 'Simulated Stripe Card checkout' }
              ].map((method) => (
                <label
                  key={method.name}
                  className={`flex items-start rounded border p-4 cursor-pointer transition-all hover:bg-muted ${
                    paymentMethod === method.name ? 'border-primary ring-1 ring-primary' : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_option"
                    checked={paymentMethod === method.name}
                    onChange={() => setPaymentMethod(method.name as any)}
                    className="mt-1 text-primary focus:ring-primary h-3.5 w-3.5 border-border"
                  />
                  <div className="ml-3">
                    <span className="block text-xs font-bold tracking-wide uppercase">{method.name}</span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">{method.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider border-b border-border pb-3">Items Review</h3>

            {/* Cart preview */}
            <div className="max-h-60 overflow-y-auto space-y-4 pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <img src={item.image} alt="" className="h-10 w-7.5 object-cover object-center rounded border border-border bg-muted flex-shrink-0" />
                    <div>
                      <p className="font-semibold truncate max-w-[120px]">{item.productName}</p>
                      <p className="text-[9px] text-muted-foreground uppercase">{item.size} | {item.color}</p>
                    </div>
                  </div>
                  <span className="font-bold text-muted-foreground">x{item.quantity}</span>
                  <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Calculations review */}
            <div className="border-t border-border pt-4 space-y-2 text-xs">
              {couponCode && (
                <div className="flex justify-between text-green-500 font-semibold">
                  <span>Coupon ({couponCode})</span>
                  <span>-{discountPercent}%</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm">
                <span>Grand Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="rounded bg-red-500/10 p-3 text-xs text-red-500 border border-red-500/20 flex items-center space-x-1.5">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded bg-primary py-3.5 text-xs font-bold text-primary-foreground uppercase tracking-widest hover:bg-neutral-900 transition-colors focus:outline-none disabled:opacity-50"
            >
              {submitting ? 'Placing Order...' : (paymentMethod === 'Cash on Delivery' ? 'Confirm Order' : `Pay & Place Order`)}
            </button>
          </div>
        </div>

      </form>

      {/* Payment gateway simulator */}
      <SimulatedPaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
        amount={total}
        method={paymentMethod as any}
      />

    </div>
  );
}
