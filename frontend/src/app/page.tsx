"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Award,
  Sparkles,
  ShoppingBag,
  Users,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/lib/apiClient';
import { Court } from '@/types';
import { formatPKR, formatTime12h } from '@/lib/format';

const SECTIONS = [
  { id: 'hero', title: 'Home' },
  { id: 'featured', title: 'Featured' },
  { id: 'how-it-works', title: 'How It Works' },
  { id: 'cta', title: 'Get Started' }
];

export default function HomePage() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [featuredCourts, setFeaturedCourts] = useState<Court[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isTransitioningRef = useRef(false);
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await apiClient.get('/courts/?page=1');
        const data = response.data.results || response.data || [];
        setFeaturedCourts(data.slice(0, 3));
      } catch (err) {
        console.error("Error fetching courts:", err);
      }
    };
    fetchFeatured();
  }, []);

  const goToSection = useCallback((index: number) => {
    if (index < 0 || index >= SECTIONS.length) return;
    if (isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setCurrentIndex(index);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 850);
  }, []);

  const goToNext = useCallback(() => {
    goToSection(currentIndex + 1);
  }, [currentIndex, goToSection]);

  const goToPrev = useCallback(() => {
    goToSection(currentIndex - 1);
  }, [currentIndex, goToSection]);

  // Smooth mouse wheel navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Ignore if user is inside an input or typing
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (Math.abs(e.deltaY) < 25) return;

      if (e.deltaY > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToNext, goToPrev]);

  // Touch swipe support for mobile/trackpad gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartYRef.current - touchEndY;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartYRef.current = null;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city.trim()) params.append('city', city.trim());
    router.push(`/courts?${params.toString()}`);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative h-[calc(100dvh-4rem)] w-full overflow-hidden bg-pitch-cream dark:bg-stadium-dark select-none"
    >
      {/* Floating Dot Navigation on Right Side */}
      <div className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
        {SECTIONS.map((sec, idx) => (
          <button
            key={sec.id}
            onClick={() => goToSection(idx)}
            className="group relative flex items-center justify-end p-1 cursor-pointer"
            aria-label={`Go to ${sec.title}`}
          >
            <span className="absolute right-7 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-stadium-dark/95 dark:bg-boundary-white text-white dark:text-stadium-dark text-xs font-bold px-2.5 py-1 rounded-lg shadow-xl pointer-events-none whitespace-nowrap">
              {sec.title}
            </span>
            <span
              className={`block rounded-full transition-all duration-500 ease-out ${
                currentIndex === idx
                  ? 'w-3 h-8 bg-field-green dark:bg-field-green-light shadow-lg scale-105'
                  : 'w-3 h-3 bg-gray-400/40 hover:bg-gray-400'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Up Arrow (visible when not on first section) */}
      {currentIndex > 0 && (
        <button
          onClick={goToPrev}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-40 p-2 rounded-full bg-boundary-white/80 dark:bg-stadium-surface/80 backdrop-blur-md shadow-md text-gray-600 dark:text-gray-300 hover:text-field-green transition-all hover:scale-110 cursor-pointer"
          aria-label="Previous section"
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* Main Sliding Container */}
      <div
        className="w-full h-full will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.65,0,0.35,1)]"
        style={{
          transform: `translate3d(0, -${currentIndex * 100}%, 0)`
        }}
      >
        {/* =========================================================================
            SECTION 1: HERO (FULL SCREEN)
           ========================================================================= */}
        <section
          id="hero"
          className="relative w-full h-[calc(100dvh-4rem)] flex flex-col justify-between items-center px-4 py-6 md:py-8 overflow-y-auto"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-field-green/15 via-pitch-cream to-ball-red/10 dark:from-stadium-dark dark:via-slate-900 dark:to-stadium-dark" />

            {/* Pitch Markings */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-field-green dark:bg-slate-700 animate-pulse" />
              <div className="absolute top-1/2 left-1/2 w-48 h-48 border-2 border-dashed border-field-green dark:border-slate-700 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>

            {/* Floating Cricket Ball */}
            <div className="absolute top-12 right-12 md:right-24 w-14 h-14 bg-gradient-to-br from-ball-red to-red-700 rounded-full shadow-2xl animate-bounce hidden sm:block opacity-90 border-2 border-white/20" />
            <div className="absolute bottom-20 left-12 md:left-24 w-10 h-10 bg-field-green dark:bg-field-green-light rounded-full shadow-xl animate-pulse hidden sm:block opacity-80" />
          </div>

          {/* Top Badge */}
          <div className="w-full flex justify-center z-10 pt-2">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-field-green/10 dark:bg-field-green-light/10 text-field-green dark:text-field-green-light text-xs md:text-sm font-bold border border-field-green/20 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ball-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-ball-red"></span>
              </span>
              <span>🏏 Book Premium Cricket Turfs in Real Time!</span>
            </div>
          </div>

          {/* Center Content */}
          <div className="container mx-auto max-w-4xl text-center z-10 my-auto">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-stadium-dark dark:text-boundary-white tracking-tight leading-none mb-3">
              Your Perfect <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-field-green via-emerald-500 to-field-green-light animate-gradient">
                22 YARDS
              </span>
              <br />
              Experience
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-5 font-medium">
              Professional-grade indoor cricket courts with instant slot booking,
              certified turfs, and lightning-fast confirmation.
            </p>

            {/* Quick Search */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
              <div className="bg-boundary-white dark:bg-stadium-surface p-1.5 rounded-2xl shadow-xl border-2 border-stadium-grey dark:border-slate-700 flex flex-col sm:flex-row items-center gap-2 hover:border-field-green transition-all">
                <div className="flex items-center w-full sm:flex-1 px-4 py-2.5 bg-stadium-grey/30 dark:bg-slate-800/50 rounded-xl">
                  <MapPin className="text-field-green dark:text-field-green-light mr-2.5 flex-shrink-0" size={20} />
                  <input
                    type="text"
                    placeholder="Enter city (e.g., Lahore, Karachi)..."
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 focus:outline-none w-full text-sm md:text-base text-gray-800 dark:text-white placeholder-gray-400 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto bg-gradient-to-r from-ball-red to-red-600 hover:from-red-600 hover:to-ball-red text-white font-black py-3 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 shadow-md text-sm md:text-base cursor-pointer"
                >
                  <Search size={18} />
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Trust Highlights */}
            <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-2xl mx-auto">
              {[
                { icon: Target, val: '50+', label: 'Courts' },
                { icon: Award, val: '10k+', label: 'Players' },
                { icon: Star, val: '4.9★', label: 'Rating' },
                { icon: Zap, val: 'Instant', label: 'Booking' }
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center py-2 px-1 bg-boundary-white/60 dark:bg-stadium-surface/60 rounded-xl backdrop-blur-sm border border-stadium-grey/40 dark:border-slate-700/40"
                >
                  <stat.icon className="text-field-green dark:text-field-green-light mb-1" size={18} />
                  <span className="text-base sm:text-lg font-black text-gray-800 dark:text-white leading-tight">
                    {stat.val}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-semibold">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll Down Button */}
          <button
            onClick={goToNext}
            className="z-10 flex flex-col items-center text-gray-500 hover:text-field-green transition-colors pb-2 cursor-pointer group"
          >
            <span className="text-xs font-bold uppercase tracking-wider mb-1 group-hover:translate-y-0.5 transition-transform">
              Featured Courts
            </span>
            <ChevronDown className="animate-bounce" size={20} />
          </button>
        </section>

        {/* =========================================================================
            SECTION 2: FEATURED COURTS (FULL SCREEN)
           ========================================================================= */}
        <section
          id="featured"
          className="relative w-full h-[calc(100dvh-4rem)] flex flex-col justify-between items-center px-4 py-6 md:py-8 bg-boundary-white dark:bg-stadium-surface overflow-y-auto"
        >
          {/* Section Header */}
          <div className="text-center z-10 pt-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-field-green dark:text-field-green-light bg-field-green/10 dark:bg-field-green-light/10 px-3 py-1 rounded-full mb-1">
              <Sparkles size={14} /> Top Venues
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-stadium-dark dark:text-boundary-white">
              Featured <span className="text-field-green dark:text-field-green-light">Arenas</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
              Book top-tier turf pitches handpicked for professional cricketing
            </p>
          </div>

          {/* Courts Grid */}
          <div className="container mx-auto max-w-5xl z-10 my-auto w-full">
            {featuredCourts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading top rated turfs...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCourts.map((court) => (
                  <div
                    key={court.id}
                    className="group bg-pitch-cream dark:bg-stadium-dark rounded-2xl overflow-hidden shadow-lg border-2 border-stadium-grey dark:border-slate-700 hover:border-field-green transition-all hover:shadow-2xl hover:-translate-y-1.5 flex flex-col"
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={court.main_image || '/api/placeholder/400/320'}
                        alt={court.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-white/95 dark:bg-stadium-dark/95 backdrop-blur px-2.5 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-field-green dark:text-field-green-light shadow">
                        <Star size={13} fill="currentColor" />
                        {court.average_rating || '5.0'}
                      </div>
                      <div className="absolute bottom-3 left-3 bg-stadium-dark/80 backdrop-blur text-white px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                        {court.turf_type || 'Astroturf'}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-black text-stadium-dark dark:text-boundary-white group-hover:text-field-green transition-colors line-clamp-1">
                          {court.name}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1 mb-1.5">
                          <MapPin size={13} className="mr-1 text-field-green flex-shrink-0" />
                          <span className="truncate">{court.city} • {court.address}</span>
                        </div>
                        <div className="flex items-center text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-2 bg-stadium-grey/40 dark:bg-slate-800/60 px-2 py-0.5 rounded-md w-fit">
                          <Clock size={12} className="mr-1 text-field-green dark:text-field-green-light flex-shrink-0" />
                          <span>{formatTime12h(court.opening_time)} – {formatTime12h(court.closing_time)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stadium-grey/60 dark:border-slate-800">
                        <div>
                          <span className="block text-[10px] text-gray-400 uppercase font-bold">Hourly Rate</span>
                          <span className="text-lg font-black text-field-green dark:text-field-green-light">
                            {formatPKR(court.price_per_hour)}
                          </span>
                        </div>
                        <Link
                          href={`/courts/${court.id}`}
                          className="px-4 py-2 bg-field-green hover:bg-field-green-light text-white text-xs font-black rounded-xl transition-all shadow hover:shadow-md transform active:scale-95"
                        >
                          Book Slot
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center mt-5">
              <Link
                href="/courts"
                className="inline-flex items-center gap-2 text-sm font-black text-field-green dark:text-field-green-light hover:underline"
              >
                Explore All Courts in Your City <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Scroll Down Button */}
          <button
            onClick={goToNext}
            className="z-10 flex flex-col items-center text-gray-500 hover:text-field-green transition-colors pb-2 cursor-pointer group"
          >
            <span className="text-xs font-bold uppercase tracking-wider mb-1 group-hover:translate-y-0.5 transition-transform">
              How It Works
            </span>
            <ChevronDown className="animate-bounce" size={20} />
          </button>
        </section>

        {/* =========================================================================
            SECTION 3: HOW IT WORKS (FULL SCREEN)
           ========================================================================= */}
        <section
          id="how-it-works"
          className="relative w-full h-[calc(100dvh-4rem)] flex flex-col justify-between items-center px-4 py-6 md:py-8 bg-pitch-cream dark:bg-stadium-dark overflow-y-auto"
        >
          {/* Section Header */}
          <div className="text-center z-10 pt-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ball-red dark:text-ball-red-dark bg-ball-red/10 px-3 py-1 rounded-full mb-1">
              <Target size={14} /> 3 Easy Steps
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-stadium-dark dark:text-boundary-white">
              How It <span className="text-field-green dark:text-field-green-light">Works</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
              From discovering a turf to playing your first over in under 60 seconds
            </p>
          </div>

          {/* 3 Step Cards */}
          <div className="container mx-auto max-w-4xl z-10 my-auto w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: "01",
                  icon: Search,
                  title: "Explore Turfs",
                  desc: "Filter by city, turf type (Astroturf, Carpet), AC, and amenities in your locality."
                },
                {
                  step: "02",
                  icon: Zap,
                  title: "Pick Your Slot",
                  desc: "Check live slot availability, select preferred hours, and reserve your match instantly."
                },
                {
                  step: "03",
                  icon: Award,
                  title: "Play & Compete",
                  desc: "Show up at the venue with your team, play on certified 22 yards, and leave reviews."
                }
              ].map((card, i) => (
                <div
                  key={i}
                  className="relative bg-boundary-white dark:bg-stadium-surface p-6 rounded-3xl border-2 border-stadium-grey dark:border-slate-700 hover:border-field-green transition-all hover:shadow-xl group"
                >
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-field-green to-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-110 transition-transform">
                    {card.step}
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-field-green/10 dark:bg-field-green-light/10 text-field-green dark:text-field-green-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <card.icon size={26} />
                  </div>
                  <h3 className="text-lg font-black text-stadium-dark dark:text-boundary-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 p-4 bg-boundary-white/60 dark:bg-stadium-surface/60 rounded-2xl border border-stadium-grey/60 dark:border-slate-700/60 max-w-2xl mx-auto flex items-center justify-around text-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-field-green" size={20} />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Verified Owners</span>
              </div>
              <div className="h-6 w-px bg-gray-300 dark:bg-slate-700" />
              <div className="flex items-center gap-2">
                <Zap className="text-ball-red" size={20} />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Instant Confirmation</span>
              </div>
              <div className="h-6 w-px bg-gray-300 dark:bg-slate-700" />
              <div className="flex items-center gap-2">
                <Users className="text-blue-500" size={20} />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Player Community</span>
              </div>
            </div>
          </div>

          {/* Scroll Down Button */}
          <button
            onClick={goToNext}
            className="z-10 flex flex-col items-center text-gray-500 hover:text-field-green transition-colors pb-2 cursor-pointer group"
          >
            <span className="text-xs font-bold uppercase tracking-wider mb-1 group-hover:translate-y-0.5 transition-transform">
              Ready to Play?
            </span>
            <ChevronDown className="animate-bounce" size={20} />
          </button>
        </section>

        {/* =========================================================================
            SECTION 4: CALL TO ACTION & FOOTER (FULL SCREEN)
           ========================================================================= */}
        <section
          id="cta"
          className="relative w-full h-[calc(100dvh-4rem)] flex flex-col justify-between items-center px-4 py-6 md:py-8 bg-gradient-to-br from-stadium-dark via-slate-900 to-stadium-surface text-white overflow-y-auto"
        >
          {/* Background glow effects */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-field-green rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-ball-red rounded-full blur-3xl animate-pulse" />
          </div>

          {/* Top badge */}
          <div className="z-10 pt-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-field-green-light border border-white/15 text-xs font-bold backdrop-blur-sm">
              <span>🏏 Join the 22 Yards Cricket League</span>
            </div>
          </div>

          {/* Main CTA Content */}
          <div className="container mx-auto max-w-3xl text-center z-10 my-auto">
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black mb-3 tracking-tight leading-none">
              Ready to Step Onto <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-field-green-light via-emerald-400 to-green-300">
                The Pitch?
              </span>
            </h2>

            <p className="text-sm sm:text-base md:text-lg opacity-85 max-w-xl mx-auto mb-6 font-medium">
              Lock in your turf slot now or shop for pro cricket gear before your next match.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link
                href="/courts"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-field-green to-emerald-600 hover:from-emerald-600 hover:to-field-green text-white font-black py-3.5 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl text-base"
              >
                <span>Explore Courts</span>
                <ArrowRight size={20} />
              </Link>

              <Link
                href="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-black py-3.5 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20 shadow-xl text-base"
              >
                <ShoppingBag size={20} />
                <span>Visit Pro Shop</span>
              </Link>

              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-ball-red hover:bg-red-700 text-white font-black py-3.5 px-8 rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl text-base"
              >
                <span>Sign Up Free</span>
              </Link>
            </div>
          </div>

          {/* Footer info bar */}
          <div className="w-full max-w-4xl z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
            <p>© 2026 22 Yards. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/courts" className="hover:text-white transition-colors">Courts</Link>
              <Link href="/shop" className="hover:text-white transition-colors">Shop</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
