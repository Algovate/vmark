import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SliderInput } from '../SliderInput';
import { triggerFileInput } from '../../utils/fileInputUtils';
import { isValidImageFile } from '../../utils/fileUtils';
import type { WatermarkConfig } from '../ControlPanel';

interface ImageSettingsProps {
    config: WatermarkConfig;
    onChange: (key: keyof WatermarkConfig, value: File | number) => void;
    disabled?: boolean;
}

export const ImageSettings: React.FC<ImageSettingsProps> = ({ config, onChange, disabled }) => {
    const { t } = useTranslation();
    const [watermarkPreviewUrl, setWatermarkPreviewUrl] = useState<string | null>(null);

    // Handle watermark image preview URL cleanup
    useEffect(() => {
        if (config.type === 'image' && config.imageFile) {
            const objectUrl = URL.createObjectURL(config.imageFile);
            setWatermarkPreviewUrl(objectUrl);
            return () => {
                URL.revokeObjectURL(objectUrl);
            };
        } else {
            setWatermarkPreviewUrl(null);
        }
    }, [config.type, config.imageFile]);

    return (
        <>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ marginBottom: '0.75rem', display: 'block' }}>
                    {config.imageFile ? t('settings.watermarkImagePreview') : t('settings.uploadWatermarkImage')}
                </label>
                {config.imageFile && watermarkPreviewUrl && (
                    <div style={{
                        marginBottom: '0.75rem',
                        padding: '0.5rem',
                        background: 'rgba(0, 0, 0, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <img
                            src={watermarkPreviewUrl}
                            alt="Watermark preview"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '120px',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                )}
                <button
                    className="btn-secondary"
                    onClick={() => {
                        triggerFileInput({
                            multiple: false,
                            accept: 'image/*',
                            onSelect: (files) => {
                                const file = files[0];
                                if (file && isValidImageFile(file)) {
                                    onChange('imageFile', file);
                                }
                            },
                        });
                    }}
                    disabled={disabled}
                    aria-label={config.imageFile ? t('settings.changeWatermarkImage') : t('settings.uploadWatermarkImage')}
                    style={{ width: '100%' }}
                >
                    {config.imageFile ? t('settings.changeWatermarkImage') : t('settings.uploadWatermarkImage')}
                </button>
            </div>

            <SliderInput
                id="image-size"
                label={t('settings.imageSize')}
                value={config.imageSize}
                min={10}
                max={200}
                unit="%"
                disabled={disabled}
                onChange={(value) => onChange('imageSize', value)}
            />
        </>
    );
};
