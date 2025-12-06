import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message, 
  size = 'md' 
}) => {
  
  const sizeMap = {
    sm: '24px',
    md: '40px',
    lg: '60px',
  };

  const borderSizeMap = {
    sm: '2px',
    md: '3px',
    lg: '4px',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      color: 'var(--text-secondary)'
    }}>
      <div style={{
        width: sizeMap[size],
        height: sizeMap[size],
        border: `${borderSizeMap[size]} solid var(--border-color)`,
        borderTopColor: 'var(--accent-primary)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      {message && <span>{message}</span>}
    </div>
  );
};

