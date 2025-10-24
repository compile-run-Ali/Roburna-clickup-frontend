import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // Performance page access control
    if (pathname.startsWith("/performance")) {
      if (!token?.canAccessPerformance) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Add-member page - only certain roles can access
    if (pathname.startsWith("/add-member")) {
      const allowedRoles = ["ceo", "manager", "assistant_manager"];
      if (!token?.role || !allowedRoles.includes(token.role.toLowerCase())) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // User management page - only management roles can access
    if (pathname.startsWith("/user-management")) {
      const allowedRoles = ["ceo", "manager", "assistant_manager"];
      if (!token?.role || !allowedRoles.includes(token.role.toLowerCase())) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Admin routes - CEO only
    if (pathname.startsWith("/admin")) {
      if (token?.role?.toLowerCase() !== "ceo") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Client management - CEO only
    if (pathname.startsWith("/client-management")) {
      if (token?.role?.toLowerCase() !== "ceo") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        
        // Public routes that don't require authentication
        const publicRoutes = [
          "/",
          "/login",
          "/sign-up",
          "/login-via-email",
          "/auth/error",
          "/unauthorized"
        ];

        // Check if the current path is public
        const isPublicRoute = publicRoutes.some(route => 
          pathname === route || pathname.startsWith(route + "/")
        );

        if (isPublicRoute) {
          return true;
        }

        // All other routes require authentication
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};