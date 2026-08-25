'use client';

/**
 * Main Layout Component
 * Provides the basic application shell with navigation and content area
 */

import React, { ReactNode } from 'react';

export interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout component
 * Contains main application structure with sidebar/header and content area
 */
export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-zinc-200 md:dark:border-zinc-800 md:bg-zinc-50 md:dark:bg-zinc-900">
        <div className="flex items-center justify-center h-16 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
            SimuLab
          </h1>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          <NavLink href="/issues" label="Issues" />
          <NavLink href="/channels" label="Chat" />
          <NavLink href="/repositories" label="Repositories" />
          <NavLink href="/teams" label="Teams" />
        </nav>

        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
          <UserProfile />
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 md:hidden h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center px-4 z-40">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
          SimuLab
        </h1>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

/**
 * Navigation Link Component
 */
interface NavLinkProps {
  href: string;
  label: string;
}

function NavLink({ href, label }: NavLinkProps) {
  return (
    <a
      href={href}
      className="block px-3 py-2 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
    >
      {label}
    </a>
  );
}

/**
 * User Profile Component
 */
function UserProfile() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
        <span className="text-white text-xs font-bold">U</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
          User
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
          user@example.com
        </p>
      </div>
    </div>
  );
}

export default Layout;
