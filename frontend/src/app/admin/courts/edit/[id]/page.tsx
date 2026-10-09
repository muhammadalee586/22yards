"use client";

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter, useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { Building2, ArrowLeft, Upload, Loader2, Moon, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/store/useToastStore';
import { getMediaUrl } from '@/lib/format';

const ALL_WEEK_DAYS = [
  { key: 'MON', label: 'Mon' },
  { key: 'TUE', label: 'Tue' },
  { key: 'WED', label: 'Wed' },
  { key: 'THU', label: 'Thu' },
  { key: 'FRI', label: 'Fri' },
  { key: 'SAT', label: 'Sat' },
  { key: 'SUN', label: 'Sun' },
];

export default function EditCourtPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const courtId = params?.id;

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentImage, setCurrentImage] = useState<string>('');
  const [operatingDays, setOperatingDays] = useState<string[]>([
    'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'
  ]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    price_per_hour: '',
    opening_time: '06:00',
    closing_time: '23:00',
    has_ac: false,
    has_parking: false,
    turf_type: 'ASTROTURF'
  });
  const [mainImage, setMainImage] = useState<File | null>(null);

  useEffect(() => {
    if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
      router.push('/dashboard');
      return;
    }

    const fetchCourt = async () => {
      try {
        setInitialLoading(true);
        const res = await apiClient.get(`/courts/${courtId}/`);
        const c = res.data;
        setFormData({
          name: c.name || '',
          description: c.description || '',
          address: c.address || '',
          city: c.city || '',
          price_per_hour: c.price_per_hour || '',
          opening_time: c.opening_time ? c.opening_time.slice(0, 5) : '06:00',
          closing_time: c.closing_time ? c.closing_time.slice(0, 5) : '23:00',
          has_ac: !!c.has_ac,
          has_parking: !!c.has_parking,
          turf_type: c.turf_type || 'ASTROTURF'
        });
        setCurrentImage(c.main_image || '');
        if (c.operating_days && Array.isArray(c.operating_days) && c.operating_days.length > 0) {
          setOperatingDays(c.operating_days);
        }
      } catch (err) {
        console.error('Failed to fetch court:', err);
        setError('Court not found or permission denied');
        toast.error('Failed to load court details');
      } finally {
        setInitialLoading(false);
      }
    };

    if (courtId) {
      fetchCourt();
    }
  }, [courtId, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });

      data.append('operating_days', JSON.stringify(operatingDays));

      if (mainImage) {
        data.append('main_image', mainImage);
      }

      await apiClient.patch(`/courts/${courtId}/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Court updated successfully! 🏏');
      router.push('/admin');
    } catch (err: unknown) {
      const error = err as { response?: { data?: any } };
      console.error('Failed to update court:', error);
      let detail = 'Failed to update court. Please check all fields.';
      const resData = error.response?.data;
      if (resData) {
        if (typeof resData === 'string') {
          detail = resData;
        } else if (resData.detail) {
          detail = resData.detail;
        } else if (typeof resData === 'object') {
          const parts: string[] = [];
          Object.entries(resData).forEach(([field, val]) => {
            if (Array.isArray(val)) {
              parts.push(`${field}: ${val.join(' ')}`);
            } else if (typeof val === 'string') {
              parts.push(`${field}: ${val}`);
            }
          });
          if (parts.length > 0) {
            detail = parts.join(' | ');
          }
        }
      }
      setError(detail);
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMainImage(e.target.files[0]);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pitch-cream dark:bg-stadium-dark">
        <Loader2 className="animate-spin text-field-green" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pitch-cream dark:bg-stadium-dark p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-field-green hover:underline mb-4 text-sm font-bold"
          >
            <ArrowLeft size={16} /> Back to Court Management
          </Link>
          <h1 className="text-3xl md:text-4xl font-black text-stadium-dark dark:text-boundary-white">
            Edit Court Details
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Update court information, operating timings, amenities, and hourly pricing
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-2xl border border-red-200 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-boundary-white dark:bg-stadium-surface p-6 md:p-8 rounded-3xl border border-stadium-grey dark:border-slate-700 shadow-sm space-y-8">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-bold text-stadium-dark dark:text-boundary-white mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Full Address *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          {/* Pricing & Timings */}
          <div className="pt-6 border-t border-stadium-grey dark:border-slate-700">
            <h2 className="text-xl font-bold text-stadium-dark dark:text-boundary-white mb-4">
              Pricing & Operating Hours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Hourly Rate (PKR) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                  value={formData.price_per_hour}
                  onChange={(e) => setFormData({ ...formData, price_per_hour: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Opening Time *
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                  value={formData.opening_time}
                  onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Closing Time *
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                  value={formData.closing_time}
                  onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                />
              </div>
            </div>

            {/* Overnight Helper Notice */}
            {formData.closing_time <= formData.opening_time && (
              <div className="mt-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center gap-3">
                <Moon className="text-indigo-600 flex-shrink-0" size={20} />
                <div className="text-xs">
                  <p className="font-bold text-indigo-900 dark:text-indigo-200">
                    🌙 Overnight Schedule Detected
                  </p>
                  <p className="text-indigo-700 dark:text-indigo-300">
                    Your court opens at {formData.opening_time} and closes next morning at {formData.closing_time}. Players will be able to book midnight and early morning slots smoothly!
                  </p>
                </div>
              </div>
            )}

            {/* Operating Days Selection */}
            <div className="mt-6 pt-6 border-t border-stadium-grey/60 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <CalendarDays size={18} className="text-field-green" /> Operating Days *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOperatingDays(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])}
                    className="text-xs font-bold text-field-green hover:underline cursor-pointer"
                  >
                    All Days
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setOperatingDays(['MON', 'TUE', 'WED', 'THU', 'FRI'])}
                    className="text-xs font-bold text-field-green hover:underline cursor-pointer"
                  >
                    Weekdays
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setOperatingDays(['SAT', 'SUN'])}
                    className="text-xs font-bold text-field-green hover:underline cursor-pointer"
                  >
                    Weekends
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {ALL_WEEK_DAYS.map((day) => {
                  const selected = operatingDays.includes(day.key);
                  return (
                    <button
                      key={day.key}
                      type="button"
                      onClick={() => {
                        setOperatingDays(prev =>
                          selected ? prev.filter(d => d !== day.key) : [...prev, day.key]
                        );
                      }}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                        selected
                          ? 'bg-field-green text-white border-field-green shadow-sm'
                          : 'bg-stadium-grey dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-transparent hover:border-gray-400'
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Only the selected days will be available for players to book matches.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="pt-6 border-t border-stadium-grey dark:border-slate-700">
            <h2 className="text-xl font-bold text-stadium-dark dark:text-boundary-white mb-4">
              Turf Type & Amenities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Turf Type
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                  value={formData.turf_type}
                  onChange={(e) => setFormData({ ...formData, turf_type: e.target.value })}
                >
                  <option value="ASTROTURF">AstroTurf (Recommended)</option>
                  <option value="CARPET">Carpet Turf</option>
                  <option value="WOOD">Wood Surface</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  id="has_ac"
                  checked={formData.has_ac}
                  onChange={(e) => setFormData({ ...formData, has_ac: e.target.checked })}
                  className="w-5 h-5 accent-field-green cursor-pointer"
                />
                <label htmlFor="has_ac" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                  Air Conditioning Available
                </label>
              </div>

              <div className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  id="has_parking"
                  checked={formData.has_parking}
                  onChange={(e) => setFormData({ ...formData, has_parking: e.target.checked })}
                  className="w-5 h-5 accent-field-green cursor-pointer"
                />
                <label htmlFor="has_parking" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                  Dedicated Parking Available
                </label>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="pt-6 border-t border-stadium-grey dark:border-slate-700">
            <h2 className="text-xl font-bold text-stadium-dark dark:text-boundary-white mb-4">
              Court Main Image
            </h2>
            {currentImage && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2 font-semibold">Current Image:</p>
                <img
                  src={getMediaUrl(currentImage)}
                  alt="Current Court"
                  className="w-48 h-32 object-cover rounded-2xl border border-stadium-grey"
                />
              </div>
            )}
            <div className="border-2 border-dashed border-stadium-grey dark:border-slate-700 rounded-2xl p-6 text-center hover:border-field-green transition-colors">
              <Upload className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                {mainImage ? mainImage.name : 'Click to select a new image (or leave empty to keep current)'}
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="court_image"
              />
              <label
                htmlFor="court_image"
                className="inline-block mt-3 px-4 py-2 rounded-xl bg-stadium-grey dark:bg-slate-800 text-xs font-bold cursor-pointer hover:bg-field-green hover:text-white transition-colors"
              >
                Choose File
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4 pt-4">
            <Link
              href="/admin"
              className="px-6 py-3 rounded-xl border border-stadium-grey text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-field-green hover:bg-field-green-light text-white font-black rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              <span>{loading ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
