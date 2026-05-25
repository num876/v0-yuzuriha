'use client';

import Link from 'next/link';
import { ArrowRight, Zap, TrendingUp, Bell, BookOpen, Cpu, BarChart3, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollAnimation } from '@/lib/hooks/useScrollAnimation';
import { useParticleEffect } from '@/lib/hooks/useParticleEffect';
import { HeroBackground } from '@/components/landing/HeroBackground';
import { AnimatedCounter } from '@/components/landing/AnimatedCounter';
import { YuzurihaLogo } from '@/components/layout/YuzurihaLogo';
import { EcosystemMarquee } from '@/components/landing/EcosystemMarquee';
import { FAQAccordion } from '@/components/landing/FAQAccordion';

export default function LandingPage() {
  const { containerRef, createParticles } = useParticleEffect();
  
  // Viewport scroll trigger hooks
  const heroRef = useScrollAnimation();
  const ecosystemRef = useScrollAnimation();
  const pipelineRef = useScrollAnimation();
  const featuresRef = useScrollAnimation();
  const securityRef = useScrollAnimation();
  const faqRef = useScrollAnimation();
  const ctaRef = useScrollAnimation();

  const features = [
    {
      icon: Zap,
      title: 'Ultra-Low Latency Execution',
      description: 'Instantly route automated orders directly from webhook triggers with fractional-second latency.',
    },
    {
      icon: Cpu,
      title: 'LLM-Orchestrated Risk Analysis',
      description: 'Evaluate market conditions on-the-fly using advanced cognitive reasoning models with real-time confidence grading.',
    },
    {
      icon: BarChart3,
      title: 'Real-Time Portfolio Intelligence',
      description: 'Track positions across asset classes with responsive analytics, Sharpe calculations, and risk tracking.',
    },
    {
      icon: BookOpen,
      title: 'Alternative Data Sentiment Feed',
      description: 'Aggregate market intelligence and alternative news sources analyzed for NLP sentiment scoring.',
    },
    {
      icon: Bell,
      title: 'Instant Alert Distribution',
      description: 'Sync transaction notifications, signal status updates, and trade reports directly to secure Telegram channels.',
    },
    {
      icon: TrendingUp,
      title: 'Foundry Ontology Sync',
      description: 'Log structured telemetry, trade records, and execution telemetry into persistent cloud ontologies.',
    },
  ];

  const pipelineSteps = [
    { 
      number: '01', 
      icon: Zap, 
      label: 'TradingView', 
      desc: 'webhook triggers are generated in real-time from custom strategy indicators.' 
    },
    { 
      number: '02', 
      icon: BarChart3, 
      label: 'Foundry Ontology', 
      desc: 'payload is ingested, parsed, and logged persistently into global ontologies.' 
    },
    { 
      number: '03', 
      icon: Cpu, 
      label: 'Make.com', 
      desc: 'orchestrates the signal logic, checking parameters and validation policies.' 
    },
    { 
      number: '04', 
      icon: TrendingUp, 
      label: 'Cloudflare Edge', 
      desc: 'low-latency routing and secure API signature validation at closest edge nodes.' 
    },
    { 
      number: '05', 
      icon: Bell, 
      label: 'Exchanges', 
      desc: 'instant fills are executed via OKX (crypto) or Alpaca (stocks) API keys.' 
    },
  ];

  return (
    <main className="min-h-screen bg-transparent text-foreground relative z-10">
      {/* Fixed Full-page Trading Background Animation */}
      <HeroBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/20 px-6 py-4" style={{ background: 'rgba(5, 5, 16, 0.95)' }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <YuzurihaLogo iconSize="h-6 w-6" textSize="text-xl" />
          <Link href="/dashboard">
            <Button className="gap-2 btn-glow rounded-full px-6 text-white border-0">
              Launch platform
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        <div className="mx-auto max-w-5xl relative z-10" ref={heroRef as any}>
          <div className="space-y-6 max-w-3xl reveal-inview">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-4 py-1.5 text-sm text-[#8b5cf6] backdrop-blur-sm">
              <Zap className="h-3.5 w-3.5" />
              Next-Generation Autonomous Trading
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight font-[family-name:var(--font-display)]">
              Autonomous execution engines{' '}
              <span className="shimmer-text">orchestrated by intelligence</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              Execute low-latency strategies directly from custom indicators. Orchestrated with real-time exchange integrations, live portfolio analytics, and Claude-powered quantitative confidence models.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4 reveal-inview" style={{ transitionDelay: '150ms' }}>
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 btn-glow-green rounded-full px-8 text-lg h-14 text-white border-0" onClick={(e) => createParticles(e as any)}>
                Get started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg reveal-inview" style={{ transitionDelay: '300ms' }}>
            <div>
              <AnimatedCounter end={156} suffix="+" className="text-3xl font-bold gradient-text font-[family-name:var(--font-display)]" />
              <div className="text-sm text-muted-foreground mt-1">Total Signals Routed</div>
            </div>
            <div>
              <AnimatedCounter end={68} suffix="%" className="text-3xl font-bold gradient-text-green font-[family-name:var(--font-display)]" />
              <div className="text-sm text-muted-foreground mt-1">Mean Confidence Win Rate</div>
            </div>
            <div>
              <AnimatedCounter end={24} suffix="/7" className="text-3xl font-bold gradient-text font-[family-name:var(--font-display)]" />
              <div className="text-sm text-muted-foreground mt-1">System Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Trust Marquee */}
      <div ref={ecosystemRef as any}>
        <EcosystemMarquee />
      </div>

      {/* Pipeline Diagram */}
      <section ref={pipelineRef as any} className="px-6 py-24 relative border-b border-[#1e1e3a]/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="mx-auto max-w-6xl space-y-12 relative z-10">
          <div className="text-center space-y-3 reveal-inview">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8b5cf6]">Real-Time Processing Flow</h2>
            <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] text-white">Autonomous Routing Pipeline</h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              Follow the journey of a trading signal from indicator validation to direct execution in milliseconds.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 relative reveal-inview" style={{ transitionDelay: '150ms' }}>
            {pipelineSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.label} className="relative flex flex-col items-center text-center group">
                  {/* Visual connector line between steps on desktop/large screens */}
                  {idx < pipelineSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[70%] w-[60%] h-[2px] bg-gradient-to-r from-[#8b5cf6]/40 to-transparent z-0 pointer-events-none" />
                  )}
                  
                  {/* Step Node Circle */}
                  <div className="relative z-10 mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0c0c1d] border border-[#1e1e3a] transition-all duration-300 group-hover:border-[#8b5cf6] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]">
                    {/* Step Number Badge */}
                    <span className="absolute -top-2.5 -left-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#111128] border border-[#1e1e3a] text-[10px] font-bold text-[#8b5cf6] group-hover:bg-[#8b5cf6] group-hover:text-white group-hover:border-transparent transition-all duration-200">
                      {step.number}
                    </span>
                    <Icon className="h-8 w-8 text-[#8b5cf6] transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {/* Title & Description */}
                  <h3 className="relative z-10 font-bold text-white text-base mb-2 tracking-tight group-hover:text-[#8b5cf6] transition-colors duration-200">{step.label}</h3>
                  <p className="relative z-10 text-xs text-muted-foreground leading-relaxed px-3">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Features Grid */}
      <section ref={featuresRef as any} className="px-6 py-24 relative border-t border-[#1e1e3a]/20">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="text-center space-y-3 reveal-inview">
            <h2 className="text-3xl font-bold font-[family-name:var(--font-display)] text-white">Core Capabilities</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-card card-hover-lift glow-border group reveal-inview"
                  style={{ transitionDelay: `${idx * 80}ms` }}
                >
                  <div className="mb-4 inline-flex rounded-lg p-2.5" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.15)' }}>
                    <Icon className="h-5 w-5" style={{ color: '#8b5cf6' }} />
                  </div>
                  <h3 className="mb-2 font-semibold text-lg text-white">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Architecture Grid */}
      <section ref={securityRef as any} className="px-6 py-24 relative border-t border-[#1e1e3a]/20">
        <div className="mx-auto max-w-5xl space-y-12 relative z-10">
          <div className="text-center space-y-3 reveal-inview">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8b5cf6]">Cryptographic Safety</h2>
            <h2 className="text-3xl font-bold font-display text-white">Institutional Security Architecture</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              We enforce a zero-trust, non-custodial risk containment architecture designed to secure your exchange connections and isolate trading execution environments.
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-12 items-stretch">
            {/* Left Vault Panel */}
            <div className="md:col-span-5 glass-card-lg flex flex-col justify-between border-[#8b5cf6]/20 bg-[#0c0c1d]/90 relative overflow-hidden group reveal-inview" style={{ transitionDelay: '100ms' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#10b981]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-[#10b981]/10 px-3 py-1 text-xs text-[#10b981]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
                    SYSTEM SECURE
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">NODE: YUZ-SEC-01</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white font-display">Zero-Trust Connection Enclave</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Exchange integration endpoints are cryptographically isolated and hardware-secured. All execution routines operate under read-and-trade permissions with absolute isolation from capital withdrawals.
                  </p>
                </div>
                
                <div className="space-y-2 border-t border-[#1e1e3a]/60 pt-4 font-mono text-[10px] text-muted-foreground">
                  <div className="flex justify-between">
                    <span>CONNECTION STATUS</span>
                    <span className="text-white">SECURED (AES-256-GCM)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WITHDRAWAL ACCESS</span>
                    <span className="text-red-500 font-semibold">INHERENTLY DISABLED</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IP WHITELISTING</span>
                    <span className="text-[#22c55e] font-semibold">ENFORCED</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AUDIT LOGGING</span>
                    <span className="text-white">FOUNDRY ONTOLOGY SYNC</span>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#8b5cf6]/10 flex items-center justify-center border border-[#8b5cf6]/20 text-[#8b5cf6] font-bold text-lg">
                  🛡️
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-mono">NON-CUSTODIAL</div>
                  <div className="text-[10px] text-muted-foreground">100% Capital Control</div>
                </div>
              </div>
            </div>
            
            {/* Right List Items */}
            <div className="md:col-span-7 flex flex-col justify-center gap-4 reveal-inview" style={{ transitionDelay: '200ms' }}>
              
              <div className="flex gap-4 p-4 rounded-xl border border-[#1e1e3a]/40 bg-[#0c0c1d]/50 hover:bg-[#0c0c1d]/80 hover:border-[#8b5cf6]/20 transition-all duration-300 group">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/15 flex items-center justify-center text-lg transition-transform group-hover:scale-105">
                  🔒
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-white text-base">Secure Connection Enclave</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    All connection credentials are encrypted using industry-standard AES-256 at rest, with decryption strictly isolated to sandboxed runtime execution environments.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl border border-[#1e1e3a]/40 bg-[#0c0c1d]/50 hover:bg-[#0c0c1d]/80 hover:border-[#06b6d4]/20 transition-all duration-300 group">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-[#06b6d4]/10 border border-[#06b6d4]/15 flex items-center justify-center text-lg transition-transform group-hover:scale-105">
                  🛡️
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-white text-base">Non-Custodial Execution</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Yuzuriha operates under zero-custody constraints. The platform is restricted to execution and read-only telemetry, ensuring you maintain absolute control over your funds at all times.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-4 rounded-xl border border-[#1e1e3a]/40 bg-[#0c0c1d]/50 hover:bg-[#0c0c1d]/80 hover:border-[#10b981]/20 transition-all duration-300 group">
                <div className="h-10 w-10 shrink-0 rounded-lg bg-[#10b981]/10 border border-[#10b981]/15 flex items-center justify-center text-lg transition-transform group-hover:scale-105">
                  ⚡
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-white text-base">Edge Validation Shield</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    All incoming execution telemetry is sanitized at the network edge, filtering out unauthorized calls and preventing replay attacks before reaching the core database.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <div ref={faqRef as any}>
        <FAQAccordion />
      </div>

      {/* CTA Section */}
      <section ref={ctaRef as any} className="px-6 py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full blur-[120px] opacity-20" style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }} />
        </div>
        <div className="neon-line mb-16" />
        <div className="mx-auto max-w-4xl space-y-8 text-center relative z-10 reveal-inview">
          <h2 className="text-4xl font-bold font-[family-name:var(--font-display)] text-white">Deploy Your Autonomous Trading Strategies</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Establish exchange API bindings, configure risk tolerance matrices, and activate the autonomous autopilot execution engine.
          </p>
          <div className="pt-4">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2 btn-glow rounded-full px-10 text-lg h-14 text-white border-0" onClick={(e) => createParticles(e as any)}>
                Launch platform
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="border-t border-border/20 px-6 py-8" style={{ background: '#050510' }}>
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs text-muted-foreground">
            Disclaimer: Yuzuriha is provided as-is for educational purposes. Automated trading carries risk of loss. Always review your positions and settings before enabling autopilot. Past performance does not guarantee future results. Trade at your own risk.
          </p>
        </div>
      </footer>

      {/* Particle container */}
      <div ref={containerRef} className="fixed inset-0 pointer-events-none" />
    </main>
  );
}
