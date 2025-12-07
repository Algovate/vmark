import React from 'react';

interface ModalCloseButtonProps {
  onClose: () => void;
  ariaLabel: string;
}

const BUTTON_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: '1rem',
  right: '1rem',
  background: 'none',
  border: 'none',
  color: 'var(--text-secondary)',
  fontSize: '1.5rem',
  cursor: 'pointer',
  padding: '0.5rem',
  borderRadius: 'var(--radius-sm)',
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
};

export const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  onClose,
  ariaLabel,
}) => {
  return (
    <button
      onClick={onClose}
      aria-label={ariaLabel}
      style={BUTTON_STYLE}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.color = 'var(--text-primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'none';
        e.currentTarget.style.color = 'var(--text-secondary)';
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid var(--accent-primary)';
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
    >
      ✕
    </button>
  );
};

