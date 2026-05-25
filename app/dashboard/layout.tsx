'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Premium loading gate to prevent page flickering
  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050510]">
        <div className="relative flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#8b5cf6]/20 border-t-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
          <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase animate-pulse">
            Verifying Credentials...
          </p>
        </div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
