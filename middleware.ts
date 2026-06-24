import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Allow all requests through — auth is handled client-side via localStorage
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
