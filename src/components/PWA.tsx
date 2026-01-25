'use client';

import { useEffect } from 'react';
import { InstallPrompt } from './InstallPrompt';
import { logger } from '@/lib/utils/logger';

export function PWA() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          logger.info('Service Worker registered successfully', { registration });

          // Check for updates every hour
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);
        })
        .catch((error) => {
          logger.error('Service Worker registration failed', error);
        });
    }
  }, []);

  return <InstallPrompt />;
}
