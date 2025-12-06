import React from 'react';
import { useTranslation } from 'react-i18next';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  const { t } = useTranslation();

  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      color: '#ef4444',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ fontSize: '2rem' }}>⚠️</div>
      <div>{t(error)}</div>
      {onRetry && (
        <button
          className="btn-secondary"
          onClick={onRetry}
          style={{ marginTop: '0.5rem' }}
        >
          {t('upload.retry') || 'Retry'}
        </button>
      )}
    </div>
  );
};

