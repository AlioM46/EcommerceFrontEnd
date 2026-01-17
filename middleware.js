import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import { enRoles } from "./app/utils/roles";

export function middleware(req) {
  const token = req.cookies.get("accessToken")?.value;
  const url = req.nextUrl.clone();

  // If no token -> login
  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    const decoded = jwtDecode(token);
    const role = decoded["role"];
    const isVerified = decoded["isVerified"];
    const roleName = (enRoles[role] || "").toLowerCase();

    // ✅ redirect unverified users (avoid loop)
    if (!isVerified && !url.pathname.startsWith("/verify-email")) {
      url.pathname = "/verify-email";
      // optional:
      // url.searchParams.set("resend", "true");
      return NextResponse.redirect(url);
    }

    // Admin/Owner protection
    if (url.pathname.startsWith("/dashboard") && roleName !== "owner" && roleName !== "admin") {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

    if (url.pathname.startsWith("/owner-panel") && roleName !== "owner") {
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }

  } catch (err) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/owner-panel/:path*"],
};
