import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  console.warn('EXPO_PUBLIC_RORK_API_BASE_URL is not set, using placeholder');
  return 'http://placeholder.local';
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      fetch: async (url, options) => {
        console.log('[tRPC] Fetching:', url);
        try {
          const response = await fetch(url, options);
          console.log('[tRPC] Response status:', response.status);
          
          if (!response.ok) {
            const text = await response.text();
            console.error('[tRPC] Error response:', text.substring(0, 500));
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          return response;
        } catch (error) {
          console.error('[tRPC] Fetch error:', error);
          throw error;
        }
      },
    }),
  ],
});
