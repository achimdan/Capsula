// Valori implicite TanStack Query: datele se schimbă rar, deci nu le cerem din nou la focus, mount sau reconectare.
export const queryDefaults = {
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1
    },
    mutations: { retry: 1 }
  }
}
