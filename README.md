# LC App - 公司内部协同办公系统

## 项目简介
LC App 是一个现代化的企业内部协同办公系统，集成了智能邮件助手、报价订单生成、发票制作等功能，旨在提高员工的工作效率。

## 技术栈
- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- NextAuth.js
- Headless UI

## 功能特点
- 智能邮件助手（中英文）
- 报价订单自动生成
- 发票制作系统
- 用户认证与授权
- 管理员控制面板

## 本地开发
1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 打开浏览器访问 http://localhost:3000

## 部署
本项目使用Vercel进行部署，直接连接GitHub仓库即可自动部署。

## 环境变量
请在项目根目录创建 `.env.local` 文件，并配置以下环境变量：
```
DATABASE_URL="你的数据库URL"
NEXTAUTH_SECRET="你的NextAuth密钥"
NEXTAUTH_URL="http://localhost:3000"
```

## 贡献指南
1. Fork 本仓库
2. 创建新的功能分支
3. 提交更改
4. 发起 Pull Request

## 许可证
MIT License
