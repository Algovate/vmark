import React from 'react';

interface ToggleButtonProps {
  value: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  selected,
  onClick,
  disabled = false,
  children,
}) => {
  return (
    <button
      onClick={onClick}
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      style={{
        flex: 1,
        padding: '0.5rem',
        border: `1px solid ${selected ? 'var(--accent-primary)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-sm)',
        background: selected
          ? 'rgba(59, 130, 246, 0.2)'
          : 'rgba(0, 0, 0, 0.2)',
        color: 'var(--text-primary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '0.875rem',
        fontWeight: selected ? '600' : '400',
        transition: 'var(--transition-fast)',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
};

