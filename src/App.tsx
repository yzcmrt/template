import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import './i18n/i18n'
import './App.css'

// Sayfalar
import HomePage from './pages/HomePage'
import UpgradePage from './pages/UpgradePage'
import TaskPage from './pages/TaskPage'
import ReferralPage from './pages/ReferralPage'
import WalletPage from './pages/WalletPage'

// Bileşenler
import Navigation from './components/Navigation'
import LoadingScreen from './components/LoadingScreen'

// Servisler
import { initializeTonWallet } from './services/ton-service'

// TON Wallet manifest URL'i (Vite env üzerinden)
const TON_MANIFEST_URL = (import.meta as any).env?.VITE_TON_MANIFEST_URL || 'https://ton-mining-app.vercel.app/tonconnect-manifest.json';

function App() {
  // useTranslation hook'u i18n için gerekli
  useTranslation(); // 't' değişkenini kullanmazsak direkt hook çağırabiliriz
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Uygulama yükleme simülasyonu
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // TON wallet'ı başlat
  useEffect(() => {
    try {
      // TON wallet başlatma
      initializeTonWallet();
    } catch (error) {
      console.error('TON wallet initialization error:', error);
    }
  }, []);

  if (loading) {
    return <LoadingScreen />
  }

  // TonConnectUIProvider eklenir - react devmode'da iki kez render edilmeyecek şekilde
  return (
    <TonConnectUIProvider manifestUrl={TON_MANIFEST_URL}>
      <BrowserRouter>
        <div className="app-container">
          <main className="content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/upgrade" element={<UpgradePage />} />
              <Route path="/task" element={<TaskPage />} />
              <Route path="/referral" element={<ReferralPage />} />
              <Route path="/wallet" element={<WalletPage />} />
            </Routes>
          </main>
          <Navigation />
        </div>
      </BrowserRouter>
    </TonConnectUIProvider>
  )
}

export default App
