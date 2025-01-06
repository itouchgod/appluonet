import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // 如果用户未登录且访问需要认证的页面
  if (!token && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 如果用户已登录且访问登录页
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/tools', request.url))
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
    "/((?!api|_next/static|_next/image|logo|apple-touch-icon.png|favicon.ico).*)",
    "/"
  ]
} 