import React from 'react';
import { useTranslation } from 'react-i18next';
import './UserStats.css';

interface UserStatsProps {
  miningPower: number;
  balance: number;
  totalEarned: number;
  referralCount: number;
}

const UserStats: React.FC<UserStatsProps> = ({
  miningPower,
  balance,
  totalEarned,
  referralCount
}) => {
  const { t } = useTranslation();

  return (
    <div className="user-stats">
      <div className="stat-item">
        <div className="stat-icon">⚡</div>
        <div className="stat-content">
          <div className="stat-label">{t('stats.mining_power')}</div>
          <div className="stat-value">{miningPower.toFixed(2)}</div>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon">💎</div>
        <div className="stat-content">
          <div className="stat-label">{t('stats.balance')}</div>
          <div className="stat-value">{balance.toFixed(3)} TON</div>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <div className="stat-label">{t('stats.total_earned')}</div>
          <div className="stat-value">{totalEarned.toFixed(3)} TON</div>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon">👥</div>
        <div className="stat-content">
          <div className="stat-label">{t('stats.referrals')}</div>
          <div className="stat-value">{referralCount}</div>
        </div>
      </div>
    </div>
  );
};

export default UserStats; 