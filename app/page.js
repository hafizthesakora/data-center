// File: app/page.js

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TimeClock from './components/TimeClock';
import TimeLogViewer from './components/TimeLogViewer';
import DashboardStats from './components/DashboardStats';
import HolidayCalendar from './components/HolidayCalendar';
import Image from 'next/image';

// --- Delete Confirmation Modal Component ---
const DeleteCycleModal = ({ cycle, onConfirm, onCancel, isDeleting }) => {
  if (!cycle) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Confirm Deletion</h2>
        </div>
        <p className="text-sm text-slate-600 mb-6">
          Are you sure you want to permanently delete the cycle created by{' '}
          <strong>{cycle.technician.name}</strong> on{' '}
          <strong>{new Date(cycle.createdAt).toLocaleDateString()}</strong>?
          This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="bg-slate-200 text-slate-700 px-5 py-2 rounded-xl font-semibold hover:bg-slate-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(cycle.id)}
            disabled={isDeleting}
            className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-5 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-red-600 hover:to-rose-600 transition-all duration-200 disabled:from-slate-400 disabled:to-slate-400 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [cycles, setCycles] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cycleToDelete, setCycleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const res = await fetch('/api/cycles');
          if (res.ok) {
            const { cycles, stats } = await res.json();
            setCycles(cycles || []);
            if (stats) setStats(stats);
          } else {
            console.error('Failed to fetch dashboard data');
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [status, router]);

  const createCycle = async () => {
    const hasDraft = cycles.some(
      (cycle) =>
        cycle.technicianId === session.user.id &&
        (cycle.status === 'DRAFT' || cycle.status === 'REJECTED')
    );
    if (hasDraft) {
      alert(
        'You must complete or resubmit your current draft/rejected cycle before creating a new one.'
      );
      return;
    }

    const res = await fetch('/api/cycles', { method: 'POST' });
    if (res.ok) {
      const newCycle = await res.json();
      setCycles((prevCycles) => [newCycle, ...prevCycles]);
      router.push(`/cycles/${newCycle.id}`);
    } else {
      alert('Failed to create cycle.');
    }
  };

  const handleDeleteCycle = async (cycleId) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cycles/${cycleId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setCycles((prevCycles) => prevCycles.filter((c) => c.id !== cycleId));
        setCycleToDelete(null);
      } else {
        alert('Failed to delete the cycle. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while deleting the cycle.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const filteredCycles = cycles.filter((cycle) =>
    cycle.technician.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <DeleteCycleModal
        cycle={cycleToDelete}
        onConfirm={handleDeleteCycle}
        onCancel={() => setCycleToDelete(null)}
        isDeleting={isDeleting}
      />

      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div className="w-4/5 mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                Eni Ghana Datacenter Dashboard
              </h1>
              <div className="flex items-center mt-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div>
                <p className="text-slate-300">
                  Welcome back,{' '}
                  <span className="text-white font-semibold">
                    {session?.user?.name}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl border border-slate-600"
            >
              Sign Out
            </button>
          </header>
        </div>
      </div>

      <div className="w-4/5 mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {session?.user?.role === 'APPROVER' && <DashboardStats stats={stats} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          <main className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-1">
                    Work Cycles
                  </h2>
                  <p className="text-slate-600">
                    Manage and track your recording cycles
                  </p>
                </div>
                {session?.user?.role === 'TECHNICIAN' && (
                  <button
                    onClick={createCycle}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 w-full sm:w-auto"
                  >
                    <span className="flex items-center justify-center">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Create New Cycle
                    </span>
                  </button>
                )}
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by technician name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm placeholder-slate-400 transition-all duration-200"
                />
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Technician
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Date Created
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Date Submitted
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {filteredCycles.length > 0 ? (
                        filteredCycles.map((cycle) => (
                          <tr
                            key={cycle.id}
                            className="hover:bg-slate-50/80 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-bold">
                                    {cycle.technician.name.charAt(0)}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-semibold text-slate-900">
                                    {cycle.technician.name}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                              {new Date(cycle.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                                  cycle.status === 'APPROVED'
                                    ? 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200'
                                    : cycle.status === 'SUBMITTED'
                                    ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200'
                                    : cycle.status === 'REJECTED'
                                    ? 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border border-red-200'
                                    : 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border border-slate-200'
                                }`}
                              >
                                {cycle.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                              {cycle.submittedAt ? (
                                new Date(cycle.submittedAt).toLocaleDateString()
                              ) : (
                                <span className="text-slate-400 italic">
                                  Not submitted
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Link
                                  href={`/cycles/${cycle.id}`}
                                  className={`inline-flex items-center px-4 py-2 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 ${
                                    cycle.status === 'REJECTED'
                                      ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
                                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                                  }`}
                                >
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
                                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                  </svg>
                                  {cycle.status === 'REJECTED'
                                    ? 'Review'
                                    : 'View'}
                                </Link>
                                {session?.user?.role === 'APPROVER' && (
                                  <button
                                    onClick={() => setCycleToDelete(cycle)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                    title="Delete Cycle"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      ></path>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <svg
                                  className="w-8 h-8 text-slate-400"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <p className="text-slate-500 font-medium">
                                No cycles found
                              </p>
                              <p className="text-slate-400 text-sm mt-1">
                                Try adjusting your search or create a new cycle
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>

          <aside className="lg:col-span-1">
            {session?.user?.role === 'TECHNICIAN' && <TimeClock />}
            {session?.user?.role === 'APPROVER' && (
              <div className="space-y-8">
                <TimeLogViewer />
                <HolidayCalendar />
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
