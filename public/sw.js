// Service Worker for offline support
const CACHE_VERSION = 'v1';
const CACHE_NAME = `markdown-logseq-converter-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `runtime-${CACHE_VERSION}`;

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// 缓存策略配置
const CACHE_STRATEGIES = {
  // 静态资源：缓存优先，后台更新
  static: ['/_next/static/', '/static/'],
  // HTML：网络优先，失败时使用缓存
  html: ['/'],
  // 图片：缓存优先
  images: ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'],
};

// 安装事件 - 预缓存关键资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('预缓存失败，但不影响功能:', err);
      });
    })
  );
  self.skipWaiting();
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, STATIC_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => {
            console.log('删除旧缓存:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// 监听消息 - 支持手动更新
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 判断资源类型
function getResourceType(url) {
  const pathname = url.pathname;
  
  // 静态资源
  if (CACHE_STRATEGIES.static.some(path => pathname.includes(path))) {
    return 'static';
  }
  
  // 图片
  if (CACHE_STRATEGIES.images.some(ext => pathname.endsWith(ext))) {
    return 'image';
  }
  
  // HTML
  if (pathname === '/' || pathname.endsWith('.html')) {
    return 'html';
  }
  
  return 'other';
}

// 请求拦截 - 根据资源类型使用不同策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源请求和 GET 请求
  if (url.origin !== location.origin || request.method !== 'GET') {
    return;
  }

  const resourceType = getResourceType(url);

  // HTML：网络优先，失败时使用缓存
  if (resourceType === 'html') {
    event.respondWith(
      fetch(request, { 
        cache: 'no-cache' // 弱网优化：避免浏览器缓存导致的延迟
      })
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response(
              '<html><body><h1>离线状态</h1><p>请检查网络连接后刷新页面</p></body></html>',
              {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'text/html' },
              }
            );
          });
        })
    );
    return;
  }

  // 静态资源和图片：缓存优先，后台更新
  if (resourceType === 'static' || resourceType === 'image') {
    event.respondWith(
      caches.match(request).then((cached) => {
        // 后台更新策略
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        }).catch(() => null);

        // 如果有缓存，立即返回；否则等待网络
        return cached || fetchPromise || new Response('资源加载失败', {
          status: 404,
          statusText: 'Not Found',
        });
      })
    );
    return;
  }

  // 其他资源：网络优先
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
