// @ts-nocheck
import * as tma from '@telegram-apps/sdk'

// WebApp tipi tanımı
interface WebApp {
  initDataUnsafe?: {
    user?: {
      id?: number;
      language_code?: string;
    }
  };
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
}

let webApp: WebApp | null = null
let isTMAInitialized = false

export async function initializeTMA() {
  // TMA zaten başlatılmışsa tekrar başlatma
  if (isTMAInitialized && webApp) {
    return { webApp }
  }
  
  // TMA SDK'yı başlat
  try {
    // SDK başlatılmış mı kontrol et
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      // Zaten mevcut WebApp'i kullan
      webApp = window.Telegram.WebApp
      isTMAInitialized = true
      console.log('TMA is ready (using existing WebApp)')
      
      // Tema renklerini ayarla
      if (webApp) {
        const themeParams = webApp.themeParams || {}
        document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color || '#000000')
        document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color || '#ffffff')
        document.documentElement.style.setProperty('--tg-theme-hint-color', themeParams.hint_color || '#999999')
        document.documentElement.style.setProperty('--tg-theme-link-color', themeParams.link_color || '#2481cc')
        document.documentElement.style.setProperty('--tg-theme-button-color', themeParams.button_color || '#2481cc')
        document.documentElement.style.setProperty('--tg-theme-button-text-color', themeParams.button_text_color || '#ffffff')
      }
      
      return { webApp }
    }
    
    console.warn('WebApp is not available, using test mode')
    
    // Test modunda uygulamanın çalışmasına izin ver
    console.log('Running in browser test mode - not inside Telegram')
    isTMAInitialized = false
    
    // Varsayılan tema değerlerini ayarla - tarayıcıda test etmek için
    document.documentElement.style.setProperty('--tg-theme-bg-color', '#000000')
    document.documentElement.style.setProperty('--tg-theme-text-color', '#ffffff')
    document.documentElement.style.setProperty('--tg-theme-hint-color', '#999999')
    document.documentElement.style.setProperty('--tg-theme-link-color', '#2481cc')
    document.documentElement.style.setProperty('--tg-theme-button-color', '#2481cc')
    document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff')
    
    // Uygulamanın test modunda çalışmasına izin ver
    return { 
      webApp: null, 
      isTestMode: true
    }
  } catch (error) {
    console.error('Failed to initialize TMA', error)
    
    // Hata durumunda varsayılan tema değerlerini kullanmaya devam et
    document.documentElement.style.setProperty('--tg-theme-bg-color', '#000000')
    document.documentElement.style.setProperty('--tg-theme-text-color', '#ffffff')
    document.documentElement.style.setProperty('--tg-theme-hint-color', '#999999')
    document.documentElement.style.setProperty('--tg-theme-link-color', '#2481cc')
    document.documentElement.style.setProperty('--tg-theme-button-color', '#2481cc')
    document.documentElement.style.setProperty('--tg-theme-button-text-color', '#ffffff')
    
    // Test moduna geç
    isTMAInitialized = false
    return { 
      webApp: null, 
      isTestMode: true,
      error
    }
  }
}

export function isTelegramWebApp() {
  return isTMAInitialized && webApp !== null
}

export function getUserId() {
  // TMA başlatılmadıysa veya user bilgisi yoksa
  if (!isTMAInitialized || !webApp?.initDataUnsafe?.user?.id) {
    console.warn('TMA not initialized or user ID not available')
    return null
  }
  
  return webApp.initDataUnsafe.user.id
}

export function getLanguageCode() {
  // TMA başlatılmadıysa veya dil bilgisi yoksa varsayılan olarak 'en' döndür
  if (!isTMAInitialized || !webApp?.initDataUnsafe?.user?.language_code) {
    console.warn('TMA not initialized or language code not available, using default: en')
    return 'en'
  }
  
  return webApp.initDataUnsafe.user.language_code
}