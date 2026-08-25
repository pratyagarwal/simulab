'use client';

import { Layout } from './components';

export default function Home() {
  return (
    <Layout>
      <div className="py-8 px-4 md:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Welcome to SimuLab
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Engineering Agent Evaluation Environment
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Issues" value="0" />
          <StatCard label="Active Channels" value="0" />
          <StatCard label="Repositories" value="0" />
        </div>

        {/* Welcome Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
            Getting Started
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            SimuLab is a high-fidelity training and evaluation environment for software engineering AI agents.
          </p>
          <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span>View and manage issues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span>Collaborate in chat channels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">✓</span>
              <span>Track repository changes</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}

/**
 * Stat Card Component
 */
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}
