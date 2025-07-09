import React, { useEffect, memo } from 'react';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
}

// Pre-load critical resources
const preloadCriticalResources = () => {
  // Preload commonly used icons
  const iconPaths = [
    '/src/lib/utils.ts',
    '/src/components/ui/button.tsx',
    '/src/components/ui/card.tsx'
  ];

  iconPaths.forEach(path => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = path;
    document.head.appendChild(link);
  });
};

// Optimize images and assets
const optimizeAssets = () => {
  // Add loading="lazy" to images that aren't already optimized
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach(img => {
    img.setAttribute('loading', 'lazy');
  });

  // Optimize heavy components
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  });

  // Observe charts and heavy components
  const heavyElements = document.querySelectorAll('[data-heavy]');
  heavyElements.forEach(el => observer.observe(el));
};

// Add performance CSS for smooth animations
const addPerformanceCSS = () => {
  const style = document.createElement('style');
  style.textContent = `
    * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    
    .fade-in {
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Optimize scrolling */
    .scroll-smooth {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    
    /* GPU acceleration for transforms */
    .gpu-accelerated {
      transform: translateZ(0);
      will-change: transform;
    }
    
    /* Optimize chart rendering */
    canvas {
      image-rendering: -webkit-optimize-contrast;
      image-rendering: crisp-edges;
    }
    
    /* Reduce layout shifts */
    .skeleton-loader {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: skeleton-loading 1.5s infinite;
    }
    
    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
};

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = memo(({ children }) => {
  useEffect(() => {
    // Initialize performance optimizations
    const initOptimizations = () => {
      preloadCriticalResources();
      addPerformanceCSS();
      
      // Defer heavy optimizations
      requestIdleCallback(() => {
        optimizeAssets();
      });
    };

    // Run on mount
    initOptimizations();

    // Clean up observer on unmount
    return () => {
      const style = document.querySelector('style[data-performance]');
      if (style) style.remove();
    };
  }, []);

  return <>{children}</>;
});

PerformanceOptimizer.displayName = 'PerformanceOptimizer';

export default PerformanceOptimizer;