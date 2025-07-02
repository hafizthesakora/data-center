// File: app/components/TimeLogViewer.js

'use client';

import { useState, useEffect } from 'react';

export default function TimeLogViewer() {
  const [timeLogs, setTimeLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAllLogs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/timelog');
        if (res.ok) {
          const data = await res.json();
          setTimeLogs(data);
        } else {
          setError('Failed to fetch time logs.');
        }
      } catch (err) {
        setError('An error occurred while fetching logs.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllLogs();
  }, []);

  const calculateDuration = (clockIn, clockOut) => {
    if (!clockOut) {
      return <span className="text-blue-600 font-medium">In Progress</span>;
    }
    const durationMs = new Date(clockOut) - new Date(clockIn);
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Technician Time Logs
      </h2>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading time logs...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <div className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Technician
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Clock In
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Clock Out
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeLogs.length > 0 ? (
                timeLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.technician.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.clockIn).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.clockOut
                        ? new Date(log.clockOut).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">
                      {calculateDuration(log.clockIn, log.clockOut)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-gray-500">
                    No time logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
