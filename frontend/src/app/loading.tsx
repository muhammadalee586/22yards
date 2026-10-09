"use client";

import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pitch-cream dark:bg-stadium-dark">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-stadium-grey dark:border-slate-700 border-t-field-green rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-field-green rounded-full animate-ping opacity-20"></div>
        </div>
      </div>
      <p className="mt-6 text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest animate-pulse">
        Loading Gear...
      </p>
    </div>
  );
}
