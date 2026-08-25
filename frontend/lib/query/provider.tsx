/**
 * Query Provider Component
 * Wraps the app with React Query's QueryClientProvider
 * Includes development tools for debugging
 */

'use client';

import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './client';
import { config } from '@/lib/config';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryProvider component
 * Must wrap all components that use React Query hooks
 * Typically used in the root layout
 *
 * @example
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <QueryProvider>
 *           {children}
 *         </QueryProvider>
 *       </body>
 *     </html>
 *   )
 * }
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {config.features.enableDevTools && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;
