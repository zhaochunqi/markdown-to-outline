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
    <div className="fixed bottom-6 right-6 z-50 max-w-sm animate-in slide-in-from-bottom-4">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">新版本可用</p>
            <p className="text-xs text-gray-600 mt-1">
              发现新版本，刷新页面以获取最新功能
            </p>
            <div className="mt-3 flex space-x-2">
              <button
                type="button"
                onClick={updateServiceWorker}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                立即更新
              </button>
              <button
                type="button"
                onClick={() => setShowUpdatePrompt(false)}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
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
