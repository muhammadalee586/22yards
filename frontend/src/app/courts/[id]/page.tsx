"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import { Court } from '@/types';
import { Calendar, Clock, MapPin, Star, Wind, ParkingCircle, ChevronLeft, Phone, MessageSquare, ThumbsUp, Moon, CalendarDays, AlertTriangle } from 'lucide-react';
import { formatPKR, formatTime12h, getMediaUrl } from '@/lib/format';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';

export interface SlotItem {
  hour: string;
  isNextDay: boolean;
  label: string;
}

export function getNextDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + 1);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Generate every hour slot within a court's operating window */
export function generateHourSlots(openingTime: string, closingTime: string): SlotItem[] {
  const slots: SlotItem[] = [];
  const [openH] = openingTime.split(':').map(Number);
  const [closeH] = closingTime.split(':').map(Number);

  if (openH < closeH) {
    for (let h = openH; h < closeH; h++) {
      const hh = `${String(h).padStart(2, '0')}:00`;
      slots.push({ hour: hh, isNextDay: false, label: formatTime12h(hh) });
    }
  } else {
    // Overnight: openH to 23 (session date), 0 to closeH-1 (next calendar day)
    for (let h = openH; h < 24; h++) {
      const hh = `${String(h).padStart(2, '0')}:00`;
      slots.push({ hour: hh, isNextDay: false, label: formatTime12h(hh) });
    }
    for (let h = 0; h < closeH; h++) {
      const hh = `${String(h).padStart(2, '0')}:00`;
      slots.push({ hour: hh, isNextDay: true, label: `${formatTime12h(hh)} (+1d)` });
    }
  }
  return slots;
}

/** Check whether a slot is already booked using datetime comparisons */
export function isSlotBooked(
  slot: SlotItem,
  bookingDate: string,
  bookedSlots: { start_time: string; end_time: string; date?: string; end_date?: string }[]
): boolean {
  const slotDate = slot.isNextDay ? getNextDate(bookingDate) : bookingDate;
  const [h] = slot.hour.split(':').map(Number);

  const [y, m, d] = slotDate.split('-').map(Number);
  const slotStart = new Date(y, m - 1, d, h, 0, 0).getTime();
  const slotEnd = slotStart + 60 * 60 * 1000;

  return bookedSlots.some((b) => {
    const bDate = b.date || bookingDate;
    const bEndDate = b.end_date || bDate;
    const [bStartH, bStartM] = b.start_time.split(':').map(Number);
    const [bEndH, bEndM] = b.end_time.split(':').map(Number);

    const [bY, bM, bD] = bDate.split('-').map(Number);
    const bStart = new Date(bY, bM - 1, bD, bStartH, bStartM || 0, 0).getTime();

    const [bEY, bEM, bED] = bEndDate.split('-').map(Number);
    const bEnd = new Date(bEY, bEM - 1, bED, bEndH, bEndM || 0, 0).getTime();

    return slotStart < bEnd && slotEnd > bStart;
  });
}

export default function CourtDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courtId = params.id;
  const { user } = useAuthStore();

  const [court, setCourt] = useState<Court | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [availability, setAvailability] = useState<{
    opening_time: string;
    closing_time: string;
    booked_slots: { start_time: string; end_time: string }[];
  } | null>(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [contactNumber, setContactNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  // Review submission state
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courtRes, availRes, reviewsRes] = await Promise.all([
          apiClient.get(`/courts/${courtId}/`),
          apiClient.get(`/courts/${courtId}/availability/?date=${bookingDate}`),
          apiClient.get(`/reviews/?court=${courtId}`).catch(() => ({ data: [] })),
        ]);
        setCourt(courtRes.data);
        setAvailability(availRes.data);
        setReviews(reviewsRes.data.results || reviewsRes.data || []);
        setSelectedSlots([]); // reset on date change
      } catch (err) {
        console.error('Error fetching court details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courtId, bookingDate]);

  /** Toggle an hour slot on/off — only if it isn't already booked */
  const toggleSlot = (slot: string) => {
    setSelectedSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const allSlots = availability
    ? generateHourSlots(availability.opening_time, availability.closing_time)
    : [];

  // Operating days check for the selected bookingDate
  const [by, bm, bd] = bookingDate.split('-').map(Number);
  const selectedDateObj = new Date(by, (bm || 1) - 1, bd || 1);
  const DAY_CODES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const selectedDayCode = DAY_CODES[selectedDateObj.getDay()];
  const isDayAvailable = court?.operating_days && court.operating_days.length > 0
    ? court.operating_days.includes(selectedDayCode)
    : true;
  const isOvernight = court ? court.closing_time <= court.opening_time : false;

  /** Derive contiguous start/end time and calendar dates from selected slots */
  const getBookingTimes = () => {
    if (selectedSlots.length === 0 || allSlots.length === 0) return null;

    const orderedSelected = allSlots.filter(s => selectedSlots.includes(s.hour));
    if (orderedSelected.length === 0) return null;

    const first = orderedSelected[0];
    const last = orderedSelected[orderedSelected.length - 1];

    const startDate = first.isNextDay ? getNextDate(bookingDate) : bookingDate;
    const startTime = first.hour;

    const lastH = parseInt(last.hour.split(':')[0], 10);
    const nextH = (lastH + 1) % 24;
    const endTime = `${String(nextH).padStart(2, '0')}:00`;
    const endDate = (last.isNextDay || lastH === 23) ? getNextDate(bookingDate) : bookingDate;

    return { startDate, endDate, startTime, endTime };
  };

  /** Warn if selected slots are not contiguous */
  const isContiguous = (): boolean => {
    if (selectedSlots.length <= 1) return true;
    const indices = allSlots
      .map((s, idx) => (selectedSlots.includes(s.hour) ? idx : -1))
      .filter(idx => idx !== -1);
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i - 1] + 1) return false;
    }
    return true;
  };

  const totalHours = selectedSlots.length;
  const totalCost = court ? parseFloat(court.price_per_hour) * totalHours : 0;
  const times = getBookingTimes();

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!user) {
      toast.info('Please sign in to book your court slot.');
      router.push(`/login?next=/courts/${courtId}`);
      return;
    }

    if (!isDayAvailable) {
      const dayMsg = `Court is closed on ${selectedDayCode}s. Operating days: ${court?.operating_days?.join(', ')}`;
      setError(dayMsg);
      toast.error(dayMsg);
      return;
    }

    if (selectedSlots.length === 0) {
      setError('Please select at least one hour slot.');
      return;
    }
    if (!isContiguous()) {
      setError('Please select consecutive hour slots only.');
      return;
    }
    if (!contactNumber.trim()) {
      setError('Please enter your contact number so the court owner can reach you.');
      return;
    }
    if (!/^[0-9+\-\s()]{7,15}$/.test(contactNumber.trim())) {
      setError('Please enter a valid contact number (7–15 digits).');
      return;
    }

    setBookingLoading(true);
    try {
      const times = getBookingTimes();
      if (!times) {
        setError('Please select a valid time slot.');
        return;
      }

      await apiClient.post('/bookings/', {
        court: courtId,
        date: times.startDate,
        end_date: times.endDate,
        start_time: times.startTime.length === 5 ? `${times.startTime}:00` : times.startTime,
        end_time: times.endTime.length === 5 ? `${times.endTime}:00` : times.endTime,
        contact_number: contactNumber.trim(),
        advance_payment: '0.00',
      });
      toast.success('Court booking confirmed! 🏏 Enjoy your match!');
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response?.data : null) ||
        (err.response?.data && typeof err.response?.data === 'object' ? Object.values(err.response?.data).flat().join(' ') : null) ||
        'Booking failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in to leave a review.');
      router.push(`/login?next=/courts/${courtId}`);
      return;
    }
    if (!newComment.trim()) {
      toast.warning('Please enter a review comment.');
      return;
    }

    try {
      setReviewSubmitting(true);
      const res = await apiClient.post('/reviews/', {
        court: courtId,
        rating: newRating,
        comment: newComment.trim(),
      });
      toast.success('Review submitted successfully! Thank you.');
      setReviews([res.data, ...reviews]);
      setNewComment('');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Only players with a completed match at this venue can review.';
      toast.error(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!court) return <div className="min-h-screen flex items-center justify-center">Court not found.</div>;

  // Today's date string for min date restriction
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-pitch-cream dark:bg-stadium-dark">
      <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-field-green mb-6 transition-colors cursor-pointer"
          >
            <ChevronLeft size={20} /> Back to Courts
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Court Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-boundary-white dark:bg-stadium-surface rounded-3xl overflow-hidden shadow-sm border border-stadium-grey dark:border-slate-700">
                <img src={getMediaUrl(court.main_image)} alt={court.name} className="w-full h-96 object-cover" />
                <div className="p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="text-4xl font-black text-stadium-dark dark:text-boundary-white">{court.name}</h1>
                    <div className="flex items-center gap-1 bg-field-green text-white px-3 py-1 rounded-full font-bold">
                      <Star size={16} fill="currentColor" /> {court.average_rating}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-6">
                    <MapPin size={18} /> {court.address}, {court.city}
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                    {court.description}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="p-4 bg-stadium-grey dark:bg-slate-800 rounded-2xl text-center">
                      <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Price</span>
                      <span className="text-base font-black text-field-green dark:text-field-green-light">{formatPKR(court.price_per_hour)}/hr</span>
                    </div>
                    <div className="p-4 bg-stadium-grey dark:bg-slate-800 rounded-2xl text-center">
                      <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Turf</span>
                      <span className="text-base font-bold dark:text-boundary-white">{court.turf_type}</span>
                    </div>
                    <div className="p-4 bg-stadium-grey dark:bg-slate-800 rounded-2xl text-center">
                      <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Timings</span>
                      <span className="text-xs font-black text-field-green dark:text-field-green-light whitespace-nowrap block mt-1">
                        {formatTime12h(court.opening_time)} - {formatTime12h(court.closing_time)}
                      </span>
                    </div>
                    <div className="p-4 bg-stadium-grey dark:bg-slate-800 rounded-2xl text-center">
                      <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Open Days</span>
                      <span className="text-xs font-bold text-field-green dark:text-field-green-light block mt-1">
                        {court.operating_days && court.operating_days.length === 7
                          ? 'All 7 Days'
                          : court.operating_days?.join(', ') || 'All Days'}
                      </span>
                    </div>
                    <div className="p-4 bg-stadium-grey dark:bg-slate-800 rounded-2xl text-center">
                      <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">AC</span>
                      <span className="text-base font-bold dark:text-boundary-white">{court.has_ac ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="p-4 bg-stadium-grey dark:bg-slate-800 rounded-2xl text-center">
                      <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Parking</span>
                      <span className="text-base font-bold dark:text-boundary-white">{court.has_parking ? 'Yes' : 'No'}</span>
                    </div>
                  </div>

                  {isOvernight && (
                    <div className="mt-4 p-3.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl flex items-center gap-2.5 text-xs text-indigo-900 dark:text-indigo-200">
                      <Moon size={18} className="text-indigo-600 flex-shrink-0" />
                      <span><strong>🌙 Overnight Venue:</strong> Operating past midnight into the morning. Night matches available!</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviews & Ratings Section */}
              <div className="bg-boundary-white dark:bg-stadium-surface rounded-3xl p-8 shadow-sm border border-stadium-grey dark:border-slate-700 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black text-stadium-dark dark:text-boundary-white flex items-center gap-2">
                      <MessageSquare className="text-field-green" size={24} /> Verified Player Reviews
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Feedback from players who completed matches at this turf
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-field-green/10 text-field-green font-black text-sm">
                    <Star size={16} fill="currentColor" />
                    <span>{court.average_rating} ({reviews.length})</span>
                  </div>
                </div>

                {/* Submit Review Form */}
                <form onSubmit={handleReviewSubmit} className="p-5 bg-stadium-grey/30 dark:bg-slate-800/40 rounded-2xl border border-stadium-grey dark:border-slate-700/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Leave Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className={`p-1 transition-transform hover:scale-125 cursor-pointer ${
                            star <= newRating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'
                          }`}
                        >
                          <Star size={20} fill={star <= newRating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    placeholder={user ? "Share your experience with lighting, bounce, or turf quality..." : "Log in to leave a review after completing your match..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!user || reviewSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl border border-stadium-grey dark:border-slate-700 bg-white dark:bg-stadium-dark text-sm outline-none focus:ring-2 ring-field-green disabled:opacity-60"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!user || reviewSubmitting || !newComment.trim()}
                      className="px-5 py-2 rounded-xl bg-field-green hover:bg-field-green-light text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Post Review'}
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-3 pt-2">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6 italic">
                      No reviews yet for this turf. Be the first to play and review!
                    </p>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 rounded-2xl border border-stadium-grey/60 dark:border-slate-800 bg-white/50 dark:bg-stadium-dark/50 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-800 dark:text-gray-200">
                              {rev.user_name || 'Verified Player'}
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                              Verified Match
                            </span>
                          </div>
                          <div className="flex items-center text-amber-400 text-xs font-bold">
                            {'★'.repeat(rev.rating)}
                            <span className="text-gray-400 text-[11px] ml-1.5">{rev.created_at ? rev.created_at.slice(0, 10) : ''}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Booking Panel */}
            <div className="space-y-6">
              <div className="bg-boundary-white dark:bg-stadium-surface p-8 rounded-3xl shadow-lg border border-stadium-grey dark:border-slate-700 sticky top-8">
                <h2 className="text-2xl font-black text-stadium-dark dark:text-boundary-white mb-4">Book This Court</h2>

                {/* Operating Hours & Days */}
                <div className="flex items-start gap-3 p-4 bg-field-green/10 dark:bg-field-green-light/10 border border-field-green/20 rounded-2xl mb-6">
                  <Clock className="text-field-green dark:text-field-green-light flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <span className="block text-xs font-bold uppercase tracking-wider text-field-green dark:text-field-green-light">
                      Court Schedule
                    </span>
                    <span className="text-base font-black text-stadium-dark dark:text-boundary-white">
                      {formatTime12h(court.opening_time)} – {formatTime12h(court.closing_time)}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 font-medium mt-1">
                      <CalendarDays size={13} className="text-field-green" />
                      <span>
                        Open: {court.operating_days && court.operating_days.length === 7 ? 'Every Day' : court.operating_days?.join(', ') || 'All Days'}
                      </span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleBooking} className="space-y-6">
                  {/* Date picker — no past dates */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Select Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="date"
                        min={today}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                      />
                    </div>

                    {!isDayAvailable && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200 font-medium">
                        <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                        <span>Court is closed on {selectedDayCode}s. Open days: {court.operating_days?.join(', ') || 'All Days'}.</span>
                      </div>
                    )}

                    {isOvernight && (
                      <div className="mt-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                        <Moon size={16} className="text-indigo-600 flex-shrink-0" />
                        <span>Overnight court: Slots past 12:00 AM belong to the next calendar morning.</span>
                      </div>
                    )}
                  </div>

                  {/* Hour slot grid */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                      Select Hour Slots
                      <span className="text-xs font-normal text-gray-400 ml-2">(tap to toggle)</span>
                    </label>
                    {allSlots.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">Loading slots...</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {allSlots.map((slot) => {
                          const booked = availability
                            ? isSlotBooked(slot, bookingDate, availability.booked_slots)
                            : false;
                          const selected = selectedSlots.includes(slot.hour);
                          return (
                            <button
                              key={slot.hour}
                              type="button"
                              disabled={booked || !isDayAvailable}
                              onClick={() => toggleSlot(slot.hour)}
                              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center cursor-pointer ${
                                !isDayAvailable
                                  ? 'bg-gray-100 dark:bg-slate-800/50 text-gray-400 border-transparent cursor-not-allowed opacity-50'
                                  : booked
                                  ? 'bg-red-100 dark:bg-red-950/40 text-red-400 border-red-200 dark:border-red-900/50 cursor-not-allowed line-through'
                                  : selected
                                  ? 'bg-field-green text-white border-field-green shadow-md scale-105'
                                  : 'bg-stadium-grey dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-transparent hover:border-field-green hover:text-field-green'
                              }`}
                            >
                              <span>{formatTime12h(slot.hour)}</span>
                              {slot.isNextDay && (
                                <span className={`text-[10px] font-normal leading-tight mt-0.5 ${selected ? 'text-white/80' : 'text-indigo-500 dark:text-indigo-300'}`}>
                                  Next Day
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {totalHours > 0 && (
                    <div className="p-4 bg-field-green/10 dark:bg-field-green-light/10 rounded-2xl border border-field-green/20">
                      {!isContiguous() && (
                        <p className="text-xs text-orange-600 font-bold mb-2">
                          ⚠ Please select consecutive slots only.
                        </p>
                      )}
                      <div className="flex justify-between text-sm font-bold text-stadium-dark dark:text-boundary-white mb-1">
                        <span>Duration</span>
                        <span>{totalHours} hour{totalHours > 1 ? 's' : ''}</span>
                      </div>
                      {times && (
                        <div className="space-y-1 mb-1">
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Time</span>
                            <span>{formatTime12h(times.startTime)} → {formatTime12h(times.endTime)}</span>
                          </div>
                          {times.startDate !== times.endDate && (
                            <div className="flex justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                              <span>Schedule</span>
                              <span>Spans overnight into next morning 🌙</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex justify-between text-base font-black text-field-green dark:text-field-green-light mt-2 pt-2 border-t border-field-green/20">
                        <span>Total</span>
                        <span>{formatPKR(totalCost)}</span>
                      </div>
                    </div>
                  )}

                  {/* Contact number */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      Contact Number
                      <span className="text-xs font-normal text-gray-400 ml-2">(shared with court owner)</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 0300-1234567"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-stadium-grey dark:border-slate-700 bg-boundary-white dark:bg-stadium-dark text-gray-800 dark:text-white focus:ring-2 ring-field-green outline-none"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-100 text-red-700 rounded-xl text-sm font-medium border border-red-200">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bookingLoading || selectedSlots.length === 0 || !isContiguous()}
                    className="w-full py-4 bg-field-green hover:bg-field-green-light text-white font-black rounded-2xl transition-all transform active:scale-95 disabled:opacity-50 shadow-lg cursor-pointer"
                  >
                    {bookingLoading
                      ? 'Processing...'
                      : selectedSlots.length === 0
                      ? 'Select Slots to Book'
                      : `Confirm Booking · ${formatPKR(totalCost)}`}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
