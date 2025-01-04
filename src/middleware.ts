export { auth as middleware } from "@/auth"

export const config = {
  matcher: [
    "/tools/:path*",
    "/admin/:path*",
    "/quotation/:path*",
    "/order/:path*",
    "/invoice/:path*",
  ],
} 