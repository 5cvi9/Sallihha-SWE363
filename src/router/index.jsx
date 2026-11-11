
import {
    createRootRoute,
    createRoute,
    createRouter,
  } from '@tanstack/react-router'
  
  import App from '../App'
  import RootLayout from './RootLayout'
  
  const rootRoute = createRootRoute({
    component: RootLayout,
  })
  
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: App,
  })
  
  const routeTree = rootRoute.addChildren([homeRoute])
  
  export const router = createRouter({ routeTree })
  