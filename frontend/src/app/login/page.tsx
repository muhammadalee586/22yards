"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login/', {
        username: formData.username.trim(),
        password: formData.password,
      });
      const { access, refresh, user } = response.data;
      setAuth(user, access, refresh);
      
      // Redirect to original page or dashboard
      const returnUrl = new URLSearchParams(window.location.search).get('next') || '/dashboard';
      router.push(returnUrl);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string; non_field_errors?: string[] } } };
      const data = error.response?.data;
      const errorMsg = data?.detail || 
                       (data?.non_field_errors && data.non_field_errors[0]) || 
                       'Invalid username/email or password';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pitch-cream dark:bg-stadium-dark px-4">
      <div className="max-w-md w-full bg-boundary-white dark:bg-stadium-surface rounded-3xl shadow-xl p-8 border border-stadium-grey dark:border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-field-green dark:text-field-green-light mb-2">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400">Sign in to manage your bookings</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl text-sm font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username or Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none transition-all"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <Link
                href="/reset-password"
                className="text-xs font-semibold text-field-green dark:text-field-green-light hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-10 pr-12 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-field-green transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-field-green hover:bg-field-green-light text-white font-bold rounded-xl transition-all transform active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Dont have an account? <Link href="/register" className="text-field-green dark:text-field-green-light font-bold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
