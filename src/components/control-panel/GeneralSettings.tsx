import React from 'react';
import { useTranslation } from 'react-i18next';
import { SliderInput } from '../SliderInput';
import type { WatermarkConfig } from '../ControlPanel';

interface GeneralSettingsProps {
    config: WatermarkConfig;
    onChange: (key: keyof WatermarkConfig, value: number | boolean) => void;
    disabled?: boolean;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({ config, onChange, disabled }) => {
    const { t } = useTranslation();

    return (
        <>
            <SliderInput
                id="opacity"
                label={t('settings.opacity')}
                value={config.opacity}
                min={0}
                max={1}
                step={0.01}
                unit="%"
                disabled={disabled}
                onChange={(value) => onChange('opacity', value)}
                formatValue={(value) => `${Math.round(value * 100)}%`}
            />

            <SliderInput
                id="rotation"
                label={t('settings.rotation')}
                value={config.rotation}
                min={0}
                max={360}
                unit="°"
                disabled={disabled}
                onChange={(value) => onChange('rotation', value)}
            />

            <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="repeat-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: disabled ? 'not-allowed' : 'pointer' }}>
                    <input
                        id="repeat-checkbox"
                        type="checkbox"
                        checked={config.repeat}
                        onChange={(e) => onChange('repeat', e.target.checked)}
                        disabled={disabled}
                        style={{
                            width: '18px',
                            height: '18px',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            accentColor: 'var(--accent-primary)'
                        }}
                    />
                    <span>{t('settings.repeat')}</span>
                </label>
            </div>

            {config.repeat && (
                <SliderInput
                    id="spacing"
                    label={t('settings.spacing')}
                    value={config.spacing}
                    min={50}
                    max={500}
                    unit="px"
                    disabled={disabled}
                    onChange={(value) => onChange('spacing', value)}
                />
            )}

            {!config.repeat && <div style={{ marginBottom: '1.5rem' }} />}
        </>
    );
};
