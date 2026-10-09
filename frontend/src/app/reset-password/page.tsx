"use client";

import React, { useState } from 'react';
import apiClient from '@/lib/apiClient';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordRequestPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiClient.post('/auth/password/reset/', { email: email.trim() });
      setIsSubmitted(true);
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { detail?: string; email?: string[] } } };
      const detail = errorResponse.response?.data?.detail || 
                     (errorResponse.response?.data?.email && errorResponse.response.data.email[0]) ||
                     'Unable to send password reset email. Please try again.';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pitch-cream dark:bg-stadium-dark px-4 py-12">
      <div className="max-w-md w-full bg-boundary-white dark:bg-stadium-surface rounded-3xl shadow-xl p-8 border border-stadium-grey dark:border-slate-700">
        
        {isSubmitted ? (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-950/40 text-field-green dark:text-field-green-light rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-stadium-dark dark:text-boundary-white mb-2">Check Your Email</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                If an account exists for <span className="font-semibold text-gray-800 dark:text-gray-200">{email}</span>, you will receive an email with instructions to reset your password.
              </p>
            </div>

            <div className="p-4 bg-stadium-grey/60 dark:bg-slate-800/60 rounded-2xl text-xs text-gray-500 dark:text-gray-400 text-left">
              <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Didn't receive an email?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spam or junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>In development mode, check your server console log</li>
              </ul>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }}
                className="w-full py-3 bg-stadium-grey dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold rounded-xl transition-all text-sm"
              >
                Try another email
              </button>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full text-sm font-bold text-field-green dark:text-field-green-light hover:underline"
              >
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-field-green dark:text-field-green-light mb-2">
                Forgot Password?
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Enter your registered email address and we'll send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="e.g. player@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none transition-all placeholder:text-gray-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-field-green hover:bg-field-green-light text-white font-bold rounded-xl transition-all transform active:scale-95 disabled:opacity-50 shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-stadium-grey dark:border-slate-700">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-field-green dark:hover:text-field-green-light transition-colors"
              >
                <ArrowLeft size={16} /> Remember your password? Sign In
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
