import React from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButton } from '../ToggleButton';
import type { WatermarkConfig, WatermarkType } from '../ControlPanel';

interface WatermarkTypeSelectorProps {
    config: WatermarkConfig;
    onChange: (type: WatermarkType) => void;
    disabled?: boolean;
}

export const WatermarkTypeSelector: React.FC<WatermarkTypeSelectorProps> = ({ config, onChange, disabled }) => {
    const { t } = useTranslation();

    return (
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <label style={{ marginBottom: '0.75rem', display: 'block' }}>{t('settings.watermarkType')}</label>
            <div style={{ display: 'flex', gap: '0.5rem' }} role="radiogroup" aria-label={t('settings.watermarkType')}>
                <ToggleButton
                    value="text"
                    selected={config.type === 'text'}
                    onClick={() => onChange('text')}
                    disabled={disabled}
                >
                    {t('settings.textWatermark')}
                </ToggleButton>
                <ToggleButton
                    value="image"
                    selected={config.type === 'image'}
                    onClick={() => onChange('image')}
                    disabled={disabled}
                >
                    {t('settings.imageWatermark')}
                </ToggleButton>
            </div>
        </div>
    );
};
