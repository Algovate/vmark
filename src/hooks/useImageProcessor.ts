import { useCallback } from 'react';
import type { WatermarkConfig, ExportOptions } from '../components/ControlPanel';
import { drawWatermarkOnCanvas } from '../utils/watermarkUtils';
import { canvasToBlob } from '../utils/exportUtils';

/**
 * Custom hook for processing images with watermarks
 */
export function useImageProcessor() {
  const processImage = useCallback(
    async (
      file: File,
      config: WatermarkConfig,
      options: ExportOptions,
      watermarkImg?: HTMLImageElement
    ): Promise<Blob | null> => {
      return new Promise((resolve) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.src = objectUrl;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          drawWatermarkOnCanvas(canvas, img, config, undefined, watermarkImg);
          
          canvasToBlob(canvas, options).then((blob) => {
            URL.revokeObjectURL(objectUrl);
            resolve(blob);
          });
        };

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        };
      });
    },
    []
  );

  return { processImage };
}

