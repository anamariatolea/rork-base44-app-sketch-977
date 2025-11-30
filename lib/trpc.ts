import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (!envUrl) {
    console.error('[tRPC] ERROR: EXPO_PUBLIC_RORK_API_BASE_URL is not set.');
    console.error('[tRPC] Backend features will not work. Please contact support.');
    console.log('[tRPC] Available env vars:', Object.keys(process.env).filter(k => k.startsWith('EXPO_PUBLIC')));
    return null;
  }
  
  console.log('[tRPC] Using base URL:', envUrl);
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
          console.error('[tRPC] Cannot make request - base URL is not configured');
          throw new Error('Backend is not configured. Please check your environment settings or contact support.');
        }
        
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
              throw new Error(`Backend endpoint not found. The server may not be running or the URL is incorrect.`);
            }
            
            throw new Error(`Backend error (${response.status}): ${text || response.statusText}`);
          }
          
          const clonedResponse = response.clone();
          const responseText = await clonedResponse.text();
          console.log('[tRPC] Success response:', responseText.substring(0, 500));
          
          return response;
        } catch (error: any) {
          console.error('[tRPC] Fetch error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            type: error.constructor.name
          });
          
          if (error.message.includes('Network request failed') || error.name === 'TypeError') {
            throw new Error('Unable to connect to the server. Please check your internet connection or try again later.');
          }
          
          throw error;
        }
      },
    }),
  ],
});
