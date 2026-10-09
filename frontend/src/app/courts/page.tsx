"use client";
import React, { useState, useEffect, Suspense } from 'react';
import apiClient from '@/lib/apiClient';
import { Court } from '@/types';
import { Search, MapPin, Star, Wind, ParkingCircle, Clock } from 'lucide-react';
import { formatPKR, formatTime12h, getMediaUrl } from '@/lib/format';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
const TURF_TYPE_LABELS: Record<string, string> = {
  ASTROTURF: 'AstroTurf',
  CARPET: 'Carpet',
  WOOD: 'Wood',
  CONCRETE: 'Concrete',
}
interface CourtCardProps {
  court: Court;
}
function CourtCard({ court }: CourtCardProps) {
  return (
    <div className="bg-boundary-white dark:bg-stadium-surface rounded-3xl shadow-sm border border-stadium-grey dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={getMediaUrl(court.main_image)}
          alt={court.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-stadium-dark/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-field-green dark:text-field-green-light">
          <Star size={12} fill="currentColor" />
          {court.average_rating}
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-stadium-dark dark:text-boundary-white">{court.name}</h3>
          <span className="text-field-green dark:text-field-green-light font-black">{formatPKR(court.price_per_hour)}/hr</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-3">
          <MapPin size={14} />
          {court.city}
        </div>
        {/* Court Timings */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 mb-4 bg-stadium-grey/60 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg w-fit">
          <Clock size={14} className="text-field-green dark:text-field-green-light" />
          <span>{formatTime12h(court.opening_time)} – {formatTime12h(court.closing_time)}</span>
        </div>
        <div className="flex gap-3 mb-6">
          {court.has_ac && (
            <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-stadium-grey dark:bg-slate-800 px-2 py-1 rounded-md">
              <Wind size={12} /> AC
            </div>
          )}
          {court.has_parking && (
            <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-stadium-grey dark:bg-slate-800 px-2 py-1 rounded-md">
              <ParkingCircle size={12} /> Parking
            </div>
          )}
          <div className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-300 bg-stadium-grey dark:bg-slate-800 px-2 py-1 rounded-md">
            {TURF_TYPE_LABELS[court.turf_type] || court.turf_type}
          </div>
        </div>
        <Link
          href={`/courts/${court.id}`}
          className="block w-full py-3 text-center bg-field-green hover:bg-field-green-light text-white font-bold rounded-xl transition-colors cursor-pointer"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}

function CourtsContent() {
  const searchParams = useSearchParams();
  const initialCity = searchParams.get('city') || '';
  const initialSearch = searchParams.get('search') || '';

  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  // Raw input state (updates instantly as user types)
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [cityInput, setCityInput] = useState(initialCity);
  // Debounced filter state (triggers API call)
  const [filters, setFilters] = useState({
    city: initialCity,
    search: initialSearch,
    turf_type: '',
    has_ac: '',
    has_parking: ''
  });
  const [page, setPage] = useState(1);
  // Debounce search & city inputs — only apply after 400ms of no typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput, city: cityInput }));
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, cityInput]);
  useEffect(() => {
    const fetchCourts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.city) params.append('city', filters.city);
        if (filters.search) params.append('search', filters.search);
        if (filters.turf_type) params.append('turf_type', filters.turf_type);
        if (filters.has_ac) params.append('has_ac', filters.has_ac);
        if (filters.has_parking) params.append('has_parking', filters.has_parking);
        params.append('page', page.toString());
        const response = await apiClient.get(`/courts/?${params.toString()}`);
        setCourts(response.data.results || response.data);
      } catch (err) {
        console.error("Error fetching courts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourts();
  }, [filters, page]);
  return (
    <div className="min-h-screen bg-pitch-cream dark:bg-stadium-dark">
      <div className="bg-field-green dark:bg-field-green-light text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-4">Find Your Perfect Turf</h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">Explore the best indoor cricket courts in your city</p>
      </div>
      <div className="container mx-auto px-4 py-12">
        {/* Filters Bar */}
        <div className="bg-boundary-white dark:bg-stadium-surface p-6 rounded-3xl border border-stadium-grey dark:border-slate-700 mb-12 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search courts..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <input
              type="text"
              placeholder="City"
              className="w-full px-4 py-2 rounded-lg border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
            />
            <select
              className="w-full px-4 py-2 rounded-lg border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
              value={filters.turf_type}
              onChange={(e) => { setFilters(prev => ({ ...prev, turf_type: e.target.value })); setPage(1); }}
            >
              <option value="">All Turf Types</option>
              <option value="ASTROTURF">AstroTurf</option>
              <option value="CARPET">Carpet</option>
              <option value="WOOD">Wood</option>
            </select>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ac"
                className="w-4 h-4 accent-field-green"
                onChange={(e) => { setFilters(prev => ({ ...prev, has_ac: e.target.checked ? 'true' : '' })); setPage(1); }}
              />
              <label htmlFor="ac" className="text-sm text-gray-600 dark:text-gray-300">AC Available</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-4 h-4 accent-field-green"
                onChange={(e) => { setFilters(prev => ({ ...prev, has_parking: e.target.checked ? 'true' : '' })); setPage(1); }}
              />
              <label htmlFor="parking" className="text-sm text-gray-600 dark:text-gray-300">Parking</label>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-80 bg-stadium-grey dark:bg-slate-800 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : courts.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-stadium-grey dark:bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-boundary-white">No courts found</h3>
            <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courts.map(court => (
              <CourtCard key={court.id} court={court} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CourtsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-pitch-cream dark:bg-stadium-dark flex items-center justify-center">
        <div className="animate-pulse text-field-green font-bold text-lg">Loading venues...</div>
      </div>
    }>
      <CourtsContent />
    </Suspense>
  );
}


