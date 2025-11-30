import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (!envUrl) {
    console.warn('[tRPC] Backend URL not configured - using local storage fallback');
    console.warn('[tRPC] To enable backend features, ensure EXPO_PUBLIC_RORK_API_BASE_URL is set');
    return null;
  }
  
  console.log('[tRPC] Backend configured:', envUrl);
  return envUrl;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl() || 'http://localhost:8081'}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        const baseUrl = getBaseUrl();
        
        if (!baseUrl) {
          console.warn('[tRPC] Backend not configured - operation will be skipped');
          throw new Error('BACKEND_NOT_CONFIGURED');
        }
        
        console.log('[tRPC] Making request to:', url.toString().substring(0, 100));
        
        try {
          const response = await fetch(url, options);
          
          if (!response.ok) {
            const text = await response.text();
            console.error('[tRPC] Error response:', response.status, text.substring(0, 200));
            
            throw new Error(`Backend error (${response.status}): ${text || response.statusText}`);
          }
          
          console.log('[tRPC] Request successful');
          return response;
        } catch (error: any) {
          console.error('[tRPC] Request failed:', error.message);
          
          if (error.message.includes('Network request failed') || error.name === 'TypeError') {
            throw new Error('BACKEND_UNAVAILABLE');
          }
          
          throw error;
        }
      },
    }),
  ],
});
