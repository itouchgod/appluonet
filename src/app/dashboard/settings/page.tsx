'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Role } from '@prisma/client';

type User = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: string;
};

type CompanyInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

type EmailTemplate = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

export default function SettingsPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: '',
    address: '',
    phone: '',
    email: '',
  });
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) throw new Error('获取用户列表失败');
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('获取用户列表错误:', error);
      // TODO: 添加错误提示
    }
  };

  // 获取公司信息
  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch('/api/admin/company-info');
      if (!response.ok) throw new Error('获取公司信息失败');
      const data = await response.json();
      setCompanyInfo(data);
    } catch (error) {
      console.error('获取公司信息错误:', error);
      // TODO: 添加错误提示
    }
  };

  // 获取邮件模板
  const fetchEmailTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates');
      if (!response.ok) throw new Error('获取邮件模板失败');
      const data = await response.json();
      setEmailTemplates(data.templates);
    } catch (error) {
      console.error('获取邮件模板错误:', error);
      // TODO: 添加错误提示
    }
  };

  // 更新用户角色
  const updateUserRole = async (userId: string, role: Role) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) throw new Error('更新用户角色失败');
      await fetchUsers(); // 重新获取用户列表
    } catch (error) {
      console.error('更新用户角色错误:', error);
      // TODO: 添加错误提示
    }
  };

  // 更新公司信息
  const updateCompanyInfo = async (info: CompanyInfo) => {
    try {
      const response = await fetch('/api/admin/company-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(info),
      });

      if (!response.ok) throw new Error('更新公司信息失败');
      setCompanyInfo(info);
    } catch (error) {
      console.error('更新公司信息错误:', error);
      // TODO: 添加错误提示
    }
  };

  // 删除邮件模板
  const deleteEmailTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('删除邮件模板失败');
      await fetchEmailTemplates(); // 重新获取模板列表
    } catch (error) {
      console.error('删除邮件模板错误:', error);
      // TODO: 添加错误提示
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            无权访问
          </h2>
          <p className="mt-2 text-gray-600">
            您没有权限访问此页面
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">系统设置</h2>
        <p className="mt-1 text-sm text-gray-500">
          管理用户、公司信息和系统配置
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">用户管理</TabsTrigger>
          <TabsTrigger value="company">公司信息</TabsTrigger>
          <TabsTrigger value="templates">邮件模板</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <div className="bg-white shadow-sm rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name || '-'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={(value) =>
                          updateUserRole(user.id, value as Role)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={Role.USER}>普通用户</SelectItem>
                          <SelectItem value={Role.ADMIN}>管理员</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // TODO: 重置密码
                        }}
                      >
                        重置密码
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="company" className="space-y-4">
          <div className="bg-white shadow-sm rounded-lg p-6">
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                updateCompanyInfo(companyInfo);
              }}
            >
              <div>
                <label
                  htmlFor="company-name"
                  className="block text-sm font-medium text-gray-700"
                >
                  公司名称
                </label>
                <Input
                  id="company-name"
                  value={companyInfo.name}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, name: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="company-address"
                  className="block text-sm font-medium text-gray-700"
                >
                  公司地址
                </label>
                <Input
                  id="company-address"
                  value={companyInfo.address}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, address: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="company-phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  联系电话
                </label>
                <Input
                  id="company-phone"
                  value={companyInfo.phone}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, phone: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="company-email"
                  className="block text-sm font-medium text-gray-700"
                >
                  联系邮箱
                </label>
                <Input
                  id="company-email"
                  type="email"
                  value={companyInfo.email}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, email: e.target.value })
                  }
                  className="mt-1"
                />
              </div>

              <Button type="submit">保存更改</Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="bg-white shadow-sm rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>模板名称</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailTemplates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>
                      {new Date(template.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: 编辑模板
                          }}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEmailTemplate(template.id)}
                        >
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button
            onClick={() => {
              // TODO: 添加新模板
            }}
          >
            添加模板
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
} 