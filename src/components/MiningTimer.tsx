import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './MiningTimer.css'

interface MiningTimerProps {
  initialHours: number;
  onComplete: () => void;
  isActive: boolean;
}

const MiningTimer: React.FC<MiningTimerProps> = ({ initialHours, onComplete, isActive }) => {
  useTranslation(); // t değişkenini kullanmıyoruz şimdilik
  const [timeLeft, setTimeLeft] = useState(initialHours * 3600) // saniye cinsinden
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    setIsRunning(isActive)
  }, [isActive])

  useEffect(() => {
    if (initialHours > 0) {
      setTimeLeft(initialHours * 3600)
    }
  }, [initialHours])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null
    
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer as ReturnType<typeof setInterval>)
            onComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else if (timer) {
      clearInterval(timer)
    }
    
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isRunning, onComplete])

  // Kalan süreyi formatlama
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
    <div className="mining-timer">
      <div className="timer-display">
        <span className="time-section">
          <span className="time-value">{formattedTime.hours}</span>
          <span className="time-label">Saat</span>
        </span>
        <span className="time-separator">:</span>
        <span className="time-section">
          <span className="time-value">{formattedTime.minutes.toString().padStart(2, '0')}</span>
          <span className="time-label">Dakika</span>
        </span>
        <span className="time-separator">:</span>
        <span className="time-section">
          <span className="time-value">{formattedTime.seconds.toString().padStart(2, '0')}</span>
          <span className="time-label">Saniye</span>
        </span>
      </div>
      <div className="mining-progress">
        <div 
          className="mining-progress-bar" 
          style={{ width: `${(1 - timeLeft / (initialHours * 3600)) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}

export default MiningTimer 