import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  isSlowLoad: boolean;
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    isSlowLoad: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.fetchStart;
        const isSlowLoad = loadTime > 3000; // 超过 3 秒视为慢速加载

        setMetrics({
          loadTime: Math.round(loadTime),
          isSlowLoad,
        });

        // 记录性能指标
        if (isSlowLoad) {
          console.warn(`页面加载较慢: ${Math.round(loadTime)}ms`);
        }
      }
    };

    // 等待页面完全加载
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  return metrics;
}
