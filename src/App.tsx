import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import type { WatermarkConfig, ExportOptions } from './components/ControlPanel';
import { ImageSidebar } from './components/ImageSidebar';
import { WatermarkCanvas } from './components/WatermarkCanvas';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { drawWatermarkOnCanvas } from './utils/watermarkUtils';
import { HelpModal } from './components/HelpModal';

function App() {
  const { t, i18n } = useTranslation();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [config, setConfig] = useState<WatermarkConfig>({
    type: 'text',
    text: 'Watermark',
    color: '#ffffff',
    fontSize: 48,
    opacity: 0.8,
    rotation: 0,
    repeat: false,
    spacing: 200,
    imageSize: 100
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 0.92
  });

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  const handleDownload = (options: ExportOptions) => {
    if (!canvasRef.current || imageFiles.length === 0) return;

    const currentFile = imageFiles[selectedImageIndex];

    // Generate filename based on original file name
    const originalName = currentFile.name;
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const extension = options.format;
    const downloadName = `${nameWithoutExt}-watermarked.${extension}`;

    // Determine MIME type and quality
    let mimeType: string;
    let quality: number | undefined;

    switch (options.format) {
      case 'jpeg':
        mimeType = 'image/jpeg';
        quality = options.quality;
        break;
      case 'webp':
        mimeType = 'image/webp';
        quality = options.quality;
        break;
      default:
        mimeType = 'image/png';
        quality = undefined;
    }

    const link = document.createElement('a');
    link.download = downloadName;
    link.href = canvasRef.current.toDataURL(mimeType, quality);
    link.click();
    link.click();
  };

  const handleBatchDownload = async (options: ExportOptions) => {
    if (imageFiles.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder('watermarked_images');
    if (!folder) return;

    // Load watermark image if needed
    let watermarkImg: HTMLImageElement | undefined;
    if (config.type === 'image' && config.imageFile) {
      watermarkImg = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(config.imageFile!);
        img.onload = () => resolve(img);
        img.onerror = reject;
      });
    }

    // Process each image
    const promises = imageFiles.map((file) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
          const canvas = document.createElement('canvas');
          drawWatermarkOnCanvas(canvas, img, config, undefined, watermarkImg);

          // Determine MIME type and quality
          let mimeType: string;
          let quality: number | undefined;

          switch (options.format) {
            case 'jpeg':
              mimeType = 'image/jpeg';
              quality = options.quality;
              break;
            case 'webp':
              mimeType = 'image/webp';
              quality = options.quality;
              break;
            default:
              mimeType = 'image/png';
              quality = undefined;
          }

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const originalName = file.name;
                const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
                const extension = options.format;
                const filename = `${nameWithoutExt}-watermarked.${extension}`;
                folder.file(filename, blob);
              }
              URL.revokeObjectURL(img.src);
              resolve();
            },
            mimeType,
            quality
          );
        };
      });
    });

    await Promise.all(promises);
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, 'watermarked_images.zip');
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    if (selectedImageIndex >= newFiles.length) {
      setSelectedImageIndex(Math.max(0, newFiles.length - 1));
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '1rem', position: 'relative' }}>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="glass-panel"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            background: 'rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <span>?</span> {t('help.title')}
        </button>
        <button
          onClick={toggleLanguage}
          className="glass-panel"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            background: 'rgba(0, 0, 0, 0.2)'
          }}
        >
          {i18n.language === 'zh' ? 'English' : '中文'}
        </button>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '0.5rem'
        }}>
          {t('app.title')}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('app.subtitle')}
        </p>
      </header>

      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {imageFiles.length === 0 ? (
          <div style={{ width: '100%', maxWidth: '600px', marginTop: '4rem' }}>
            <ImageUploader onImageUpload={(files) => setImageFiles(files)} />
          </div>
        ) : (
          <div style={{
            display: 'flex',
            gap: '2rem',
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}>
            <div style={{ flex: '1 1 500px', minWidth: '300px', display: 'flex', gap: '1rem' }}>
              {imageFiles.length > 1 && (
                <ImageSidebar
                  images={imageFiles}
                  selectedIndex={selectedImageIndex}
                  onSelect={setSelectedImageIndex}
                  onRemove={handleRemoveImage}
                />
              )}
              <div style={{ flex: 1 }}>
                <WatermarkCanvas
                  imageFile={imageFiles[selectedImageIndex]}
                  config={config}
                  onCanvasReady={(canvas) => canvasRef.current = canvas}
                />
                <button
                  className="btn-secondary"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.accept = 'image/*';
                    input.onchange = (e) => {
                      const files = (e.target as HTMLInputElement).files;
                      if (files && files.length > 0) {
                        setImageFiles([...imageFiles, ...Array.from(files)]);
                      }
                    };
                    input.click();
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  {t('upload.uploadMore')}
                </button>
              </div>
            </div>

            <ControlPanel
              config={config}
              onChange={setConfig}
              onDownload={handleDownload}
              exportOptions={exportOptions}
              onExportOptionsChange={setExportOptions}
              isBatchMode={imageFiles.length > 1}
              onDownloadAll={handleBatchDownload}
            />
          </div>
        )}
      </main>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}

export default App;
