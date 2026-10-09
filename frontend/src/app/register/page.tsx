"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { useAuthStore } from '@/store/useAuthStore';
import { User as UserType } from '@/types';
import { User, Mail, Lock, Phone } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: '',
    phone_number: '',
    role: 'USER' as 'USER' | 'OWNER'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password1 !== formData.password2) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password1.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password1: formData.password1,
        password2: formData.password2,
        phone_number: formData.phone_number.trim(),
        role: formData.role,
      };

      const response = await apiClient.post('/auth/registration/', payload);
      if (response.data.access) {
        const { access, refresh, user } = response.data;
        setAuth(user, access, refresh);
        router.push('/dashboard');
      } else {
        router.push('/login?message=registered');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: Record<string, any> } };
      const data = error.response?.data;
      let message = 'Registration failed. Please check your details.';
      if (data) {
        if (typeof data === 'string') {
          message = data;
        } else if (data.detail) {
          message = data.detail;
        } else if (data.non_field_errors && data.non_field_errors.length > 0) {
          message = data.non_field_errors[0];
        } else {
          const errorList: string[] = [];
          Object.entries(data).forEach(([field, val]) => {
            const fieldText = Array.isArray(val) ? val.join(' ') : String(val);
            const label = field === 'password1' ? 'Password' : 
                          field === 'password2' ? 'Confirm password' : 
                          field.replace('_', ' ');
            errorList.push(`${label.charAt(0).toUpperCase() + label.slice(1)}: ${fieldText}`);
          });
          if (errorList.length > 0) {
            message = errorList.join(' · ');
          }
        }
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-pitch-cream dark:bg-stadium-dark px-4 py-12">
      <div className="max-w-2xl w-full bg-boundary-white dark:bg-stadium-surface rounded-3xl shadow-xl p-8 border border-stadium-grey dark:border-slate-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-field-green dark:text-field-green-light mb-2">Join 22 Yards</h1>
          <p className="text-gray-500 dark:text-gray-400">Create your account to start booking courts</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl text-sm font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none transition-all"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none transition-all"
                  value={formData.password1}
                  onChange={(e) => setFormData({...formData, password1: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none transition-all"
                  value={formData.password2}
                  onChange={(e) => setFormData({...formData, password2: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Type</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'USER'})}
                  className={`py-3 px-4 rounded-xl border-2 transition-all text-sm font-bold ${
                    formData.role === 'USER' 
                    ? 'border-field-green bg-field-green text-white' 
                    : 'border-stadium-grey dark:border-slate-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  I want to play
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'OWNER'})}
                  className={`py-3 px-4 rounded-xl border-2 transition-all text-sm font-bold ${
                    formData.role === 'OWNER' 
                    ? 'border-field-green bg-field-green text-white' 
                    : 'border-stadium-grey dark:border-slate-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  I own a court
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-field-green hover:bg-field-green-light text-white font-bold rounded-xl transition-all transform active:scale-95 disabled:opacity-50 mt-auto cursor-pointer"
            >
              {isLoading ? 'Creating account...' : 'Register Now'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-stadium-grey dark:border-slate-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-field-green dark:text-field-green-light font-bold hover:underline">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
