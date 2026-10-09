"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import {
  BarChart3,
  TrendingUp,
  ArrowLeft,
  DollarSign,
  Calendar,
  CheckCircle2,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';
import { formatPKR } from '@/lib/format';
import { Booking, Court } from '@/types';

export default function AdminAnalyticsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courtsRes, bookingsRes] = await Promise.all([
        apiClient.get('/courts/'),
        apiClient.get('/bookings/')
      ]);
      const allCourts: Court[] = courtsRes.data.results || courtsRes.data || [];
      const myCourts = user?.role === 'ADMIN'
        ? allCourts
        : allCourts.filter(c => c.owner === user?.id || c.owner_name === user?.username);
      setCourts(myCourts);

      const allBookings: Booking[] = bookingsRes.data.results || bookingsRes.data || [];
      const myCourtIds = myCourts.map(c => c.id);
      const myBookings = allBookings.filter(b =>
        myCourtIds.includes(b.court) || myCourtIds.includes(b.court_details?.id)
      );
      setBookings(myBookings);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = bookings.reduce(
    (sum, b) => b.status !== 'CANCELLED' ? sum + parseFloat(b.total_price || '0') : sum,
    0
  );
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED').length;
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length;
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;
  const activeBookingsCount = confirmedBookings + completedBookings;
  const avgOrderValue = activeBookingsCount > 0 ? totalRevenue / activeBookingsCount : 0;

  // Breakdown by court
  const courtBreakdown = courts.map(court => {
    const courtBookings = bookings.filter(b => b.court === court.id || b.court_details?.id === court.id);
    const rev = courtBookings.reduce(
      (sum, b) => b.status !== 'CANCELLED' ? sum + parseFloat(b.total_price || '0') : sum,
      0
    );
    return {
      id: court.id,
      name: court.name,
      city: court.city,
      turf_type: court.turf_type,
      bookingsCount: courtBookings.length,
      revenue: rev,
      rating: court.average_rating,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  if (loading) {
    return (
      <div className="min-h-screen bg-pitch-cream dark:bg-stadium-dark p-8 animate-pulse">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-stadium-grey rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-stadium-grey rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pitch-cream dark:bg-stadium-dark p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-field-green hover:underline mb-3 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Back to Court Management
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-stadium-dark dark:text-boundary-white flex items-center gap-3">
                <BarChart3 className="text-field-green" size={36} /> Arena Analytics & Insights
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Financial performance, booking velocity, and occupancy metrics
              </p>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-boundary-white dark:bg-stadium-surface p-6 rounded-3xl border border-stadium-grey dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl">
                <DollarSign size={24} />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Revenue</p>
            </div>
            <p className="text-3xl font-black text-field-green dark:text-field-green-light">
              {formatPKR(totalRevenue)}
            </p>
            <p className="text-xs text-gray-400 mt-2">Active & completed bookings</p>
          </div>

          <div className="bg-boundary-white dark:bg-stadium-surface p-6 rounded-3xl border border-stadium-grey dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-950/60 text-blue-600 rounded-2xl">
                <Calendar size={24} />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Bookings</p>
            </div>
            <p className="text-3xl font-black text-stadium-dark dark:text-boundary-white">
              {bookings.length}
            </p>
            <p className="text-xs text-gray-400 mt-2">{completedBookings} successfully played</p>
          </div>

          <div className="bg-boundary-white dark:bg-stadium-surface p-6 rounded-3xl border border-stadium-grey dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-950/60 text-purple-600 rounded-2xl">
                <TrendingUp size={24} />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Slot Value</p>
            </div>
            <p className="text-3xl font-black text-stadium-dark dark:text-boundary-white">
              {formatPKR(avgOrderValue)}
            </p>
            <p className="text-xs text-gray-400 mt-2">Per confirmed match</p>
          </div>

          <div className="bg-boundary-white dark:bg-stadium-surface p-6 rounded-3xl border border-stadium-grey dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-2xl">
                <Building2 size={24} />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Courts</p>
            </div>
            <p className="text-3xl font-black text-stadium-dark dark:text-boundary-white">
              {courts.length}
            </p>
            <p className="text-xs text-gray-400 mt-2">Generating player bookings</p>
          </div>
        </div>

        {/* Court Revenue Breakdown */}
        <div className="bg-boundary-white dark:bg-stadium-surface p-6 md:p-8 rounded-3xl border border-stadium-grey dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-stadium-dark dark:text-boundary-white">
                Revenue by Court
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Top performing venues across your arenas</p>
            </div>
            <span className="text-xs font-bold text-field-green bg-field-green/10 px-3 py-1.5 rounded-full flex items-center gap-1">
              <Sparkles size={14} /> Highest to Lowest
            </span>
          </div>

          {courtBreakdown.length === 0 ? (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No courts listed yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stadium-grey dark:border-slate-700 text-xs uppercase text-gray-500 dark:text-gray-400 bg-stadium-grey/20 dark:bg-slate-800/30">
                    <th className="p-4">Arena Name</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Turf Type</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Bookings</th>
                    <th className="p-4 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stadium-grey dark:divide-slate-700 text-sm">
                  {courtBreakdown.map((c) => (
                    <tr key={c.id} className="hover:bg-stadium-grey/20 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-bold text-stadium-dark dark:text-boundary-white">
                        <Link href={`/courts/${c.id}`} className="hover:text-field-green transition-colors">
                          {c.name}
                        </Link>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{c.city}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md bg-stadium-grey dark:bg-slate-800 text-xs font-bold">
                          {c.turf_type}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-yellow-500">
                        ★ {c.rating}
                      </td>
                      <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">
                        {c.bookingsCount}
                      </td>
                      <td className="p-4 text-right font-black text-field-green dark:text-field-green-light">
                        {formatPKR(c.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Status Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 p-6 rounded-3xl">
            <h3 className="text-sm font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider mb-2">
              Confirmed / Upcoming
            </h3>
            <p className="text-4xl font-black text-emerald-900 dark:text-emerald-100">{confirmedBookings}</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-2">Scheduled match slots</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 p-6 rounded-3xl">
            <h3 className="text-sm font-black text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-2">
              Completed
            </h3>
            <p className="text-4xl font-black text-blue-900 dark:text-blue-100">{completedBookings}</p>
            <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">Successfully played matches</p>
          </div>

          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 p-6 rounded-3xl">
            <h3 className="text-sm font-black text-red-800 dark:text-red-300 uppercase tracking-wider mb-2">
              Cancelled
            </h3>
            <p className="text-4xl font-black text-red-900 dark:text-red-100">{cancelledBookings}</p>
            <p className="text-xs text-red-700 dark:text-red-400 mt-2">Cancelled by user or owner</p>
          </div>
        </div>
      </div>
    </div>
  );
}
