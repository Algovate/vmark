import React from 'react';
import { useTranslation } from 'react-i18next';

export type WatermarkType = 'text' | 'image';

export interface WatermarkConfig {
    type: WatermarkType;
    text: string;
    color: string;
    fontSize: number;
    opacity: number;
    rotation: number;
    repeat: boolean;
    spacing: number;
    imageFile?: File;
    imageSize: number; // percentage 10-200
}

export interface ExportOptions {
    format: 'png' | 'jpeg' | 'webp';
    quality: number; // 0-1 for JPEG/WebP
}

interface ControlPanelProps {
    config: WatermarkConfig;
    onChange: (config: WatermarkConfig) => void;
    onDownload: (exportOptions: ExportOptions) => void;
    exportOptions: ExportOptions;
    onExportOptionsChange: (options: ExportOptions) => void;
    isBatchMode?: boolean;
    onDownloadAll?: (exportOptions: ExportOptions) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, onChange, onDownload, exportOptions, onExportOptionsChange, isBatchMode, onDownloadAll }) => {
    const { t } = useTranslation();

    const handleChange = (key: keyof WatermarkConfig, value: string | number | boolean | File) => {
        onChange({ ...config, [key]: value });
    };

    const handleExportFormatChange = (format: 'png' | 'jpeg' | 'webp') => {
        onExportOptionsChange({ ...exportOptions, format });
    };

    const handleExportQualityChange = (quality: number) => {
        onExportOptionsChange({ ...exportOptions, quality });
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', width: '300px', flexShrink: 0 }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>{t('settings.title')}</h2>

            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <label style={{ marginBottom: '0.75rem', display: 'block' }}>{t('settings.watermarkType')}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => handleChange('type', 'text')}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: `1px solid ${config.type === 'text' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-sm)',
                            background: config.type === 'text'
                                ? 'rgba(59, 130, 246, 0.2)'
                                : 'rgba(0, 0, 0, 0.2)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: config.type === 'text' ? '600' : '400',
                            transition: 'var(--transition-fast)'
                        }}
                    >
                        {t('settings.textWatermark')}
                    </button>
                    <button
                        onClick={() => handleChange('type', 'image')}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: `1px solid ${config.type === 'image' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-sm)',
                            background: config.type === 'image'
                                ? 'rgba(59, 130, 246, 0.2)'
                                : 'rgba(0, 0, 0, 0.2)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: config.type === 'image' ? '600' : '400',
                            transition: 'var(--transition-fast)'
                        }}
                    >
                        {t('settings.imageWatermark')}
                    </button>
                </div>
            </div>

            {config.type === 'text' && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label>{t('settings.watermarkText')}</label>
                    <textarea
                        value={config.text}
                        onChange={(e) => handleChange('text', e.target.value)}
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
                            fontFamily: 'inherit'
                        }}
                    />
                </div>
            )}

            {config.type === 'image' && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ marginBottom: '0.75rem', display: 'block' }}>
                        {config.imageFile ? t('settings.watermarkImagePreview') : t('settings.uploadWatermarkImage')}
                    </label>
                    {config.imageFile && (
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
                                src={URL.createObjectURL(config.imageFile)}
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
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0];
                                if (file) {
                                    handleChange('imageFile', file);
                                }
                            };
                            input.click();
                        }}
                        style={{ width: '100%' }}
                    >
                        {config.imageFile ? t('settings.changeWatermarkImage') : t('settings.uploadWatermarkImage')}
                    </button>
                </div>
            )}

            {config.type === 'text' && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label>{t('settings.color')}</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="color"
                            value={config.color}
                            onChange={(e) => handleChange('color', e.target.value)}
                            style={{
                                width: '40px',
                                height: '40px',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                backgroundColor: 'transparent'
                            }}
                        />
                        <input
                            type="text"
                            value={config.color}
                            onChange={(e) => handleChange('color', e.target.value)}
                            style={{ flex: 1 }}
                        />
                    </div>
                </div>
            )}

            {config.type === 'text' && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label>{t('settings.fontSize')} ({config.fontSize}px)</label>
                    <input
                        type="range"
                        min="12"
                        max="200"
                        value={config.fontSize}
                        onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                    />
                </div>
            )}

            {config.type === 'image' && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label>{t('settings.imageSize')} ({config.imageSize}%)</label>
                    <input
                        type="range"
                        min="10"
                        max="200"
                        value={config.imageSize}
                        onChange={(e) => handleChange('imageSize', Number(e.target.value))}
                    />
                </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
                <label>{t('settings.opacity')} ({Math.round(config.opacity * 100)}%)</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={config.opacity}
                    onChange={(e) => handleChange('opacity', Number(e.target.value))}
                />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label>{t('settings.rotation')} ({config.rotation}°)</label>
                <input
                    type="range"
                    min="0"
                    max="360"
                    value={config.rotation}
                    onChange={(e) => handleChange('rotation', Number(e.target.value))}
                />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={config.repeat}
                        onChange={(e) => handleChange('repeat', e.target.checked)}
                        style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: 'var(--accent-primary)'
                        }}
                    />
                    <span>{t('settings.repeat')}</span>
                </label>
            </div>

            {config.repeat && (
                <div style={{ marginBottom: '2rem' }}>
                    <label>{t('settings.spacing')} ({config.spacing}px)</label>
                    <input
                        type="range"
                        min="50"
                        max="500"
                        value={config.spacing}
                        onChange={(e) => handleChange('spacing', Number(e.target.value))}
                    />
                </div>
            )}

            {!config.repeat && <div style={{ marginBottom: '1.5rem' }} />}

            <div style={{ marginBottom: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <label style={{ marginBottom: '0.75rem', display: 'block' }}>{t('settings.exportFormat')}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {(['png', 'jpeg', 'webp'] as const).map((format) => (
                        <button
                            key={format}
                            onClick={() => handleExportFormatChange(format)}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                border: `1px solid ${exportOptions.format === format ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                borderRadius: 'var(--radius-sm)',
                                background: exportOptions.format === format
                                    ? 'rgba(59, 130, 246, 0.2)'
                                    : 'rgba(0, 0, 0, 0.2)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                fontWeight: exportOptions.format === format ? '600' : '400',
                                transition: 'var(--transition-fast)'
                            }}
                        >
                            {format}
                        </button>
                    ))}
                </div>
            </div>

            {(exportOptions.format === 'jpeg' || exportOptions.format === 'webp') && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label>{t('settings.quality')} ({Math.round(exportOptions.quality * 100)}%)</label>
                    <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.01"
                        value={exportOptions.quality}
                        onChange={(e) => handleExportQualityChange(Number(e.target.value))}
                    />
                </div>
            )}

            <button
                className="btn-primary"
                style={{ width: '100%', marginBottom: isBatchMode ? '1rem' : 0 }}
                onClick={() => onDownload(exportOptions)}
            >
                {t('settings.download')}
            </button>

            {isBatchMode && (
                <button
                    className="btn-secondary"
                    style={{ width: '100%' }}
                    onClick={() => onDownloadAll && onDownloadAll(exportOptions)}
                >
                    {t('settings.downloadAll')}
                </button>
            )}
        </div>
    );
};
