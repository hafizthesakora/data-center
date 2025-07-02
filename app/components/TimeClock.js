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
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">Time Clock</h2>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading status...</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Status:</span>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                isClockedIn
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {isClockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
            </span>
          </div>
          {latestLog && (
            <p className="text-xs text-gray-500">
              Last event:{' '}
              {new Date(
                isClockedIn ? latestLog.clockIn : latestLog.clockOut
              ).toLocaleString()}
            </p>
          )}
          <div className="flex space-x-2">
            <button
              onClick={handleClockIn}
              disabled={isClockedIn}
              className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Clock In
            </button>
            <button
              onClick={handleClockOut}
              disabled={!isClockedIn}
              className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Clock Out
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-xs text-center pt-2">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
