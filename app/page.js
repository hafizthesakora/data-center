// File: app/page.js

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import TimeClock from './components/TimeClock'; // Assuming TimeClock is in app/components/

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [cycles, setCycles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      const fetchCycles = async () => {
        try {
          const res = await fetch('/api/cycles');
          if (res.ok) {
            const data = await res.json();
            setCycles(data);
          } else {
            console.error('Failed to fetch cycles');
          }
        } catch (error) {
          console.error('Error fetching cycles:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCycles();
    }
  }, [status, router]);

  const createCycle = async () => {
    // Check if there's an existing 'DRAFT' cycle for this user
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
      // Add the new cycle to the top of the list and navigate to it
      setCycles((prevCycles) => [newCycle, ...prevCycles]);
      router.push(`/cycles/${newCycle.id}`);
    } else {
      alert('Failed to create cycle.');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Dashboard...
      </div>
    );
  }

  const filteredCycles = cycles.filter((cycle) =>
    cycle.technician.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome, {session?.user?.name}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 self-start sm:self-center"
          >
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <main className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h2 className="text-xl font-semibold text-gray-800">Cycles</h2>
                {session?.user?.role === 'TECHNICIAN' && (
                  <button
                    onClick={createCycle}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 w-full sm:w-auto"
                  >
                    Create New Cycle
                  </button>
                )}
              </div>
              <input
                type="text"
                placeholder="Search by technician name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border rounded-md mb-4"
              />
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Technician
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Submitted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCycles.length > 0 ? (
                      filteredCycles.map((cycle) => (
                        <tr key={cycle.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {cycle.technician.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(cycle.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                cycle.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-800'
                                  : cycle.status === 'SUBMITTED'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {cycle.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cycle.submittedAt
                              ? new Date(cycle.submittedAt).toLocaleDateString()
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Link
                              href={`/cycles/${cycle.id}`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="text-center py-10 text-gray-500"
                        >
                          No cycles found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </main>

          <aside className="lg:col-span-1">
            {session?.user?.role === 'TECHNICIAN' && <TimeClock />}
          </aside>
        </div>
      </div>
    </div>
  );
}
