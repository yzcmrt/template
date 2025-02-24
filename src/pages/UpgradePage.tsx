import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import './UpgradePage.css'
import { makePayment, isWalletConnected, connectWallet } from '../services/ton-service'

const UpgradePage = () => {
  const { t } = useTranslation()
  const [timerLevel, setTimerLevel] = useState(1)
  const [boostLevel, setBoostLevel] = useState(1)
  const [hasAutoClaim, setHasAutoClaim] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [lastTransactionId, setLastTransactionId] = useState<string | null>(null)

  // Zamanlayıcı seviyesine göre saat hesaplaması
  const getTimerHours = (level: number) => {
    const timers = [16, 14, 12, 10, 8, 6]
    return timers[level - 1] || 16
  }

  // Boost seviyesine göre çarpan hesaplaması
  const getBoostMultiplier = (level: number) => {
    const boosts = [1.0, 1.3, 1.8, 2.5, 3.5, 5.0, 7.5, 10.0]
    return boosts[level - 1] || 1.0
  }

  // Zamanlayıcı seviyesi için fiyat hesaplaması
  const getTimerUpgradePrice = (level: number) => {
    if (level === 1) return 0.1
    if (level === 2) return 0.2
    if (level === 3) return 0.3
    if (level === 4) return 0.4
    if (level === 5) return 0.5
    return 0
  }

  // Boost seviyesi için fiyat hesaplaması
  const getBoostUpgradePrice = (level: number) => {
    const prices = [0.1, 0.3, 0.6, 1.0, 1.5, 2.0, 2.5]
    return prices[level - 1] || 0
  }

  // Ödeme işlemini gerçekleştir
  const processPayment = async (amount: number, productName: string, productId: string, onSuccess: () => void) => {
    if (processingPayment) return
    
    // Ödeme işlemi başladı
    setProcessingPayment(true)

    try {
      // Cüzdan bağlı değilse bağla
      if (!isWalletConnected()) {
        connectWallet()
        // Kullanıcının cüzdanı bağlaması için biraz bekle
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Hala bağlı değilse uyarı ver ve iptal et
      if (!isWalletConnected()) {
        alert('Lütfen önce TON cüzdanınızı bağlayın')
        setProcessingPayment(false)
        return
      }

      // Ödeme işlemini başlat
      const result = await makePayment(amount, {
        name: productName,
        description: `${productName} - ${t('upgrade.level', { level: productId })}`,
        productId: productId
      })

      if (result.success) {
        // İşlem başarılı
        setLastTransactionId(result.transactionId || null)
        onSuccess()
      } else {
        // İşlem başarısız
        alert(`Ödeme işlemi başarısız: ${result.error}`)
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Ödeme işlemi sırasında bir hata oluştu')
    } finally {
      setProcessingPayment(false)
    }
  }

  // Zamanlayıcı yükseltme işlemi
  const upgradeTimer = async () => {
    const nextLevel = timerLevel + 1
    const price = getTimerUpgradePrice(timerLevel)
    
    await processPayment(
      price, 
      'Zamanlayıcı Yükseltme', 
      `timer-${nextLevel}`,
      () => setTimerLevel(nextLevel)
    )
  }

  // Boost yükseltme işlemi
  const upgradeBoost = async () => {
    const nextLevel = boostLevel + 1
    const price = getBoostUpgradePrice(boostLevel)
    
    await processPayment(
      price, 
      'Çarpan Yükseltme', 
      `boost-${nextLevel}`,
      () => setBoostLevel(nextLevel)
    )
  }

  // Otomatik toplama özelliğini satın alma
  const buyAutoClaim = async () => {
    await processPayment(
      1.5, 
      'Otomatik Toplama', 
      'auto-claim',
      () => setHasAutoClaim(true)
    )
  }

  return (
    <div className="upgrade-page">
      <h1>{t('upgrade.title')}</h1>
      
      {lastTransactionId && (
        <div className="transaction-success">
          <p>Son işlem başarıyla tamamlandı!</p>
          <small>İşlem ID: {lastTransactionId.substring(0, 10)}...{lastTransactionId.substring(lastTransactionId.length - 6)}</small>
        </div>
      )}
      
      <div className="upgrade-section">
        <h2>{t('upgrade.timers')}</h2>
        <p>Current Level: {timerLevel}</p>
        <p>Mining Time: {getTimerHours(timerLevel)} hours</p>
        
        {timerLevel < 6 && (
          <div className="upgrade-card">
            <div className="upgrade-info">
              <h3>{t('upgrade.level', { level: timerLevel + 1 })}</h3>
              <p>New Mining Time: {getTimerHours(timerLevel + 1)} hours</p>
              <p>Price: {getTimerUpgradePrice(timerLevel)} TON</p>
            </div>
            <button 
              onClick={upgradeTimer} 
              disabled={processingPayment}
            >
              {processingPayment ? 'İşleniyor...' : t('upgrade.buyUpgrade')}
            </button>
          </div>
        )}
      </div>
      
      <div className="upgrade-section">
        <h2>{t('upgrade.boosts')}</h2>
        <p>Current Level: {boostLevel}</p>
        <p>Boost Multiplier: {getBoostMultiplier(boostLevel)}x</p>
        
        {boostLevel < 7 && (
          <div className="upgrade-card">
            <div className="upgrade-info">
              <h3>{t('upgrade.level', { level: boostLevel + 1 })}</h3>
              <p>New Multiplier: {getBoostMultiplier(boostLevel + 1)}x</p>
              <p>Price: {getBoostUpgradePrice(boostLevel)} TON</p>
            </div>
            <button 
              onClick={upgradeBoost}
              disabled={processingPayment}
            >
              {processingPayment ? 'İşleniyor...' : t('upgrade.buyUpgrade')}
            </button>
          </div>
        )}
      </div>
      
      {!hasAutoClaim && (
        <div className="upgrade-section">
          <h2>{t('upgrade.autoClaim')}</h2>
          <p>Automatically claim rewards when mining is complete</p>
          
          <div className="upgrade-card">
            <div className="upgrade-info">
              <h3>Auto Claim</h3>
              <p>Never miss a mining reward</p>
              <p>Price: 1.5 TON</p>
            </div>
            <button 
              onClick={buyAutoClaim}
              disabled={processingPayment}
            >
              {processingPayment ? 'İşleniyor...' : t('upgrade.buyUpgrade')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UpgradePage