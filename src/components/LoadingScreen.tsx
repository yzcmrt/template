import { useTranslation } from 'react-i18next'
import './LoadingScreen.css'

const LoadingScreen = () => {
  const { t } = useTranslation()

  return (
    <div className="loading-screen">
      <div className="loading-animation">
        <div className="loading-circle"></div>
      </div>
      <h1>TON Mining</h1>
      <p>{t('app.loading')}</p>
    </div>
  )
}

export default LoadingScreen