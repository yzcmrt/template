import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './HomePage.css'

const HomePage = () => {
  const { t } = useTranslation()
  const [userPoints, setUserPoints] = useState(0)
  const [miningActive, setMiningActive] = useState(false)
  const [canClaim, setCanClaim] = useState(false)
  const [timerDuration, setTimerDuration] = useState(16) // Saat cinsinden
  const [miningBoost, setMiningBoost] = useState(1) // Çarpan
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    // Kullanıcı verilerini yükle
    const loadUserData = async () => {
      try {
        // Burada backend'den veri çekilecek
        // Şimdilik sabit veriler kullanalım
        setUserPoints(1250)
        setTimerDuration(16)
        setMiningBoost(1)
      } catch (error) {
        console.error("Failed to load user data", error)
      }
    }
    
    loadUserData()
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null
    
    if (miningActive) {
      setTimeLeft(timerDuration * 3600) // Saniye cinsine çevir
      
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer as ReturnType<typeof setInterval>)
            setCanClaim(true)
            setMiningActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [miningActive, timerDuration])

  const handleStartMining = () => {
    setMiningActive(true)
    setCanClaim(false)
    // Burada mining başladı bilgisi backend'e gönderilecek
  }

  const handleClaimRewards = () => {
    // Mining puanlarını hesapla
    const basePoints = 100 // Temel puan
    const boostedPoints = Math.floor(basePoints * miningBoost)
    
    setUserPoints(prev => prev + boostedPoints)
    setMiningActive(false)
    setCanClaim(false)
    
    // Burada claim işlemi backend'e gönderilecek
  }

  // Kalan süreyi saat, dakika, saniye formatına çevir
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    return {
      hours,
      minutes,
      seconds: secs
    }
  }

  const formattedTime = formatTime(timeLeft)

  return (
    <div className="home-page">
      <h1>{t('app.name')}</h1>
      
      <div className="stats-card">
        <div className="stat-item">
          <span className="stat-label">{t('home.totalPoints')}</span>
          <span className="stat-value">{userPoints}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">{t('home.globalRank')}</span>
          <span className="stat-value">#1253</span>
        </div>
      </div>
      
      <div className="mining-card">
        <h2>{t('home.miningStatus')}</h2>
        
        {miningActive ? (
          <div className="mining-active">
            <div className="mining-animation"></div>
            <p>Mining in progress...</p>
            <div className="timer-display">
              <div className="time-section">
                <span className="time-value">{formattedTime.hours}</span>
                <span className="time-label">Hours</span>
              </div>
              <span className="time-separator">:</span>
              <div className="time-section">
                <span className="time-value">{formattedTime.minutes.toString().padStart(2, '0')}</span>
                <span className="time-label">Minutes</span>
              </div>
              <span className="time-separator">:</span>
              <div className="time-section">
                <span className="time-value">{formattedTime.seconds.toString().padStart(2, '0')}</span>
                <span className="time-label">Seconds</span>
              </div>
            </div>
            <div className="mining-progress">
              <div 
                className="mining-progress-bar" 
                style={{ width: `${(1 - timeLeft / (timerDuration * 3600)) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="mining-inactive">
            {canClaim ? (
              <p className="mining-ready">{t('home.readyToClaim')}</p>
            ) : (
              <p>{t('mining.hourLeft', { hours: timerDuration })}</p>
            )}
          </div>
        )}
        
        <div className="mining-actions">
          {canClaim ? (
            <button 
              onClick={handleClaimRewards} 
              className="claim-button"
            >
              {t('home.claimRewards')}
            </button>
          ) : (
            <button 
              onClick={handleStartMining} 
              disabled={miningActive}
              className="start-button"
            >
              {t('home.startMining')}
            </button>
          )}
        </div>
      </div>
      
      <div className="boost-info">
        <p>Current Boost: {miningBoost}x</p>
        {miningBoost > 1 && <p>Your mining is {miningBoost}x faster!</p>}
      </div>
    </div>
  )
}

export default HomePage 