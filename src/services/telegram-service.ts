/**
 * @deprecated Bu dosya eski sürüm entegrasyonu içindir.
 * Lütfen bunun yerine tma-service.ts dosyasını kullanın.
 */

// WebApp tipi
export interface WebApp {
  ready?: () => void;
  initDataUnsafe?: {
    user?: {
      id?: number;
      language_code?: string;
    }
  };
}

// Global tip tanımı
declare global {
  interface Window {
    Telegram?: {
      WebApp?: WebApp;
    };
  }
}

// Telegram WebApp referansı
let webApp: WebApp | null = null;

/**
 * @deprecated initializeTMA kullan
 */
export async function initTelegramWebApp() {
  // Telegram WebApp API'si yüklü mü kontrol et
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    webApp = window.Telegram.WebApp;
    // WebApp hazır olduğunu bildir
    if (webApp && webApp.ready) {
      webApp.ready();
    }
    return webApp;
  }
  
  console.warn('Telegram WebApp API not available');
  return null;
}

/**
 * @deprecated getUserId kullan
 */
export function getUserId() {
  if (!webApp?.initDataUnsafe?.user?.id) {
    return null;
  }
  return webApp.initDataUnsafe.user.id;
}

/**
 * @deprecated getLanguageCode kullan
 */
export function getLanguageCode() {
  return webApp?.initDataUnsafe?.user?.language_code || 'en';
}