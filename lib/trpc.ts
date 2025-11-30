import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (!envUrl) {
    console.warn('[tRPC] WARNING: EXPO_PUBLIC_RORK_API_BASE_URL is not set. Backend features will be limited.');
    console.warn('[tRPC] Available env vars:', Object.keys(process.env).filter(k => k.startsWith('EXPO_PUBLIC')));
    return 'http://localhost:8081';
  }
  
  console.log('[tRPC] Using base URL:', envUrl);
  return envUrl;
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        console.log('[tRPC] Fetching URL:', url);
        console.log('[tRPC] Request method:', options?.method);
        console.log('[tRPC] Request body:', options?.body ? String(options.body).substring(0, 200) : 'none');
        
        try {
          const response = await fetch(url, options);
          console.log('[tRPC] Response status:', response.status);
          console.log('[tRPC] Response headers:', JSON.stringify(Object.fromEntries(response.headers.entries())));
          
          if (!response.ok) {
            const text = await response.text();
            console.error('[tRPC] Error response body:', text.substring(0, 1000));
            
            if (response.status === 404) {
              throw new Error(`Endpoint not found (404). Check if backend is deployed at: ${getBaseUrl()}`);
            }
            
            throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
          }
          
          const clonedResponse = response.clone();
          const responseText = await clonedResponse.text();
          console.log('[tRPC] Success response:', responseText.substring(0, 500));
          
          return response;
        } catch (error: any) {
          console.error('[tRPC] Fetch error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
          throw error;
        }
      },
    }),
  ],
});
