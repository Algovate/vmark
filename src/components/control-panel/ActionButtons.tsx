import React from 'react';
import { useTranslation } from 'react-i18next';
import type { ExportOptions } from '../ControlPanel';

interface ActionButtonsProps {
    onDownload: (options: ExportOptions) => void;
    onDownloadAll?: (options: ExportOptions) => void;
    exportOptions: ExportOptions;
    isBatchMode?: boolean;
    batchProgress?: { current: number; total: number } | null;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    onDownload,
    onDownloadAll,
    exportOptions,
    isBatchMode,
    batchProgress
}) => {
    const { t } = useTranslation();
    const isProcessing = batchProgress !== null;

    return (
        <>
            {batchProgress && (
                <div
                    role="progressbar"
                    aria-valuenow={batchProgress.current}
                    aria-valuemin={0}
                    aria-valuemax={batchProgress.total}
                    aria-label={`Processing ${batchProgress.current} of ${batchProgress.total} images`}
                    style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                >
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
        </>
    );
};
