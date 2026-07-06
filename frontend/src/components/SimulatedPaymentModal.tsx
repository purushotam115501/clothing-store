'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowRight, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface SimulatedPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  onFailure: (errorMsg: string) => void;
  amount: number;
  method: 'UPI' | 'Razorpay' | 'Stripe';
}

export const SimulatedPaymentModal: React.FC<SimulatedPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onFailure,
  amount,
  method
}) => {
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'failure'>('form');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [upiId, setUpiId] = useState('customer@okaxis');
  const [cvc, setCvc] = useState('***');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('form');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSimulatePayment = (simulateSuccess: boolean) => {
    setStep('processing');
    
    // Simulate API delay
    setTimeout(() => {
      if (simulateSuccess) {
        setStep('success');
        const paymentId = 'pay_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        setTimeout(() => {
          onSuccess(paymentId);
        }, 1500);
      } else {
        setStep('failure');
        const error = 'Insufficient funds / Simulating failed transaction.';
        setErrorMsg(error);
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-2xl p-6">
        
        {/* FORM STEP */}
        {step === 'form' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-bold uppercase tracking-wider">Simulated Payment Portal</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-primary text-sm font-semibold">Cancel</button>
            </div>

            <div className="rounded bg-muted p-4 text-center">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Amount to Pay</span>
              <p className="text-3xl font-extrabold tracking-wide mt-1">${amount.toFixed(2)}</p>
              <span className="text-[10px] text-zinc-500 block mt-1 uppercase">Method: Simulated {method} Gateway</span>
            </div>

            {method === 'Stripe' && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="card-number-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Card Number</label>
                  <input
                    id="card-number-input"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded border border-border bg-transparent p-2.5 text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">Expiry</label>
                    <input id="expiry-input" type="text" placeholder="12 / 28" className="w-full rounded border border-border bg-transparent p-2.5 text-xs focus:outline-none text-center" />
                  </div>
                  <div>
                    <label htmlFor="cvv-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">CVV</label>
                    <input
                      id="cvv-input"
                      type="password"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      className="w-full rounded border border-border bg-transparent p-2.5 text-xs focus:outline-none text-center"
                    />
                  </div>
                </div>
              </div>
            )}

            {(method === 'UPI' || method === 'Razorpay') && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="upi-id-input" className="block text-xs font-semibold text-muted-foreground uppercase mb-1">UPI Address (VPA)</label>
                  <input
                    id="upi-id-input"
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full rounded border border-border bg-transparent p-2.5 text-xs font-semibold focus:outline-none"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Accepts any mock format.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleSimulatePayment(false)}
                className="rounded border border-red-500 bg-red-50/10 py-3 text-xs font-bold text-red-500 uppercase hover:bg-red-500 hover:text-white transition-all focus:outline-none"
              >
                Fail Payment
              </button>
              <button
                onClick={() => handleSimulatePayment(true)}
                className="rounded bg-primary py-3 text-xs font-bold text-primary-foreground uppercase hover:bg-neutral-900 transition-all focus:outline-none flex items-center justify-center space-x-1"
              >
                <span>Pay Securely</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* PROCESSING STEP */}
        {step === 'processing' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <div className="text-center">
              <h4 className="text-sm font-bold uppercase tracking-wider">Processing Transaction</h4>
              <p className="text-xs text-muted-foreground mt-1">Please do not refresh or close the browser window...</p>
            </div>
          </div>
        )}

        {/* SUCCESS STEP */}
        {step === 'success' && (
          <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div className="text-center">
              <h4 className="text-sm font-bold uppercase tracking-wider text-green-500">Payment Successful</h4>
              <p className="text-xs text-muted-foreground mt-1">Redirecting to order confirmation page...</p>
            </div>
          </div>
        )}

        {/* FAILURE STEP */}
        {step === 'failure' && (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 animate-fade-in">
            <XCircle className="h-16 w-16 text-red-500" />
            <div className="text-center">
              <h4 className="text-sm font-bold uppercase tracking-wider text-red-500 font-semibold">Payment Declined</h4>
              <p className="text-xs text-red-400 mt-2">{errorMsg}</p>
            </div>
            <button
              onClick={() => setStep('form')}
              className="mt-4 rounded bg-primary px-6 py-2 text-xs font-bold text-primary-foreground uppercase hover:bg-neutral-900 transition-colors focus:outline-none"
            >
              Try Again
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
