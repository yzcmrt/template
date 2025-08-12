// TonConnectUI importunu kaldırıp açıklayıcı bir yorum ekleyelim
// TonConnectUI doğrudan import edilmiyor, bunun yerine global değişken üzerinden erişilecek
// TonConnectUIProvider App.tsx içinde kullanılıyor, bu servis sadece global değişkenlere erişim sağlıyor

// Tip tanımları
declare global {
  interface Window {
    ethereum?: any;
    _originalEthereum?: any;
    _tonModeActive?: boolean;
    __TON_MODE_ACTIVE?: boolean;
    __TON_WALLET_INITIALIZED?: boolean;
    // TonConnect global değişkenleri (index.html ile uyumlu isimler)
    __TON_CONNECTION_STATUS__?: string;
    __TON_WALLET_ADDRESS?: string;
    __TON_CONNECT_UI_OPEN_MODAL?: () => void;
    __TON_CONNECT_UI_SEND_TRANSACTION?: (txn: any) => Promise<any>;
  }
}

// TON cüzdan adresi (Vite env üzerinden alınır, yoksa varsayılan kullanılır)
const envWalletAddress = typeof import.meta !== 'undefined'
  ? (import.meta as any).env?.VITE_TON_WALLET_ADDRESS
  : undefined;
export const WALLET_ADDRESS = envWalletAddress || 'UQCo-_sf6z8mlUdspm1LG6CoZj85QDuiuig7nXQTD0DZmXwF'

// TonConnect manifest URL'i (Vite env üzerinden alınır, yoksa varsayılan kullanılır)
const envManifestUrl = typeof import.meta !== 'undefined'
  ? (import.meta as any).env?.VITE_TON_MANIFEST_URL
  : undefined;
export const manifestUrl = envManifestUrl || 'https://ton-mining-app.vercel.app/tonconnect-manifest.json'

// Son işlemler geçmişi
let transactionHistory: PaymentTransaction[] = []

// Ödeme işlemi tipi
export interface PaymentTransaction {
  id: string;
  amount: number; 
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  reason?: string;
  productInfo?: {
    name: string;
    description?: string;
    productId: string;
  }
}

// Ethereum property çakışmasını önle
if (typeof window !== 'undefined') {
  try {
    // Ethereum'u kontrol etmeye çalışırken hata oluşmaması için
    // daha güvenli bir yaklaşım uygulayalım
    console.log('TON mode activated, checking for possible conflicts...')
  } catch (error) {
    console.warn('Ethereum detection error:', error)
  }
}

// Global değişkenden TonConnect özelliklerine erişim sağlayacağız
// App.tsx içinde TonConnectUIProvider zaten bu değişkenleri sağlıyor
export function isWalletConnected() {
  // Bağlantı durumunu global window özelliğinden kontrol et
  try {
    // @ts-ignore - window.__TON_CONNECTION_STATUS__ özelliği kontrol edilir
    if (typeof window !== 'undefined' && window.__TON_CONNECTION_STATUS__) {
      // @ts-ignore
      return window.__TON_CONNECTION_STATUS__ === 'connected';
    }
    return false;
  } catch (error) {
    console.warn('Wallet connection status check error:', error);
    return false;
  }
}

// Cüzdan bağlantısını başlat - TC-UI-R tarafından sağlanan fonksiyonları kullan
export function connectWallet() {
  try {
    // @ts-ignore - TC-UI-R tarafından sağlanan global fonksiyonu kullan
    if (typeof window !== 'undefined' && window.__TON_CONNECT_UI_OPEN_MODAL) {
      // @ts-ignore
      window.__TON_CONNECT_UI_OPEN_MODAL();
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Connect wallet error:', error);
    return false;
  }
}

// Cüzdan adresini al
export function getWalletAddress() {
  try {
    // @ts-ignore - TC-UI-R tarafından sağlanan global değişkeni kullan
    if (typeof window !== 'undefined' && window.__TON_WALLET_ADDRESS) {
      // @ts-ignore
      return window.__TON_WALLET_ADDRESS;
    }
    return null;
  } catch (error) {
    console.warn('Get wallet address error:', error);
    return null;
  }
}

// Ödeme onaylama ekranını göster
export function confirmPayment(
  amount: number, 
  productInfo: { name: string; description?: string; productId: string }
): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)
    
    // Kullanıcıya onay ekranı göster
    if (confirm(`"${productInfo.name}" için ${amount} TON ödeme yapmak istediğinizden emin misiniz?`)) {
      return resolve(true)
    }
    
    return resolve(false)
  })
}

// İşlem durumunu takip et
export function trackTransaction(transaction: PaymentTransaction) {
  // İşlemi geçmişe ekle
  transactionHistory.push(transaction)
  
  // LocalStorage'a kaydet (opsiyonel)
  try {
    const storageKey = 'ton_transactions'
    if (typeof window !== 'undefined' && window.localStorage) {
      const existingData = window.localStorage.getItem(storageKey)
      const transactions = existingData ? JSON.parse(existingData) : []
      transactions.push(transaction)
      window.localStorage.setItem(storageKey, JSON.stringify(transactions))
    }
  } catch (error) {
    console.warn('Transaction save error:', error)
  }
  
  return transaction.id
}

// İşlem geçmişini getir
export function getTransactionHistory(): PaymentTransaction[] {
  return [...transactionHistory]
}

// Ödeme işlemini gerçekleştir
export async function makePayment(amount: number, productInfo?: PaymentTransaction['productInfo']) {
  // Cüzdan bağlı değilse bağlamayı dene
  if (!isWalletConnected()) {
    connectWallet()
    // Cüzdan bağlantısı için biraz bekle
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // İşlem başlatma log'u
    logTonTransaction({
      type: 'connect_wallet_attempt',
      timestamp: Date.now()
    });
    
    // Hala bağlantı yoksa işlemi iptal et
    if (!isWalletConnected()) {
      return {
        success: false,
        error: 'Cüzdan bağlantısı kurulamadı'
      }
    }
  }
  
  // Eğer ürün bilgisi varsa, ödemeyi onaylamasını iste
  if (productInfo) {
    const isConfirmed = await confirmPayment(amount, productInfo)
    
    // Onay log'u
    logTonTransaction({
      type: 'payment_confirmation',
      confirmed: isConfirmed,
      amount,
      productInfo,
      timestamp: Date.now()
    });
    
    if (!isConfirmed) {
      return {
        success: false,
        error: 'Kullanıcı ödemeyi iptal etti'
      }
    }
  }
  
  const transactionId = Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9)
  
  // İşlemi başlatıldı olarak işle
  const transaction: PaymentTransaction = {
    id: transactionId,
    amount,
    timestamp: Date.now(),
    status: 'pending',
    productInfo
  }
  
  // İşlemi takip etmeye başla
  trackTransaction(transaction)
  
  try {
    enableTonMode();
    
    // İşlem objesi
    const txn = {
      validUntil: Math.floor(Date.now() / 1000) + 360, // 5 dakika geçerli
      messages: [
        {
          address: WALLET_ADDRESS,
          amount: (amount * 1000000000).toString(), // TON birimine çevir (1 TON = 10^9 nanogram)
        }
      ]
    }
    
    // İşlem başlatma log'u
    logTonTransaction({
      type: 'transaction_started',
      transactionId,
      txn,
      timestamp: Date.now()
    });
    
    // @ts-ignore - TC-UI-R'nin sendTransaction fonksiyonunu kullan
    if (typeof window === 'undefined' || !window.__TON_CONNECT_UI_SEND_TRANSACTION) {
      console.error('TonConnectUI is not initialized');
      updateTransaction(transactionId, 'failed', null, 'TonConnectUI not initialized');
      return { success: false, message: 'Wallet service is not available' };
    }
    
    // @ts-ignore
    const result = await window.__TON_CONNECT_UI_SEND_TRANSACTION(txn);
    
    // İşlem sonuç log'u
    logTonTransaction({
      type: 'transaction_result',
      transactionId,
      result,
      timestamp: Date.now()
    });
    
    // İşlemi güncelle
    if (result) {
      // İşlem başarılı
      updateTransaction(transactionId, 'completed', result);
      return { success: true, transactionId };
    } else {
      // İşlem başarısız veya iptal edildi
      updateTransaction(transactionId, 'failed', null, 'Transaction was cancelled or failed');
      return { success: false, message: 'Transaction was cancelled or failed' };
    }
    
  } catch (error) {
    // Hata log'u
    logTonTransaction({
      type: 'transaction_error',
      transactionId,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    });
    
    console.error('Payment error:', error);
    updateTransaction(transactionId, 'failed', null, error instanceof Error ? error.message : 'Unknown error');
    return { success: false, message: error instanceof Error ? error.message : 'Payment failed' };
  } finally {
    disableTonMode();
  }
}

// İşlemi güncelle (genişletilmiş versiyon)
function updateTransaction(
  transactionIdOrObject: string | PaymentTransaction,
  status?: 'pending' | 'completed' | 'failed',
  result?: any,
  reason?: string
) {
  let transaction: PaymentTransaction;
  
  // İlk parametre obje mi yoksa id mi kontrol et
  if (typeof transactionIdOrObject === 'string') {
    // ID verilmiş, önce işlemi bul
    const existingTransaction = transactionHistory.find(t => t.id === transactionIdOrObject);
    
    if (!existingTransaction) {
      console.error(`Transaction with ID ${transactionIdOrObject} not found`);
      return;
    }
    
    // Mevcut işlemi güncelle
    transaction = existingTransaction;
    
    // Parametrelerle güncelle
    if (status) transaction.status = status;
    if (result) transaction.transactionId = result.boc || result;
    if (reason) transaction.reason = reason;
  } else {
    // Doğrudan işlem objesi verilmiş
    transaction = transactionIdOrObject;
  }
  
  // İşlemi güncelle
  const index = transactionHistory.findIndex(t => t.id === transaction.id);
  if (index >= 0) {
    transactionHistory[index] = transaction;
    
    // LocalStorage'ı da güncelle (opsiyonel)
    try {
      const storageKey = 'ton_transactions';
      if (typeof window !== 'undefined' && window.localStorage) {
        const existingData = window.localStorage.getItem(storageKey);
        const transactions = existingData ? JSON.parse(existingData) : [];
        const storageIndex = transactions.findIndex((t: any) => t.id === transaction.id);
        
        if (storageIndex >= 0) {
          transactions[storageIndex] = transaction;
        } else {
          transactions.push(transaction);
        }
        
        window.localStorage.setItem(storageKey, JSON.stringify(transactions));
      }
    } catch (error) {
      console.warn('Transaction update error:', error);
    }
  }
}

// Ödeme durumunu kontrol et
export async function checkPaymentStatus(transactionId: string): Promise<'completed' | 'pending' | 'failed'> {
  const transaction = transactionHistory.find(t => t.id === transactionId || t.transactionId === transactionId)
  
  if (!transaction) {
    return 'failed'
  }
  
  return transaction.status
}

// TON işlemleri için yardımcı fonksiyonlar
// Bu fonksiyon TON işlem loglarını konsola yazdırır
export function logTonTransaction(txInfo: any) {
  console.log('TON Transaction:', txInfo);
  return txInfo; // Daha sonra işlem detayları için kullanılabilir
}

// Ton işlem modunu etkinleştir (Global değişken ile)
export function enableTonMode() {
  // @ts-ignore
  window.__TON_MODE_ACTIVE = true;
  console.log('TON mode enabled');
}

// Ton işlem modunu kapat
export function disableTonMode() {
  // @ts-ignore
  window.__TON_MODE_ACTIVE = false;
  console.log('TON mode disabled');
}

// İşlemi takip et - Global değişken kullanarak
export function initializeTonWallet() {
  // Sayfa yüklendiğinde TON wallet durumunu dinle
  try {
    // @ts-ignore - Global değişkenleri izlemeye başla
    window.__TON_WALLET_INITIALIZED = true;
    
    // İlk işlemi logla
    logTonTransaction({type: 'wallet_init', timestamp: Date.now()});
    
    console.log('TON wallet listeners initialized');
    return true;
  } catch (error) {
    console.warn('TON wallet initialization error:', error);
    return false;
  }
}

// TonConnectUI'yi React bileşeni ile yönetiyoruz
// Bu nedenle burada yalnızca yardımcı fonksiyonlar olacak
// ve `window.Telegram?.WebApp` üzerinden Telegram ile etkileşim sağlanacak