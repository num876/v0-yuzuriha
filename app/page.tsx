import Link from 'next/link';
import { ArrowRight, Zap, TrendingUp, Bell, BookOpen, Cpu, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const features = [
    {
      icon: Zap,
      title: 'Auto execution',
      description: 'Execute trades instantly when strong signals fire from TradingView',
    },
    {
      icon: Cpu,
      title: 'Claude AI',
      description: 'Pre-trade analysis with confidence scoring and trade recommendations',
    },
    {
      icon: BarChart3,
      title: 'Live PNL',
      description: 'Real-time portfolio tracking with performance analytics and charts',
    },
    {
      icon: BookOpen,
      title: 'News sentiment',
      description: 'Asset-specific news feeds with sentiment analysis and heatmaps',
    },
    {
      icon: Bell,
      title: 'Telegram alerts',
      description: 'Instant notifications for trades, signals, and market events',
    },
    {
      icon: TrendingUp,
      title: 'Foundry integration',
      description: 'Persistent signal storage and trade history with ontology support',
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="text-2xl font-bold">Yuzuriha</div>
          <Link href="/dashboard">
            <Button variant="default" size="sm" className="gap-2">
              Launch dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-balance text-5xl font-bold">
              Trading automation powered by AI
            </h1>
            <p className="text-balance text-xl text-muted-foreground">
              Real-time signals from TradingView, multi-exchange support, live portfolio analytics, and Claude AI-powered trade analysis.
            </p>
          </div>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Get started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Pipeline Diagram */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-8">
          <h2 className="text-2xl font-bold">Signal pipeline</h2>
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-8">
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg bg-accent/10 p-3">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium">TradingView</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg bg-accent/10 p-3">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium">Foundry</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg bg-accent/10 p-3">
                <Cpu className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium">Make.com</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg bg-accent/10 p-3">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium">Cloudflare</span>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-lg bg-accent/10 p-3">
                <Bell className="h-6 w-6 text-accent" />
              </div>
              <span className="text-sm font-medium">OKX / Alpaca</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Strong signals from TradingView automatically flow through Foundry, get processed by Make.com, validated by Cloudflare Workers, and execute on your preferred exchange.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-b border-border px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-8">
          <h2 className="text-2xl font-bold">Key features</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-lg border border-border bg-card p-6">
                  <Icon className="mb-4 h-6 w-6 text-accent" />
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          <h2 className="text-3xl font-bold">Ready to automate your trading?</h2>
          <p className="text-balance text-lg text-muted-foreground">
            Configure your API keys, set your confidence threshold, and let Yuzuriha handle the rest.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Launch dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="border-t border-border bg-card px-6 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs text-muted-foreground">
            Disclaimer: Yuzuriha is provided as-is for educational purposes. Automated trading carries risk of loss. Always review your positions and settings before enabling autopilot. Past performance does not guarantee future results. Trade at your own risk.
          </p>
        </div>
      </footer>
    </main>
  );
}
