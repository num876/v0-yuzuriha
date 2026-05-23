'use client';

import { useRef, useCallback } from 'react';

export function useParticleEffect() {
  const containerRef = useRef<HTMLDivElement>(null);

  const createParticles = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!containerRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      const angle = (i / 8) * Math.PI * 2;
      const velocity = 6;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;

      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      particle.className = 'particle absolute w-2 h-2 bg-accent rounded-full';
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;

      containerRef.current.appendChild(particle);

      setTimeout(() => particle.remove(), 600);
    }
  }, []);

  return { containerRef, createParticles };
}
