'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, ArrowRight, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { YuzurihaLogo } from '@/components/layout/YuzurihaLogo';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setErrorMsg(error.message || 'Failed to dispatch reset link.');
      } else {
        setSuccessMsg(
          'A secure password reset link has been dispatched to your email address. Please check your inbox and select the recovery link to set new credentials.'
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-white tracking-tight">Restore Console Access</h2>
          <p className="text-xs text-muted-foreground">Request secure credential recovery options</p>
        </div>

        {/* Card */}
        <div className="glass-card shadow-2xl relative overflow-hidden">
          {successMsg ? (
            <div className="space-y-4 text-center py-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e]/10 text-[#22c55e]">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-white">Reset Link Dispatched</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {successMsg}
              </p>
              <div className="pt-4">
                <Link href="/login">
                  <Button className="btn-glow text-white border-0 px-6 rounded-xl text-xs h-9">
                    Return to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Enter the email address registered with your account. We will send a secure link to reset your credentials.
              </p>

              {errorMsg && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive flex items-start gap-2 leading-normal">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Email input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="name@institution.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 backdrop-blur-sm pl-10 pr-3.5 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none text-white"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full btn-glow text-white border-0 py-2.5 rounded-xl text-sm font-semibold h-11 flex items-center justify-center gap-2">
                {isSubmitting ? 'Requesting Reset...' : 'Request Password Reset'}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>
          )}

          {!successMsg && (
            <div className="mt-6 text-center text-xs">
              <Link href="/login">
                <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-medium">
                  <ArrowLeft className="h-3 w-3" /> Back to Login
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
