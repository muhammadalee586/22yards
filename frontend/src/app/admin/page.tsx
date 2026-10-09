"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from '@/store/useToastStore';

interface Court {
  id: number;
  name: string;
  city: string;
  price_per_hour: string;
  average_rating: string;
  total_reviews: number;
  main_image?: string;
  owner?: number;
  owner_name?: string;
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourts: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0
  });

  useEffect(() => {
    // Check if user is OWNER or ADMIN
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

      const allCourts: Court[] = courtsRes.data.results || courtsRes.data;
      // Filter to only show courts owned by this user (or all if ADMIN)
      const myCourts = user?.role === 'ADMIN'
        ? allCourts
        : allCourts.filter((c) => c.owner === user?.id || c.owner_name === user?.username);
      setCourts(myCourts);

      const bookings = bookingsRes.data.results || bookingsRes.data;
      const myCourtIds = myCourts.map((c) => c.id);
      const myBookings = bookings.filter((b: any) =>
        myCourtIds.includes(b.court) || myCourtIds.includes(b.court_details?.id)
      );

      // Calculate stats
      const totalRevenue = myBookings.reduce((sum: number, b: any) =>
        sum + parseFloat(b.total_price || 0), 0
      );
      const pendingBookings = myBookings.filter((b: any) =>
        b.status === 'PENDING' || b.payment_status === 'PENDING'
      ).length;

      setStats({
        totalCourts: myCourts.length,
        totalBookings: myBookings.length,
        totalRevenue,
        pendingBookings
      });
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to fetch admin metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courtId: number) => {
    if (!window.confirm('Are you sure you want to delete this court? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.delete(`/courts/${courtId}/`);
      setCourts(courts.filter(c => c.id !== courtId));
      toast.success('Court deleted successfully!');
    } catch (error) {
      console.error('Failed to delete court:', error);
      toast.error('Failed to delete court. It may have existing bookings.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pitch-cream dark:bg-stadium-dark p-8 animate-pulse">
        <div className="h-8 w-64 bg-stadium-grey rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-stadium-grey rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pitch-cream dark:bg-stadium-dark p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-stadium-dark dark:text-boundary-white">
              Court Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your courts, bookings, and view analytics
            </p>
          </div>
          <Link
            href="/admin/courts/add"
            className="flex items-center gap-2 px-6 py-3 bg-field-green text-white font-bold rounded-xl hover:bg-field-green-light transition-all"
          >
            <Plus size={20} />
            Add New Court
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-stadium-surface p-6 rounded-2xl border border-stadium-grey dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-xl">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-stadium-dark dark:text-boundary-white">
                  {stats.totalCourts}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Courts</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stadium-surface p-6 rounded-2xl border border-stadium-grey dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-xl">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-stadium-dark dark:text-boundary-white">
                  {stats.totalBookings}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stadium-surface p-6 rounded-2xl border border-stadium-grey dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 rounded-xl">
                <BarChart3 size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-stadium-dark dark:text-boundary-white">
                  Rs {stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-stadium-surface p-6 rounded-2xl border border-stadium-grey dark:border-slate-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 rounded-xl">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-stadium-dark dark:text-boundary-white">
                  {stats.pendingBookings}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Courts List */}
        <div className="bg-white dark:bg-stadium-surface p-6 rounded-2xl border border-stadium-grey dark:border-slate-700">
          <h2 className="text-2xl font-black text-stadium-dark dark:text-boundary-white mb-6">
            Your Courts
          </h2>

          {courts.length === 0 ? (
            <div className="text-center py-12">
              <Building2 size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven't added any courts yet.
              </p>
              <Link
                href="/admin/courts/add"
                className="inline-flex items-center gap-2 px-6 py-3 bg-field-green text-white font-bold rounded-xl hover:bg-field-green-light transition-all"
              >
                <Plus size={20} />
                Add Your First Court
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stadium-grey dark:border-slate-700">
                    <th className="text-left p-4 font-bold text-stadium-dark dark:text-boundary-white">Court</th>
                    <th className="text-left p-4 font-bold text-stadium-dark dark:text-boundary-white">City</th>
                    <th className="text-left p-4 font-bold text-stadium-dark dark:text-boundary-white">Price/Hour</th>
                    <th className="text-left p-4 font-bold text-stadium-dark dark:text-boundary-white">Rating</th>
                    <th className="text-right p-4 font-bold text-stadium-dark dark:text-boundary-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courts.map((court) => (
                    <tr
                      key={court.id}
                      className="border-b border-stadium-grey dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-bold text-stadium-dark dark:text-boundary-white">
                          {court.name}
                        </p>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">{court.city}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-400">
                        Rs {parseFloat(court.price_per_hour).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="text-yellow-500">★</span> {court.average_rating}
                        <span className="text-gray-500 text-sm"> ({court.total_reviews})</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/courts/${court.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={18} />
                          </Link>
                          <Link
                            href={`/admin/courts/edit/${court.id}`}
                            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(court.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link
            href="/admin/bookings"
            className="p-6 bg-white dark:bg-stadium-surface rounded-2xl border border-stadium-grey dark:border-slate-700 hover:border-field-green dark:hover:border-field-green transition-all"
          >
            <Calendar size={32} className="text-field-green mb-4" />
            <h3 className="text-xl font-bold text-stadium-dark dark:text-boundary-white mb-2">
              Manage Bookings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              View and manage all bookings for your courts
            </p>
          </Link>

          <Link
            href="/admin/analytics"
            className="p-6 bg-white dark:bg-stadium-surface rounded-2xl border border-stadium-grey dark:border-slate-700 hover:border-field-green dark:hover:border-field-green transition-all"
          >
            <BarChart3 size={32} className="text-field-green mb-4" />
            <h3 className="text-xl font-bold text-stadium-dark dark:text-boundary-white mb-2">
              View Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Track revenue and booking trends
            </p>
          </Link>

          <Link
            href="/dashboard"
            className="p-6 bg-white dark:bg-stadium-surface rounded-2xl border border-stadium-grey dark:border-slate-700 hover:border-field-green dark:hover:border-field-green transition-all"
          >
            <LayoutDashboard size={32} className="text-field-green mb-4" />
            <h3 className="text-xl font-bold text-stadium-dark dark:text-boundary-white mb-2">
              User Dashboard
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Back to your regular dashboard
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
