'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How is the security of my exchange API credentials guaranteed?',
    answer: 'API credentials are encrypted at rest using AES-256 encryption. Keys are decrypted only inside secure runtime memory environments during signal execution and are never logged or exposed in plain text. For safety, you should only bind trading permissions and ensure that withdrawal privileges are explicitly disabled in your exchange settings.',
  },
  {
    question: 'What is the execution latency from webhook alert to exchange fill?',
    answer: 'Our ingestion node uses high-performance Cloudflare Edge Workers that receive TradingView signals in under 100ms. If Autopilot is active, signal processing, validation, and broker routing typically complete in 150ms to 300ms, resulting in sub-second order entry times to minimize slippage.',
  },
  {
    question: 'Do I need to keep my computer running or leave the dashboard open?',
    answer: 'No. Yuzuriha runs entirely on cloud serverless infrastructure. Once you configure your webhooks and exchange API keys, the routing engine runs autonomously 24/7. You can close your browser and turn off your computer; executions will proceed in the background.',
  },
  {
    question: 'How does Claude AI risk-scoring interact with signal execution?',
    answer: 'When a webhook fires, the payload is evaluated concurrently. If you set a Confidence Threshold (e.g. 70%) and enabling Autopilot is turned on, orders are only routed if Claude validates the market structures at or above that grade. If confidence is below the threshold, the trade is skipped and logged.',
  },
  {
    question: 'Which exchanges and asset classes are supported?',
    answer: 'Currently, the system provides native integrations with OKX (for crypto spot and margined futures), Alpaca (for US equities and ETFs), and OANDA (for Forex and commodity CFDs). You can select your active trading terminal under the dashboard configurations.',
  },
];

export function FAQAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-24 relative overflow-hidden border-t border-[#1e1e3a]/20">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      <div className="mx-auto max-w-4xl px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-3">
          <HelpCircle className="h-8 w-8 text-[#8b5cf6] mx-auto animate-float-slow" />
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#8b5cf6]">Operational Details</h2>
          <p className="text-3xl md:text-4xl font-bold text-white font-display">Frequently Asked Questions</p>
        </div>

        {/* Accordion Rows */}
        <div className="space-y-4">
          {faqData.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx}
                className={cn(
                  "rounded-xl border transition-all duration-300 overflow-hidden",
                  isOpen 
                    ? "border-[#8b5cf6]/40 bg-[#0c0c1d]/80 shadow-[0_0_24px_rgba(139,92,246,0.05)]" 
                    : "border-[#1e1e3a]/50 bg-[#0c0c1d]/30 hover:border-[#8b5cf6]/20 hover:bg-[#0c0c1d]/50"
                )}
              >
                {/* Header Button */}
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-white text-sm sm:text-base cursor-pointer outline-none"
                >
                  <span>{item.question}</span>
                  <ChevronDown 
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform duration-300 shrink-0 ml-4",
                      isOpen && "transform rotate-180 text-[#8b5cf6]"
                    )} 
                  />
                </button>

                {/* Answer Content */}
                <div 
                  className={cn(
                    "transition-all duration-300 ease-in-out px-5 overflow-hidden",
                    isOpen ? "max-h-48 pb-5 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  )}
                >
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
