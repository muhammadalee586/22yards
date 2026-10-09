"use client";

import React from 'react';
import { Booking, Order } from '@/types';
import { Calendar, Package, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { formatPKR } from '@/lib/format';

interface UserStatsProps {
  bookings: Booking[];
  orders: Order[];
}

export default function UserStats({ bookings, orders }: UserStatsProps) {
  const upcomingBooking = bookings[0];
  const recentOrder = orders[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Upcoming Booking */}
      <div className="bg-boundary-white dark:bg-stadium-surface p-6 rounded-3xl border border-stadium-grey dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-field-green/10 text-field-green rounded-2xl">
            <Calendar size={24} />
          </div>
          <Link href="/dashboard" className="text-xs font-bold text-field-green hover:underline flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>
        
        {upcomingBooking ? (
          <div>
            <h3 className="text-xl font-black text-stadium-dark dark:text-boundary-white mb-1">
              {upcomingBooking.court_details?.name || 'Cricket Court'}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span className="flex items-center gap-1"><Calendar size={14} /> {upcomingBooking.date}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {upcomingBooking.start_time}</span>
            </div>
            <div className="p-3 bg-stadium-grey dark:bg-slate-800 rounded-xl text-sm font-bold text-stadium-dark dark:text-boundary-white flex justify-between">
              <span>Total Price:</span>
              <span>{formatPKR(upcomingBooking.total_price)}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No upcoming bookings</p>
            <Link href="/courts" className="text-sm text-field-green font-bold mt-2 block">Book a court now</Link>
          </div>
        )}
      </div>

      {/* Recent Order */}
      <div className="bg-boundary-white dark:bg-stadium-surface p-6 rounded-3xl border border-stadium-grey dark:border-slate-700 shadow-sm">
        <div className="flex justify-between items-start mb-6">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-2xl">
            <Package size={24} />
          </div>
          <Link href="/shop" className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1">
            View Shop <ChevronRight size={14} />
          </Link>
        </div>
        
        {recentOrder ? (
          <div>
            <h3 className="text-xl font-black text-stadium-dark dark:text-boundary-white mb-1">
              Order #{recentOrder.id}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {recentOrder.payment_status === 'PAID' ? 'Payment Confirmed' : 'Pending Payment'}
            </p>
            <div className="p-3 bg-stadium-grey dark:bg-slate-800 rounded-xl text-sm font-bold text-stadium-dark dark:text-boundary-white flex justify-between">
              <span>Order Total:</span>
              <span>{formatPKR(recentOrder.total_amount)}</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No recent orders</p>
            <Link href="/shop" className="text-sm text-orange-600 font-bold mt-2 block">Explore gear shop</Link>
          </div>
        )}
      </div>
    </div>
  );
}
