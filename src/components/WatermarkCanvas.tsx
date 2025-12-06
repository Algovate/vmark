import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { WatermarkConfig } from './ControlPanel';
import { useDebounce } from '../hooks/useDebounce';
import { useImageLoader } from '../hooks/useImageLoader';
import { drawWatermarkOnCanvas } from '../utils/watermarkUtils';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorDisplay } from './ErrorDisplay';
import { DragIndicator } from './DragIndicator';

interface WatermarkCanvasProps {
    imageFile: File | null;
    config: WatermarkConfig;
    onCanvasReady: (canvas: HTMLCanvasElement) => void;
}

export const WatermarkCanvas: React.FC<WatermarkCanvasProps> = ({ imageFile, config, onCanvasReady }) => {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [position, setPosition] = useState({ x: 50, y: 50 }); // Percentage 0-100
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
    
    // Use custom hook for image loading
    const { image, isLoading, error } = useImageLoader(imageFile);
    const { image: watermarkImage } = useImageLoader(
        config.type === 'image' ? config.imageFile : null
    );
    
    // Debounce position updates for better performance
    const debouncedPosition = useDebounce(position, 100);

    // Reset position when new image loads
    useEffect(() => {
        if (image) {
            setPosition({ x: 50, y: 50 });
        }
    }, [image]);

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
        <div className="glass-panel" style={{ padding: '1rem', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', position: 'relative' }}>
            {isLoading && (
                <div style={{ position: 'absolute' }}>
                    <LoadingSpinner message={t('upload.loading')} />
                </div>
            )}
            {error && <ErrorDisplay error={error} />}
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
                    <DragIndicator
                        position={dragPosition || { x: 0, y: 0 }}
                        visible={isDragging && dragPosition !== null && !config.repeat}
                    />
                </div>
            )}
        </div>
    );
};
