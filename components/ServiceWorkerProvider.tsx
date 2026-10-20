'use client';

import { useServiceWorker } from '@/hooks/useServiceWorker';
import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export function ServiceWorkerProvider() {
  const { needsUpdate, updateServiceWorker } = useServiceWorker();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  useEffect(() => {
    if (needsUpdate) {
      setShowUpdatePrompt(true);
    }
  }, [needsUpdate]);

  if (!showUpdatePrompt) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-slide-in-bottom">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <RefreshCw className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">新版本可用</p>
            <p className="mt-1 text-xs text-gray-600">发现新版本，刷新页面以获取最新功能</p>
            <div className="mt-3 flex space-x-2">
              <button
                type="button"
                onClick={updateServiceWorker}
                className="rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                立即更新
              </button>
              <button
                type="button"
                onClick={() => setShowUpdatePrompt(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:text-gray-900"
              >
                稍后
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
