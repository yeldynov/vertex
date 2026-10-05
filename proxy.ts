import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Browsing stays public; only learner-specific routes need a session.
const isPrivateRoute = createRouteMatcher(["/my-learning(.*)", "/api/progress(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPrivateRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
