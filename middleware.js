// middleware.js
import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

export function middleware(req) {
  const token = req.cookies.get("accessToken")?.value;

  const url = req.nextUrl.clone();

  // If no token → send to login
  if (!token) {
    url.pathname = "/login2";
    return NextResponse.redirect(url);
  }

  try {
    // Decode token
    const decoded = jwtDecode(token);

    const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    // Protect dashboard → only Admins
    if (url.pathname.startsWith("/dashboard") && role.toLowerCase() !== "owner" && role.toLowerCase() != "admin") {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    // Protect owner-only routes
    if (url.pathname.startsWith("/owner-panel") && role.toLowerCase() !== "owner") {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.error("Invalid token", err);
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/owner-panel/:path*"], 
};
