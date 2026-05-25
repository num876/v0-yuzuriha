'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, Eye, EyeOff, AlertTriangle, CheckCircle } from 'lucide-react';
import { YuzurihaLogo } from '@/components/layout/YuzurihaLogo';
import { supabase } from '@/lib/supabaseClient';

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Validate active recovery session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setErrorMsg('Invalid or expired password recovery session. Please request a new link.');
        }
      } catch (err) {
        setErrorMsg('Error checking recovery session.');
      } finally {
        setSessionLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setErrorMsg(error.message || 'Failed to update password.');
      } else {
        setSuccessMsg('Your account credentials have been successfully updated.');
        // Sign out user to clear session state before sending to login
        await supabase.auth.signOut();
        setTimeout(() => {
          router.replace('/login?reset=success');
        }, 2000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#050510]">
        <div className="relative flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#8b5cf6]/20 border-t-[#8b5cf6] shadow-[0_0_15px_rgba(139,92,246,0.3)]" />
          <p className="text-xs text-muted-foreground font-mono tracking-widest uppercase animate-pulse">
            Verifying Recovery Session...
          </p>
        </div>
      </div>
    );
  }

  // If session is missing and they loaded manually
  const isInvalidSession = errorMsg.includes('recovery session');

  return (
    <main className="min-h-screen bg-[#050510] text-foreground relative flex items-center justify-center p-6 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[120px]" style={{ background: '#8b5cf6' }} />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px]" style={{ background: '#06b6d4' }} />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Title */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link href="/">
            <YuzurihaLogo iconSize="h-8 w-8" textSize="text-3xl" className="cursor-pointer justify-center" />
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Configure New Password</h2>
          <p className="text-xs text-muted-foreground">Restore secure authentication parameters</p>
        </div>

        {/* Card */}
        <div className="glass-card shadow-2xl relative overflow-hidden">
          {successMsg ? (
            <div className="space-y-4 text-center py-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e]/10 text-[#22c55e]">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Password Updated</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {successMsg} Redirecting to login console...
              </p>
            </div>
          ) : isInvalidSession ? (
            <div className="space-y-4 text-center py-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Session Invalid</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {errorMsg}
              </p>
              <div className="pt-4">
                <Link href="/forgot-password">
                  <Button className="btn-glow text-white border-0 px-6 rounded-xl text-xs h-9">
                    Request New Link
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive flex items-start gap-2 leading-normal">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Password input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 backdrop-blur-sm pl-10 pr-10 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 backdrop-blur-sm pl-10 pr-3.5 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none text-white"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full btn-glow text-white border-0 py-2.5 rounded-xl text-sm font-semibold h-11 flex items-center justify-center gap-2">
                {isSubmitting ? 'Updating...' : 'Update Password'}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
