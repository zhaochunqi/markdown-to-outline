'use client';

import { ReactNode, useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps): ReactNode {
  const [state, setState] = useState<ErrorBoundaryState>({ hasError: false });

  const resetError = (): void => {
    setState({ hasError: false });
  };

  useEffect(() => {
    const handleError = (event: ErrorEvent): void => {
      console.error('应用错误:', event.error, event.message);
      setState({ hasError: true, error: new Error(event.message) });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent): void => {
      console.error('未处理的Promise拒绝:', event.reason);
      setState({
        hasError: true,
        error: new Error(event.reason?.message || '未处理的Promise错误'),
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (state.hasError) {
    if (fallback) {
      return fallback;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>

            <div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">加载出错</h2>
              <p className="mb-4 text-sm text-gray-600">
                应用加载时遇到问题，这可能是网络连接不稳定导致的
              </p>
            </div>

            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                重新加载
              </button>

              <button
                type="button"
                onClick={resetError}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:text-gray-900"
              >
                继续尝试
              </button>
            </div>

            {state.error && (
              <details className="mt-4 w-full">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                  查看错误详情
                </summary>
                <pre className="mt-2 max-h-32 overflow-auto rounded bg-gray-50 p-3 text-left text-xs">
                  {state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
}
