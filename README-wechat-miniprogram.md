# LC商业文档管理系统 - 微信小程序版

这是一个基于微信小程序开发的商业文档管理系统，提供报价单、发票、采购单等商业文档的创建、管理和生成功能。

## 功能特性

### 1. 报价单管理
- 创建和编辑客户报价单
- 支持多商品明细管理
- 自动计算小计和总计
- 支持其他费用添加
- 生成专业PDF报价单

### 2. 发票管理
- 生成销售发票
- 支持多种发票类型
- 自动计算税额
- 生成标准发票格式

### 3. 采购订单管理
- 创建供应商采购订单
- 管理采购商品明细
- 支持供应商信息管理
- 生成采购订单PDF

### 4. AI邮件助手
- 智能生成商务邮件
- 支持中英文双语
- 多种邮件风格可选
- 快速邮件回复建议

### 5. 实用工具
- 日期计算工具
- 格式转换工具
- 常用商务工具

### 6. 用户管理
- 微信授权登录
- 用户权限管理
- 管理员后台

## 技术架构

### 前端技术栈
- **框架**: 微信小程序原生开发
- **样式**: WXSS (类似CSS)
- **逻辑**: JavaScript ES6+
- **数据存储**: 微信小程序本地存储 + 云数据库

### 后端技术栈
- **API服务**: Node.js + Express
- **数据库**: PostgreSQL
- **认证**: 微信小程序登录 + JWT
- **文件存储**: 微信云存储

## 项目结构

```
wechat-miniprogram/
├── app.js                 # 小程序入口文件
├── app.json              # 小程序配置文件
├── app.wxss              # 全局样式文件
├── project.config.json   # 项目配置文件
├── pages/                # 页面目录
│   ├── index/           # 首页
│   ├── quotation/       # 报价单相关页面
│   ├── invoice/         # 发票相关页面
│   ├── purchase/        # 采购相关页面
│   ├── mail/            # 邮件助手页面
│   ├── tools/           # 工具页面
│   ├── profile/         # 个人中心页面
│   └── admin/           # 管理页面
├── components/          # 自定义组件
├── utils/              # 工具函数
├── images/             # 图片资源
└── styles/             # 样式文件
```

## 开发环境设置

### 1. 安装微信开发者工具
下载并安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

### 2. 获取小程序AppID
- 登录 [微信公众平台](https://mp.weixin.qq.com/)
- 创建小程序应用
- 获取AppID并配置到 `project.config.json`

### 3. 配置后端API
- 部署后端API服务
- 在 `app.js` 中配置 `baseUrl` 为你的API地址

### 4. 导入项目
- 打开微信开发者工具
- 导入项目目录
- 配置AppID

### 5. 开发调试
```bash
# 在微信开发者工具中
# 1. 点击编译
# 2. 在模拟器中预览
# 3. 真机调试
```

## 部署发布

### 1. 代码审核
- 在微信开发者工具中点击"上传"
- 填写版本号和项目备注
- 提交审核

### 2. 发布上线
- 审核通过后，在微信公众平台发布
- 用户可在微信中搜索使用

## 核心功能实现

### 1. 数据存储
```javascript
// 本地存储
wx.setStorageSync('quotationHistory', data)
wx.getStorageSync('quotationHistory')

// 云数据库
wx.cloud.database().collection('quotations').add({
  data: quotationData
})
```

### 2. 网络请求
```javascript
// 封装请求方法
app.request({
  url: '/api/quotations',
  method: 'POST',
  data: formData
})
```

### 3. PDF生成
```javascript
// 调用后端API生成PDF
wx.request({
  url: `${app.globalData.baseUrl}/generate/quotation`,
  method: 'POST',
  data: quotationData,
  success: (res) => {
    // 下载PDF文件
    wx.downloadFile({
      url: res.data.pdfUrl,
      success: (downloadRes) => {
        wx.openDocument({
          filePath: downloadRes.tempFilePath
        })
      }
    })
  }
})
```

## 权限配置

### 1. 用户信息权限
在 `app.json` 中配置：
```json
{
  "permission": {
    "scope.userInfo": {
      "desc": "用于完善用户资料"
    }
  }
}
```

### 2. 网络请求权限
确保后端API支持HTTPS，并在微信公众平台配置合法域名。

## 性能优化

### 1. 图片优化
- 使用CDN加速图片加载
- 压缩图片文件大小
- 使用webp格式

### 2. 代码优化
- 减少不必要的网络请求
- 使用本地缓存
- 优化页面渲染性能

### 3. 数据优化
- 分页加载大量数据
- 使用虚拟列表
- 合理使用本地存储

## 常见问题

### 1. 登录失败
- 检查AppID配置
- 确认后端API正常运行
- 检查网络连接

### 2. PDF生成失败
- 确认后端PDF服务正常
- 检查数据格式是否正确
- 查看网络请求日志

### 3. 数据同步问题
- 检查本地存储空间
- 确认云数据库连接
- 验证数据格式

## 更新日志

### V1.0.0 (2024-01-04)
- 初始版本发布
- 支持报价单、发票、采购单管理
- 集成AI邮件助手
- 实现微信登录认证

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 创建 Pull Request

## 许可证

[MIT License](LICENSE)

## 联系方式

- 项目地址: [GitHub Repository]
- 问题反馈: [Issues]
- 技术支持: [Support Email]

---

**注意**: 使用前请确保已获得微信小程序相关权限，并遵守微信小程序开发规范。 