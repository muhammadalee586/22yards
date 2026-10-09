"use client";

import React from 'react';
import { MapPin, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-pitch-cream dark:bg-stadium-dark">
      <div className="relative mb-8">
        <div className="absolute -inset-4 bg-field-green/20 rounded-full blur-xl animate-pulse"></div>
        <div className="relative p-8 bg-white dark:bg-stadium-surface rounded-full shadow-sm border border-stadium-grey dark:border-slate-700">
          <MapPin size={80} className="text-field-green" />
        </div>
      </div>
      <h1 className="text-5xl font-black text-stadium-dark dark:text-boundary-white mb-4">404 - Lost on the Pitch</h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-10 text-lg">
        The page you're looking for has been bowled out. It either doesn't exist or has moved to a different pavilion.
      </p>
      <Link 
        href="/" 
        className="px-8 py-4 bg-field-green text-white font-black rounded-2xl hover:bg-field-green-light transition-all shadow-lg transform hover:scale-105"
      >
        Return to Home Base
      </Link>
    </div>
  );
}
