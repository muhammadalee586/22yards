"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

function ResetPasswordConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // If link is missing token or uid
  if (!uid || !token) {
    return (
      <div className="text-center py-4 space-y-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={36} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-stadium-dark dark:text-boundary-white mb-2">
            Invalid Reset Link
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This password reset link is invalid or incomplete. Please request a new password reset link.
          </p>
        </div>
        <Link
          href="/reset-password"
          className="inline-block w-full py-3.5 bg-field-green hover:bg-field-green-light text-white font-bold rounded-xl transition-all shadow-md"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword1.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword1 !== newPassword2) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      await apiClient.post('/auth/password/reset/confirm/', {
        uid,
        token,
        new_password1: newPassword1,
        new_password2: newPassword2,
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      const errorResponse = err as {
        response?: {
          data?: {
            detail?: string;
            new_password1?: string[];
            new_password2?: string[];
            non_field_errors?: string[];
            token?: string[];
            uid?: string[];
          };
        };
      };

      const data = errorResponse.response?.data;
      const errorMsg =
        data?.detail ||
        (data?.new_password1 && data.new_password1[0]) ||
        (data?.new_password2 && data.new_password2[0]) ||
        (data?.non_field_errors && data.non_field_errors[0]) ||
        (data?.token && 'This reset token is invalid or has expired. Please request a new link.') ||
        'Failed to reset password. The link may have expired.';

      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-4 space-y-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-950/40 text-field-green dark:text-field-green-light rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 size={36} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-stadium-dark dark:text-boundary-white mb-2">
            Password Reset Complete!
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Your password has been changed successfully. You can now use your new password to sign in.
          </p>
        </div>

        <Link
          href="/login"
          className="inline-block w-full py-3.5 bg-field-green hover:bg-field-green-light text-white font-bold rounded-xl transition-all shadow-md text-center"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black text-field-green dark:text-field-green-light mb-2">
          Set New Password
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Please enter your new password below.
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
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPass1 ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Minimum 8 characters"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none transition-all placeholder:text-gray-400"
              value={newPassword1}
              onChange={(e) => setNewPassword1(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPass1(!showPass1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-field-green transition-colors"
            >
              {showPass1 ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPass2 ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Re-enter your new password"
              className="w-full pl-10 pr-12 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none transition-all placeholder:text-gray-400"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPass2(!showPass2)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-field-green transition-colors"
            >
              {showPass2 ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
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
              <span>Updating Password...</span>
            </>
          ) : (
            'Reset Password'
          )}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-stadium-grey dark:border-slate-700">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-field-green dark:hover:text-field-green-light transition-colors"
        >
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>
    </>
  );
}

export default function ResetPasswordConfirmPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-pitch-cream dark:bg-stadium-dark px-4 py-12">
      <div className="max-w-md w-full bg-boundary-white dark:bg-stadium-surface rounded-3xl shadow-xl p-8 border border-stadium-grey dark:border-slate-700">
        <Suspense
          fallback={
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-field-green" size={32} />
              <p className="text-sm text-gray-500">Loading password reset...</p>
            </div>
          }
        >
          <ResetPasswordConfirmForm />
        </Suspense>
      </div>
    </div>
  );
}
