"use client";

import React from 'react';
import { DollarSign, Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { formatPKR } from '@/lib/format';

interface OwnerStatsProps {
  revenue: number;
  totalBookings: number;
  pendingRequests: number;
}

export default function OwnerStats({ revenue, totalBookings, pendingRequests }: OwnerStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-boundary-white dark:bg-stadium-surface p-6 rounded-3xl border border-stadium-grey dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
            <DollarSign size={24} />
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Total Revenue</p>
        </div>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-black text-stadium-dark dark:text-boundary-white">
            {formatPKR(revenue)}
          </h3>
          <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
            <TrendingUp size={14} /> +12%
          </div>
        </div>
      </div>

      <div className="bg-boundary-white dark:bg-stadium-surface p-6 rounded-3xl border border-stadium-grey dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
            <Calendar size={24} />
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Total Bookings</p>
        </div>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-black text-stadium-dark dark:text-boundary-white">
            {totalBookings}
          </h3>
          <span className="text-xs text-gray-400">All time</span>
        </div>
      </div>

      <div className="bg-boundary-white dark:bg-stadium-surface p-6 rounded-3xl border border-stadium-grey dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
            <Clock size={24} />
          </div>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Pending Requests</p>
        </div>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-black text-stadium-dark dark:text-boundary-white">
            {pendingRequests}
          </h3>
          <span className="text-xs text-red-500 font-bold">Needs attention</span>
        </div>
      </div>
    </div>
  );
}
