import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth";
export async function middleware(req: NextRequest) {
  const session = await auth();
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      const loginUrl = new URL("/signin", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/admin"],
};
