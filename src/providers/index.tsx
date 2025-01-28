'use client'

import { ThemeProvider } from 'next-themes'
import { Provider as ReduxProvider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { store } from '@/store'
import { TranslationsProvider } from './translations-provider'
import { AuthProvider } from './auth-provider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TranslationsProvider>
              {children}
              <Toaster
                position="bottom-left"
                toastOptions={{
                  style: {
                    direction: 'rtl',
                  },
                }}
              />
            </TranslationsProvider>
          </AuthProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ReduxProvider>
    </ThemeProvider>
  )
} 