import { useEffect, useState } from 'react';

export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [needsUpdate, setNeedsUpdate] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let isActive = true;
    let registrationRef: ServiceWorkerRegistration | null = null;
    let updateInterval: ReturnType<typeof setInterval> | null = null;

    const handleUpdateFound = () => {
      const newWorker = registrationRef?.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setNeedsUpdate(true);
          }
        });
      }
    };

    setIsSupported(true);

    // 注册 Service Worker
    navigator.serviceWorker
      .register('/sw.js')
      .then(registration => {
        if (!isActive) {
          return;
        }

        registrationRef = registration;
        setIsRegistered(true);

        // 检查更新
        registration.addEventListener('updatefound', handleUpdateFound);

        // 定期检查更新
        updateInterval = setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000
        ); // 每小时检查一次
      })
      .catch(error => {
        console.warn('Service Worker 注册失败:', error);
      });

    return () => {
      isActive = false;

      if (updateInterval) {
        clearInterval(updateInterval);
      }

      registrationRef?.removeEventListener('updatefound', handleUpdateFound);
    };
  }, []);

  const updateServiceWorker = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      });
    }
  };

  return {
    isSupported,
    isRegistered,
    needsUpdate,
    updateServiceWorker,
  };
}
