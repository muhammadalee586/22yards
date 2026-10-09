"use client";

import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Wind, MapPin, Loader } from 'lucide-react';

interface WeatherData {
  temperature: number;
  windspeed: number;
  weathercode: number;
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [cityName, setCityName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        // Fetch weather
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const weatherData = await weatherRes.json();
        setWeather(weatherData.current_weather);

        // Reverse geocode city name
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const geoData = await geoRes.json();
        const city =
          geoData.address?.city ||
          geoData.address?.town ||
          geoData.address?.village ||
          geoData.address?.county ||
          'Your Location';
        setCityName(city);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Unable to load weather');
      } finally {
        setLoading(false);
      }
    };

    if (!navigator.geolocation) {
      // Fallback to Karachi if geolocation not supported
      fetchWeather(24.8607, 67.0011);
      setCityName('Karachi');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
      },
      () => {
        // Permission denied — fall back to Karachi
        fetchWeather(24.8607, 67.0011);
        setCityName('Karachi');
      },
      { timeout: 8000 }
    );
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun className="text-yellow-400" size={24} />;
    if (code <= 3) return <Cloud className="text-gray-400" size={24} />;
    return <CloudRain className="text-blue-400" size={24} />;
  };

  if (loading) {
    return (
      <div className="bg-boundary-white dark:bg-stadium-surface p-4 rounded-2xl border border-stadium-grey dark:border-slate-700 flex items-center gap-3 shadow-sm">
        <Loader size={20} className="animate-spin text-field-green" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Getting weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="bg-boundary-white dark:bg-stadium-surface p-4 rounded-2xl border border-stadium-grey dark:border-slate-700 shadow-sm">
        <p className="text-sm text-gray-400 italic">{error || 'Weather unavailable'}</p>
      </div>
    );
  }

  return (
    <div className="bg-boundary-white dark:bg-stadium-surface p-4 rounded-2xl border border-stadium-grey dark:border-slate-700 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-stadium-grey dark:bg-slate-800 rounded-xl">
          {getWeatherIcon(weather.weathercode)}
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase flex items-center gap-1">
            <MapPin size={10} /> {cityName}
          </p>
          <p className="text-xl font-black text-stadium-dark dark:text-boundary-white">
            {Math.round(weather.temperature)}°C
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <Wind size={14} /> {weather.windspeed} km/h
        </div>
      </div>
    </div>
  );
}
