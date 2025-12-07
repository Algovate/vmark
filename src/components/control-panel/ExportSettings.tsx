import React from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButton } from '../ToggleButton';
import { SliderInput } from '../SliderInput';
import type { ExportOptions } from '../ControlPanel';

interface ExportSettingsProps {
    options: ExportOptions;
    onChange: (options: ExportOptions) => void;
    disabled?: boolean;
}

export const ExportSettings: React.FC<ExportSettingsProps> = ({ options, onChange, disabled }) => {
    const { t } = useTranslation();

    const handleFormatChange = (format: 'png' | 'jpeg' | 'webp') => {
        onChange({ ...options, format });
    };

    const handleQualityChange = (quality: number) => {
        onChange({ ...options, quality });
    };

    return (
        <>
            <div style={{ marginBottom: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <label style={{ marginBottom: '0.75rem', display: 'block' }}>{t('settings.exportFormat')}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }} role="radiogroup" aria-label={t('settings.exportFormat')}>
                    {(['png', 'jpeg', 'webp'] as const).map((format) => (
                        <ToggleButton
                            key={format}
                            value={format}
                            selected={options.format === format}
                            onClick={() => handleFormatChange(format)}
                            disabled={disabled}
                        >
                            {format.toUpperCase()}
                        </ToggleButton>
                    ))}
                </div>
            </div>

            {(options.format === 'jpeg' || options.format === 'webp') && (
                <SliderInput
                    id="quality"
                    label={t('settings.quality')}
                    value={options.quality}
                    min={0.1}
                    max={1}
                    step={0.01}
                    unit="%"
                    disabled={disabled}
                    onChange={handleQualityChange}
                    formatValue={(value) => `${Math.round(value * 100)}%`}
                />
            )}
        </>
    );
};
