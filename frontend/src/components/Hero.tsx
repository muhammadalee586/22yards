import React from 'react';
import { Search, MapPin, Calendar } from 'lucide-react';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Decoration - The "Field" Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-field-green/20 to-pitch-cream dark:from-stadium-dark/50 dark:to-stadium-dark" />
        {/* Decorative boundary line simulation */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-field-green/10 dark:bg-field-green-light/5 blur-3xl rounded-full transform translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-field-green/10 dark:bg-field-green-light/10 text-field-green dark:text-field-green-light text-sm font-medium mb-6 animate-bounce">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-field-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-field-green dark:bg-field-green-light"></span>
          </span>
          <span>Premium Indoor Turfs Now Open!</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
          Book Your Perfect <br />
          <span className="text-field-green dark:text-field-green-light">22 Yards</span> Experience
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          Experience professional-grade indoor cricket courts. Seamless booking, 
          premium turfs, and a world-class gaming environment.
        </p>

        {/* Modern Floating Search Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-boundary-white dark:bg-stadium-surface p-2 rounded-2xl shadow-2xl border border-stadium-grey dark:border-slate-700 flex flex-col md:flex-row items-center gap-4">
            
            {/* Location Input */}
            <div className="flex items-center w-full md:w-1/3 px-4 py-3 border-b md:border-b-0 md:border-r border-stadium-grey dark:border-slate-700">
              <MapPin className="text-field-green dark:text-field-green-light mr-3" size={20} />
              <input 
                type="text" 
                placeholder="Enter city..." 
                className="bg-transparent border-none focus:ring-0 w-full text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Date Input */}
            <div className="flex items-center w-full md:w-1/3 px-4 py-3 border-b md:border-b-0 md:border-r border-stadium-grey dark:border-slate-700">
              <Calendar className="text-field-green dark:text-field-green-light mr-3" size={20} />
              <input 
                type="date" 
                className="bg-transparent border-none focus:ring-0 w-full text-gray-800 dark:text-white"
              />
            </div>

            {/* Search Button */}
            <div className="w-full md:w-1/3 p-1">
              <button className="w-full bg-ball-red dark:bg-ball-red-dark hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center space-x-2">
                <Search size={20} />
                <span>Search Courts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-gray-800 dark:text-white">50+</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Premium Turfs</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-gray-800 dark:text-white">10k+</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Happy Players</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-gray-800 dark:text-white">4.8/5</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Avg. Rating</span>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-2xl font-bold text-gray-800 dark:text-white">24/7</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">Support</span>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
