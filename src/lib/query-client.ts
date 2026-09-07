import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
    mutations: {
      // Form submits are rarely idempotent; a silent retry can double-write.
      retry: 0,
    },
  },
})
