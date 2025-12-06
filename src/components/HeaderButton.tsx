import React from 'react';

interface HeaderButtonProps {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
  className?: string;
}

export const HeaderButton: React.FC<HeaderButtonProps> = ({
  onClick,
  ariaLabel,
  children,
  className = 'glass-panel',
}) => {
  return (
    <button
      onClick={onClick}
      className={className}
      aria-label={ariaLabel}
      style={{
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-color)',
        background: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
    >
      {children}
    </button>
  );
};

