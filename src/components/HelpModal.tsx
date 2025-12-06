import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        // Focus trap
        const handleTab = (e: KeyboardEvent) => {
            if (e.key !== 'Tab' || !modalRef.current) return;

            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement?.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement?.focus();
                    e.preventDefault();
                }
            }
        };

        window.addEventListener('keydown', handleEscape);
        window.addEventListener('keydown', handleTab);

        // Focus first element when modal opens
        const firstButton = modalRef.current?.querySelector('button') as HTMLElement;
        firstButton?.focus();

        return () => {
            window.removeEventListener('keydown', handleEscape);
            window.removeEventListener('keydown', handleTab);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            style={{
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
            }}
            onClick={onClose}
        >
            <div
                ref={modalRef}
                className="glass-panel"
                role="dialog"
                aria-modal="true"
                aria-labelledby="help-modal-title"
                style={{
                    width: '90%',
                    maxWidth: '600px',
                    maxHeight: '80vh',
                    padding: '2rem',
                    position: 'relative',
                    overflowY: 'auto',
                    animation: 'fadeIn 0.3s ease',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label="Close help modal"
                    style={{
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
                    }}
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

                <h2 id="help-modal-title" style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                    {t('help.title')}
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <section>
                        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                            {t('help.gettingStarted.title')}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            {t('help.gettingStarted.content')}
                        </p>
                    </section>

                    <section>
                        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                            {t('help.batchProcessing.title')}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            {t('help.batchProcessing.content')}
                        </p>
                    </section>

                    <section>
                        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>
                            {t('help.tips.title')}
                        </h3>
                        <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.6', paddingLeft: '1.5rem' }}>
                            <li>{t('help.tips.item1')}</li>
                            <li>{t('help.tips.item2')}</li>
                            <li>{t('help.tips.item3')}</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};
