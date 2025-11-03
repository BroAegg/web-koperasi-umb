'use client';

import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>('portrait');

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;

    const updateOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      setOrientation(isPortrait ? 'portrait' : 'landscape');
    };

    // Set initial orientation
    updateOrientation();

    // Listen for resize events
    window.addEventListener('resize', updateOrientation);
    
    // Listen for orientation change events (for mobile/tablet)
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}
