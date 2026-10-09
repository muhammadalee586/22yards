"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import apiClient from '@/lib/apiClient';
import { Booking, Order, OwnerStatsData } from '@/types';
import {
  LayoutDashboard,
  CalendarDays,
  ShoppingBag,
  ArrowRight,
  Zap,
  LogOut,
} from 'lucide-react';
import Link from 'next/link';

import WeatherWidget from '@/components/dashboard/WeatherWidget';
import UserStats from '@/components/dashboard/UserStats';
import OwnerStats from '@/components/dashboard/OwnerStats';

interface DashboardData {
  bookings: Booking[];
  orders: Order[];
  ownerStats?: OwnerStatsData;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState<DashboardData>({
    bookings: [],
    orders: [],
  });

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout/').catch(() => {});
    } finally {
      clearAuth();
      router.push('/login');
    }
  };

  const [activityView, setActivityView] = useState<'upcoming' | 'history'>('upcoming');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const endpoints = [
          `/bookings/?view=${activityView}`,
          '/orders/',
        ];

        const responses = await Promise.all(
          endpoints.map((endpoint) => apiClient.get(endpoint))
        );

        const bookings: Booking[] =
          responses[0].data.results ?? responses[0].data;
        const orders: Order[] =
          responses[1].data.results ?? responses[1].data;

        let ownerStats: OwnerStatsData | undefined;

        if (user?.role === 'OWNER' || user?.role === 'ADMIN') {
          const bookingsRevenue = bookings.reduce(
            (acc, b) => acc + (parseFloat(b.total_price) || 0),
            0
          );
          const ordersRevenue = orders.reduce(
            (acc, o) => acc + (parseFloat(o.total_amount) || 0),
            0
          );

          ownerStats = {
            revenue: bookingsRevenue + ordersRevenue,
            totalBookings: bookings.length,
            pendingRequests: bookings.filter((b) => b.status === 'PENDING' || b.payment_status === 'PENDING').length,
          };
        }

        setUserData({ bookings, orders, ownerStats });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, activityView]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse space-y-8">
        <div className="h-10 w-64 bg-stadium-grey rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="h-20 bg-stadium-grey rounded-2xl" />
            <div className="h-40 bg-stadium-grey rounded-2xl" />
          </div>
          <div className="lg:col-span-2 h-64 bg-stadium-grey rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-pitch-cream dark:bg-stadium-dark">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-stadium-dark dark:text-boundary-white">
            Welcome back, {user?.username ?? 'Player'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.role === 'OWNER' || user?.role === 'ADMIN'
              ? 'Manage your courts and gear shop from here.'
              : 'Ready for your next match? Check your schedule.'}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-ball-red dark:text-ball-red-dark font-bold text-sm transition-all border border-red-200 dark:border-red-900/50 cursor-pointer shadow-sm"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <WeatherWidget />

          <div className="bg-boundary-white dark:bg-stadium-surface p-6 rounded-3xl border border-stadium-grey dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-black text-stadium-dark dark:text-boundary-white mb-6 flex items-center gap-2">
              <Zap size={20} className="text-field-green" /> Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/courts"
                className="flex items-center justify-between p-4 bg-stadium-grey dark:bg-slate-800 hover:bg-field-green hover:text-white transition-all rounded-2xl group"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays size={18} className="group-hover:text-white" />
                  <span className="font-bold">Book a Court</span>
                </div>
                <ArrowRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
              <Link
                href="/shop"
                className="flex items-center justify-between p-4 bg-stadium-grey dark:bg-slate-800 hover:bg-orange-500 hover:text-white transition-all rounded-2xl group"
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag size={18} className="group-hover:text-white" />
                  <span className="font-bold">Shop Gear</span>
                </div>
                <ArrowRight
                  size={16}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </Link>
              {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between p-4 bg-stadium-grey dark:bg-slate-800 hover:bg-blue-600 hover:text-white transition-all rounded-2xl group"
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard
                      size={18}
                      className="group-hover:text-white"
                    />
                    <span className="font-bold">Court Management</span>
                  </div>
                  <ArrowRight
                    size={16}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          {user?.role === 'OWNER' || user?.role === 'ADMIN' ? (
            <OwnerStats
              revenue={userData.ownerStats?.revenue ?? 0}
              totalBookings={userData.ownerStats?.totalBookings ?? 0}
              pendingRequests={userData.ownerStats?.pendingRequests ?? 0}
            />
          ) : (
            <UserStats
              bookings={userData.bookings}
              orders={userData.orders}
            />
          )}

          <div className="bg-boundary-white dark:bg-stadium-surface p-8 rounded-3xl border border-stadium-grey dark:border-slate-700 shadow-sm">
            <h3 className="text-2xl font-black text-stadium-dark dark:text-boundary-white mb-4 flex items-center justify-between">
              <span>Your Activity</span>
              <div className="flex gap-2 bg-stadium-grey dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setActivityView('upcoming')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activityView === 'upcoming'
                      ? 'bg-field-green text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-stadium-dark dark:hover:text-boundary-white'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setActivityView('history')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    activityView === 'history'
                      ? 'bg-field-green text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-stadium-dark dark:hover:text-boundary-white'
                  }`}
                >
                  History
                </button>
              </div>
            </h3>
            <div className="space-y-4">
              {userData.bookings.length === 0 &&
              userData.orders.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    No recent activity found.
                  </p>
                </div>
              ) : (
                userData.bookings.slice(0, 5).map((booking) => (
                  // FIX: use booking.id instead of array index for key
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border border-stadium-grey dark:border-slate-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-field-green/10 text-field-green rounded-lg">
                        <CalendarDays size={18} />
                      </div>
                      <div>
                        {/* FIX: booking.court.name now valid because Court is typed on Booking */}
                        <p className="font-bold text-stadium-dark dark:text-boundary-white">
                          {booking.court_details?.name || 'Cricket Court'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {booking.date} • {booking.start_time} → {booking.end_time}
                        </p>
                      </div>
                    </div>

                    {/* FIX: status is now a union type — compare to real backend values */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : booking.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : booking.status === 'CANCELLED'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}