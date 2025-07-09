import { defineConfig } from 'vite';
import { resolve } from 'path';

// Vite performance optimization configuration
export default defineConfig({
  build: {
    // Enable build optimizations
    target: 'esnext',
    minify: 'terser',
    
    // Optimize chunk sizes
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks for better caching
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['lightweight-charts'],
          'vendor-utils': ['clsx', 'class-variance-authority', 'tailwind-merge']
        }
      }
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Source maps for production debugging
    sourcemap: true
  },
  
  // Development optimizations
  server: {
    hmr: {
      overlay: false // Reduce overlay noise during development
    }
  },
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      '@tanstack/react-query',
      'wouter',
      'lightweight-charts',
      'framer-motion'
    ],
    exclude: [
      '@vite/client',
      '@vite/env'
    ]
  },
  
  // Asset optimization
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg'],
  
  // Plugin configuration for performance
  plugins: [
    // Add compression plugins in production
    ...(process.env.NODE_ENV === 'production' ? [] : [])
  ]
});