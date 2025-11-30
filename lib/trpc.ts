import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (!envUrl) {
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
          console.error('[tRPC] Fetch error:', error.message || 'Unknown error');
          console.error('[tRPC] Fetch error details:', JSON.stringify({
            message: error.message,
            name: error.name,
            cause: error.cause,
            code: error.code
          }, null, 2));
          
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
