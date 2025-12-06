import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { WatermarkConfig } from './ControlPanel';
import { useDebounce } from '../hooks/useDebounce';
import { drawWatermarkOnCanvas } from '../utils/watermarkUtils';

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
    const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
    
    // Debounce position updates for better performance
    const debouncedPosition = useDebounce(position, 100);

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
            // Revoke object URL after image is loaded
            URL.revokeObjectURL(objectUrl);
        };

        img.onerror = () => {
            setError('upload.error');
            setIsLoading(false);
            setImage(null);
            // Revoke object URL on error
            URL.revokeObjectURL(objectUrl);
        };

        // Cleanup function
        return () => {
            // Revoke object URL if component unmounts before image loads
            URL.revokeObjectURL(objectUrl);
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
            // Revoke object URL after image is loaded
            URL.revokeObjectURL(objectUrl);
        };

        img.onerror = () => {
            setWatermarkImage(null);
            // Revoke object URL on error
            URL.revokeObjectURL(objectUrl);
        };

        return () => {
            // Revoke object URL if component unmounts or config changes before image loads
            URL.revokeObjectURL(objectUrl);
        };
    }, [config.type, config.imageFile]);

    // Draw canvas with debouncing for better performance
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !image) return;

        // For image watermarks, wait until watermark image is loaded
        if (config.type === 'image' && !watermarkImage) return;

        // Use debounced position for rendering to reduce redraws
        const positionToUse = isDragging && dragPosition ? dragPosition : debouncedPosition;

        // Use requestAnimationFrame for smooth rendering
        const drawFrame = requestAnimationFrame(() => {
            drawWatermarkOnCanvas(canvas, image, config, positionToUse, watermarkImage || undefined);
            // Notify parent that canvas is updated (for download)
            if (!isDragging) {
                onCanvasReady(canvas);
            }
        });

        return () => cancelAnimationFrame(drawFrame);
    }, [image, config, debouncedPosition, onCanvasReady, watermarkImage, isDragging, dragPosition]);

    // Handle Dragging
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (config.repeat) return; // Don't allow dragging in repeat mode
        e.preventDefault();
        setIsDragging(true);
        
        if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            setDragPosition({ x, y });
        }
    }, [config.repeat]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || !canvasRef.current || config.repeat) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

        setDragPosition({ x, y });
    }, [isDragging, config.repeat]);

    const handleMouseUp = useCallback(() => {
        if (isDragging && dragPosition) {
            setPosition(dragPosition);
            setDragPosition(null);
        }
        setIsDragging(false);
    }, [isDragging, dragPosition]);

    const handleMouseLeave = useCallback(() => {
        if (isDragging && dragPosition) {
            setPosition(dragPosition);
            setDragPosition(null);
        }
        setIsDragging(false);
    }, [isDragging, dragPosition]);

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
                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={!config.repeat ? handleMouseDown : undefined}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseLeave}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '70vh',
                            cursor: !config.repeat ? (isDragging ? 'grabbing' : 'grab') : 'default',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: isDragging ? 'none' : 'transform 0.1s ease',
                        }}
                        aria-label="Watermarked image canvas"
                    />
                    {isDragging && dragPosition && !config.repeat && (
                        <div
                            style={{
                                position: 'absolute',
                                left: `${dragPosition.x}%`,
                                top: `${dragPosition.y}%`,
                                transform: 'translate(-50%, -50%)',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                border: '2px solid var(--accent-primary)',
                                background: 'rgba(59, 130, 246, 0.3)',
                                pointerEvents: 'none',
                                boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
                                animation: 'pulse 1.5s ease-in-out infinite',
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};
