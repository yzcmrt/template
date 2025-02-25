import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import './MiningTimer.css'

export interface MiningTimerProps {
  seconds?: number;
  onComplete: () => void;
}

const MiningTimer = ({ seconds = 30, onComplete }: MiningTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const { t } = useTranslation();

  useEffect(() => {
    // Sayaç fonksiyonu
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onComplete();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Temizleme fonksiyonu
    return () => clearInterval(timer);
  }, [onComplete]);

  // Yüzde cinsinden ilerleme hesapla
  const progress = ((seconds - timeLeft) / seconds) * 100;

  return (
    <div className="mining-timer">
      <div className="mining-animation">
        <div className="mining-icon-animated">⛏️</div>
      </div>
      
      <div className="timer-display">
        <div className="timer-text">
          {timeLeft > 0 ? (
            <>
              <span className="timer-label">{t('mining.time_left')}</span>
              <span className="timer-value">{timeLeft} {t('mining.seconds')}</span>
            </>
          ) : (
            <span className="timer-complete">{t('mining.completed')}</span>
          )}
        </div>
      </div>

      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="mining-status">{t('mining.in_progress')}</p>
    </div>
  );
};

export default MiningTimer 