// File: app/cycles/[id]/page.js

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function CycleDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [cycle, setCycle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    if (id) {
      const fetchCycle = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/cycles/${id}`);
          if (res.ok) {
            const data = await res.json();
            if (data) {
              data.entries = data.entries || [];
              data.entries.sort((a, b) => a.entryNumber - b.entryNumber);
              setCycle(data);
            } else {
              setCycle(null);
            }
          } else {
            setCycle(null);
          }
        } catch (error) {
          setCycle(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCycle();
    }
  }, [id]);

  const updateCycleStatus = async (status) => {
    const res = await fetch(`/api/cycles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updatedCycle = await res.json();
      if (updatedCycle) {
        updatedCycle.entries.sort((a, b) => a.entryNumber - b.entryNumber);
        setCycle(updatedCycle);
      }
    } else {
      alert(`Failed to ${status.toLowerCase()} cycle.`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-6"></div>
          <p className="text-slate-600 font-semibold text-lg">
            Loading cycle details...
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Please wait while we fetch the data
          </p>
        </div>
      </div>
    );
  }

  if (!cycle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
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
          </div>
          <p className="text-red-600 font-semibold text-lg mb-2">
            Could not load cycle data
          </p>
          <p className="text-slate-500 mb-4">
            The requested cycle may not exist or you don't have permission to
            view it
          </p>
          <button
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const allEntriesComplete =
    cycle.entries.length === 7 &&
    cycle.entries.every((entry) => entry.isCompleted);

  const completedCount = cycle.entries.filter(
    (entry) => entry.isCompleted
  ).length;
  const progressPercentage = (completedCount / 7) * 100;

  // --- NEW LOGIC: Determine if technicians can edit ---
  const canEdit = cycle.status === 'DRAFT' || cycle.status === 'REJECTED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                Cycle Details
              </h1>
              <div className="flex items-center mt-2 text-slate-300">
                <div className="flex items-center mr-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-bold">
                      {cycle.technician?.name?.charAt(0) || 'N'}
                    </span>
                  </div>
                  <span className="font-medium">
                    {cycle.technician?.name || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center">
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
                  <span className="text-sm">
                    {new Date(cycle.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`px-4 py-2 rounded-xl font-bold text-sm shadow-lg ${
                  cycle.status === 'APPROVED'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                    : cycle.status === 'SUBMITTED'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                    : cycle.status === 'REJECTED'
                    ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                    : 'bg-gradient-to-r from-slate-500 to-gray-500 text-white'
                }`}
              >
                {cycle.status}
              </div>
              <button
                onClick={() => router.push('/')}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl border border-slate-600"
              >
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Dashboard
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Card */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              Progress Overview
            </h2>
            <div className="text-sm font-semibold text-slate-600">
              {completedCount} of 7 entries completed
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="text-xs text-slate-500 text-right">
            {Math.round(progressPercentage)}% complete
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">
                Work Entries
              </h2>
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-emerald-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                  <span className="text-xs font-semibold text-emerald-700">
                    Completed
                  </span>
                </div>
                <div className="flex items-center bg-red-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-xs font-semibold text-red-700">
                    Pending
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {cycle.entries.map((entry) => {
                // --- CRITICAL FIX: Determine the correct link based on cycle status ---
                let href = `/entries/${entry.id}`; // Default to edit form
                if (!canEdit && entry.isCompleted) {
                  href = `/entries/${entry.id}/view`; // Go to view page if cycle is submitted/approved
                }

                return (
                  <div
                    key={entry.id}
                    className={`relative group p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 ${
                      entry.isCompleted
                        ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 hover:border-emerald-300'
                        : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200 hover:border-red-300'
                    }`}
                  >
                    <div
                      className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${
                        entry.isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                          : 'bg-gradient-to-r from-red-500 to-rose-500'
                      }`}
                    >
                      {entry.isCompleted ? (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M12 8v4m0 4h.01"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-md ${
                          entry.isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                            : 'bg-gradient-to-r from-slate-400 to-gray-400 text-white'
                        }`}
                      >
                        <span className="font-bold text-lg">
                          {entry.entryNumber}
                        </span>
                      </div>

                      <Link
                        href={href} // Use the dynamically determined href
                        className={`font-semibold mb-2 transition-colors duration-200 ${
                          entry.isCompleted
                            ? 'text-emerald-700 hover:text-emerald-800'
                            : 'text-red-700 hover:text-red-800'
                        }`}
                      >
                        {canEdit
                          ? 'Edit Entry'
                          : entry.isCompleted
                          ? 'View Entry'
                          : 'Fill Entry'}{' '}
                        {entry.entryNumber}
                      </Link>

                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
                          entry.isCompleted
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white'
                            : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                        }`}
                      >
                        {entry.isCompleted ? 'COMPLETED' : 'PENDING'}
                      </span>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons Section */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* ... (Info message is the same) ... */}
                <div className="flex items-center space-x-3 ml-auto">
                  {session?.user?.role === 'TECHNICIAN' &&
                    (cycle.status === 'DRAFT' ||
                      cycle.status === 'REJECTED') && (
                      <button
                        onClick={() => updateCycleStatus('SUBMITTED')}
                        disabled={!allEntriesComplete}
                        className={`px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 transform ${
                          allEntriesComplete
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white hover:shadow-xl hover:scale-105'
                            : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                          </svg>
                          {cycle.status === 'REJECTED'
                            ? 'Resubmit Cycle'
                            : 'Submit Cycle'}
                        </div>
                      </button>
                    )}

                  {session?.user?.role === 'APPROVER' &&
                    cycle.status === 'SUBMITTED' && (
                      <>
                        <button
                          onClick={() => setIsRejecting(true)} // Open the rejection modal
                          className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Reject
                          </div>
                        </button>
                        <button
                          onClick={() => updateCycleStatus('APPROVED')}
                          className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                          <div className="flex items-center">
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Approve Cycle
                          </div>
                        </button>
                      </>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
