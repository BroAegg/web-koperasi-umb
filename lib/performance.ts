/**
 * Performance Monitoring Utilities
 * 
 * Tracks Web Vitals (CLS, FID, LCP, FCP, TTFB) for tablet optimization
 * Use this to measure real-world performance and identify bottlenecks
 */

import type { Metric } from 'web-vitals';

// Web Vitals thresholds for good user experience
const THRESHOLDS = {
  CLS: 0.1,  // Cumulative Layout Shift
  FID: 100,  // First Input Delay (ms)
  LCP: 2500, // Largest Contentful Paint (ms)
  FCP: 1800, // First Contentful Paint (ms)
  TTFB: 600, // Time to First Byte (ms)
  INP: 200,  // Interaction to Next Paint (ms)
};

// Performance metric names
type MetricName = 'CLS' | 'FID' | 'LCP' | 'FCP' | 'TTFB' | 'INP';

/**
 * Report Web Vitals to console (development) or analytics (production)
 */
export function reportWebVitals(metric: Metric) {
  const { name, value, rating, id } = metric;
  const metricName = name as MetricName;
  const threshold = THRESHOLDS[metricName];
  
  // Determine if metric is good/needs improvement/poor
  const status = threshold 
    ? value < threshold ? '✅ GOOD' : value < threshold * 2 ? '⚠️ NEEDS IMPROVEMENT' : '❌ POOR'
    : 'ℹ️ INFO';

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${name}:`, {
      value: `${Math.round(value)}${name === 'CLS' ? '' : 'ms'}`,
      rating,
      status,
      id,
      threshold: threshold ? `${threshold}${name === 'CLS' ? '' : 'ms'}` : 'N/A'
    });
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', name, {
        event_category: 'Web Vitals',
        event_label: id,
        value: Math.round(value),
        non_interaction: true,
      });
    }

    // Example: Send to custom analytics endpoint
    fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        value,
        rating,
        id,
        timestamp: Date.now(),
        url: window.location.pathname,
        userAgent: navigator.userAgent,
      }),
    }).catch(err => {
      // Silently fail - don't disrupt user experience
      console.error('Failed to report web vitals:', err);
    });
  }
}

/**
 * Track custom performance mark (useful for component-specific timing)
 */
export function trackPerformanceMark(markName: string) {
  if (typeof window !== 'undefined' && window.performance) {
    performance.mark(markName);
  }
}

/**
 * Measure time between two performance marks
 */
export function measurePerformance(measureName: string, startMark: string, endMark: string) {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.measure(measureName, startMark, endMark);
      const measure = performance.getEntriesByName(measureName)[0];
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance Measure] ${measureName}: ${Math.round(measure.duration)}ms`);
      }
      
      return measure.duration;
    } catch (err) {
      console.error('Performance measurement failed:', err);
      return 0;
    }
  }
  return 0;
}

/**
 * Get device type based on screen width (useful for tablet-specific tracking)
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Track tablet-specific interactions (useful for touch optimization analysis)
 */
export function trackTabletInteraction(eventName: string, metadata?: Record<string, any>) {
  const deviceType = getDeviceType();
  
  if (deviceType === 'tablet') {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Tablet Interaction] ${eventName}`, metadata);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      fetch('/api/analytics/tablet-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          metadata,
          timestamp: Date.now(),
          url: window.location.pathname,
        }),
      }).catch(() => {}); // Silently fail
    }
  }
}

// Type definitions for window.gtag
declare global {
  interface Window {
    gtag?: (
      command: 'event',
      eventName: string,
      eventParams: Record<string, any>
    ) => void;
  }
}
