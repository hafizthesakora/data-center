'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Changed from 'next/router'

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [cycles, setCycles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      const fetchCycles = async () => {
        const res = await fetch('/api/cycles');
        const data = await res.json();
        setCycles(data);
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
      setCycles((prevCycles) => [newCycle, ...prevCycles]);
      router.push(`/cycles/${newCycle.id}`);
    } else {
      alert('Failed to create cycle.');
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  const filteredCycles = cycles.filter((cycle) =>
    cycle.technician.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session?.user?.name}</p>
      <button onClick={() => signOut()}>Sign out</button>
      {session?.user?.role === 'TECHNICIAN' && (
        <button onClick={createCycle}>Create New Cycle</button>
      )}
      <table>
        <thead>
          <tr>
            <th>Technician</th>
            <th>Date Created</th>
            <th>Status</th>
            <th>Date Submitted</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cycles.map((cycle) => (
            <tr key={cycle.id}>
              <td>{cycle.technician.name}</td>
              <td>{new Date(cycle.createdAt).toLocaleDateString()}</td>
              <td>{cycle.status}</td>
              <td>
                {cycle.submittedAt
                  ? new Date(cycle.submittedAt).toLocaleDateString()
                  : 'N/A'}
              </td>
              <td>
                <Link href={`/cycles/${cycle.id}`}>View</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
