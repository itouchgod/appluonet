import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export async function middleware(request: NextRequest) {
  const session = await auth();
  const pathname = request.nextUrl.pathname;
  
  // 调试信息
  console.log('Auth Debug:', {
    pathname,
    session: {
      user: session?.user,
      expires: session?.expires,
    },
    headers: Object.fromEntries(request.headers.entries()),
  });

  // 未登录用户访问非登录页，重定向到登录页
  if (!session?.user && pathname !== '/') {
    console.log('未登录用户访问，重定向到登录页');
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 已登录用户访问登录页，重定向到工具页
  if (session?.user && pathname === '/') {
    console.log('已登录用户访问登录页，重定向到工具页');
    return NextResponse.redirect(new URL('/tools', request.url));
  }

  // 检查是否是管理路由
  const isAdminRoute = pathname.startsWith('/admin');
  const isAdmin = session?.user?.isAdmin;

  console.log('权限检查:', {
    isAdminRoute,
    isAdmin,
    user: session?.user,
    pathname,
  });

  // 非管理员访问管理页面，跳转到工具页
  if (isAdminRoute && !isAdmin) {
    console.log('非管理员访问管理页面，重定向到工具页');
    return NextResponse.redirect(new URL('/tools', request.url));
  }

  return NextResponse.next();
}

// 修改 matcher 配置，确保处理所有相关路由
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 