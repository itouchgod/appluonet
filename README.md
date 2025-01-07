# LC APP - 企业级文档管理系统

## 项目概述
LC APP 是一个现代化的企业级文档管理系统，专注于提供高效的商业文档处理解决方案。系统采用 Next.js 15 和 TypeScript 开发，提供了报价单、销售确认单和发票等核心商业文档的全生命周期管理。

## 核心功能

### 文档管理
- 📄 报价单管理
  - 在线创建和编辑报价单
  - Excel 数据导入功能
  - 多币种支持
  - PDF 导出

- 📋 销售确认单
  - 基于报价单快速生成
  - 自动计算功能
  - 状态跟踪

- 🧾 发票系统
  - 自动生成发票
  - 多模板支持
  - 批量处理

### 系统功能
- 👥 用户管理
  - 基于角色的权限控制
  - 完整的用户配置文件
  - 安全的身份认证

- 🛠 工具集成
  - Excel 导入/导出
  - PDF 生成器
  - 邮件通知系统

## 技术架构

### 前端技术
- Next.js 15.1.3 (App Router)
- TypeScript 5.x
- Tailwind CSS 3.4.1
- shadcn/ui 组件库
- jsPDF 文档生成

### 后端技术
- Next.js API Routes
- Prisma ORM
- PostgreSQL 数据库
- Auth.js 认证
- AWS S3 文件存储

## 快速开始

### 环境要求
- Node.js 18.x 或更高版本
- PostgreSQL 14.x 或更高版本
- npm 或 yarn

### 安装步骤

1. 克隆项目
```bash
git clone [repository-url]
cd lc-app
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 环境配置
```bash
cp .env.example .env
```
编辑 .env 文件，配置以下必要环境变量：
- DATABASE_URL: PostgreSQL 连接串
- NEXTAUTH_SECRET: Auth.js 密钥
- AWS_ACCESS_KEY_ID: AWS 访问密钥
- AWS_SECRET_ACCESS_KEY: AWS 密钥
- S3_BUCKET_NAME: S3 存储桶名称

4. 数据库迁移
```bash
npx prisma generate
npx prisma migrate dev
```

5. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

## 项目结构
```
/src
  /app                # Next.js 应用路由
    /admin           # 管理面板
    /quotation      # 报价单模块
    /order          # 订单管理
    /invoice        # 发票系统
  /components        # React 组件
  /lib              # 工具库
  /types            # TypeScript 类型定义
  /utils            # 通用工具函数
/prisma             # 数据库模型
/public             # 静态资源
```

## 开发指南

### 代码规范
- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 TypeScript 严格模式

### 分支管理
- main: 生产环境分支
- develop: 开发环境分支
- feature/*: 功能开发分支
- hotfix/*: 紧急修复分支

### 提交规范
使用语义化提交信息：
- feat: 新功能
- fix: 错误修复
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 部署指南

### Vercel 部署
1. 在 Vercel 中导入项目
2. 配置环境变量
3. 选择部署分支
4. 触发部署

### 自托管部署
1. 构建生产版本
```bash
npm run build
```
2. 启动服务
```bash
npm run start
```

## 维护者
- 开发团队 [@team](mailto:team@example.com)

## 许可证
本项目采用 MIT 许可证
