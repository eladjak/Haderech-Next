"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";

// VAPID public key - יש לשנות למפתח האמיתי לפני production
// לייצור: npx web-push generate-vapid-keys
const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ??
  "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

function urlBase64ToArrayBuffer(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

export type PushPermission = "default" | "granted" | "denied";

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: PushPermission;
  isLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  sendTestNotification: () => void;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<PushPermission>("default");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSubscription, setCurrentSubscription] =
    useState<PushSubscription | null>(null);

  const saveSubscription = useMutation(api.pushNotifications.saveSubscription);
  const removeSubscription = useMutation(
    api.pushNotifications.removeSubscription
  );

  // בדוק תמיכה בדפדפן
  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission as PushPermission);
    }
  }, []);

  // בדוק subscription קיים
  useEffect(() => {
    if (!isSupported) return;

    const checkExisting = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setCurrentSubscription(subscription);
          setIsSubscribed(true);
        }
      } catch {
        // אין service worker רשום עדיין - זה תקין
      }
    };

    void checkExisting();
  }, [isSupported]);

  // הרשמה לקבלת push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) return;

    setIsLoading(true);
    try {
      // בקש הרשאה
      const result = await Notification.requestPermission();
      setPermission(result as PushPermission);

      if (result !== "granted") {
        return;
      }

      // ודא שה-service worker רשום
      let registration = await navigator.serviceWorker.getRegistration("/sw.js");
      if (!registration) {
        registration = await navigator.serviceWorker.register("/sw.js");
      }
      await navigator.serviceWorker.ready;

      // בטל subscription ישן אם קיים
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
      }

      // צור subscription חדש
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(VAPID_PUBLIC_KEY),
      });

      const subJson = subscription.toJSON();

      // שמור ב-Convex
      await saveSubscription({
        endpoint: subscription.endpoint,
        p256dh: (subJson.keys?.p256dh) ?? "",
        auth: (subJson.keys?.auth) ?? "",
        userAgent: navigator.userAgent,
      });

      setCurrentSubscription(subscription);
      setIsSubscribed(true);
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, saveSubscription]);

  // ביטול הרשמה
  const unsubscribe = useCallback(async () => {
    if (!currentSubscription) return;

    setIsLoading(true);
    try {
      // הסר מ-Convex
      await removeSubscription({ endpoint: currentSubscription.endpoint });

      // בטל ב-browser
      await currentSubscription.unsubscribe();

      setCurrentSubscription(null);
      setIsSubscribed(false);
    } catch (error) {
      console.error("Failed to unsubscribe from push notifications:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [currentSubscription, removeSubscription]);

  // שלח notification מקומי לבדיקה
  const sendTestNotification = useCallback(() => {
    if (permission !== "granted") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((reg) => {
          void reg.showNotification("הדרך נקסט - בדיקת התראה", {
            body: "ההתראות עובדות! תקבלו עדכונים על שיעורים ותוכן חדש.",
            icon: "/images/haderech-icon.jpg",
            badge: "/images/haderech-icon.jpg",
            tag: "test-notification",
            data: { url: "/dashboard" },
          });
        })
        .catch(console.error);
    } else if (Notification.permission === "granted") {
      new Notification("הדרך נקסט - בדיקת התראה", {
        body: "ההתראות עובדות! תקבלו עדכונים על שיעורים ותוכן חדש.",
        icon: "/images/haderech-icon.jpg",
      });
    }
  }, [permission]);

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}
