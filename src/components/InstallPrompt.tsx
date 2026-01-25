'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { logger } from "@/lib/utils/logger";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after 30 seconds of usage
      setTimeout(() => {
        const hasSeenPrompt = localStorage.getItem('pwa-install-dismissed');
        if (!hasSeenPrompt) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    logger.info(`PWA install prompt user response: ${outcome}`);
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-card border rounded-lg shadow-lg p-4 z-50">
      <button
        onClick={handleDismiss}
        className="absolute top-2 end-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <img src="/icons/icon-72x72.png" alt="הדרך" className="w-12 h-12 rounded-lg" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold mb-1">התקן את הדרך</h3>
          <p className="text-sm text-muted-foreground mb-3">
            קבל גישה מהירה לפלטפורמה ישירות מהמסך הראשי
          </p>
          <Button onClick={handleInstall} className="w-full">
            התקן עכשיו
          </Button>
        </div>
      </div>
    </div>
  );
}
