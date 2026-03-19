import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(eventName: string, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") return;

  const analyticsDebug = import.meta.env.VITE_ANALYTICS_DEBUG === "true";

  if (analyticsDebug) {
    console.info("[analytics]", eventName, payload);
  }

  const globalWindow = window as Window & {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };

  if (typeof globalWindow.gtag === "function") {
    globalWindow.gtag("event", eventName, payload);
    return;
  }

  if (Array.isArray(globalWindow.dataLayer)) {
    globalWindow.dataLayer.push({ event: eventName, ...payload });
    return;
  }

  if (analyticsDebug) {
    console.warn("[analytics] No gtag or dataLayer found for event:", eventName);
  }
}
