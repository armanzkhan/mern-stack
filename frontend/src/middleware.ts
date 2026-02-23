import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Set x-pathname on the REQUEST so the root layout (server) can read it via headers().
 * Redirect "/" to "/auth/sign-in" so we never render the home page (avoids useContext error on "/").
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Redirect root to sign-in so "/" never loads the app shell (avoids client-side useContext error)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    /*
     * Match all pathnames except:
     * - api routes
     * - _next/static
     * - _next/image
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
