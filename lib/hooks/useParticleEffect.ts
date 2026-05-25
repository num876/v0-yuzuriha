'use client';

import { useRef, useCallback } from 'react';

export function useParticleEffect() {
  const containerRef = useRef<HTMLDivElement>(null);

  const createParticles = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!containerRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Read accent color from CSS variable, fallback to purple
    const accentColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--accent-purple').trim() || '#8b5cf6';

    const count = 10;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const angle = (i / count) * Math.PI * 2;
      const velocity = 4 + Math.random() * 4;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);

      particle.className = 'particle absolute rounded-full';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.width = `${3 + Math.random() * 3}px`;
      particle.style.height = particle.style.width;
      particle.style.background = accentColor;
      particle.style.boxShadow = `0 0 6px ${accentColor}`;

      containerRef.current.appendChild(particle);

      setTimeout(() => particle.remove(), 600);
    }
  }, []);

  return { containerRef, createParticles };
}
