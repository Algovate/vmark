import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { WatermarkConfig } from './ControlPanel';
import { useImageLoader } from '../hooks/useImageLoader';
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
    
    // Refs for drag state and optimization
    const dragStateRef = useRef<{ isDragging: boolean; position: { x: number; y: number } | null }>({
        isDragging: false,
        position: null,
    });
    const canvasRectRef = useRef<DOMRect | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const needsRedrawRef = useRef<boolean>(false);
    const handlersRef = useRef<{
        handleGlobalMouseMove: ((e: MouseEvent) => void) | null;
        handleGlobalMouseUp: (() => void) | null;
    }>({ handleGlobalMouseMove: null, handleGlobalMouseUp: null });
    // Offscreen canvas for caching background image
    const backgroundCanvasRef = useRef<HTMLCanvasElement | null>(null);
    // Current position ref - stores the position to use for rendering (drag position or debounced position)
    const currentPositionRef = useRef<{ x: number; y: number }>({ x: 50, y: 50 });
    // Refs to store values needed for rendering (to avoid recreating redrawCanvas)
    const configRef = useRef<WatermarkConfig>(config);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const watermarkImageRef = useRef<HTMLImageElement | null>(null);
    const onCanvasReadyRef = useRef(onCanvasReady);
    
    // Use custom hook for image loading
    const { image, isLoading, error } = useImageLoader(imageFile);
    const { image: watermarkImage } = useImageLoader(
        config.type === 'image' ? config.imageFile : null
    );
    
    // Store previous config for deep comparison
    const prevConfigRef = useRef<WatermarkConfig>(config);
    
    // Update refs when values change and trigger redraw (with deep comparison)
    useEffect(() => {
        const prev = prevConfigRef.current;
        const needsUpdate = 
            prev.type !== config.type ||
            prev.text !== config.text ||
            prev.color !== config.color ||
            prev.fontSize !== config.fontSize ||
            prev.opacity !== config.opacity ||
            prev.rotation !== config.rotation ||
            prev.repeat !== config.repeat ||
            prev.imageFile !== config.imageFile ||
            prev.imageSize !== config.imageSize;
        
        if (needsUpdate) {
            configRef.current = config;
            prevConfigRef.current = config;
            needsRedrawRef.current = true;
        } else {
            configRef.current = config; // Still update ref to keep it current
            prevConfigRef.current = config;
        }
    }, [config]);
    
    useEffect(() => {
        imageRef.current = image || null;
    }, [image]);
    
    useEffect(() => {
        watermarkImageRef.current = watermarkImage || null;
    }, [watermarkImage]);
    
    useEffect(() => {
        onCanvasReadyRef.current = onCanvasReady;
    }, [onCanvasReady]);
    
    // Reset position when new image loads
    useEffect(() => {
        if (image) {
            const defaultPosition = { x: 50, y: 50 };
            setPosition(defaultPosition);
            currentPositionRef.current = defaultPosition;
        }
    }, [image]);

    // Update currentPositionRef when position changes (only when not dragging)
    // This handles non-drag position updates (e.g., programmatic position changes)
    useEffect(() => {
        if (!dragStateRef.current.isDragging) {
            // Use epsilon comparison to handle floating point precision issues
            const POSITION_EPSILON = 0.01;
            const xDiff = Math.abs(currentPositionRef.current.x - position.x);
            const yDiff = Math.abs(currentPositionRef.current.y - position.y);
            
            if (xDiff > POSITION_EPSILON || yDiff > POSITION_EPSILON) {
                currentPositionRef.current = position;
                needsRedrawRef.current = true;
            }
        }
    }, [position]);

    // Cache background image to offscreen canvas
    useEffect(() => {
        if (!image) {
            backgroundCanvasRef.current = null;
            return;
        }

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = image.width;
        offscreenCanvas.height = image.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        if (offscreenCtx) {
            offscreenCtx.drawImage(image, 0, 0);
            backgroundCanvasRef.current = offscreenCanvas;
        }
    }, [image]);

    // Optimized redraw function using cached background and refs (no dependencies to avoid recreation)
    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const currentImage = imageRef.current;
        const currentConfig = configRef.current;
        const currentWatermarkImage = watermarkImageRef.current;
        
        if (!canvas || !currentImage) return;

        // For image watermarks, wait until watermark image is loaded
        if (currentConfig.type === 'image' && !currentWatermarkImage) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match image (only if size changed to avoid clearing content)
        // Setting canvas.width/height clears the entire canvas, so we only do it when necessary
        if (canvas.width !== currentImage.width || canvas.height !== currentImage.height) {
            canvas.width = currentImage.width;
            canvas.height = currentImage.height;
        }

        // Use cached background canvas for faster rendering during drag
        // Always use cached background if available (faster than redrawing from image)
        if (backgroundCanvasRef.current) {
            // Fast path: copy background from cached canvas (much faster than redrawing)
            ctx.drawImage(backgroundCanvasRef.current, 0, 0);
        } else {
            // Normal path: draw background image (fallback if cache not available)
            ctx.drawImage(currentImage, 0, 0);
        }

        // Use current position from ref (always up-to-date, no dependency on state)
        const positionToUse = currentPositionRef.current;

        // Draw watermark only
        if (currentConfig.type === 'image' && currentWatermarkImage) {
            // Image watermark
            const baseSize = Math.min(canvas.width, canvas.height);
            const scaleFactor = (currentConfig.imageSize / 100) * (baseSize / 500);
            const watermarkWidth = currentWatermarkImage.width * scaleFactor;
            const watermarkHeight = currentWatermarkImage.height * scaleFactor;

            // Function to draw a single image watermark at a given position
            const drawSingleImageWatermark = (x: number, y: number) => {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate((currentConfig.rotation * Math.PI) / 180);
                ctx.globalAlpha = currentConfig.opacity;

                ctx.drawImage(
                    currentWatermarkImage,
                    -watermarkWidth / 2,
                    -watermarkHeight / 2,
                    watermarkWidth,
                    watermarkHeight
                );
                ctx.restore();
            };

            if (currentConfig.repeat) {
                // Repeat mode: draw watermarks in a grid pattern
                // Calculate spacing considering rotation
                const rotationRad = (currentConfig.rotation * Math.PI) / 180;
                const cos = Math.abs(Math.cos(rotationRad));
                const sin = Math.abs(Math.sin(rotationRad));

                // Bounding box dimensions after rotation
                const rotatedWidth = watermarkWidth * cos + watermarkHeight * sin;
                const rotatedHeight = watermarkWidth * sin + watermarkHeight * cos;

                // Spacing between watermarks
                const spacingX = rotatedWidth + currentConfig.spacing;
                const spacingY = rotatedHeight + currentConfig.spacing;

                // Calculate starting position to cover the entire canvas
                const startX = -spacingX;
                const startY = -spacingY;

                // Draw watermarks in a grid pattern
                const maxWatermarks = 2000;
                let watermarkCount = 0;

                for (
                    let y = startY;
                    y < canvas.height + spacingY && watermarkCount < maxWatermarks;
                    y += spacingY
                ) {
                    for (
                        let x = startX;
                        x < canvas.width + spacingX && watermarkCount < maxWatermarks;
                        x += spacingX
                    ) {
                        drawSingleImageWatermark(x, y);
                        watermarkCount++;
                    }
                }
            } else {
                // Single mode: draw watermark at the specified position
                const x = (canvas.width * positionToUse.x) / 100;
                const y = (canvas.height * positionToUse.y) / 100;
                drawSingleImageWatermark(x, y);
            }
        } else if (currentConfig.type === 'text') {
            // Text watermark
            const lines = currentConfig.text.split('\n');
            const lineHeight = currentConfig.fontSize * 1.2;
            const totalHeight = lines.length * lineHeight;

            // Calculate text width for bounding box
            ctx.font = `bold ${currentConfig.fontSize}px Inter, sans-serif`;
            let maxWidth = 0;
            lines.forEach((line) => {
                const width = ctx.measureText(line).width;
                if (width > maxWidth) {
                    maxWidth = width;
                }
            });

            // Function to draw a single text watermark at a given position
            const drawSingleTextWatermark = (x: number, y: number) => {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate((currentConfig.rotation * Math.PI) / 180);
                ctx.globalAlpha = currentConfig.opacity;
                ctx.font = `bold ${currentConfig.fontSize}px Inter, sans-serif`;
                ctx.fillStyle = currentConfig.color;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                const startY = -(totalHeight - lineHeight) / 2;

                lines.forEach((line, index) => {
                    ctx.fillText(line, 0, startY + index * lineHeight);
                });

                ctx.restore();
            };

            if (currentConfig.repeat) {
                // Repeat mode: draw watermarks in a grid pattern
                // Calculate spacing considering rotation
                const rotationRad = (currentConfig.rotation * Math.PI) / 180;
                const cos = Math.abs(Math.cos(rotationRad));
                const sin = Math.abs(Math.sin(rotationRad));

                // Bounding box dimensions after rotation
                const rotatedWidth = maxWidth * cos + totalHeight * sin;
                const rotatedHeight = maxWidth * sin + totalHeight * cos;

                // Spacing between watermarks
                const spacingX = rotatedWidth + currentConfig.spacing;
                const spacingY = rotatedHeight + currentConfig.spacing;

                // Calculate starting position to cover the entire canvas
                const startX = -spacingX;
                const startY = -spacingY;

                // Draw watermarks in a grid pattern
                const maxWatermarks = 2000;
                let watermarkCount = 0;

                for (
                    let y = startY;
                    y < canvas.height + spacingY && watermarkCount < maxWatermarks;
                    y += spacingY
                ) {
                    for (
                        let x = startX;
                        x < canvas.width + spacingX && watermarkCount < maxWatermarks;
                        x += spacingX
                    ) {
                        drawSingleTextWatermark(x, y);
                        watermarkCount++;
                    }
                }
            } else {
                // Single mode: draw watermark at the specified position
                const x = (canvas.width * positionToUse.x) / 100;
                const y = (canvas.height * positionToUse.y) / 100;
                drawSingleTextWatermark(x, y);
            }
        }
        
        // Notify parent that canvas is updated (for download) only when not dragging
        if (!dragStateRef.current.isDragging) {
            onCanvasReadyRef.current(canvas);
        }

        needsRedrawRef.current = false;
    }, []); // No dependencies - function never recreates, animation loop never restarts

    // Single requestAnimationFrame loop for smooth rendering
    useEffect(() => {
        let isRunning = true;

        const animate = () => {
            if (!isRunning) return;
            
            if (needsRedrawRef.current) {
                redrawCanvas();
            }
            
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            isRunning = false;
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [redrawCanvas]);

    // Trigger redraw when image or watermarkImage change
    // config changes are handled in the configRef update effect above
    // isDragging changes are handled explicitly in handleGlobalMouseUp to avoid multiple redraws
    useEffect(() => {
        needsRedrawRef.current = true;
    }, [image, watermarkImage]);

    // Global mouse move handler
    const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
        if (!dragStateRef.current.isDragging || !canvasRectRef.current || config.repeat) return;

        const rect = canvasRectRef.current;
        const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

        const newPosition = { x, y };
        // Update refs immediately (synchronous)
        dragStateRef.current.position = newPosition;
        currentPositionRef.current = newPosition;
        // Update state for UI (async, but doesn't affect rendering)
        setDragPosition(newPosition);
        // Trigger redraw immediately
        needsRedrawRef.current = true;
    }, [config.repeat]);

    // Global mouse up handler
    const handleGlobalMouseUp = useCallback(() => {
        if (dragStateRef.current.isDragging) {
            if (dragStateRef.current.position) {
                const finalPosition = dragStateRef.current.position;
                
                // Immediately update all refs synchronously
                currentPositionRef.current = finalPosition;
                dragStateRef.current.isDragging = false;
                dragStateRef.current.position = null;
                
                // Update React state (async, but doesn't affect rendering since we use refs)
                setPosition(finalPosition);
                setDragPosition(null);
                setIsDragging(false);
                
                // Trigger immediate redraw with final position
                needsRedrawRef.current = true;
            } else {
                // No position to update, just end dragging
                dragStateRef.current.isDragging = false;
                dragStateRef.current.position = null;
                setIsDragging(false);
            }
        }

        // Remove global event listeners using refs to ensure we remove the correct handlers
        if (handlersRef.current.handleGlobalMouseMove) {
            document.removeEventListener('mousemove', handlersRef.current.handleGlobalMouseMove);
        }
        if (handlersRef.current.handleGlobalMouseUp) {
            document.removeEventListener('mouseup', handlersRef.current.handleGlobalMouseUp);
        }
        handlersRef.current.handleGlobalMouseMove = null;
        handlersRef.current.handleGlobalMouseUp = null;
    }, []);

    // Handle mouse down on canvas
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (config.repeat) return; // Don't allow dragging in repeat mode
        e.preventDefault();
        
        if (canvasRef.current) {
            // Cache canvas boundary information
            canvasRectRef.current = canvasRef.current.getBoundingClientRect();
            
            const rect = canvasRectRef.current;
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

            const initialPosition = { x, y };
            dragStateRef.current.isDragging = true;
            dragStateRef.current.position = initialPosition;
            // Update currentPositionRef immediately for rendering
            currentPositionRef.current = initialPosition;
            setIsDragging(true);
            setDragPosition(initialPosition);
            needsRedrawRef.current = true;

            // Add global event listeners using refs to ensure we can remove them correctly
            handlersRef.current.handleGlobalMouseMove = handleGlobalMouseMove;
            handlersRef.current.handleGlobalMouseUp = handleGlobalMouseUp;
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }
    }, [config.repeat, handleGlobalMouseMove, handleGlobalMouseUp]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Remove global event listeners using refs
            if (handlersRef.current.handleGlobalMouseMove) {
                document.removeEventListener('mousemove', handlersRef.current.handleGlobalMouseMove);
            }
            if (handlersRef.current.handleGlobalMouseUp) {
                document.removeEventListener('mouseup', handlersRef.current.handleGlobalMouseUp);
            }
            
            // Cancel animation frame
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

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
