// requestIdleCallback polyfill for better browser compatibility
const safeRequestIdleCallback = (
  callback: () => void, 
  options?: { timeout?: number }
): void => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, options);
  } else {
    // Fallback to setTimeout for unsupported browsers (e.g., Safari)
    setTimeout(callback, options?.timeout ? Math.min(options.timeout, 100) : 50);
  }
};

// 性能监控工具
class PerformanceMonitor {
  private timers: Map<string, number> = new Map();
  private metrics: Map<string, any> = new Map();
  private isMonitoring: boolean = false;

  startTimer(name: string) {
    this.timers.set(name, performance.now());
  }

  endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer ${name} was not started`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(name);
    this.metrics.set(name, duration);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  getPageLoadMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return {};
    
    return {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcp: navigation.connectEnd - navigation.connectStart,
      ttfb: navigation.responseStart - navigation.requestStart,
      download: navigation.responseEnd - navigation.responseStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.fetchStart,
    };
  }

  monitorResourceLoading() {
    // 避免重复监控
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;
          // 只监控真正慢的资源，避免字体等正常资源的误报
          if (resource.duration > 5000) { // 提高到5秒，只监控真正的问题
            console.warn(`🐌 慢资源加载: ${resource.name} (${resource.duration.toFixed(2)}ms)`);
          }
        }
      }
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }

  monitorApiCalls() {
    // 避免重复包装fetch
    if (window.fetch.toString().includes('originalFetch')) return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      let url = '';
      
      // 正确处理不同类型的fetch参数
      if (typeof args[0] === 'string') {
        url = args[0];
      } else if (args[0] instanceof Request) {
        url = args[0].url;
      } else if (args[0] instanceof URL) {
        url = args[0].toString();
      } else {
        url = 'unknown';
      }
      
      try {
        const response = await originalFetch(...args);
        const duration = performance.now() - startTime;
        
        // 过滤Next.js编译请求和只监控真正慢的API调用
        const isNextCompilation = url.includes('_rsc=') || url.includes('/_next/');
        const isRealSlowCall = duration > 5000; // 提高到5秒
        
        if (isRealSlowCall && !isNextCompilation) {
          console.warn(`🐌 慢API调用: ${url} (${duration.toFixed(2)}ms)`);
        } else if (isNextCompilation && duration > 8000) {
          // 只报告超过8秒的编译时间
          console.info(`⏱️ 页面编译耗时: ${url} (${duration.toFixed(2)}ms)`);
        }
        
        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        console.error(`❌ API调用失败: ${url} (${duration.toFixed(2)}ms)`, error);
        throw error;
      }
    };
  }
}

// 性能优化工具
class PerformanceOptimizer {
  private fontPreloaded: boolean = false;

  optimizeFontLoading() {
    // 由于网页使用系统字体 (Arial, Helvetica, sans-serif)
    // NotoSans字体仅用于PDF生成，无需预加载
    // 移除不必要的字体预加载以提升性能
    console.log('🚀 使用系统字体，跳过字体预加载');
  }

  cleanupUnusedResources() {
    // 简化定时器清理逻辑，减少性能开销
    if (typeof window !== 'undefined') {
      const timers = new Set<number>();
      
      // 只在开发环境启用定时器跟踪
      if (process.env.NODE_ENV === 'development') {
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        
        window.setTimeout = ((fn: (...args: any[]) => void, delay: number, ...args: any[]) => {
          const id = originalSetTimeout(fn, delay, ...args);
          timers.add(id);
          return id;
        }) as typeof window.setTimeout;
        
        window.setInterval = ((fn: (...args: any[]) => void, delay: number, ...args: any[]) => {
          const id = originalSetInterval(fn, delay, ...args);
          timers.add(id);
          return id;
        }) as typeof window.setInterval;
        
        // 页面卸载时清理
        window.addEventListener('beforeunload', () => {
          if (timers && timers.size > 0) {
            timers.forEach(id => {
              clearTimeout(id);
              clearInterval(id);
            });
          }
        }, { once: true });
      }
    }
  }

  optimizeImages() {
    // 延迟执行图片优化，避免阻塞主线程
    safeRequestIdleCallback(() => this.setupImageLazyLoading());
  }

  private setupImageLazyLoading() {
    // 懒加载图片
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        if (entries && entries.length > 0) {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
              }
            }
          });
        }
      });
      
      const images = document.querySelectorAll('img[data-src]');
      if (images && images.length > 0) {
        images.forEach(img => {
          imageObserver.observe(img);
        });
      }
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
export const optimizePerformance = new PerformanceOptimizer();
export { safeRequestIdleCallback }; 