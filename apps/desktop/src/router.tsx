import { ConvexQueryClient } from '@convex-dev/react-query'
import { QueryClient } from '@tanstack/react-query'
import {
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { routerWithQueryClient } from '@tanstack/react-router-with-query'
import { ConvexProvider } from 'convex/react'
import { invoke } from '@tauri-apps/api/core'
import * as React from 'react'
import {
  DeskScreen,
  HomeScreen,
  PhonePairingScreen,
  ThemeProvider,
  type DeskInjectConfig,
  type InjectSuffix,
} from '@scan-it/features'
import type { QueryClient as QC } from '@tanstack/react-query'

const rootRoute = createRootRouteWithContext<{ queryClient: QC }>()({
  component: RootLayout,
})

function RootLayout() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  )
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeScreen,
})

const deskRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/desk/$publicId',
  component: DeskPage,
})

const phonePairRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/s/$publicId',
  component: PhonePairPage,
})

function DeskPage() {
  const { publicId } = deskRoute.useParams()
  const inject = React.useMemo<DeskInjectConfig>(
    () => ({
      injectScan: async (text, suffix: InjectSuffix) => {
        await invoke('inject_text', { text, suffix })
      },
      injectFieldParts: async (parts, finalSuffix: InjectSuffix) => {
        await invoke('inject_sequence', { parts, final_suffix: finalSuffix })
      },
    }),
    [],
  )
  return <DeskScreen publicId={publicId} inject={inject} />
}

function PhonePairPage() {
  const { publicId } = phonePairRoute.useParams()
  return <PhonePairingScreen publicId={publicId} />
}

const routeTree = rootRoute.addChildren([indexRoute, deskRoute, phonePairRoute])

export function getRouter() {
  const CONVEX_URL = import.meta.env.VITE_CONVEX_URL
  if (!CONVEX_URL) {
    console.error('missing envar VITE_CONVEX_URL')
  }
  const convexQueryClient = new ConvexQueryClient(CONVEX_URL)

  const queryClient: QueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        queryKeyHashFn: convexQueryClient.hashFn(),
        queryFn: convexQueryClient.queryFn(),
        gcTime: 5000,
      },
    },
  })
  convexQueryClient.connect(queryClient)

  return routerWithQueryClient(
    createRouter({
      routeTree,
      defaultPreload: 'intent',
      context: { queryClient },
      scrollRestoration: true,
      defaultPreloadStaleTime: 0,
      defaultErrorComponent: (err) => <p>{err.error.stack}</p>,
      defaultNotFoundComponent: () => <p>not found</p>,
      Wrap: ({ children }) => (
        <ConvexProvider client={convexQueryClient.convexClient}>
          {children}
        </ConvexProvider>
      ),
    }),
    queryClient,
  )
}
