import React from 'react';
import { useTranslation } from 'react-i18next';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

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
                className="glass-panel"
                style={{
                    width: '90%',
                    maxWidth: '600px',
                    maxHeight: '80vh',
                    padding: '2rem',
                    position: 'relative',
                    overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                    }}
                >
                    ✕
                </button>

                <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
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
