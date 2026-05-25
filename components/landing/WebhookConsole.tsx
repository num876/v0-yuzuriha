'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, CheckCircle, Shield, AlertCircle } from 'lucide-react';

interface LogLine {
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  text: string;
}

export function WebhookConsole() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  const mockPayload = {
    ticker: 'BTCUSDT',
    action: 'BUY_STRONG',
    price: 94820.50,
    timeframe: '1h',
    indicator: 'Trend Reversal Signal',
    auth_token: 'yuz_sec_9a8f27c3...8b',
    confidence: 88,
    reasoning: 'Bullish moving average crossover confirmed on 1h indicators',
  };

  const simulationSteps = [
    { text: '📥 Ingesting webhook alert from TradingView edge...', type: 'info', delay: 400 },
    { text: '🛡️ Validating secure auth token: SUCCESS', type: 'success', delay: 350 },
    { text: '🌐 Running Cloudflare Worker security check (no-replay validation): PASSED', type: 'success', delay: 450 },
    { text: '🧠 Dispatching signal payload to Claude LLM risk analyzer...', type: 'info', delay: 600 },
    { text: '🤖 Claude LLM Report: CONFIDENCE 88% | BUY recommendations confirmed.', type: 'success', delay: 900 },
    { text: '📊 Portfolio Risk Check: Volatility-adjusted size calculation completed.', type: 'info', delay: 500 },
    { text: '🚀 Dispatching execution order to OKX exchange endpoints...', type: 'info', delay: 700 },
    { text: '🟢 Order Executed: OKX Execution ID #okx_f_9381a1 | Filled at $94,820.50', type: 'success', delay: 450 },
    { text: '📢 Pushing transaction telemetry notification to Telegram bot...', type: 'info', delay: 350 },
    { text: '💾 Syncing execution record to Foundry Ontology database.', type: 'info', delay: 400 },
    { text: '✅ Pipeline Execution Successful. Total cycle latency: 1.88s', type: 'success', delay: 200 },
  ];

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const runSimulation = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setLogs([]);

    // Actually trigger the backend endpoint to ingest and persist this signal
    try {
      await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair: 'BTC-USDT',
          timeframe: '1h',
          type: 'buy',
          confidence: 88,
          price: 94820.50,
          reasoning: 'Bullish moving average crossover confirmed on 1h indicators',
          recommendation: 'execute',
        }),
      });
    } catch (error) {
      console.error('Failed to trigger real webhook signal:', error);
    }

    let currentStep = 0;
    const addNextLog = () => {
      if (currentStep >= simulationSteps.length) {
        setIsPlaying(false);
        return;
      }

      const step = simulationSteps[currentStep];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

      setLogs((prev) => [
        ...prev,
        { time: timeStr, text: step.text, type: step.type as any },
      ]);

      currentStep++;
      setTimeout(addNextLog, step.delay);
    };

    addNextLog();
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="mx-auto max-w-5xl px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8b5cf6]">Real-Time Ingestion</h2>
          <p className="text-3xl md:text-4xl font-bold text-white font-display">Interactive Webhook Simulator</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Test the pipeline. Simulate a custom TradingView indicator alert and watch how the system ingests, validates, scores, and routes it to the exchange in fractions of a second.
          </p>
        </div>

        {/* Console Container */}
        <div className="grid gap-8 md:grid-cols-5 items-stretch">
          
          {/* Left panel: Trigger payload mockup */}
          <div className="glass-card md:col-span-2 flex flex-col justify-between p-6 border-[#1e1e3a]/50">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Shield className="h-4 w-4 text-[#8b5cf6]" />
                <span>TradingView Webhook Setup</span>
              </div>
              
              <div className="space-y-1.5 text-xs">
                <span className="text-muted-foreground block">Destination Webhook URL</span>
                <div className="font-mono bg-[#111128]/70 border border-[#1e1e3a]/60 px-3 py-2 rounded-lg text-white select-all overflow-x-auto whitespace-nowrap">
                  https://yuzuriha.io/api/signals
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-muted-foreground block">Ingestion Alert Payload (JSON)</span>
                <pre className="font-mono text-[11px] bg-[#111128]/70 border border-[#1e1e3a]/60 p-3.5 rounded-lg text-white overflow-x-auto leading-relaxed" style={{ color: '#a5b4fc' }}>
                  {JSON.stringify(mockPayload, null, 2)}
                </pre>
              </div>
            </div>

            <button
              onClick={runSimulation}
              disabled={isPlaying}
              className="mt-6 w-full btn-glow-green text-white border-0 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {isPlaying ? 'Simulating Routing...' : 'Fire Ingestion Signal'}
            </button>
          </div>

          {/* Right panel: Terminal emulator */}
          <div className="md:col-span-3 flex flex-col bg-[#050512] border border-[#1e1e3a]/60 rounded-xl overflow-hidden shadow-2xl relative">
            
            {/* Terminal Top bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0a0a1c] border-b border-[#1e1e3a]/60">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <Terminal className="h-3.5 w-3.5 text-[#06b6d4]" />
                <span>yuzuriha-pipeline-telemetry</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/30" />
              </div>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2.5 min-h-[300px] max-h-[380px] bg-[#05050f]">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8 space-y-3">
                  <div className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <p className="text-[11px] uppercase tracking-wider animate-pulse">
                    Standing by for indicators alerts...
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 max-w-[240px]">
                    Click "Fire Ingestion Signal" on the left dashboard to trigger the automated telemetry loop.
                  </p>
                </div>
              ) : (
                <>
                  {logs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-start gap-2.5 leading-relaxed text-left animate-fadeInUp"
                      style={{ animationDuration: '0.3s' }}
                    >
                      <span className="text-muted-foreground shrink-0 select-none">[{log.time}]</span>
                      <span 
                        className={
                          log.type === 'success' 
                            ? 'text-[#22c55e]' 
                            : log.type === 'error' 
                            ? 'text-[#ef4444]' 
                            : 'text-[#a5b4fc]'
                        }
                      >
                        {log.text}
                      </span>
                    </div>
                  ))}
                  {isPlaying && (
                    <div className="flex items-center gap-1.5 text-muted-foreground pl-16">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6] animate-bounce stagger-1" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6] animate-bounce stagger-2" />
                      <span className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6] animate-bounce stagger-3" />
                    </div>
                  )}
                  <div ref={consoleEndRef} />
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
