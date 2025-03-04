# LC APP - 商业文档管理系统

一个用于处理报价单、销售确认单和发票等商业文档的生成和管理系统。

## 功能特性

### 1. 报价单和订单确认书生成
- 支持报价单和订单确认书的快速生成
- 可自定义客户信息、商品明细、备注等内容
- 支持多币种（USD/CNY）
- 提供专业的 PDF 导出功能
- 支持本地历史记录保存和管理

### 2. AI 邮件助手
- 智能生成商务邮件
- 支持中英文双语邮件
- 多种邮件语气风格可选
- 快速邮件回复建议

### 3. 用户管理
- 多用户支持
- 基于角色的权限控制
- 管理员后台管理

### 4. 系统特性
- 支持深色/浅色主题
- 响应式设计，支持移动端访问
- 本地数据存储，保护隐私

## 技术栈

- **前端框架**: Next.js 14
- **UI 框架**: TailwindCSS
- **状态管理**: React Hooks
- **认证**: NextAuth.js
- **数据库**: Prisma + PostgreSQL
- **AI 集成**: DeepSeek API
- **PDF 生成**: jsPDF

## 开发环境设置

1. 克隆项目
```bash
git clone [repository-url]
cd mluonet
```

2. 安装依赖
```bash
npm install
```

3. 环境变量配置
创建 `.env.local` 文件并添加以下配置：
```env
DEEPSEEK_API_KEY=your_api_key
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_nextauth_secret
```

4. 启动开发服务器
```bash
npm run dev
```

## 部署

1. 构建项目
```bash
npm run build
```

2. 启动生产服务器
```bash
npm start
```

## 数据存储说明

- 用户数据存储在 PostgreSQL 数据库中
- 报价历史记录使用浏览器的 localStorage 存储
- AI 生成的内容不会被永久存储

## 注意事项

1. localStorage 存储限制
   - 浏览器的 localStorage 通常限制在 5-10MB
   - 建议定期导出重要的报价历史记录
   - 清除浏览器数据会导致历史记录丢失

2. AI 功能使用
   - 需要配置有效的 DeepSeek API Key
   - API 调用有频率限制
   - 生成的内容建议人工审核

## 更新日志

### V1.1.1
- 移除 Cloudflare D1 集成
- 改用 localStorage 存储报价历史
- 优化用户界面响应速度
- 修复已知问题

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

[MIT License](LICENSE)
