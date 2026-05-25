'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface YuzurihaLogoProps {
  className?: string;
  iconSize?: string;
  textSize?: string;
}

export function YuzurihaLogo({ className, iconSize = "h-5 w-5", textSize = "text-sm" }: YuzurihaLogoProps) {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      {/* Geometric Monogram Emblem (interlocking vector paths forming a Y-leaf and an infinity loop representing quantitative flows) */}
      <svg
        className={cn("text-[#8b5cf6] shrink-0", iconSize)}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Infinity Loop path representing recursion and quantitative flow */}
        <path 
          d="M12 13C10 10.5 7 10.5 5.5 12C4 13.5 4 16 5.5 17.5C7 19 10 19 12 16.5C14 19 17 19 18.5 17.5C20 16 20 13.5 18.5 12C17 10.5 14 10.5 12 13Z" 
          stroke="url(#logo-grad-1)" 
        />
        {/* Y-branch stem representing growth & execution */}
        <path 
          d="M12 21V13M12 13C12 9.5 9 6.5 8 4.5M12 13C12 9.5 15 6.5 16 4.5" 
          stroke="url(#logo-grad-2)" 
        />
        {/* Central intelligence node */}
        <circle cx="12" cy="13" r="1.5" fill="#06b6d4" />
        <defs>
          <linearGradient id="logo-grad-1" x1="4" y1="12" x2="20" y2="17" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="logo-grad-2" x1="8" y1="4" x2="16" y2="21" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06b6d4" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      {/* Premium uppercase tracking typography */}
      <span className={cn("font-display font-light uppercase tracking-[0.25em] text-white leading-none", textSize)}>
        Yuzuriha
      </span>
    </div>
  );
}
