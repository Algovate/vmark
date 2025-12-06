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
    batchProgress?: { current: number; total: number } | null;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, onChange, onDownload, exportOptions, onExportOptionsChange, isBatchMode, onDownloadAll, batchProgress }) => {
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

    const isProcessing = batchProgress !== null;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', width: '300px', flexShrink: 0, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>{t('settings.title')}</h2>

            <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <label style={{ marginBottom: '0.75rem', display: 'block' }}>{t('settings.watermarkType')}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }} role="radiogroup" aria-label={t('settings.watermarkType')}>
                    <button
                        onClick={() => handleChange('type', 'text')}
                        role="radio"
                        aria-checked={config.type === 'text'}
                        disabled={isProcessing}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: `1px solid ${config.type === 'text' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-sm)',
                            background: config.type === 'text'
                                ? 'rgba(59, 130, 246, 0.2)'
                                : 'rgba(0, 0, 0, 0.2)',
                            color: 'var(--text-primary)',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: config.type === 'text' ? '600' : '400',
                            transition: 'var(--transition-fast)',
                            opacity: isProcessing ? 0.6 : 1,
                        }}
                    >
                        {t('settings.textWatermark')}
                    </button>
                    <button
                        onClick={() => handleChange('type', 'image')}
                        role="radio"
                        aria-checked={config.type === 'image'}
                        disabled={isProcessing}
                        style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: `1px solid ${config.type === 'image' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                            borderRadius: 'var(--radius-sm)',
                            background: config.type === 'image'
                                ? 'rgba(59, 130, 246, 0.2)'
                                : 'rgba(0, 0, 0, 0.2)',
                            color: 'var(--text-primary)',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: config.type === 'image' ? '600' : '400',
                            transition: 'var(--transition-fast)',
                            opacity: isProcessing ? 0.6 : 1,
                        }}
                    >
                        {t('settings.imageWatermark')}
                    </button>
                </div>
            </div>

            {config.type === 'text' && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="watermark-text">{t('settings.watermarkText')}</label>
                    <textarea
                        id="watermark-text"
                        value={config.text}
                        onChange={(e) => handleChange('text', e.target.value)}
                        disabled={isProcessing}
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
                            cursor: isProcessing ? 'not-allowed' : 'text',
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
                        disabled={isProcessing}
                        aria-label={config.imageFile ? t('settings.changeWatermarkImage') : t('settings.uploadWatermarkImage')}
                        style={{ width: '100%' }}
                    >
                        {config.imageFile ? t('settings.changeWatermarkImage') : t('settings.uploadWatermarkImage')}
                    </button>
                </div>
            )}

            {config.type === 'text' && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ marginBottom: '0.75rem', display: 'block' }} htmlFor="watermark-color">{t('settings.color')}</label>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                id="watermark-color"
                                type="color"
                                value={config.color}
                                onChange={(e) => handleChange('color', e.target.value)}
                                disabled={isProcessing}
                                style={{
                                    width: '50px',
                                    height: '50px',
                                    border: '2px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
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
                            onChange={(e) => handleChange('color', e.target.value)}
                            disabled={isProcessing}
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
            )}

            {config.type === 'text' && (
            <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="font-size" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span>{t('settings.fontSize')}</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.875rem' }}>{config.fontSize}px</span>
                </label>
                <input
                    id="font-size"
                    type="range"
                    min="12"
                    max="200"
                    value={config.fontSize}
                    onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                    disabled={isProcessing}
                    style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                />
            </div>
            )}

            {config.type === 'image' && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="image-size" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span>{t('settings.imageSize')}</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.875rem' }}>{config.imageSize}%</span>
                    </label>
                    <input
                        id="image-size"
                        type="range"
                        min="10"
                        max="200"
                        value={config.imageSize}
                        onChange={(e) => handleChange('imageSize', Number(e.target.value))}
                        disabled={isProcessing}
                        style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                    />
                </div>
            )}

            <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="opacity" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span>{t('settings.opacity')}</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.875rem' }}>{Math.round(config.opacity * 100)}%</span>
                </label>
                <input
                    id="opacity"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={config.opacity}
                    onChange={(e) => handleChange('opacity', Number(e.target.value))}
                    disabled={isProcessing}
                    style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="rotation" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span>{t('settings.rotation')}</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.875rem' }}>{config.rotation}°</span>
                </label>
                <input
                    id="rotation"
                    type="range"
                    min="0"
                    max="360"
                    value={config.rotation}
                    onChange={(e) => handleChange('rotation', Number(e.target.value))}
                    disabled={isProcessing}
                    style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="repeat-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isProcessing ? 'not-allowed' : 'pointer' }}>
                    <input
                        id="repeat-checkbox"
                        type="checkbox"
                        checked={config.repeat}
                        onChange={(e) => handleChange('repeat', e.target.checked)}
                        disabled={isProcessing}
                        style={{
                            width: '18px',
                            height: '18px',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            accentColor: 'var(--accent-primary)'
                        }}
                    />
                    <span>{t('settings.repeat')}</span>
                </label>
            </div>

            {config.repeat && (
                <div style={{ marginBottom: '2rem' }}>
                    <label htmlFor="spacing" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span>{t('settings.spacing')}</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.875rem' }}>{config.spacing}px</span>
                    </label>
                    <input
                        id="spacing"
                        type="range"
                        min="50"
                        max="500"
                        value={config.spacing}
                        onChange={(e) => handleChange('spacing', Number(e.target.value))}
                        disabled={isProcessing}
                        style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                    />
                </div>
            )}

            {!config.repeat && <div style={{ marginBottom: '1.5rem' }} />}

            <div style={{ marginBottom: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <label style={{ marginBottom: '0.75rem', display: 'block' }}>{t('settings.exportFormat')}</label>
                <div style={{ display: 'flex', gap: '0.5rem' }} role="radiogroup" aria-label={t('settings.exportFormat')}>
                    {(['png', 'jpeg', 'webp'] as const).map((format) => (
                        <button
                            key={format}
                            onClick={() => handleExportFormatChange(format)}
                            role="radio"
                            aria-checked={exportOptions.format === format}
                            disabled={isProcessing}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                border: `1px solid ${exportOptions.format === format ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                borderRadius: 'var(--radius-sm)',
                                background: exportOptions.format === format
                                    ? 'rgba(59, 130, 246, 0.2)'
                                    : 'rgba(0, 0, 0, 0.2)',
                                color: 'var(--text-primary)',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                fontWeight: exportOptions.format === format ? '600' : '400',
                                transition: 'var(--transition-fast)',
                                opacity: isProcessing ? 0.6 : 1,
                            }}
                        >
                            {format}
                        </button>
                    ))}
                </div>
            </div>

            {(exportOptions.format === 'jpeg' || exportOptions.format === 'webp') && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="quality" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span>{t('settings.quality')}</span>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: '600', fontSize: '0.875rem' }}>{Math.round(exportOptions.quality * 100)}%</span>
                    </label>
                    <input
                        id="quality"
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.01"
                        value={exportOptions.quality}
                        onChange={(e) => handleExportQualityChange(Number(e.target.value))}
                        disabled={isProcessing}
                        style={{ cursor: isProcessing ? 'not-allowed' : 'pointer' }}
                    />
                </div>
            )}

            {batchProgress && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Processing...</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: '600' }}>
                            {batchProgress.current} / {batchProgress.total}
                        </span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(0, 0, 0, 0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                            style={{
                                width: `${(batchProgress.current / batchProgress.total) * 100}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </div>
                </div>
            )}

            <button
                className="btn-primary"
                style={{
                    width: '100%',
                    marginBottom: isBatchMode ? '1rem' : 0,
                    opacity: isProcessing ? 0.6 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                }}
                onClick={() => onDownload(exportOptions)}
                disabled={isProcessing}
                aria-label={t('settings.download')}
            >
                {t('settings.download')}
            </button>

            {isBatchMode && (
                <button
                    className="btn-secondary"
                    style={{
                        width: '100%',
                        opacity: isProcessing ? 0.6 : 1,
                        cursor: isProcessing ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => onDownloadAll && onDownloadAll(exportOptions)}
                    disabled={isProcessing}
                    aria-label={t('settings.downloadAll')}
                >
                    {t('settings.downloadAll')}
                </button>
            )}
        </div>
    );
};
