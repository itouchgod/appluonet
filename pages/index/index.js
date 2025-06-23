const app = getApp()

Page({
  data: {
    userInfo: null,
    stats: {
      quotationCount: 0,
      invoiceCount: 0,
      purchaseCount: 0,
      totalAmount: '¥0'
    },
    recentItems: []
  },

  onLoad() {
    console.log('首页加载')
    this.loadUserInfo()
    this.loadStats()
    this.loadRecentItems()
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadStats()
    this.loadRecentItems()
  },

  onPullDownRefresh() {
    // 下拉刷新
    this.loadStats()
    this.loadRecentItems()
    wx.stopPullDownRefresh()
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      })
    }
  },

  // 加载统计数据
  loadStats() {
    app.showLoading('加载统计数据...')
    
    // 获取本地存储的统计数据
    const quotationHistory = wx.getStorageSync('quotationHistory') || []
    const invoiceHistory = wx.getStorageSync('invoiceHistory') || []
    const purchaseHistory = wx.getStorageSync('purchaseHistory') || []
    
    // 计算总金额
    let totalAmount = 0
    quotationHistory.forEach(item => {
      if (item.totalAmount) {
        totalAmount += parseFloat(item.totalAmount.replace(/[^\d.-]/g, '')) || 0
      }
    })
    invoiceHistory.forEach(item => {
      if (item.totalAmount) {
        totalAmount += parseFloat(item.totalAmount.replace(/[^\d.-]/g, '')) || 0
      }
    })
    purchaseHistory.forEach(item => {
      if (item.totalAmount) {
        totalAmount += parseFloat(item.totalAmount.replace(/[^\d.-]/g, '')) || 0
      }
    })

    this.setData({
      stats: {
        quotationCount: quotationHistory.length,
        invoiceCount: invoiceHistory.length,
        purchaseCount: purchaseHistory.length,
        totalAmount: `¥${totalAmount.toFixed(2)}`
      }
    })
    
    app.hideLoading()
  },

  // 加载最近记录
  loadRecentItems() {
    const quotationHistory = wx.getStorageSync('quotationHistory') || []
    const invoiceHistory = wx.getStorageSync('invoiceHistory') || []
    const purchaseHistory = wx.getStorageSync('purchaseHistory') || []
    
    // 合并所有记录并按时间排序
    let allItems = []
    
    quotationHistory.forEach(item => {
      allItems.push({
        ...item,
        type: '报价单',
        typeColor: 'primary'
      })
    })
    
    invoiceHistory.forEach(item => {
      allItems.push({
        ...item,
        type: '发票',
        typeColor: 'secondary'
      })
    })
    
    purchaseHistory.forEach(item => {
      allItems.push({
        ...item,
        type: '采购单',
        typeColor: 'danger'
      })
    })
    
    // 按时间排序，取最近10条
    allItems.sort((a, b) => new Date(b.date) - new Date(a.date))
    allItems = allItems.slice(0, 10)
    
    this.setData({
      recentItems: allItems
    })
  },

  // 导航到报价单页面
  navigateToQuotation() {
    wx.navigateTo({
      url: '/pages/quotation/index'
    })
  },

  // 导航到发票页面
  navigateToInvoice() {
    wx.navigateTo({
      url: '/pages/invoice/index'
    })
  },

  // 导航到采购页面
  navigateToPurchase() {
    wx.navigateTo({
      url: '/pages/purchase/index'
    })
  },

  // 导航到邮件页面
  navigateToMail() {
    wx.navigateTo({
      url: '/pages/mail/index'
    })
  },

  // 导航到工具页面
  navigateToTools() {
    wx.navigateTo({
      url: '/pages/tools/index'
    })
  },

  // 导航到管理页面
  navigateToAdmin() {
    wx.navigateTo({
      url: '/pages/admin/index'
    })
  },

  // 查看所有历史记录
  viewAllHistory() {
    wx.showActionSheet({
      itemList: ['报价单历史', '发票历史', '采购单历史'],
      success: (res) => {
        const urls = [
          '/pages/quotation/history',
          '/pages/invoice/history',
          '/pages/purchase/history'
        ]
        wx.navigateTo({
          url: urls[res.tapIndex]
        })
      }
    })
  },

  // 查看具体项目
  viewItem(e) {
    const item = e.currentTarget.dataset.item
    let url = ''
    
    switch (item.type) {
      case '报价单':
        url = `/pages/quotation/edit?id=${item.id}`
        break
      case '发票':
        url = `/pages/invoice/edit?id=${item.id}`
        break
      case '采购单':
        url = `/pages/purchase/edit?id=${item.id}`
        break
    }
    
    if (url) {
      wx.navigateTo({
        url: url
      })
    }
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: 'LC商业文档管理系统',
      path: '/pages/index/index',
      imageUrl: '/images/share-image.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'LC商业文档管理系统',
      imageUrl: '/images/share-image.png'
    }
  }
}) 