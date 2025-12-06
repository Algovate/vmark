import React, { useState, useEffect } from 'react';
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
    const [imageUrls, setImageUrls] = useState<Map<number, string>>(new Map());

    // Manage object URLs for image previews
    useEffect(() => {
        const urlMap = new Map<number, string>();
        images.forEach((file, index) => {
            const url = URL.createObjectURL(file);
            urlMap.set(index, url);
        });

        setImageUrls(urlMap);

        return () => {
            // Cleanup all object URLs
            urlMap.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [images]);

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
                        role="button"
                        tabIndex={0}
                        aria-label={`Select image ${index + 1}: ${file.name}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onSelect(index);
                            }
                        }}
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
                        onMouseEnter={(e) => {
                            if (index !== selectedIndex) {
                                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (index !== selectedIndex) {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }
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
                            {imageUrls.get(index) && (
                                <img
                                    src={imageUrls.get(index)!}
                                    alt={file.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />
                            )}
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
                            aria-label={`${t('sidebar.remove')} ${file.name}`}
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
                                transition: 'all 0.2s ease',
                                width: '24px',
                                height: '24px',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                e.currentTarget.style.color = '#ef4444';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'none';
                                e.currentTarget.style.color = 'var(--text-secondary)';
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
