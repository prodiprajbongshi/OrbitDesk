'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export default function AppLayout({ children, title, breadcrumbs }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar title={title} breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
