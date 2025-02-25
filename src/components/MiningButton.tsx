import { useTranslation } from 'react-i18next';
import './MiningButton.css';

interface MiningButtonProps {
  onClick: () => void;
}

const MiningButton: React.FC<MiningButtonProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <div className="mining-button-container">
      <button className="mining-button" onClick={onClick}>
        <div className="mining-button-icon">⛏️</div>
        <div className="mining-button-text">
          <span className="mining-button-title">{t('mining.start_mining')}</span>
          <span className="mining-button-description">{t('mining.description')}</span>
        </div>
      </button>
    </div>
  );
};

export default MiningButton; 