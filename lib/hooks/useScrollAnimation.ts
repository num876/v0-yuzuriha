'use client';

import { useEffect, useRef } from 'react';

export function useScrollAnimation(_className?: string) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Attach initial reveal-inview transition classes if not already there
    if (!el.classList.contains('reveal-inview')) {
      el.classList.add('reveal-inview');
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { 
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px' // Triggers slightly before element enters deep view
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return ref;
}
