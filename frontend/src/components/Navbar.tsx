"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Moon, Sun, User, Menu, X, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/lib/apiClient';

const Navbar = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const { user, clearAuth } = useAuthStore();

  // Prevent hydration mismatch by only rendering theme-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout/').catch(() => {});
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 w-full bg-boundary-white dark:bg-stadium-dark border-b border-stadium-grey dark:border-slate-700 shadow-sm h-16" />
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-boundary-white dark:bg-stadium-dark border-b border-stadium-grey dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-field-green dark:text-field-green-light tracking-tight">
              22 <span className="text-ball-red dark:text-ball-red-dark">YARDS</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-field-green dark:hover:text-field-green-light transition-colors">
              Home
            </Link>
            <Link href="/courts" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-field-green dark:hover:text-field-green-light transition-colors">
              Explore Courts
            </Link>
            <Link href="/shop" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-field-green dark:hover:text-field-green-light transition-colors">
              Shop Gear
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-field-green dark:hover:text-field-green-light transition-colors">
              My Dashboard
            </Link>

            <div className="flex items-center space-x-4 pl-4 border-l border-stadium-grey dark:border-slate-700">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full bg-stadium-grey dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:ring-2 ring-field-green transition-all cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 py-1.5 px-3 rounded-xl bg-field-green/10 dark:bg-field-green-light/10 text-field-green dark:text-field-green-light font-bold text-sm hover:bg-field-green/20 transition-all"
                  >
                    <User size={16} />
                    <span>{user.username}</span>
                    {user.role && user.role !== 'USER' && (
                      <span className="text-[10px] bg-field-green text-white px-1.5 py-0.5 rounded uppercase font-black">
                        {user.role}
                      </span>
                    )}
                  </Link>

                  <button
                    onClick={handleLogout}
                    title="Log Out"
                    className="flex items-center space-x-1.5 py-1.5 px-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-ball-red dark:text-ball-red-dark text-sm font-bold transition-all cursor-pointer"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-1 text-sm font-semibold text-field-green dark:text-field-green-light hover:underline"
                >
                  <User size={18} />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-stadium-grey dark:bg-slate-800 text-gray-600 dark:text-gray-300"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-boundary-white dark:bg-stadium-dark border-b border-stadium-grey dark:border-slate-700 px-4 py-4 space-y-4">
          <Link href="/" onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-600 dark:text-gray-300">Home</Link>
          <Link href="/courts" onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-600 dark:text-gray-300">Explore Courts</Link>
          <Link href="/shop" onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-600 dark:text-gray-300">Shop Gear</Link>
          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="block text-base font-medium text-gray-600 dark:text-gray-300">Dashboard</Link>

          <div className="pt-4 border-t border-stadium-grey dark:border-slate-700">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-field-green" />
                  <span className="text-sm font-bold text-gray-800 dark:text-white">
                    {user.username}
                  </span>
                  {user.role && user.role !== 'USER' && (
                    <span className="text-[10px] bg-field-green text-white px-1.5 py-0.5 rounded uppercase font-black">
                      {user.role}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center space-x-1.5 py-1.5 px-3 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-ball-red dark:text-ball-red-dark text-xs font-bold"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="block text-center py-2 bg-field-green text-white font-bold rounded-xl"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
