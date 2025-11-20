import React from 'react';
import { useTranslation } from 'react-i18next';

interface ImageSidebarProps {
    images: File[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    onRemove: (index: number) => void;
}

export const ImageSidebar: React.FC<ImageSidebarProps> = ({
    images,
    selectedIndex,
    onSelect,
    onRemove,
}) => {
    const { t } = useTranslation();

    return (
        <div
            className="glass-panel"
            style={{
                width: '250px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '1rem',
                height: 'fit-content',
                maxHeight: '80vh',
                overflowY: 'auto',
            }}
        >
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                {t('sidebar.images')} ({images.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {images.map((file, index) => (
                    <div
                        key={`${file.name}-${index}`}
                        onClick={() => onSelect(index)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            backgroundColor:
                                index === selectedIndex
                                    ? 'rgba(255, 255, 255, 0.1)'
                                    : 'transparent',
                            border:
                                index === selectedIndex
                                    ? '1px solid var(--accent-primary)'
                                    : '1px solid transparent',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '4px',
                                overflow: 'hidden',
                                flexShrink: 0,
                                backgroundColor: '#000',
                            }}
                        >
                            <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                }}
                                onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                            />
                        </div>
                        <div
                            style={{
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            {file.name}
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove(index);
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                            title={t('sidebar.remove')}
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
