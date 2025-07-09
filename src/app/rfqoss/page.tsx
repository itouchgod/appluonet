'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Footer } from '@/components/Footer';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

// 使用dynamic导入避免hydration问题
const DynamicHeader = dynamic(() => import('@/components/Header').then(mod => mod.Header), {
  ssr: true,
  loading: () => (
    <div className="bg-white dark:bg-[#1c1c1e] shadow-sm dark:shadow-gray-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
});

// 询价订单状态类型
interface RFQOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  expectedDelivery: string;
  notes?: string;
}

// 状态配置
const STATUS_CONFIG = {
  pending: {
    label: '待处理',
    color: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20',
    icon: Clock
  },
  in_progress: {
    label: '处理中',
    color: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20',
    icon: AlertCircle
  },
  completed: {
    label: '已完成',
    color: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20',
    icon: CheckCircle
  },
  cancelled: {
    label: '已取消',
    color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20',
    icon: XCircle
  }
};

// 优先级配置
const PRIORITY_CONFIG = {
  low: {
    label: '低',
    color: 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800/20'
  },
  medium: {
    label: '中',
    color: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20'
  },
  high: {
    label: '高',
    color: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
  }
};

export default function RFQOSSPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<RFQOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || status === 'loading') return;

    if (!session) {
      router.push('/');
      return;
    }

    // 模拟加载数据
    const loadData = async () => {
      setLoading(true);
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 模拟数据
        const mockOrders: RFQOrder[] = [
          {
            id: '1',
            orderNumber: 'RFQ-2024-001',
            customerName: '上海贸易公司',
            productName: '不锈钢螺丝',
            quantity: 1000,
            unit: '个',
            status: 'pending',
            priority: 'high',
            createdAt: '2024-01-15',
            updatedAt: '2024-01-15',
            expectedDelivery: '2024-02-15',
            notes: '需要快速报价'
          },
          {
            id: '2',
            orderNumber: 'RFQ-2024-002',
            customerName: '北京机械厂',
            productName: '轴承',
            quantity: 500,
            unit: '套',
            status: 'in_progress',
            priority: 'medium',
            createdAt: '2024-01-14',
            updatedAt: '2024-01-16',
            expectedDelivery: '2024-02-20',
            notes: '标准规格'
          },
          {
            id: '3',
            orderNumber: 'RFQ-2024-003',
            customerName: '广州电子厂',
            productName: '电路板',
            quantity: 200,
            unit: '块',
            status: 'completed',
            priority: 'low',
            createdAt: '2024-01-10',
            updatedAt: '2024-01-12',
            expectedDelivery: '2024-01-25',
            notes: '已完成报价'
          }
        ];
        
        setOrders(mockOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mounted, session, status, router]);

  // 过滤订单
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || order.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleLogout = async () => {
    localStorage.removeItem('username');
    // 这里需要导入signOut
    // await signOut({ redirect: true, callbackUrl: '/' });
  };

  // 避免闪烁，在客户端渲染前返回空内容
  if (!mounted) {
    return null;
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-black">
      <div className="flex-1">
        <DynamicHeader 
          user={{
            name: session.user?.name || '用户',
            isAdmin: false
          }}
          onLogout={handleLogout}
          onProfile={() => {}}
          title="询价订单状态"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* 页面标题 */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              询价订单状态管理
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              管理和跟踪所有询价订单的状态
            </p>
          </div>

          {/* 工具栏 */}
          <div className="bg-white dark:bg-[#1c1c1e] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="搜索订单号、客户名称或产品名称..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* 过滤器 */}
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">所有状态</option>
                  <option value="pending">待处理</option>
                  <option value="in_progress">处理中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">所有优先级</option>
                  <option value="low">低</option>
                  <option value="medium">中</option>
                  <option value="high">高</option>
                </select>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                 transition-colors duration-200 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  新建订单
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 
                                 transition-colors duration-200 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  导出
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 
                                 transition-colors duration-200 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  刷新
                </button>
              </div>
            </div>
          </div>

          {/* 订单列表 */}
          <div className="bg-white dark:bg-[#1c1c1e] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 text-lg">
                  {loading ? '加载中...' : '暂无询价订单'}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        订单号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        客户名称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        产品名称
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        数量
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        优先级
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        创建时间
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-[#1c1c1e] divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredOrders.map((order) => {
                      const StatusIcon = STATUS_CONFIG[order.status].icon;
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {order.orderNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {order.customerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {order.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {order.quantity} {order.unit}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[order.status].color}`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {STATUS_CONFIG[order.status].label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_CONFIG[order.priority].color}`}>
                              {PRIORITY_CONFIG[order.priority].label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {order.createdAt}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
