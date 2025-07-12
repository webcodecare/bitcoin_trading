// Centralized Configuration Management
// Uses environment variables with fallbacks for development

export const config = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
  
  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableTrading: import.meta.env.VITE_ENABLE_TRADING === 'true',
  enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS === 'true',
  
  // Environment Detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // External Services
  stripePublishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// URL Building Helpers
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = config.apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

export const buildWsUrl = (): string => {
  return config.wsUrl;
};

// Configuration Validation
export const validateConfig = () => {
  if (!config.apiBaseUrl) {
    console.warn('VITE_API_BASE_URL is not configured, using fallback');
  }
  
  if (!config.wsUrl) {
    console.warn('VITE_WS_URL is not configured, using fallback');
  }
  
  console.log('🔧 Frontend Configuration:');
  console.log(`  API Base URL: ${config.apiBaseUrl}`);
  console.log(`  WebSocket URL: ${config.wsUrl}`);
  console.log(`  Environment: ${config.isDevelopment ? 'Development' : 'Production'}`);
  console.log(`  Features: Analytics=${config.enableAnalytics}, Trading=${config.enableTrading}, Notifications=${config.enableNotifications}`);
};

// Auto-validate on import
validateConfig();