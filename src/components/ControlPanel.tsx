import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { WatermarkTypeSelector } from './control-panel/WatermarkTypeSelector';
import { TextSettings } from './control-panel/TextSettings';
import { ImageSettings } from './control-panel/ImageSettings';
import { GeneralSettings } from './control-panel/GeneralSettings';
import { ExportSettings } from './control-panel/ExportSettings';
import { ActionButtons } from './control-panel/ActionButtons';

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
    const isProcessing = batchProgress !== null;

    const handleChange = useCallback((key: keyof WatermarkConfig, value: string | number | boolean | File) => {
        onChange({ ...config, [key]: value });
    }, [config, onChange]);

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', width: '300px', flexShrink: 0, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text-primary)' }}>{t('settings.title')}</h2>

            <WatermarkTypeSelector
                config={config}
                onChange={(type) => handleChange('type', type)}
                disabled={isProcessing}
            />

            {config.type === 'text' && (
                <TextSettings
                    config={config}
                    onChange={handleChange}
                    disabled={isProcessing}
                />
            )}

            {config.type === 'image' && (
                <ImageSettings
                    config={config}
                    onChange={handleChange}
                    disabled={isProcessing}
                />
            )}

            <GeneralSettings
                config={config}
                onChange={handleChange}
                disabled={isProcessing}
            />

            <ExportSettings
                options={exportOptions}
                onChange={onExportOptionsChange}
                disabled={isProcessing}
            />

            <ActionButtons
                onDownload={onDownload}
                onDownloadAll={onDownloadAll}
                exportOptions={exportOptions}
                isBatchMode={isBatchMode}
                batchProgress={batchProgress}
            />
        </div>
    );
};
