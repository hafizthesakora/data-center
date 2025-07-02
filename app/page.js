// File: app/page.js

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TimeClock from './components/TimeClock';
import TimeLogViewer from './components/TimeLogViewer';
import DashboardStats from './components/DashboardStats';
import Image from 'next/image';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [cycles, setCycles] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
            // --- CRITICAL FIX ---
            // Destructure the 'cycles' and 'stats' properties from the response object
            const { cycles, stats } = await res.json();
            setCycles(cycles || []); // Set only the array of cycles, default to empty array if undefined
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
    // This check will now work correctly since 'cycles' is an array
    const hasDraft = cycles.some(
      (cycle) =>
        cycle.technicianId === session.user.id && cycle.status === 'DRAFT'
    );
    if (hasDraft) {
      alert(
        'You must complete your current draft cycle before creating a new one.'
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

  // This filter will now work correctly since 'cycles' is guaranteed to be an array
  const filteredCycles = cycles.filter((cycle) =>
    cycle.technician.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              {/* <Image
                src="logo.svg"
                alt="Datacenter Logo"
                width={100}
                height={100}
              /> */}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                        filteredCycles.map((cycle, index) => (
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
                              <Link
                                href={`/cycles/${cycle.id}`}
                                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
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
                                View
                              </Link>
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
            {session?.user?.role === 'APPROVER' && <TimeLogViewer />}
          </aside>
        </div>
      </div>
    </div>
  );
}
