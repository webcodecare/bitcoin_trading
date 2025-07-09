import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint  
  cls: number | null; // Cumulative Layout Shift
  fid: number | null; // First Input Delay
}

export function usePerformance() {
  const metricsRef = useRef<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    cls: null,
    fid: null
  });

  // Measure performance metrics
  const measurePerformance = useCallback(() => {
    // First Contentful Paint
    const fcpEntry = performance.getEntriesByType('paint').find(
      entry => entry.name === 'first-contentful-paint'
    );
    if (fcpEntry) {
      metricsRef.current.fcp = fcpEntry.startTime;
    }

    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        metricsRef.current.lcp = lastEntry.startTime;
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observation not supported');
      }

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        let clsValue = 0;
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        metricsRef.current.cls = clsValue;
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observation not supported');
      }

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          metricsRef.current.fid = (entry as any).processingStart - entry.startTime;
        }
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observation not supported');
      }
    }
  }, []);

  // Optimize bundle loading
  const optimizeBundleLoading = useCallback(() => {
    // Preload critical chunks
    const criticalChunks = [
      '/src/components/ui/button.tsx',
      '/src/components/ui/card.tsx',
      '/src/lib/utils.ts'
    ];

    criticalChunks.forEach(chunk => {
      const link = document.createElement('link');
      link.rel = 'modulepreload';
      link.href = chunk;
      document.head.appendChild(link);
    });
  }, []);

  // Optimize memory usage
  const optimizeMemory = useCallback(() => {
    // Clean up event listeners and observers periodically
    const cleanup = () => {
      // Force garbage collection if available (dev mode)
      if ('gc' in window && typeof (window as any).gc === 'function') {
        (window as any).gc();
      }
    };

    // Run cleanup every 30 seconds
    const cleanupInterval = setInterval(cleanup, 30000);
    
    return () => clearInterval(cleanupInterval);
  }, []);

  // Debounce function for performance
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // Throttle function for performance  
  const throttle = useCallback((func: Function, limit: number) => {
    let inThrottle: boolean;
    return function executedFunction(...args: any[]) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  useEffect(() => {
    measurePerformance();
    optimizeBundleLoading();
    const memoryCleanup = optimizeMemory();

    return () => {
      if (memoryCleanup) memoryCleanup();
    };
  }, [measurePerformance, optimizeBundleLoading, optimizeMemory]);

  return {
    metrics: metricsRef.current,
    debounce,
    throttle
  };
}