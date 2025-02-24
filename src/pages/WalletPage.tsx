import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { TonConnectButton } from '@tonconnect/ui-react'
import './WalletPage.css'
import { getTransactionHistory, isWalletConnected, getWalletAddress, PaymentTransaction } from '../services/ton-service'

interface Transaction {
  id: string;
  type: 'upgrade' | 'purchase';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const WalletPage = () => {
  const { t } = useTranslation()
  const [connected, setConnected] = useState(false)
  const [balance, setBalance] = useState(0)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Cüzdan bağlantısını ve işlem geçmişini kontrol et
  useEffect(() => {
    const checkConnection = () => {
      const isConnected = isWalletConnected()
      setConnected(isConnected)
      
      if (isConnected) {
        // Cüzdan adresini al
        const address = getWalletAddress()
        setWalletAddress(address)
        
        // İşlem geçmişini al
        const history = getTransactionHistory()
        
        // İşlem geçmişini dönüştür
        const formattedTransactions = history.map(tx => formatTransaction(tx))
        setTransactions(formattedTransactions)
      }
    }
    
    checkConnection()
    
    // 5 saniyede bir kontrolü yenile
    const interval = setInterval(checkConnection, 5000)
    return () => clearInterval(interval)
  }, [])
  
  // TON işlem geçmişini UI işlemlerine dönüştür
  const formatTransaction = (tx: PaymentTransaction): Transaction => {
    const date = new Date(tx.timestamp).toLocaleString()
    
    // İşlemin tipini belirle (ürün bilgisine göre)
    const isUpgrade = tx.productInfo?.name?.toLowerCase().includes('upgrade') || 
                    tx.productInfo?.productId?.includes('upgrade')
    
    return {
      id: tx.id,
      type: isUpgrade ? 'upgrade' : 'purchase',
      amount: tx.amount,
      date: date,
      status: tx.status
    }
  }

  // Durum rengini belirle
  const getStatusColor = (status: string) => {
    if (status === 'completed') return 'var(--success-color)'
    if (status === 'pending') return 'var(--hint-color)'
    if (status === 'failed') return 'var(--error-color)'
    return 'var(--text-color)'
  }

  return (
    <div className="wallet-page">
      <h1>{t('wallet.title')}</h1>
      
      <div className="wallet-connect-container">
        <TonConnectButton />
      </div>
      
      {connected && (
        <>
          <div className="wallet-balance">
            <h2>{t('wallet.balance', { amount: balance.toFixed(2) })}</h2>
            {walletAddress && (
              <p className="wallet-address">
                Cüzdan: {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 6)}
              </p>
            )}
          </div>
          
          <div className="transactions-container">
            <h2>{t('wallet.transactions')}</h2>
            
            {transactions.length > 0 ? (
              <div className="transactions-list">
                {transactions.map(tx => (
                  <div key={tx.id} className="transaction-item">
                    <div className="transaction-info">
                      <h3>{tx.type === 'upgrade' ? 'Upgrade Purchase' : 'Item Purchase'}</h3>
                      <p>{tx.date}</p>
                    </div>
                    <div className="transaction-details">
                      <span className="transaction-amount">-{tx.amount} TON</span>
                      <span 
                        className="transaction-status"
                        style={{ color: getStatusColor(tx.status) }}
                      >
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-transactions">Henüz işlem geçmişi yok</p>
            )}
          </div>
          
          <div className="payment-info">
            <h3>Ödemeler Hakkında</h3>
            <p>Tüm ödemeler aşağıdaki TON cüzdan adresine gönderilir:</p>
            <code className="payment-address">UQCo-_sf6z8mlUdspm1LG6CoZj85QDuiuig7nXQTD0DZmXwF</code>
            <p>Bu uygulama üzerindeki ödemelerde komisyon alınmaz.</p>
            <p>İşlemler blokzincirde anında işlenir, ancak bakiyenize yansıması birkaç dakika sürebilir.</p>
          </div>
        </>
      )}
    </div>
  )
}

export default WalletPage