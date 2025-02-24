import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Navigation.css'

// İkonlar (pratikte gerçek ikonlar import edilmeli)
import HomeIcon from '../assets/icons/home-icon'
import UpgradeIcon from '../assets/icons/upgrade-icon'
import TaskIcon from '../assets/icons/task-icon'
import ReferralIcon from '../assets/icons/referral-icon'
import WalletIcon from '../assets/icons/wallet-icon'

const Navigation = () => {
  const { t } = useTranslation()

  return (
    <nav className="main-navigation">
      <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
        <HomeIcon />
        <span>{t('navigation.home')}</span>
      </NavLink>
      <NavLink to="/upgrade" className={({ isActive }) => isActive ? 'active' : ''}>
        <UpgradeIcon />
        <span>{t('navigation.upgrade')}</span>
      </NavLink>
      <NavLink to="/task" className={({ isActive }) => isActive ? 'active' : ''}>
        <TaskIcon />
        <span>{t('navigation.task')}</span>
      </NavLink>
      <NavLink to="/referral" className={({ isActive }) => isActive ? 'active' : ''}>
        <ReferralIcon />
        <span>{t('navigation.referral')}</span>
      </NavLink>
      <NavLink to="/wallet" className={({ isActive }) => isActive ? 'active' : ''}>
        <WalletIcon />
        <span>{t('navigation.wallet')}</span>
      </NavLink>
    </nav>
  )
}

export default Navigation 