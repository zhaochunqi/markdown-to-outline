'use client';

import { useEffect, useState } from 'react';

export function ResourcePreloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // 检测关键资源是否加载完成
    if (document.readyState === 'complete') {
      setIsLoading(false);
    } else {
      const handleLoad = () => {
        setIsLoading(false);
      };

      window.addEventListener('load', handleLoad);
      
      // 超时保护：5秒后强制显示内容
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setLoadError(true);
      }, 5000);

      return () => {
        window.removeEventListener('load', handleLoad);
        clearTimeout(timeout);
      };
    }
  }, []);

  // 预加载关键资源
  useEffect(() => {
    // 预连接到可能的外部资源
    const preconnectLinks = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
    ];

    preconnectLinks.forEach((href) => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto">
          <div className="w-full h-full border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">加载中...</p>
          {loadError && (
            <p className="text-xs text-amber-600 mt-2">
              网络较慢，正在努力加载
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
