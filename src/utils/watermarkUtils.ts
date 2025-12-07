import type { WatermarkConfig } from '../components/ControlPanel';

export const calculateTextDimensions = (
    ctx: CanvasRenderingContext2D,
    text: string,
    fontSize: number
) => {
    ctx.save();
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    const lines = text.split('\n');
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    const maxWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
    ctx.restore();

    return { lines, lineHeight, totalHeight, maxWidth };
};

/**
 * Calculates the dimensions of the watermark item (image or text)
 * and its rotated bounding box dimensions.
 */
export const getWatermarkDimensions = (
    ctx: CanvasRenderingContext2D,
    config: WatermarkConfig,
    canvasWidth: number,
    canvasHeight: number,
    watermarkImage?: HTMLImageElement
) => {
    let width = 0;
    let height = 0;

    if (config.type === 'image' && watermarkImage) {
        const baseSize = Math.min(canvasWidth, canvasHeight);
        const scaleFactor = (config.imageSize / 100) * (baseSize / 500);
        width = watermarkImage.width * scaleFactor;
        height = watermarkImage.height * scaleFactor;
    } else if (config.type === 'text') {
        const dims = calculateTextDimensions(ctx, config.text, config.fontSize);
        width = dims.maxWidth;
        height = dims.totalHeight;
    }

    // Calculate rotated dimensions
    const rotationRad = (config.rotation * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rotationRad));
    const sin = Math.abs(Math.sin(rotationRad));

    const rotatedWidth = width * cos + height * sin;
    const rotatedHeight = width * sin + height * cos;

    return { width, height, rotatedWidth, rotatedHeight };
};

/**
 * Draws a single watermark item at the specified position
 */
export const drawSingleWatermarkItem = (
    ctx: CanvasRenderingContext2D,
    config: WatermarkConfig,
    x: number,
    y: number,
    dims: { width: number; height: number },
    watermarkImage?: HTMLImageElement
) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((config.rotation * Math.PI) / 180);
    ctx.globalAlpha = config.opacity;

    if (config.type === 'image' && watermarkImage) {
        ctx.drawImage(
            watermarkImage,
            -dims.width / 2,
            -dims.height / 2,
            dims.width,
            dims.height
        );
    } else if (config.type === 'text') {
        ctx.font = `bold ${config.fontSize}px Inter, sans-serif`;
        ctx.fillStyle = config.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // We re-calculate lines here, which is slight overhead but keeps API cleaner.
        // Optimization: could pass lines/lineHeight if performance becomes an issue.
        const { lines, lineHeight, totalHeight } = calculateTextDimensions(
            ctx,
            config.text,
            config.fontSize
        );
        const startY = -(totalHeight - lineHeight) / 2;

        lines.forEach((line, index) => {
            ctx.fillText(line, 0, startY + index * lineHeight);
        });
    }

    ctx.restore();
};

/**
 * Orchestrates drawing watermarks (single or repeat) onto a context.
 * WARNING: This function does NOT draw the background image. It only draws the watermarks.
 * @param ctx Target canvas context
 * @param config Watermark configuration
 * @param canvasWidth Width of the canvas
 * @param canvasHeight Height of the canvas
 * @param position Position offset (0-100)
 * @param watermarkImage Optional image for image watermarks
 */
export const renderWatermarks = (
    ctx: CanvasRenderingContext2D,
    config: WatermarkConfig,
    canvasWidth: number,
    canvasHeight: number,
    position: { x: number; y: number } = { x: 50, y: 50 },
    watermarkImage?: HTMLImageElement
) => {
    // Early exit conditions
    if (config.type === 'image' && !watermarkImage) return;
    if (config.type === 'text' && !config.text) return;

    const dims = getWatermarkDimensions(ctx, config, canvasWidth, canvasHeight, watermarkImage);

    if (config.repeat) {
        // Spacing between watermarks
        const spacingX = dims.rotatedWidth + config.spacing;
        const spacingY = dims.rotatedHeight + config.spacing;

        // In repeat mode, position acts as a phase adjustment (0-100% of spacing)
        const offsetX = (spacingX * position.x) / 100;
        const offsetY = (spacingY * position.y) / 100;

        // Use modulo to normalize the offset within one spacing interval
        const normalizedOffsetX = offsetX % spacingX;
        const normalizedOffsetY = offsetY % spacingY;

        // Start from outside to ensure coverage
        const startX = -spacingX + normalizedOffsetX;
        const startY = -spacingY + normalizedOffsetY;

        const maxWatermarks = 2000;
        let watermarkCount = 0;

        for (
            let y = startY;
            y < canvasHeight + spacingY && watermarkCount < maxWatermarks;
            y += spacingY
        ) {
            for (
                let x = startX;
                x < canvasWidth + spacingX && watermarkCount < maxWatermarks;
                x += spacingX
            ) {
                drawSingleWatermarkItem(ctx, config, x, y, dims, watermarkImage);
                watermarkCount++;
            }
        }
    } else {
        // Single mode
        const x = (canvasWidth * position.x) / 100;
        const y = (canvasHeight * position.y) / 100;
        drawSingleWatermarkItem(ctx, config, x, y, dims, watermarkImage);
    }
};

/**
 * Main entry point for batch processing / export.
 * Draws the background image AND the watermarks.
 */
export const drawWatermarkOnCanvas = (
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    config: WatermarkConfig,
    position: { x: number; y: number } = { x: 50, y: 50 },
    watermarkImage?: HTMLImageElement
) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = image.width;
    canvas.height = image.height;

    // Draw background image
    ctx.drawImage(image, 0, 0);

    // Draw watermarks
    renderWatermarks(ctx, config, canvas.width, canvas.height, position, watermarkImage);
};

