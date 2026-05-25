'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Eye, EyeOff, User, Mail, ShieldAlert, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useDashboard } from '@/app/context/DashboardContext';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, signOut, updatePassword } = useAuth();
  const { settings, updateSettings } = useDashboard();
  const router = useRouter();

  const [showApiKeys, setShowApiKeys] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Local settings state cloned from context for editing
  const [localSettings, setLocalSettings] = useState(settings);
  const [showLiveConfirm, setShowLiveConfirm] = useState(false);
  const [pendingLiveVal, setPendingLiveVal] = useState<string | boolean | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const frameworks = ['Al Brooks', 'ICT/Smart Money Concepts', 'Wyckoff Method', 'Elliott Wave'];

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordError('');
    setPasswordSuccess('');
    setIsSubmittingPassword(true);

    try {
      const { error } = await updatePassword(newPassword);
      if (error) {
        setPasswordError(error.message || 'Failed to update password.');
      } else {
        setPasswordSuccess('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleSaveSettings = async (section: string) => {
    await updateSettings(localSettings);
    alert(`${section} settings saved successfully!`);
  };

  const handleEnvironmentChange = (val: string) => {
    if (val === 'live') {
      setPendingLiveVal('live');
      setShowLiveConfirm(true);
    } else {
      setLocalSettings(prev => ({ ...prev, oandaEnvironment: val }));
    }
  };

  const handleLiveTradingToggle = (checked: boolean) => {
    if (checked) {
      setPendingLiveVal(true);
      setShowLiveConfirm(true);
    } else {
      setLocalSettings(prev => ({ ...prev, isLiveTrading: false }));
      updateSettings({ isLiveTrading: false });
    }
  };

  const confirmLiveTrading = () => {
    if (pendingLiveVal === 'live') {
      setLocalSettings(prev => ({ ...prev, oandaEnvironment: 'live' }));
      updateSettings({ oandaEnvironment: 'live' });
    } else if (pendingLiveVal === true) {
      setLocalSettings(prev => ({ ...prev, isLiveTrading: true }));
      updateSettings({ isLiveTrading: true });
    }
    setShowLiveConfirm(false);
    setPendingLiveVal(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Confirmation Modal */}
      {showLiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card-lg max-w-md w-full p-6 border-[#ef4444]/40 bg-[#0d0d1e] shadow-[0_0_50px_rgba(239,68,68,0.25)] space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <AlertTriangle className="h-8 w-8 animate-bounce" />
              <h3 className="text-xl font-bold">Confirm Live Trading Mode</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              WARNING: You are about to enable Live Trading execution. This will connect to real market orderbooks. Real capital will be put at risk. Proceed with extreme caution.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowLiveConfirm(false);
                  setPendingLiveVal(null);
                }}
                className="border-[#1e1e3a] text-white hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmLiveTrading}
                className="bg-red-500 hover:bg-red-600 text-white font-bold"
              >
                Confirm Live Execution
              </Button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold">Settings & Account</h1>
        <p className="text-sm text-muted-foreground">Configure your account details and trading preferences</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#111128]/80 border border-[#1e1e3a]/50 rounded-xl">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* User Profile Info */}
            <div className="glass-card space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-[#1e1e3a]/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#8b5cf6]/10 text-[#8b5cf6]">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Security Credentials</h3>
                  <p className="text-xs text-muted-foreground">Authorized session profile</p>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block">Email Address</span>
                  <div className="flex items-center gap-2 font-mono bg-[#111128]/50 px-3 py-2 rounded-lg border border-[#1e1e3a]/30">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-white">{user?.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block">User Identifier (UID)</span>
                  <div className="font-mono text-xs text-muted-foreground bg-[#111128]/30 px-3 py-2 rounded-lg border border-[#1e1e3a]/20 select-all truncate">
                    {user?.id || 'N/A'}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block">Authentication Provider</span>
                  <div className="font-mono text-xs text-[#06b6d4] bg-[#06b6d4]/5 px-3 py-2 rounded-lg border border-[#06b6d4]/10 capitalize">
                    {user?.app_metadata?.provider || 'supabase'} auth
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block">Last Sign In</span>
                  <div className="font-mono text-xs text-muted-foreground bg-[#111128]/30 px-3 py-2 rounded-lg border border-[#1e1e3a]/20">
                    {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#1e1e3a]/50">
                <Button
                  onClick={async () => {
                    await signOut();
                    window.location.href = '/';
                  }}
                  className="w-full bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] text-white border-0 transition-all duration-300 rounded-xl h-11 flex items-center justify-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out of Console
                </Button>
              </div>
            </div>

            {/* Change Password Info */}
            <div className="glass-card space-y-6">
              <div className="flex items-center gap-3 pb-2 border-b border-[#1e1e3a]/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#06b6d4]/10 text-[#06b6d4]">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Modify Credentials</h3>
                  <p className="text-xs text-muted-foreground">Establish a new account security key</p>
                </div>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {passwordError && (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive flex items-start gap-2">
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="rounded-lg border border-success/20 bg-[#22c55e]/5 p-3 text-xs text-success flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 shrink-0 text-[#22c55e]" />
                    <span className="text-[#22c55e]">{passwordSuccess}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted-foreground">New Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isSubmittingPassword}
                    className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-muted-foreground">Confirm New Password</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmittingPassword}
                    className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="w-full btn-glow text-white border-0 py-2.5 rounded-xl text-sm font-semibold h-11 flex items-center justify-center gap-2"
                >
                  {isSubmittingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </div>
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="space-y-6 mt-6">
          <div className="glass-card space-y-6">
            <h2 className="font-semibold">Exchange API connections</h2>

            {/* OKX */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">OKX API key</label>
              <div className="flex gap-2">
                <Input
                  type={showApiKeys ? 'text' : 'password'}
                  placeholder="pk_test_..."
                  value={localSettings.okxApiKey}
                  onChange={(e) => setLocalSettings({ ...localSettings, okxApiKey: e.target.value })}
                  className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="border-[#1e1e3a] hover:bg-[#8b5cf6]/10 text-white"
                >
                  {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Demo mode - set exchange to Paper Trading</p>
            </div>

            {/* Alpaca */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Alpaca API key</label>
              <div className="flex gap-2">
                <Input
                  type={showApiKeys ? 'text' : 'password'}
                  placeholder="pk_test_..."
                  value={localSettings.alpacaApiKey}
                  onChange={(e) => setLocalSettings({ ...localSettings, alpacaApiKey: e.target.value })}
                  className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="border-[#1e1e3a] hover:bg-[#8b5cf6]/10 text-white"
                >
                  {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* MEXC */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">MEXC API key (Make.com flow integration)</label>
              <div className="flex gap-2">
                <Input
                  type={showApiKeys ? 'text' : 'password'}
                  placeholder="mexc_key_..."
                  value={localSettings.mexcApiKey || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, mexcApiKey: e.target.value })}
                  className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="border-[#1e1e3a] hover:bg-[#8b5cf6]/10 text-white"
                >
                  {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">MEXC Secret key</label>
              <div className="flex gap-2">
                <Input
                  type={showApiKeys ? 'text' : 'password'}
                  placeholder="mexc_secret_..."
                  value={localSettings.mexcSecretKey || ''}
                  onChange={(e) => setLocalSettings({ ...localSettings, mexcSecretKey: e.target.value })}
                  className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="border-[#1e1e3a] hover:bg-[#8b5cf6]/10 text-white"
                >
                  {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* OANDA */}
            <div className="space-y-4 pt-4 border-t border-[#1e1e3a]/50">
              <h3 className="font-medium text-sm">OANDA (Commodities & Forex)</h3>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">API token</label>
                <div className="flex gap-2">
                  <Input
                    type={showApiKeys ? 'text' : 'password'}
                    placeholder="Bearer token_..."
                    value={localSettings.oandaApiKey}
                    onChange={(e) => setLocalSettings({ ...localSettings, oandaApiKey: e.target.value })}
                    className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    className="border-[#1e1e3a] hover:bg-[#8b5cf6]/10 text-white"
                  >
                    {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Account ID</label>
                <Input
                  placeholder="account_..."
                  value={localSettings.oandaAccountId}
                  onChange={(e) => setLocalSettings({ ...localSettings, oandaAccountId: e.target.value })}
                  className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Environment</label>
                <select
                  value={localSettings.oandaEnvironment}
                  onChange={(e) => handleEnvironmentChange(e.target.value)}
                  className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2 text-sm focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 outline-none text-white"
                >
                  <option value="practice">Practice (Sandbox)</option>
                  <option value="live">Live Trading</option>
                </select>
                <p className="text-xs text-muted-foreground">Practice mode recommended for testing</p>
              </div>
            </div>

            {/* Telegram */}
            <div className="space-y-4 pt-4 border-t border-[#1e1e3a]/50">
              <h3 className="font-medium text-sm">Telegram Bot Telemetry</h3>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Telegram Bot Token</label>
                <div className="flex gap-2">
                  <Input
                    type={showApiKeys ? 'text' : 'password'}
                    placeholder="bot_***"
                    value={localSettings.telegramToken}
                    onChange={(e) => setLocalSettings({ ...localSettings, telegramToken: e.target.value })}
                    className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                    className="border-[#1e1e3a] hover:bg-[#8b5cf6]/10 text-white"
                  >
                    {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Telegram Chat ID</label>
                <Input
                  placeholder="chat_..."
                  value={localSettings.telegramChatId}
                  onChange={(e) => setLocalSettings({ ...localSettings, telegramChatId: e.target.value })}
                  className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none text-white"
                />
              </div>
            </div>

            <Button 
              onClick={() => handleSaveSettings('API Keys')}
              className="w-full btn-glow text-white border-0"
            >
              Save API keys
            </Button>
          </div>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-6 mt-6">
          <div className="glass-card space-y-6">
            <h2 className="font-semibold">Trading configuration</h2>

            {/* Live Trading Switch */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1e1e3a]/50">
              <div>
                <label className="text-sm font-semibold text-white block">Execution Mode</label>
                <span className="text-xs text-muted-foreground">Toggle between Paper trading and Live executions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={localSettings.isLiveTrading ? 'text-red-500 font-bold text-xs' : 'text-[#06b6d4] font-bold text-xs'}>
                  {localSettings.isLiveTrading ? 'LIVE EXECUTION' : 'PAPER TRADING'}
                </span>
                <input 
                  type="checkbox"
                  checked={localSettings.isLiveTrading}
                  onChange={(e) => handleLiveTradingToggle(e.target.checked)}
                  className="w-10 h-6 bg-[#111128]/80 border border-[#1e1e3a] rounded-full appearance-none checked:bg-red-500 cursor-pointer relative before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-0.5 before:left-0.5 checked:before:translate-x-4 before:transition-transform"
                />
              </div>
            </div>

            {/* Autopilot Threshold */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Autopilot confidence threshold</label>
                <span className="font-mono text-lg font-bold text-accent">{localSettings.autopilotThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={localSettings.autopilotThreshold}
                onChange={(e) => setLocalSettings({ ...localSettings, autopilotThreshold: parseInt(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Only execute trades when Claude confidence is at or above this threshold
              </p>
            </div>

            {/* Framework */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">Trading framework</label>
              <select
                value={localSettings.framework}
                onChange={(e) => setLocalSettings({ ...localSettings, framework: e.target.value })}
                className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2 text-sm focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 outline-none text-white"
              >
                {frameworks.map((fw) => (
                  <option key={fw} value={fw}>
                    {fw}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Framework used for Claude analysis and signal filtering (adjusts for crypto/stock/commodity)
              </p>
            </div>

            <Button 
              onClick={() => handleSaveSettings('Trading')}
              className="w-full btn-glow text-white border-0"
            >
              Save trading settings
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <div className="glass-card space-y-4">
            <h2 className="font-semibold">Notification preferences</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="telegram-trades" defaultChecked className="w-4 h-4" />
                <label htmlFor="telegram-trades" className="text-sm">
                  Telegram notifications for trade executions
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="email-summary" defaultChecked className="w-4 h-4" />
                <label htmlFor="email-summary" className="text-sm">
                  Daily 8am performance summary
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="whale-alerts" className="w-4 h-4" />
                <label htmlFor="whale-alerts" className="text-sm">
                  Whale movement alerts
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="commodity-alerts" defaultChecked className="w-4 h-4" />
                <label htmlFor="commodity-alerts" className="text-sm">
                  Commodity price alerts (DXY, gold, oil)
                </label>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <label className="block text-sm font-medium">Email address</label>
              <Input
                type="email"
                placeholder="user@example.com"
                value={localSettings.notificationEmail}
                onChange={(e) => setLocalSettings({ ...localSettings, notificationEmail: e.target.value })}
                className="w-full rounded-xl border border-[#1e1e3a]/50 bg-[#111128]/80 px-3 py-2.5 text-sm transition-all duration-200 focus:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/20 hover:border-[#8b5cf6]/30 outline-none"
              />
            </div>

            <Button 
              onClick={() => handleSaveSettings('Notification')}
              className="w-full btn-glow text-white border-0"
            >
              Save notification settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
