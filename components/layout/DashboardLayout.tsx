'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col">
      {/* Top Navigation Bar */}
      <div className="flex items-center border-b border-border bg-card px-4 py-3 lg:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        {sidebarOpen && (
          <div className="hidden lg:flex lg:w-64 lg:flex-col">
            <Sidebar />
          </div>
        )}

        {/* Mobile Sidebar - Overlay */}
        {sidebarOpen && (
          <div className="absolute inset-0 z-40 flex lg:hidden">
            <Sidebar
              className="w-64"
              isOpen={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <div
              className="flex-1 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
