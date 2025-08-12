import { useEffect, useState } from 'react'
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
    setMiningActive(true);
    
    // 30 saniye sonra mining tamamlanacak
    setTimeout(() => {
      setMiningActive(false);
      
      // Mining sonucunda kazanılacak miktar
      const miningReward = 0.01 * (userData?.miningPower || 1);
      
      // Kullanıcı verilerini güncelle
      if (userData) {
        setUserData({
          ...userData,
          balance: userData.balance + miningReward,
          totalEarned: userData.totalEarned + miningReward
        });
      }
      
      // Gerçek uygulamada burada API isteği yapılmalı
      console.log(`Mining tamamlandı: ${miningReward} TON kazanıldı.`);
    }, 30000);
  };
  
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>{t('home.title')}</h1>
        <p className="welcome-message">
          {telegramUser 
            ? `Hoş geldin, ${telegramUser.first_name || 'Kullanıcı'}`
            : 'TON Mining\'e Hoş Geldiniz!'}
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
      
      <div className="mining-section">
        {miningActive ? (
          <MiningTimer 
            seconds={30} 
            onComplete={() => console.log('Mining tamamlandı')}
          />
        ) : (
          <MiningButton onClick={startMining} />
        )}
      </div>
      
      <div className="mining-info">
        <h2>{t('home.how_it_works')}</h2>
        <p>{t('home.mining_info')}</p>
        <ul>
          <li>{t('home.mining_info_1')}</li>
          <li>{t('home.mining_info_2')}</li>
          <li>{t('home.mining_info_3')}</li>
        </ul>
      </div>
    </div>
  )
}

export default HomePage 