// app.js
App({
  globalData: {
    userInfo: null,
    baseUrl: 'https://your-api-domain.com/api', // 替换为你的API域名
    token: null,
    theme: 'light'
  },

  onLaunch() {
    console.log('小程序启动')
    
    // 检查登录状态
    this.checkLoginStatus()
    
    // 获取系统信息
    this.getSystemInfo()
    
    // 检查更新
    this.checkUpdate()
  },

  onShow() {
    console.log('小程序显示')
  },

  onHide() {
    console.log('小程序隐藏')
  },

  onError(msg) {
    console.error('小程序错误:', msg)
  },

  // 检查登录状态
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.globalData.token = token
      this.getUserInfo()
    }
  },

  // 获取用户信息
  getUserInfo() {
    if (!this.globalData.token) return
    
    wx.request({
      url: `${this.globalData.baseUrl}/users/me`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${this.globalData.token}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.globalData.userInfo = res.data
        }
      },
      fail: (err) => {
        console.error('获取用户信息失败:', err)
        // 清除无效token
        wx.removeStorageSync('token')
        this.globalData.token = null
      }
    })
  },

  // 获取系统信息
  getSystemInfo() {
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.systemInfo = res
        console.log('系统信息:', res)
      }
    })
  },

  // 检查更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      
      updateManager.onCheckForUpdate((res) => {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (res) => {
                if (res.confirm) {
                  updateManager.applyUpdate()
                }
              }
            })
          })
          
          updateManager.onUpdateFailed(() => {
            wx.showModal({
              title: '更新失败',
              content: '新版本下载失败，请检查网络后重试',
              showCancel: false
            })
          })
        }
      })
    }
  },

  // 登录方法
  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 发送 res.code 到后台换取 openId, sessionKey, unionId
            wx.request({
              url: `${this.globalData.baseUrl}/auth/wechat`,
              method: 'POST',
              data: {
                code: res.code
              },
              success: (loginRes) => {
                if (loginRes.statusCode === 200) {
                  const { token, user } = loginRes.data
                  this.globalData.token = token
                  this.globalData.userInfo = user
                  wx.setStorageSync('token', token)
                  resolve(loginRes.data)
                } else {
                  reject(loginRes.data)
                }
              },
              fail: reject
            })
          } else {
            reject(new Error('登录失败'))
          }
        },
        fail: reject
      })
    })
  },

  // 网络请求封装
  request(options) {
    return new Promise((resolve, reject) => {
      const token = this.globalData.token
      
      wx.request({
        url: options.url.startsWith('http') ? options.url : `${this.globalData.baseUrl}${options.url}`,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            // token过期，重新登录
            this.login().then(() => {
              // 重新发起请求
              this.request(options).then(resolve).catch(reject)
            }).catch(reject)
          } else {
            reject(res)
          }
        },
        fail: reject
      })
    })
  },

  // 显示提示
  showToast(title, icon = 'none') {
    wx.showToast({
      title,
      icon,
      duration: 2000
    })
  },

  // 显示加载
  showLoading(title = '加载中...') {
    wx.showLoading({
      title,
      mask: true
    })
  },

  // 隐藏加载
  hideLoading() {
    wx.hideLoading()
  },

  // 显示确认对话框
  showModal(options) {
    return new Promise((resolve) => {
      wx.showModal({
        title: options.title || '提示',
        content: options.content || '',
        showCancel: options.showCancel !== false,
        cancelText: options.cancelText || '取消',
        confirmText: options.confirmText || '确定',
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })
  }
}) 