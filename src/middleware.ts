import { clerkMiddleware, createRouteMatcher } from '@clerk/astro/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/(.*)'  // Protege TODOS los endpoints API
]);

export const onRequest = clerkMiddleware((auth, context) => {
  const { redirectToSignIn, userId } = auth();
  
  if (!userId && isProtectedRoute(context.request)) {
    return redirectToSignIn();
  }
});
