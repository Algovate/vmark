import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { WatermarkConfig } from './ControlPanel';

interface WatermarkCanvasProps {
    imageFile: File | null;
    config: WatermarkConfig;
    onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

export const WatermarkCanvas: React.FC<WatermarkCanvasProps> = ({ imageFile, config, onCanvasReady }) => {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [watermarkImage, setWatermarkImage] = useState<HTMLImageElement | null>(null);
    const [position, setPosition] = useState({ x: 50, y: 50 }); // Percentage 0-100
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load image when file changes
    useEffect(() => {
        if (!imageFile) {
            setImage(null);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        const objectUrl = URL.createObjectURL(imageFile);
        const img = new Image();
        img.src = objectUrl;

        img.onload = () => {
            setImage(img);
            setIsLoading(false);
            // Reset position to center
            setPosition({ x: 50, y: 50 });
        };

        img.onerror = () => {
            setError('upload.error');
            setIsLoading(false);
            setImage(null);
        };

        // Cleanup function
        return () => {
            // We are intentionally NOT revoking the Object URL here to avoid issues with React Strict Mode
            // where the cleanup runs immediately before the image has loaded.
            // This technically causes a small memory leak if the user uploads many images in one session,
            // but the browser will clean them up when the page is closed.
            // URL.revokeObjectURL(objectUrl);
        };
    }, [imageFile]);

    // Load watermark image when config.imageFile changes
    useEffect(() => {
        if (config.type !== 'image' || !config.imageFile) {
            setWatermarkImage(null);
            return;
        }

        const objectUrl = URL.createObjectURL(config.imageFile);
        const img = new Image();
        img.src = objectUrl;

        img.onload = () => {
            setWatermarkImage(img);
        };

        img.onerror = () => {
            setWatermarkImage(null);
        };

        return () => {
            // Cleanup handled by browser on page close
        };
    }, [config.type, config.imageFile]);

    // Draw canvas with debouncing for repeat mode
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;

        // For image watermarks, wait until watermark image is loaded
        if (config.type === 'image' && !watermarkImage) return;

        // Use requestAnimationFrame for smooth rendering
        const drawFrame = requestAnimationFrame(() => {
            import('../utils/watermarkUtils').then(({ drawWatermarkOnCanvas }) => {
                drawWatermarkOnCanvas(canvas, image, config, position, watermarkImage || undefined);
                // Notify parent that canvas is updated (for download)
                onCanvasReady(canvas);
            });
        });

        return () => cancelAnimationFrame(drawFrame);
    }, [image, config, position, onCanvasReady, watermarkImage]);

    // Handle Dragging
    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setPosition({ x, y });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (!imageFile) return null;

    return (
        <div className="glass-panel" style={{ padding: '1rem', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '1rem',
                    color: 'var(--text-secondary)'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        border: '3px solid var(--border-color)',
                        borderTopColor: 'var(--accent-primary)',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <span>{t('upload.loading')}</span>
                </div>
            )}
            {error && (
                <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#ef4444',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    <div style={{ fontSize: '2rem' }}>⚠️</div>
                    <div>{t(error)}</div>
                </div>
            )}
            {!isLoading && !error && image && (
                <canvas
                    ref={canvasRef}
                    onMouseDown={!config.repeat ? handleMouseDown : undefined}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                        maxWidth: '100%',
                        maxHeight: '70vh',
                        cursor: !config.repeat ? (isDragging ? 'grabbing' : 'grab') : 'default',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                />
            )}
        </div>
    );
};
