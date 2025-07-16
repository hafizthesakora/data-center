// File: app/components/HolidayCalendar.js

'use client';

import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'; // Base styles are important

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHolidays = async () => {
      setIsLoading(true);
      const res = await fetch('/api/holidays');
      if (res.ok) {
        const data = await res.json();
        // Convert date strings from DB to Date objects for the calendar
        setHolidays(data.map((h) => new Date(h.date)));
      }
      setIsLoading(false);
    };
    fetchHolidays();
  }, []);

  const handleDayClick = async (day, { selected }) => {
    // Normalize date to UTC to prevent timezone off-by-one errors
    const clickedDate = new Date(
      Date.UTC(day.getFullYear(), day.getMonth(), day.getDate())
    );

    // Optimistic UI Update for a faster user experience
    if (selected) {
      // Instantly remove the holiday from the UI
      const newHolidays = holidays.filter(
        (h) => h.getTime() !== clickedDate.getTime()
      );
      setHolidays(newHolidays);
      // Then make the API call to delete it from the database
      await fetch('/api/holidays', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: clickedDate.toISOString() }),
      });
    } else {
      // Instantly add the holiday to the UI
      const newHolidays = [...holidays, clickedDate];
      setHolidays(newHolidays);
      // Then make the API call to add it to the database
      await fetch('/api/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: clickedDate.toISOString() }),
      });
    }
  };

  // --- CRITICAL FIX: Explicitly define the style for selected days ---
  const holidayStyle = {
    backgroundColor: '#ef4444', // A bright red color
    color: 'white',
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 mt-8">
      <h2 className="text-xl font-bold text-slate-800 mb-2">
        Holiday Calendar
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Click a date to mark it as a holiday. Click again to remove it.
      </p>
      <div className="flex justify-center p-2 border border-slate-200 rounded-xl">
        <DayPicker
          mode="multiple"
          min={0}
          selected={holidays}
          onDayClick={handleDayClick}
          modifiers={{ selected: holidays }}
          modifiersStyles={{ selected: holidayStyle }} // Apply the style here
          styles={{
            root: { border: 'none' },
            caption: { color: '#1e3a8a', fontWeight: 'bold' },
            head: { color: '#475569' },
            day: { borderRadius: '50%' }, // Make the day container round
          }}
        />
      </div>
      {isLoading && (
        <p className="text-center text-sm text-slate-500 mt-2">
          Loading holidays...
        </p>
      )}
    </div>
  );
}
