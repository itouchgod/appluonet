# LC APP - 企业级文档管理系统

## 项目简介
LC APP 是一个基于 Next.js 开发的企业级文档管理系统，主要用于处理报价单、销售确认单和发票等商业文档的生成和管理。

## 技术栈
- Next.js 15.1.3 (App Router)
- TypeScript 5.x
- Tailwind CSS 3.4.1
- Prisma (ORM)
- PostgreSQL
- Auth.js
- jsPDF

## 开发环境设置

1. 克隆项目
```bash
git clone [repository-url]
cd lc-app
```

2. 安装依赖
```bash
npm install
```

3. 环境变量配置
复制 `.env.example` 到 `.env` 并填写必要的环境变量。

4. 数据库迁移
```bash
npx prisma migrate dev
```

5. 启动开发服务器
```bash
npm run dev
```

## 主要功能
- 报价单生成和管理
- 销售确认单处理
- 发票生成
- 用户认证与权限管理
- PDF 文档生成

## 项目结构
```
/src
  /app
    /admin     # 管理界面
    /tools     # 模块面板
    /quotation # 报价单模块
    /order     # 订单确认模块
    /invoice   # 发票模块
    /page.tsx  # 登录页面
```

## 贡献指南
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证
MIT
