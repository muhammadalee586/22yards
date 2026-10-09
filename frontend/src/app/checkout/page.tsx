"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  ArrowLeft, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2 
} from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';
import { formatPKR } from '@/lib/format';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOrderCreation = async (orderDetails: any) => {
    if (!user) {
      toast.info('Please sign in to complete your checkout.');
      router.push('/login?next=/checkout');
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Map cart items to backend OrderCreateSerializer format: { product_id: id, quantity: num }
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }));

      await apiClient.post('/orders/', {
        items: orderItems,
        shipping_address: `${orderDetails.address} | Phone: ${orderDetails.phone}`,
      });

      clearCart();
      toast.success('Your gear order has been placed! 🏏');
      setStep('success');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string; shipping_address?: string[]; items?: string[] } } };
      const errData = error.response?.data;
      const errorMsg = errData?.detail || 
                       (errData?.shipping_address && errData.shipping_address[0]) ||
                       (errData?.items && (Array.isArray(errData.items) ? errData.items[0] : JSON.stringify(errData.items))) ||
                       'Order creation failed. Please try again.';
      const msg = typeof errorMsg === 'string' ? errorMsg : 'Order creation failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-6 bg-pitch-cream dark:bg-stadium-dark">
        <div className="p-6 bg-white dark:bg-stadium-surface rounded-full shadow-sm">
          <ShoppingBag size={64} className="text-gray-300" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-stadium-dark dark:text-boundary-white mb-2">Your cart is empty</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">You need to add some gear to your cart before you can proceed to checkout.</p>
        </div>
        <Link 
          href="/shop" 
          className="px-8 py-4 bg-field-green text-white font-black rounded-2xl hover:bg-field-green-light transition-all"
        >
          Go to Shop
        </Link>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-6 bg-pitch-cream dark:bg-stadium-dark">
        <div className="p-6 bg-green-100 text-green-600 rounded-full animate-bounce">
          <CheckCircle2 size={80} />
        </div>
        <div>
          <h1 className="text-4xl font-black text-stadium-dark dark:text-boundary-white mb-2">Order Placed!</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">Your gear is on its way. We'll notify you once it's dispatched.</p>
        </div>
        <Link 
          href="/dashboard" 
          className="px-8 py-4 bg-field-green text-white font-black rounded-2xl hover:bg-field-green-light transition-all"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pitch-cream dark:bg-stadium-dark py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/shop" 
          className="flex items-center gap-2 text-gray-500 hover:text-field-green mb-8 transition-colors font-bold"
        >
          <ArrowLeft size={20} /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-boundary-white dark:bg-stadium-surface p-8 rounded-3xl shadow-sm border border-stadium-grey dark:border-slate-700">
              <h2 className="text-2xl font-black text-stadium-dark dark:text-boundary-white mb-6 flex items-center gap-2">
                <CreditCard size={24} className="text-field-green" /> Delivery Details
              </h2>
              
              {!user && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Already have an account?</p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">Sign in to save this order to your account dashboard.</p>
                  </div>
                  <Link
                    href="/login?next=/checkout"
                    className="px-4 py-2 bg-field-green text-white rounded-xl text-xs font-bold hover:bg-field-green-light transition-all flex-shrink-0"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleOrderCreation({
                  address: formData.get('address'),
                  phone: formData.get('phone'),
                });
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Phone Number</label>
                    <input 
                      name="phone" 
                      required 
                      defaultValue={user?.phone_number || ''}
                      className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                      placeholder="03xx-xxxxxxx"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">Delivery Address</label>
                  <textarea 
                    name="address" 
                    required 
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                    placeholder="House #, Street, Area, City"
                  />
                </div>
                
                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                    <AlertCircle size={18} /> {error}
                  </div>
                )}

                <button 
                  disabled={loading}
                  className="w-full py-4 bg-field-green text-white font-black rounded-2xl hover:bg-field-green-light transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm Order'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-boundary-white dark:bg-stadium-surface p-6 rounded-3xl shadow-sm border border-stadium-grey dark:border-slate-700">
              <h3 className="text-xl font-black text-stadium-dark dark:text-boundary-white mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 line-clamp-1">{item.product.name} x {item.quantity}</span>
                    <span className="font-bold text-stadium-dark dark:text-boundary-white">{formatPKR((parseFloat(item.product.price) || 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-stadium-grey dark:border-slate-700 space-y-2">
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatPKR(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-xl font-black text-stadium-dark dark:text-boundary-white pt-2">
                  <span>Total</span>
                  <span>{formatPKR(getTotalPrice())}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
