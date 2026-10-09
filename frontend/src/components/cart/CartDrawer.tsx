"use client";

import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { formatPKR, getMediaUrl } from '@/lib/format';
import Link from 'next/link';

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCartStore();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-boundary-white dark:bg-stadium-surface shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform translate-x-0">
        <div className="p-6 border-b border-stadium-grey dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-black text-stadium-dark dark:text-boundary-white flex items-center gap-2">
            <ShoppingBag size={24} className="text-field-green" /> Your Cart
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-stadium-grey dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-6 bg-stadium-grey dark:bg-slate-800 rounded-full">
                <ShoppingBag size={48} className="text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800 dark:text-white">Your cart is empty</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Looks there isnt any gear added yet.</p>
              </div>
              <Link 
                href="/shop" 
                onClick={onClose}
                className="px-6 py-3 bg-field-green text-white font-bold rounded-2xl hover:bg-field-green-light transition-all"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex gap-4 p-4 bg-stadium-grey/50 dark:bg-slate-800/50 rounded-2xl border border-stadium-grey dark:border-slate-700">
                  <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-stadium-grey dark:border-slate-700">
                    <img src={getMediaUrl(item.product.main_image)} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-stadium-dark dark:text-boundary-white line-clamp-1">{item.product.name}</h4>
                        <p className="text-sm font-black text-field-green">{formatPKR(item.product.price)}</p>
                      </div>
                      <button 
                        onClick={() => removeItem(item.product.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg border border-stadium-grey dark:border-slate-700 p-1">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 hover:bg-stadium-grey dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 hover:bg-stadium-grey dark:hover:bg-slate-800 rounded-md transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-sm font-black text-stadium-dark dark:text-boundary-white">
                        {formatPKR((parseFloat(item.product.price) || 0) * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-boundary-white dark:bg-stadium-surface border-t border-stadium-grey dark:border-slate-700 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatPKR(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Shipping</span>
                <span className="text-field-green font-bold">Free</span>
              </div>
              <div className="flex justify-between text-xl font-black text-stadium-dark dark:text-boundary-white pt-2 border-t border-stadium-grey dark:border-slate-700">
                <span>Total</span>
                <span>{formatPKR(getTotalPrice())}</span>
              </div>
            </div>
            <Link 
              href="/checkout" 
              onClick={onClose}
              className="block w-full py-4 bg-field-green text-white text-center font-black rounded-2xl hover:bg-field-green-light transition-all shadow-lg transform active:scale-95"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
