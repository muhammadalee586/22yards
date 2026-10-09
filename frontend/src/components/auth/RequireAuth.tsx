"use client";

import React from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { User } from '@/types';

interface RequireAuthProps {
  children: React.ReactNode;
  role?: User['role'];
}

export default function RequireAuth({ children, role }: RequireAuthProps) {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-500 mb-4">Please sign in to access this page.</p>
          <a href="/login" className="px-6 py-2 bg-field-green text-white rounded-lg font-bold">Login</a>
        </div>
      </div>
    );
  }

  if (role && user.role !== role && user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center text-center p-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-4">You do not have the required permissions to view this page.</p>
          <a href="/dashboard" className="px-6 py-2 bg-field-green text-white rounded-lg font-bold">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
