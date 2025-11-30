import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

let hasLoggedBackendStatus = false;

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (!hasLoggedBackendStatus) {
    if (envUrl) {
      console.log('[tRPC] ✅ Backend configured:', envUrl);
    } else {
      console.log('[tRPC] ℹ️  Backend not configured - running in local-only mode');
    }
    hasLoggedBackendStatus = true;
  }
  
  return envUrl || null;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl() || 'http://localhost:8081'}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        const baseUrl = getBaseUrl();
        
        if (!baseUrl) {
          return new Response(JSON.stringify({
            result: { data: null }
          }), {
            status: 200,
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
          const errorMessage = error?.message || String(error) || 'Unknown error';
          console.error('[tRPC] Fetch error:', errorMessage);
          console.error('[tRPC] Error type:', error?.constructor?.name || typeof error);
          
          try {
            console.error('[tRPC] Error details:', JSON.stringify({
              message: error?.message,
              name: error?.name,
              cause: error?.cause,
              code: error?.code,
              stack: error?.stack?.substring(0, 200),
            }, null, 2));
          } catch {
            console.error('[tRPC] Could not stringify error details');
          }
          
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
