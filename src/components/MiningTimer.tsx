import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './MiningTimer.css'

interface MiningTimerProps {
  duration: number; // saat cinsinden
  onComplete: () => void;
  isActive: boolean;
}

const MiningTimer: React.FC<MiningTimerProps> = ({ duration, onComplete, isActive }) => {
  const { t } = useTranslation()
  const [timeLeft, setTimeLeft] = useState(duration * 3600) // saniye cinsinden

  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer)
          onComplete()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, onComplete])

  // Saniyeyi saat:dakika:saniye formatına dönüştürme
  const hours = Math.floor(timeLeft / 3600)
  const minutes = Math.floor((timeLeft % 3600) / 60)
  const seconds = timeLeft % 60

  return (
    <div className="mining-timer">
      <div className="timer-display">
        <div className="time-section">
          <span className="time-value">{hours.toString().padStart(2, '0')}</span>
          <span className="time-label">hours</span>
        </div>
        <div className="time-separator">:</div>
        <div className="time-section">
          <span className="time-value">{minutes.toString().padStart(2, '0')}</span>
          <span className="time-label">min</span>
        </div>
        <div className="time-separator">:</div>
        <div className="time-section">
          <span className="time-value">{seconds.toString().padStart(2, '0')}</span>
          <span className="time-label">sec</span>
        </div>
      </div>
      <div className="mining-progress">
        <div 
          className="mining-progress-bar" 
          style={{ width: `${(1 - timeLeft / (duration * 3600)) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}

export default MiningTimer 