'use client';

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-10 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-300"></div>
              <div>
                <div className="mb-2 h-6 w-48 animate-pulse rounded bg-gray-300"></div>
                <div className="h-4 w-64 animate-pulse rounded bg-gray-200"></div>
              </div>
            </div>
            <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-300"></div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="mx-auto max-w-7xl p-6">
        <div className="grid h-[calc(100vh-140px)] grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Panel Skeleton */}
          <div className="overflow-hidden rounded-xl border border-gray-200/50 bg-white shadow-sm">
            <EditorSkeleton />
          </div>

          {/* Right Panel Skeleton */}
          <div className="overflow-hidden rounded-xl border border-gray-200/50 bg-white shadow-sm">
            <EditorSkeleton />
          </div>
        </div>
      </main>
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-4">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-gray-300"></div>
          <div className="h-5 w-24 rounded bg-gray-300"></div>
          <div className="h-5 w-20 rounded-full bg-gray-200"></div>
        </div>
        <div className="h-8 w-20 rounded bg-gray-300"></div>
      </div>

      <div className="flex-1 space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        <div className="h-4 w-full rounded bg-gray-200"></div>
        <div className="h-4 w-5/6 rounded bg-gray-200"></div>
        <div className="h-4 w-2/3 rounded bg-gray-200"></div>
        <div className="h-4 w-4/5 rounded bg-gray-200"></div>
        <div className="h-4 w-full rounded bg-gray-200"></div>
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}
