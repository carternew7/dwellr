'use client';

import Link from 'next/link';

export default function DashboardHome() {
  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">🏠 SmartCRM Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard
          title="📞 Call Assistant"
          href="/call"
          description="Start and transcribe calls with built-in AI summarization."
        />
        <DashboardCard
          title="📋 Leads"
          href="/leads"
          description="View and manage leads with CRM tags and AI summaries."
        />
        <DashboardCard
          title="📆 Calendar"
          href="/calendar"
          description="View scheduled events and auto-created follow-ups."
        />
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  href,
  description,
}: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="border rounded-lg p-6 shadow hover:shadow-md hover:bg-blue-50 transition"
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-600">{description}</p>
    </Link>
  );
}
