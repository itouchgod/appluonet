import { auth } from '@/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isAdmin = req.auth?.user?.username === 'admin';

  console.log('Middleware Check:', {
    isLoggedIn,
    isAdminRoute,
    isAdmin,
    username: req.auth?.user?.username,
    pathname: req.nextUrl.pathname
  });

  // 如果未登录且不是登录页，重定向到登录页
  if (!isLoggedIn && req.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/', req.url));
  }

  // 如果已登录但访问登录页，重定向到工具页
  if (isLoggedIn && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/tools', req.url));
  }

  // 如果是管理员路由但不是管理员，重定向到工具页
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/tools', req.url));
  }

  return NextResponse.next();
});

// 配置需要进行认证检查的路由
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}; 