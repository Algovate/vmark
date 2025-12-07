import React from 'react';
import { useTranslation } from 'react-i18next';
import { SliderInput } from '../SliderInput';
import type { WatermarkConfig } from '../ControlPanel';

interface TextSettingsProps {
    config: WatermarkConfig;
    onChange: (key: keyof WatermarkConfig, value: string | number) => void;
    disabled?: boolean;
}

export const TextSettings: React.FC<TextSettingsProps> = ({ config, onChange, disabled }) => {
    const { t } = useTranslation();

    return (
        <>
            <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="watermark-text">{t('settings.watermarkText')}</label>
                <textarea
                    id="watermark-text"
                    value={config.text}
                    onChange={(e) => onChange('text', e.target.value)}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        minHeight: '80px',
                        resize: 'vertical',
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        padding: 'var(--spacing-xs) var(--spacing-sm)',
                        borderRadius: 'var(--radius-sm)',
                        outline: 'none',
                        fontFamily: 'inherit',
                        cursor: disabled ? 'not-allowed' : 'text',
                    }}
                />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ marginBottom: '0.75rem', display: 'block' }} htmlFor="watermark-color">{t('settings.color')}</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            id="watermark-color"
                            type="color"
                            value={config.color}
                            onChange={(e) => onChange('color', e.target.value)}
                            disabled={disabled}
                            style={{
                                width: '50px',
                                height: '50px',
                                border: '2px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                backgroundColor: 'transparent',
                                padding: '2px',
                                transition: 'all 0.2s ease',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <input
                        type="text"
                        value={config.color}
                        onChange={(e) => onChange('color', e.target.value)}
                        disabled={disabled}
                        placeholder="#ffffff"
                        pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            fontSize: '0.875rem',
                            fontFamily: 'monospace',
                        }}
                        aria-label={`${t('settings.color')} hex value`}
                    />
                </div>
            </div>

            <SliderInput
                id="font-size"
                label={t('settings.fontSize')}
                value={config.fontSize}
                min={12}
                max={200}
                unit="px"
                disabled={disabled}
                onChange={(value) => onChange('fontSize', value)}
            />
        </>
    );
};
