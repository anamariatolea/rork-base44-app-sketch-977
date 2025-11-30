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
          return new Response(JSON.stringify({
            error: { code: 'BACKEND_NOT_CONFIGURED', message: 'Backend not configured' }
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        console.log('[tRPC] Making request to:', url.toString().substring(0, 100));
        
        try {
          const response = await fetch(url, options);
          
          if (!response.ok) {
            const text = await response.text();
            console.error('[tRPC] Error response:', response.status, text.substring(0, 200));
          }
          
          console.log('[tRPC] Request completed:', response.status);
          return response;
        } catch (error: any) {
          console.error('[tRPC] Fetch error:', {
            message: error.message,
            name: error.name,
            stack: error.stack?.substring(0, 200)
          });
          
          return new Response(JSON.stringify({
            error: { 
              code: 'NETWORK_ERROR', 
              message: error.message || 'Network request failed'
            }
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      },
    }),
  ],
});
