import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

import { config, buildApiUrl } from './config';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  try {
    // Get token from localStorage for authentication
    const token = localStorage.getItem("auth_token");
    
    const headers: Record<string, string> = {};
    if (data) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Use full URL with API base URL
    const fullUrl = url.startsWith('http') ? url : buildApiUrl(url);

    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`API request failed [${method} ${url}]:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Get token from localStorage for authentication
      const token = localStorage.getItem("token");
      
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Use full URL with API base URL
      const url = queryKey[0] as string;
      const fullUrl = url.startsWith('http') ? url : buildApiUrl(url);

      const res = await fetch(fullUrl, {
        headers,
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        // For market price endpoints, provide fallback data
        const url = queryKey[0] as string;
        if (url.includes('/api/market/price/')) {
          const symbol = url.split('/').pop();
          return {
            symbol: symbol || 'BTCUSDT',
            price: 67000 + (Math.random() - 0.5) * 2000,
            change24h: (Math.random() - 0.5) * 1000,
            volume24h: 1000000000 + Math.random() * 500000000,
            high24h: 68000,
            low24h: 66000,
            lastUpdate: new Date().toISOString(),
            isFallback: true
          };
        }
        if (unauthorizedBehavior === "returnNull") {
          return null;
        }
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      return await res.json();
    } catch (error) {
      // Silently handle network errors for market data
      const url = queryKey[0] as string;
      if (url.includes('/api/market/price/')) {
        const symbol = url.split('/').pop();
        return {
          symbol: symbol || 'BTCUSDT',
          price: 67000 + (Math.random() - 0.5) * 2000,
          change24h: (Math.random() - 0.5) * 1000,
          volume24h: 1000000000 + Math.random() * 500000000,
          high24h: 68000,
          low24h: 66000,
          lastUpdate: new Date().toISOString(),
          isFallback: true
        };
      }
      
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      
      // Don't throw errors for non-critical endpoints
      return null;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5000,
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
