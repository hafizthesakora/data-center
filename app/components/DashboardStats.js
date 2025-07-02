// File: app/components/DashboardStats.js

'use client';

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${color}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
      </div>
      <div className="flex-shrink-0">{icon}</div>
    </div>
  </div>
);

export default function DashboardStats({ stats }) {
  const { pendingCycles, recentlyApproved, totalHoursToday } = stats;

  const cards = [
    {
      title: 'Cycles Pending Approval',
      value: pendingCycles,
      color: 'border-yellow-400',
      icon: (
        <svg
          className="h-8 w-8 text-yellow-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      title: 'Total Hours Logged Today',
      value: totalHoursToday,
      color: 'border-blue-400',
      icon: (
        <svg
          className="h-8 w-8 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: 'Cycles Approved Today',
      value: recentlyApproved,
      color: 'border-green-400',
      icon: (
        <svg
          className="h-8 w-8 text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Approver Overview
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>
    </div>
  );
}
