import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeTMA } from './services/tma-service'

// TMA'yı başlat ve ekran yüklemeyi garanti altına al
const renderApp = () => {
  // DOM elementini al, yoksa yeni oluştur
  let rootElement = document.getElementById('root');
  if (!rootElement) {
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);
  }

  // React uygulamasını render et - StrictMode kaldırıldı çünkü TonConnectUIProvider çift render sorunu yaşanıyor
  ReactDOM.createRoot(rootElement).render(<App />);
};

// TMA başlatma hatası olsa bile uygulamayı çalıştır
initializeTMA()
  .then(() => {
    console.log('TMA initialized successfully');
    renderApp();
  })
  .catch(error => {
    console.error('TMA initialization error:', error);
    // Hata olsa bile uygulamayı yükle
    renderApp();
  });
