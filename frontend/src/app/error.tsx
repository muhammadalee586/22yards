"use client";

import React from 'react';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-pitch-cream dark:bg-stadium-dark">
      <div className="p-6 bg-white dark:bg-stadium-surface rounded-full shadow-sm mb-6">
        <AlertCircle size={64} className="text-red-500" />
      </div>
      <h1 className="text-4xl font-black text-stadium-dark dark:text-boundary-white mb-2">Oops! Something went wrong</h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
        Our apologies, but an unexpected error occurred. We're working to get things back on track.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <button 
          onClick={() => window.location.reload()}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-stadium-grey dark:bg-slate-800 text-stadium-dark dark:text-boundary-white font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
        >
          <RefreshCcw size={18} /> Try Again
        </button>
        <Link 
          href="/" 
          className="flex items-center justify-center gap-2 px-6 py-3 bg-field-green text-white font-bold rounded-2xl hover:bg-field-green-light transition-all shadow-lg"
        >
          <Home size={18} /> Back to Home
        </Link>
      </div>
    </div>
  );
}
