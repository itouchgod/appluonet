import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          404
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          页面不存在
        </p>
        <Link
          href="/"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
} 