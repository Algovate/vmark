import React, { type ReactNode } from 'react';
import { useModal } from '../hooks/useModal';
import { ModalCloseButton } from './ModalCloseButton';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  children: ReactNode;
  maxWidth?: string;
  maxHeight?: string;
  showCloseButton?: boolean;
  closeButtonAriaLabel?: string;
  contentStyle?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
}

const OVERLAY_STYLE: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(5px)',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  titleId,
  children,
  maxWidth = '600px',
  maxHeight,
  showCloseButton = true,
  closeButtonAriaLabel,
  contentStyle,
  titleStyle,
}) => {
  const modalRef = useModal({ isOpen, onClose });

  if (!isOpen) return null;

  return (
    <div style={OVERLAY_STYLE} onClick={onClose}>
      <div
        ref={modalRef}
        className="glass-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          width: '90%',
          maxWidth,
          maxHeight,
          padding: '2rem',
          position: 'relative',
          animation: 'fadeIn 0.3s ease',
          ...(maxHeight && { overflowY: 'auto' }),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <ModalCloseButton
            onClose={onClose}
            ariaLabel={closeButtonAriaLabel || 'Close modal'}
          />
        )}
        <h2
          id={titleId}
          style={{
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
            ...titleStyle,
          }}
        >
          {title}
        </h2>
        {contentStyle && Object.keys(contentStyle).length > 0 ? (
          <div style={contentStyle}>{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

