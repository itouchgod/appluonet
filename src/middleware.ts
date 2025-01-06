import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 检查 JWT token
  const token = request.cookies.get('next-auth.session-token')?.value

  // 如果没有 token，重定向到登录页面
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - api 路由
     * - 静态文件
     * - 图片文件
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
} 