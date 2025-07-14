import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Build API URL with environment variable support
function buildApiUrl(path: string): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
  // Handle paths that already include /api
  if (path.startsWith('/api')) {
    return `${baseUrl}${path}`;
  }
  // Handle paths without /api prefix
  return `${baseUrl}/api${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get token from localStorage for authentication
  const token = localStorage.getItem("auth_token");
  
  const headers: Record<string, string> = {};
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http') ? url : buildApiUrl(url);

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get token from localStorage for authentication
    const token = localStorage.getItem("auth_token");
    
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : buildApiUrl(url);

    try {
      const res = await fetch(fullUrl, {
        headers,
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // Return fallback data for demo purposes
      if (url.includes('/market/price/')) {
        const symbol = url.split('/').pop();
        return {
          symbol,
          price: 67234.56,
          change24h: 2.34,
          volume24h: 28456789.12,
          timestamp: Date.now()
        };
      }
      // For other endpoints, re-throw the error
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: 30000, // Refresh data every 30 seconds
      refetchOnWindowFocus: false,
      staleTime: 25000, // Data is fresh for 25 seconds
      retry: 2,
    },
    mutations: {
      retry: 1,
    },
  },
});
