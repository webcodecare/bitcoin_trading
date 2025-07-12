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
      const token = localStorage.getItem("auth_token");
      
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

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      console.error(`Query error for ${queryKey[0]}:`, error);
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
      onError: (error) => {
        console.error("Query error:", error);
        // Return null for failed queries to prevent crashes
        return null;
      },
    },
    mutations: {
      retry: false,
      onError: (error) => {
        console.error("Mutation error:", error);
        // Silently handle errors to prevent unhandled rejections
      },
    },
  },
});
