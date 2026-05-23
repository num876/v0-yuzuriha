'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [settings, setSettings] = useState({
    autopilotThreshold: 70,
    okxApiKey: 'pk_test_***',
    alpacaApiKey: 'pk_test_***',
    oandaApiKey: 'Bearer token_***',
    oandaAccountId: 'account_***',
    oandaEnvironment: 'practice',
    telegramToken: 'bot_***',
    framework: 'Al Brooks',
    notificationEmail: 'user@example.com',
  });

  const frameworks = ['Al Brooks', 'ICT Smart Money', 'Wyckoff', 'Elliott Wave'];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your trading preferences</p>
      </div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="api" className="space-y-6 mt-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-6">
            <h2 className="font-semibold">Exchange API connections</h2>

            {/* OKX */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">OKX API key</label>
              <div className="flex gap-2">
                <Input
                  type={showApiKeys ? 'text' : 'password'}
                  placeholder="pk_test_..."
                  value={settings.okxApiKey}
                  onChange={(e) => setSettings({ ...settings, okxApiKey: e.target.value })}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeys(!showApiKeys)}
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
                  value={settings.alpacaApiKey}
                  onChange={(e) => setSettings({ ...settings, alpacaApiKey: e.target.value })}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                >
                  {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* OANDA */}
            <div className="space-y-4 pt-4 border-t border-border">
              <h3 className="font-medium text-sm">OANDA (Commodities & Forex)</h3>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">API token</label>
                <div className="flex gap-2">
                  <Input
                    type={showApiKeys ? 'text' : 'password'}
                    placeholder="Bearer token_..."
                    value={settings.oandaApiKey}
                    onChange={(e) => setSettings({ ...settings, oandaApiKey: e.target.value })}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowApiKeys(!showApiKeys)}
                  >
                    {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Account ID</label>
                <Input
                  placeholder="account_..."
                  value={settings.oandaAccountId}
                  onChange={(e) => setSettings({ ...settings, oandaAccountId: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Environment</label>
                <select
                  value={settings.oandaEnvironment}
                  onChange={(e) => setSettings({ ...settings, oandaEnvironment: e.target.value })}
                  className="w-full rounded-md border border-border bg-card px-3 py-2"
                >
                  <option value="practice">Practice (Sandbox)</option>
                  <option value="live">Live Trading</option>
                </select>
                <p className="text-xs text-muted-foreground">Practice mode recommended for testing</p>
              </div>
            </div>

            {/* Telegram */}
            <div className="space-y-2 pt-4 border-t border-border">
              <label className="block text-sm font-medium">Telegram bot token</label>
              <div className="flex gap-2">
                <Input
                  type={showApiKeys ? 'text' : 'password'}
                  placeholder="bot_***"
                  value={settings.telegramToken}
                  onChange={(e) => setSettings({ ...settings, telegramToken: e.target.value })}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKeys(!showApiKeys)}
                >
                  {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button className="w-full">Save API keys</Button>
          </div>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-6 mt-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-6">
            <h2 className="font-semibold">Trading configuration</h2>

            {/* Autopilot Threshold */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Autopilot confidence threshold</label>
                <span className="font-mono text-lg font-bold text-accent">{settings.autopilotThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={settings.autopilotThreshold}
                onChange={(e) => setSettings({ ...settings, autopilotThreshold: parseInt(e.target.value) })}
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
                value={settings.framework}
                onChange={(e) => setSettings({ ...settings, framework: e.target.value })}
                className="w-full rounded-md border border-border bg-card px-3 py-2"
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

            <Button className="w-full">Save trading settings</Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <div className="rounded-lg border border-border bg-card p-6 space-y-4">
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
                value={settings.notificationEmail}
                onChange={(e) => setSettings({ ...settings, notificationEmail: e.target.value })}
              />
            </div>

            <Button className="w-full">Save notification settings</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
