import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './ReferralPage.css'

interface Referral {
  id: string;
  username: string;
  date: string;
  points: number;
}

const ReferralPage = () => {
  const { t } = useTranslation()
  const [referralLink, setReferralLink] = useState('https://t.me/TonMiningBot?start=ref123456')
  const [referrals, setReferrals] = useState<Referral[]>([
    {
      id: '1',
      username: 'User123',
      date: '2023-05-15',
      points: 500
    },
    {
      id: '2',
      username: 'CryptoFan',
      date: '2023-05-16',
      points: 500
    }
  ])
  const [copied, setCopied] = useState(false)

  // Referral linkini kopyala
  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Toplam kazanılan puanları hesapla
  const totalEarnings = referrals.reduce((sum, referral) => sum + referral.points, 0)

  return (
    <div className="referral-page">
      <h1>{t('referral.title')}</h1>
      
      <div className="referral-card">
        <p className="referral-description">{t('referral.description')}</p>
        
        <div className="referral-link-container">
          <p className="referral-link-label">{t('referral.yourLink')}</p>
          <div className="referral-link-box">
            <span className="referral-link">{referralLink}</span>
            <button onClick={copyReferralLink}>
              {copied ? t('referral.copied') : 'Copy'}
            </button>
          </div>
        </div>
        
        <div className="referral-stats">
          <div className="stat-item">
            <span className="stat-label">{t('referral.totalReferrals', { count: referrals.length })}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t('referral.earnings', { points: totalEarnings })}</span>
          </div>
        </div>
      </div>
      
      {referrals.length > 0 && (
        <div className="referral-list">
          <h2>Your Referrals</h2>
          {referrals.map(referral => (
            <div key={referral.id} className="referral-item">
              <div className="referral-user">
                <h3>{referral.username}</h3>
                <p>{referral.date}</p>
              </div>
              <div className="referral-points">
                <span>+{referral.points}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ReferralPage 