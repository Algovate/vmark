import type { WatermarkConfig, ExportOptions } from '../components/ControlPanel';

export const DEFAULT_WATERMARK_CONFIG: WatermarkConfig = {
  type: 'text',
  text: 'Watermark',
  color: '#ffffff',
  fontSize: 48,
  opacity: 0.8,
  rotation: 0,
  repeat: false,
  spacing: 200,
  imageSize: 100,
};

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: 'png',
  quality: 0.92,
};

