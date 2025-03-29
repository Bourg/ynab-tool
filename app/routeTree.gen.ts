/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SignupImport } from './routes/signup'
import { Route as LoginImport } from './routes/login'
import { Route as IndexImport } from './routes/index'
import { Route as YnabRedirectImport } from './routes/ynab/redirect'
import { Route as YnabConnectImport } from './routes/ynab/connect'

// Create/Update Routes

const SignupRoute = SignupImport.update({
  id: '/signup',
  path: '/signup',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const YnabRedirectRoute = YnabRedirectImport.update({
  id: '/ynab/redirect',
  path: '/ynab/redirect',
  getParentRoute: () => rootRoute,
} as any)

const YnabConnectRoute = YnabConnectImport.update({
  id: '/ynab/connect',
  path: '/ynab/connect',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/signup': {
      id: '/signup'
      path: '/signup'
      fullPath: '/signup'
      preLoaderRoute: typeof SignupImport
      parentRoute: typeof rootRoute
    }
    '/ynab/connect': {
      id: '/ynab/connect'
      path: '/ynab/connect'
      fullPath: '/ynab/connect'
      preLoaderRoute: typeof YnabConnectImport
      parentRoute: typeof rootRoute
    }
    '/ynab/redirect': {
      id: '/ynab/redirect'
      path: '/ynab/redirect'
      fullPath: '/ynab/redirect'
      preLoaderRoute: typeof YnabRedirectImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/signup': typeof SignupRoute
  '/ynab/connect': typeof YnabConnectRoute
  '/ynab/redirect': typeof YnabRedirectRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/signup': typeof SignupRoute
  '/ynab/connect': typeof YnabConnectRoute
  '/ynab/redirect': typeof YnabRedirectRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/signup': typeof SignupRoute
  '/ynab/connect': typeof YnabConnectRoute
  '/ynab/redirect': typeof YnabRedirectRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/login' | '/signup' | '/ynab/connect' | '/ynab/redirect'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/login' | '/signup' | '/ynab/connect' | '/ynab/redirect'
  id:
    | '__root__'
    | '/'
    | '/login'
    | '/signup'
    | '/ynab/connect'
    | '/ynab/redirect'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  LoginRoute: typeof LoginRoute
  SignupRoute: typeof SignupRoute
  YnabConnectRoute: typeof YnabConnectRoute
  YnabRedirectRoute: typeof YnabRedirectRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  LoginRoute: LoginRoute,
  SignupRoute: SignupRoute,
  YnabConnectRoute: YnabConnectRoute,
  YnabRedirectRoute: YnabRedirectRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/login",
        "/signup",
        "/ynab/connect",
        "/ynab/redirect"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/signup": {
      "filePath": "signup.tsx"
    },
    "/ynab/connect": {
      "filePath": "ynab/connect.ts"
    },
    "/ynab/redirect": {
      "filePath": "ynab/redirect.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
