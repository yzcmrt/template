import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import '../i18n/i18n'
import './HomePage.css'
import MiningButton from '../components/MiningButton'
import MiningTimer from '../components/MiningTimer'
import UserStats from '../components/UserStats'

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface UserData {
  telegramId: number;
  miningPower: number;
  balance: number;
  totalEarned: number;
  referralCode: string;
  referrals: number[];
}

function HomePage() {
  const { t } = useTranslation()
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [miningActive, setMiningActive] = useState(false)

  const miningRewardPerSession = 0.01
  const expectedReward = miningRewardPerSession * (userData?.miningPower || 1)
  
  // Telegram Mini App verisini al
  useEffect(() => {
    const getUserData = async () => {
      try {
        // Telegram WebApp API kontrol
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const webApp = window.Telegram.WebApp;
          
          // Kullanıcı bilgilerini al
          if (webApp.initDataUnsafe?.user) {
            const user = webApp.initDataUnsafe.user as any;
            
            setTelegramUser({
              id: user.id || 0,
              first_name: user.first_name,
              last_name: user.last_name,
              username: user.username,
              language_code: user.language_code
            });
            
            // Kullanıcı verisini API'den al (örnek mockup veri)
            // Gerçek uygulamada burada API isteği yapılmalı
            setUserData({
              telegramId: user.id || 0,
              miningPower: 1.0,
              balance: 0.05,
              totalEarned: 0.15,
              referralCode: `REF${user.id || 0}`,
              referrals: []
            });
          } else {
            // Test verileri
            setTelegramUser({
              id: 123456789,
              first_name: "Test",
              last_name: "User",
              username: "testuser",
              language_code: "tr"
            });
            
            setUserData({
              telegramId: 123456789,
              miningPower: 1.0,
              balance: 0.05,
              totalEarned: 0.15,
              referralCode: "REF123456789",
              referrals: []
            });
          }
        } else {
          // Telegram dışında test için
          setTelegramUser({
            id: 123456789,
            first_name: "Test",
            last_name: "User",
            username: "testuser",
            language_code: "tr"
          });
          
          setUserData({
            telegramId: 123456789,
            miningPower: 1.0,
            balance: 0.05,
            totalEarned: 0.15,
            referralCode: "REF123456789",
            referrals: []
          });
        }
      } catch (error) {
        console.error('Telegram kullanıcı verisi alınamadı:', error);
        
        // Hata durumunda test verileri
        setTelegramUser({
          id: 123456789,
          first_name: "Test",
          last_name: "User",
          username: "testuser",
          language_code: "tr"
        });
        
        setUserData({
          telegramId: 123456789,
          miningPower: 1.0,
          balance: 0.05,
          totalEarned: 0.15,
          referralCode: "REF123456789",
          referrals: []
        });
      }
    };
    
    getUserData();
  }, []);
  
  // Mining işlemini başlat
  const startMining = () => {
    setMiningActive(true)
  }

  const handleMiningComplete = useCallback(() => {
    setMiningActive(false)
    const miningReward = miningRewardPerSession * (userData?.miningPower || 1)
    if (userData) {
      setUserData({
        ...userData,
        balance: userData.balance + miningReward,
        totalEarned: userData.totalEarned + miningReward
      })
    }
    // Gerçek uygulamada burada API isteği yapılmalı
    console.log(`Mining tamamlandı: ${miningReward} TON kazanıldı.`)
  }, [miningRewardPerSession, userData])
  
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>{t('home.title')}</h1>
        <p className="welcome-message">
          {telegramUser
            ? `Hoş geldin, ${telegramUser.first_name || 'Kullanıcı'}`
            : "TON Mining'e Hoş Geldiniz!"}
        </p>
      </header>

      {userData && (
        <UserStats
          miningPower={userData.miningPower}
          balance={userData.balance}
          totalEarned={userData.totalEarned}
          referralCount={userData.referrals.length}
        />
      )}

      <section className="card mining-card">
        <h2 className="section-title">Madencilik</h2>
        <div className="mining-section">
          {miningActive ? (
            <MiningTimer seconds={30} onComplete={handleMiningComplete} />
          ) : (
            <>
              <MiningButton onClick={startMining} />
              <p className="mining-hint">
                Tahmini ödül: {(miningRewardPerSession * (userData?.miningPower || 1)).toFixed(3)} TON
              </p>
            </>
          )}
        </div>
      </section>

      <section className="card info-card">
        <h2 className="section-title">{t('home.how_it_works')}</h2>
        <p className="info-text">{t('home.mining_info')}</p>
        <ul className="info-list">
          <li>Günlük ödül havuzu: <strong>1,250 TON</strong></li>
          <li>Oturum süresi: <strong>30 saniye</strong></li>
          <li>Temel ödül (1x güç): <strong>{miningRewardPerSession.toFixed(3)} TON</strong></li>
          <li>Mining gücün: <strong>{(userData?.miningPower || 1).toFixed(2)}x</strong></li>
          <li>Tahmini ödülün: <strong>{expectedReward.toFixed(3)} TON</strong></li>
          <li>Referans bonusu: <strong>%5</strong></li>
        </ul>
      </section>
    </div>
  )
}

export default HomePage 