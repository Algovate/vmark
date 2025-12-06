import React from 'react';

interface DragIndicatorProps {
  position: { x: number; y: number };
  visible: boolean;
}

export const DragIndicator: React.FC<DragIndicatorProps> = ({ position, visible }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        border: '2px solid var(--accent-primary)',
        background: 'rgba(59, 130, 246, 0.3)',
        pointerEvents: 'none',
        boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
};

