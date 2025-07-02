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
    return <div className="text-center p-10">Loading cycle details...</div>;
  }

  if (!cycle) {
    return (
      <div className="text-center p-10 text-red-500">
        Could not load cycle data.
      </div>
    );
  }

  // --- CRITICAL FIX: Correctly check if all 7 entries are complete ---
  const allEntriesComplete =
    cycle.entries.length === 7 &&
    cycle.entries.every((entry) => entry.isCompleted);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Cycle Details
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Created by {cycle.technician?.name || 'N/A'} on{' '}
                {new Date(cycle.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  cycle.status === 'APPROVED'
                    ? 'bg-green-100 text-green-800'
                    : cycle.status === 'SUBMITTED'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {cycle.status}
              </span>
              <button
                onClick={() => router.push('/')}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Entries
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cycle.entries.map((entry) => (
                <li
                  key={entry.id}
                  className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  {/* --- CRITICAL FIX: Conditional Linking --- */}
                  <Link
                    href={
                      entry.isCompleted
                        ? `/entries/${entry.id}/view`
                        : `/entries/${entry.id}`
                    }
                    className="font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Entry {entry.entryNumber}
                  </Link>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      entry.isCompleted
                        ? 'bg-green-200 text-green-800'
                        : 'bg-red-200 text-red-800'
                    }`}
                  >
                    {entry.isCompleted ? 'COMPLETED' : 'PENDING'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t flex justify-end space-x-3">
            {session?.user?.role === 'TECHNICIAN' &&
              cycle.status === 'DRAFT' && (
                <button
                  onClick={() => updateCycleStatus('SUBMITTED')}
                  disabled={!allEntriesComplete}
                  className="px-6 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Submit Cycle
                </button>
              )}
            {session?.user?.role === 'APPROVER' &&
              cycle.status === 'SUBMITTED' && (
                <button
                  onClick={() => updateCycleStatus('APPROVED')}
                  className="px-6 py-2 rounded-md font-semibold text-white bg-green-600 hover:bg-green-700"
                >
                  Approve Cycle
                </button>
              )}
          </div>
          {!allEntriesComplete &&
            cycle.status === 'DRAFT' &&
            session?.user?.role === 'TECHNICIAN' && (
              <p className="text-right text-sm text-red-600 mt-2">
                All 7 entries must be completed before you can submit the cycle.
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
