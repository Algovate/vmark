import type { WatermarkConfig } from '../components/ControlPanel';

export const calculateTextDimensions = (
    ctx: CanvasRenderingContext2D,
    text: string,
    fontSize: number
) => {
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;
    const lines = text.split('\n');
    const lineHeight = fontSize * 1.2;
    const totalHeight = lines.length * lineHeight;
    const maxWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));

    return { lines, lineHeight, totalHeight, maxWidth };
};

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

    if (config.type === 'image') {
        // Image watermark mode
        if (!watermarkImage) return;

        // Function to draw a single image watermark at a given position
        const drawSingleImageWatermark = (x: number, y: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((config.rotation * Math.PI) / 180);
            ctx.globalAlpha = config.opacity;

            // Calculate watermark image dimensions based on imageSize percentage
            const baseSize = Math.min(canvas.width, canvas.height);
            const scaleFactor = (config.imageSize / 100) * (baseSize / 500); // Normalize to reasonable size
            const watermarkWidth = watermarkImage.width * scaleFactor;
            const watermarkHeight = watermarkImage.height * scaleFactor;

            // Draw centered on the position
            ctx.drawImage(
                watermarkImage,
                -watermarkWidth / 2,
                -watermarkHeight / 2,
                watermarkWidth,
                watermarkHeight
            );

            ctx.restore();
        };

        if (config.repeat) {
            // Repeat mode: draw watermarks in a grid pattern
            const baseSize = Math.min(canvas.width, canvas.height);
            const scaleFactor = (config.imageSize / 100) * (baseSize / 500);
            const watermarkWidth = watermarkImage.width * scaleFactor;
            const watermarkHeight = watermarkImage.height * scaleFactor;

            // Calculate spacing considering rotation
            const rotationRad = (config.rotation * Math.PI) / 180;
            const cos = Math.abs(Math.cos(rotationRad));
            const sin = Math.abs(Math.sin(rotationRad));

            // Bounding box dimensions after rotation
            const rotatedWidth = watermarkWidth * cos + watermarkHeight * sin;
            const rotatedHeight = watermarkWidth * sin + watermarkHeight * cos;

            // Spacing between watermarks
            const spacingX = rotatedWidth + config.spacing;
            const spacingY = rotatedHeight + config.spacing;

            // Apply user-defined offset (from position, converted from percentage to pixels)
            const offsetX = (canvas.width * position.x) / 100;
            const offsetY = (canvas.height * position.y) / 100;

            // Calculate starting position to cover the entire canvas, with offset
            const startX = -spacingX + offsetX;
            const startY = -spacingY + offsetY;

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
            const x = (canvas.width * position.x) / 100;
            const y = (canvas.height * position.y) / 100;
            drawSingleImageWatermark(x, y);
        }
    } else {
        // Text watermark mode (existing logic)
        // Function to draw a single watermark at a given position
        const drawSingleWatermark = (x: number, y: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate((config.rotation * Math.PI) / 180);
            ctx.globalAlpha = config.opacity;
            ctx.font = `bold ${config.fontSize}px Inter, sans-serif`;
            ctx.fillStyle = config.color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const { lines, lineHeight, totalHeight } = calculateTextDimensions(
                ctx,
                config.text,
                config.fontSize
            );

            // Start drawing from the top-most line to center the block of text vertically
            const startY = -(totalHeight - lineHeight) / 2;

            lines.forEach((line, index) => {
                ctx.fillText(line, 0, startY + index * lineHeight);
            });

            ctx.restore();
        };

        if (config.repeat) {
            // Repeat mode: draw watermarks in a grid pattern
            const { totalHeight, maxWidth } = calculateTextDimensions(
                ctx,
                config.text,
                config.fontSize
            );

            // Calculate spacing considering rotation
            const rotationRad = (config.rotation * Math.PI) / 180;
            const cos = Math.abs(Math.cos(rotationRad));
            const sin = Math.abs(Math.sin(rotationRad));

            // Bounding box dimensions after rotation
            const rotatedWidth = maxWidth * cos + totalHeight * sin;
            const rotatedHeight = maxWidth * sin + totalHeight * cos;

            // Spacing between watermarks
            const spacingX = rotatedWidth + config.spacing;
            const spacingY = rotatedHeight + config.spacing;

            // Apply user-defined offset (from position, converted from percentage to pixels)
            const offsetX = (canvas.width * position.x) / 100;
            const offsetY = (canvas.height * position.y) / 100;

            // Calculate starting position to cover the entire canvas, with offset
            const startX = -spacingX + offsetX;
            const startY = -spacingY + offsetY;

            // Draw watermarks in a grid pattern
            // Optimize: limit the number of watermarks for very large canvases
            const maxWatermarks = 2000; // Reasonable limit
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
                    drawSingleWatermark(x, y);
                    watermarkCount++;
                }
            }
        } else {
            // Single mode: draw watermark at the specified position (draggable)
            const x = (canvas.width * position.x) / 100;
            const y = (canvas.height * position.y) / 100;
            drawSingleWatermark(x, y);
        }
    }
};
