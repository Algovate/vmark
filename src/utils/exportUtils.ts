import type { ExportOptions } from '../components/ControlPanel';
import { getExportMimeType } from './fileUtils';

/**
 * Downloads a canvas as an image file
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  options: ExportOptions
): void {
  const { mimeType, needsQuality } = getExportMimeType(options.format);
  const quality = needsQuality ? options.quality : undefined;

  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL(mimeType, quality);
  link.click();
}

/**
 * Converts a canvas to a blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  options: ExportOptions
): Promise<Blob | null> {
  const { mimeType, needsQuality } = getExportMimeType(options.format);
  const quality = needsQuality ? options.quality : undefined;

  return new Promise((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
}

