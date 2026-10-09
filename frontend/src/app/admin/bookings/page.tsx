"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import {
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Phone,
  Search,
  Filter,
  User,
  Building2
} from 'lucide-react';
import { formatPKR, formatTime12h } from '@/lib/format';
import { toast } from '@/store/useToastStore';
import { Booking } from '@/types';

export default function AdminBookingsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      router.push('/dashboard');
      return;
    }
    fetchBookings();
  }, [user, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/bookings/');
      const data: Booking[] = res.data.results || res.data || [];
      setBookings(data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (bookingId: number) => {
    try {
      setActionLoading(bookingId);
      await apiClient.post(`/bookings/${bookingId}/complete/`);
      toast.success('Booking marked as COMPLETED! 🏏');
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'COMPLETED' } : b))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to complete booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (bookingId: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      setActionLoading(bookingId);
      await apiClient.post(`/bookings/${bookingId}/cancel/`);
      toast.success('Booking cancelled successfully.');
      setBookings(prev =>
        prev.map(b => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to cancel booking');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const courtName = b.court_details?.name?.toLowerCase() || '';
    const contact = (b as any).contact_number?.toLowerCase() || '';
    const matchesSearch = !search || courtName.includes(search.toLowerCase()) || contact.includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-pitch-cream dark:bg-stadium-dark p-8 animate-pulse">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-stadium-grey rounded-lg" />
          <div className="h-64 bg-stadium-grey rounded-3xl" />
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
              <h1 className="text-3xl md:text-4xl font-black text-stadium-dark dark:text-boundary-white">
                Booking Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                View player reservations, track attendance, and manage schedule
              </p>
            </div>
            <div className="flex items-center gap-2 bg-boundary-white dark:bg-stadium-surface px-4 py-2 rounded-2xl border border-stadium-grey dark:border-slate-700 text-sm font-bold">
              <Calendar size={18} className="text-field-green" />
              <span>{bookings.length} Total Bookings</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-boundary-white dark:bg-stadium-surface p-4 rounded-3xl border border-stadium-grey dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
          <div className="relative w-full md:w-80">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by court or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-sm outline-none focus:ring-2 ring-field-green"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {(['ALL', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-field-green text-white shadow-sm'
                    : 'bg-stadium-grey dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-field-green'
                }`}
              >
                {st === 'ALL' ? 'All' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table / List */}
        <div className="bg-boundary-white dark:bg-stadium-surface rounded-3xl border border-stadium-grey dark:border-slate-700 overflow-hidden shadow-sm">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">No bookings match this filter</h3>
              <p className="text-xs text-gray-500 mt-1">Try resetting your search or filter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stadium-grey dark:border-slate-700 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 bg-stadium-grey/30 dark:bg-slate-800/40">
                    <th className="p-4">Booking ID</th>
                    <th className="p-4">Court</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Customer Contact</th>
                    <th className="p-4">Total Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stadium-grey dark:divide-slate-700 text-sm">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-stadium-grey/20 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-black text-gray-800 dark:text-gray-200">
                        #{b.id}
                      </td>
                      <td className="p-4 font-bold text-stadium-dark dark:text-boundary-white">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-field-green flex-shrink-0" />
                          <span>{b.court_details?.name || `Court #${b.court}`}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-800 dark:text-gray-200">{b.date}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock size={12} />
                          <span>{formatTime12h(b.start_time)} – {formatTime12h(b.end_time)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Phone size={14} className="text-gray-400 flex-shrink-0" />
                          <span>{(b as any).contact_number || 'Not provided'}</span>
                        </div>
                      </td>
                      <td className="p-4 font-black text-field-green dark:text-field-green-light">
                        {formatPKR(b.total_price)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black inline-block ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : b.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.status === 'CONFIRMED' && (
                            <>
                              <button
                                disabled={actionLoading === b.id}
                                onClick={() => handleComplete(b.id)}
                                title="Mark as Completed"
                                className="px-3 py-1.5 rounded-xl bg-field-green hover:bg-field-green-light text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <CheckCircle2 size={14} />
                                <span>Complete</span>
                              </button>
                              <button
                                disabled={actionLoading === b.id}
                                onClick={() => handleCancel(b.id)}
                                title="Cancel Booking"
                                className="px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/50 dark:hover:bg-red-900/60 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                              >
                                <XCircle size={14} />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}
                          {b.status !== 'CONFIRMED' && (
                            <span className="text-xs text-gray-400 font-semibold italic">No action</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
