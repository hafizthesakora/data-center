'use client';

import { useState, useEffect } from 'react';

export default function TimeClock() {
  const [latestLog, setLatestLog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLatestLog = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/timelog');
      if (res.ok) {
        const data = await res.json();
        setLatestLog(data);
      }
    } catch (err) {
      setError('Could not fetch time log status.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestLog();
  }, []);

  const handleClockIn = async () => {
    setError('');
    const res = await fetch('/api/timelog', { method: 'POST' });
    if (res.ok) {
      fetchLatestLog(); // Refresh status
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to clock in.');
    }
  };

  const handleClockOut = async () => {
    setError('');
    const res = await fetch('/api/timelog', { method: 'PUT' });
    if (res.ok) {
      fetchLatestLog(); // Refresh status
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to clock out.');
    }
  };

  const isClockedIn = latestLog?.status === 'CLOCKED_IN';

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Time Clock</h2>
        <div className="flex items-center">
          <div
            className={`w-3 h-3 rounded-full mr-2 ${
              isClockedIn ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
            }`}
          ></div>
          <span className="text-sm font-medium text-slate-600">
            {isClockedIn ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-200 border-t-indigo-600"></div>
            <span className="text-sm text-slate-500 font-medium">
              Loading status...
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Card */}
          <div
            className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              isClockedIn
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200'
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">
                Current Status
              </span>
              <div
                className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  isClockedIn
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                    : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                }`}
              >
                {isClockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
              </div>
            </div>

            {latestLog && (
              <div className="flex items-center text-xs text-slate-600">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">
                  Last event:{' '}
                  {new Date(
                    isClockedIn ? latestLog.clockIn : latestLog.clockOut
                  ).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleClockIn}
              disabled={isClockedIn}
              className={`relative overflow-hidden px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform ${
                isClockedIn
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              <div className="flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Clock In
              </div>
            </button>

            <button
              onClick={handleClockOut}
              disabled={!isClockedIn}
              className={`relative overflow-hidden px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform ${
                !isClockedIn
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
              }`}
            >
              <div className="flex items-center justify-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Clock Out
              </div>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 p-4 rounded-r-xl">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
