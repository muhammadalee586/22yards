"use client";

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { Building2, ArrowLeft, Upload, Moon, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/store/useToastStore';

const ALL_WEEK_DAYS = [
  { key: 'MON', label: 'Mon' },
  { key: 'TUE', label: 'Tue' },
  { key: 'WED', label: 'Wed' },
  { key: 'THU', label: 'Thu' },
  { key: 'FRI', label: 'Fri' },
  { key: 'SAT', label: 'Sat' },
  { key: 'SUN', label: 'Sun' },
];

export default function AddCourtPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mainImage) {
      setError('Please upload a main court image.');
      return;
    }

    if (operatingDays.length === 0) {
      setError('Please select at least one operating day for your court.');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });

      data.append('operating_days', JSON.stringify(operatingDays));

      if (mainImage) {
        data.append('main_image', mainImage);
      }

      const response = await apiClient.post('/courts/', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Court added successfully! 🏏');
      router.push('/admin');
    } catch (err: unknown) {
      const error = err as { response?: { data?: any } };
      console.error('Failed to add court:', error);
      let detail = 'Failed to add court. Please check all fields.';
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

  if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pitch-cream dark:bg-stadium-dark">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Only court owners can add courts.
          </p>
          <Link href="/dashboard" className="text-field-green hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pitch-cream dark:bg-stadium-dark p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-field-green hover:underline mb-4"
          >
            <ArrowLeft size={20} />
            Back to Admin
          </Link>
          <h1 className="text-4xl font-black text-stadium-dark dark:text-boundary-white">
            Add New Court
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Fill in the details to list your court on 22 Yards
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-stadium-surface p-8 rounded-2xl border border-stadium-grey dark:border-slate-700">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-stadium-dark dark:text-boundary-white mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Court Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Elite Cricket Arena"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="e.g., Karachi"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your court facilities, amenities, and what makes it special..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Address *
              </label>
              <textarea
                required
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Street address, landmarks, etc."
              />
            </div>
          </div>

          {/* Pricing & Timing */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-stadium-dark dark:text-boundary-white mb-4">
              Pricing & Operating Hours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price per Hour (Rs) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                  value={formData.price_per_hour}
                  onChange={(e) => setFormData({...formData, price_per_hour: e.target.value})}
                  placeholder="e.g., 2000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Opening Time *
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                  value={formData.opening_time}
                  onChange={(e) => setFormData({...formData, opening_time: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Closing Time *
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                  value={formData.closing_time}
                  onChange={(e) => setFormData({...formData, closing_time: e.target.value})}
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-stadium-dark dark:text-boundary-white mb-4">
              Features & Amenities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Turf Type *
                </label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                  value={formData.turf_type}
                  onChange={(e) => setFormData({...formData, turf_type: e.target.value})}
                >
                  <option value="ASTROTURF">AstroTurf</option>
                  <option value="CARPET">Carpet</option>
                  <option value="WOOD">Wood</option>
                </select>
              </div>

              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_ac}
                    onChange={(e) => setFormData({...formData, has_ac: e.target.checked})}
                    className="w-5 h-5 rounded border-stadium-grey text-field-green focus:ring-field-green"
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Air Conditioned
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.has_parking}
                    onChange={(e) => setFormData({...formData, has_parking: e.target.checked})}
                    className="w-5 h-5 rounded border-stadium-grey text-field-green focus:ring-field-green"
                  />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Parking Available
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-stadium-dark dark:text-boundary-white mb-4">
              Court Image
            </h2>
            <div className="border-2 border-dashed border-stadium-grey dark:border-slate-700 rounded-xl p-8 text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <label className="cursor-pointer">
                <span className="text-field-green font-bold hover:underline">
                  Click to upload
                </span>
                <span className="text-gray-600 dark:text-gray-400"> or drag and drop</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {mainImage && (
                <p className="mt-4 text-green-600 dark:text-green-400 font-medium">
                  ✓ {mainImage.name}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-2">PNG, JPG, JPEG up to 10MB</p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              href="/admin"
              className="flex-1 py-4 border-2 border-stadium-grey dark:border-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-field-green text-white font-bold rounded-xl hover:bg-field-green-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding Court...' : 'Add Court'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
