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
import { useToast, ToastContainer } from './components/Toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

function App() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
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

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 's',
      ctrl: true,
      handler: () => {
        if (imageFiles.length > 0 && canvasRef.current) {
          handleDownload(exportOptions);
        }
      },
    },
    {
      key: 'Escape',
      handler: () => {
        if (isHelpOpen) {
          setIsHelpOpen(false);
        }
      },
    },
  ]);

  const handleDownload = (options: ExportOptions) => {
    if (!canvasRef.current || imageFiles.length === 0) {
      toast.error(t('upload.error') || 'No image to download');
      return;
    }

    try {
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
      toast.success(t('settings.download') || 'Image downloaded successfully');
    } catch (error) {
      toast.error(t('upload.error') || 'Failed to download image');
    }
  };

  const handleBatchDownload = async (options: ExportOptions) => {
    if (imageFiles.length === 0) {
      toast.error(t('upload.error') || 'No images to download');
      return;
    }

    const loadingToastId = toast.loading(
      t('settings.downloadAll') || `Processing ${imageFiles.length} images...`
    );
    setBatchProgress({ current: 0, total: imageFiles.length });

    try {
      const zip = new JSZip();
      const folder = zip.folder('watermarked_images');
      if (!folder) {
        toast.removeToast(loadingToastId);
        toast.error('Failed to create ZIP file');
        return;
      }

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

      // Process each image with progress tracking
      let processedCount = 0;
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
                processedCount++;
                setBatchProgress({ current: processedCount, total: imageFiles.length });
                resolve();
              },
              mimeType,
              quality
            );
          };
          img.onerror = () => {
            console.error(`Failed to load image: ${file.name}`);
            URL.revokeObjectURL(img.src);
            processedCount++;
            setBatchProgress({ current: processedCount, total: imageFiles.length });
            resolve();
          };
        });
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'watermarked_images.zip');
      
      toast.removeToast(loadingToastId);
      toast.success(
        t('settings.downloadAll') || `Successfully downloaded ${imageFiles.length} images`
      );
      setBatchProgress(null);
    } catch (error) {
      toast.removeToast(loadingToastId);
      toast.error(t('upload.error') || 'Failed to download images');
      setBatchProgress(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = [...imageFiles];
    newFiles.splice(index, 1);
    setImageFiles(newFiles);
    if (selectedImageIndex >= newFiles.length) {
      setSelectedImageIndex(Math.max(0, newFiles.length - 1));
    }
    toast.info(t('sidebar.remove') || 'Image removed');
  };

  const handleImageUpload = (files: File[]) => {
    setImageFiles(files);
    if (files.length > 0) {
      toast.success(
        files.length === 1
          ? t('upload.uploadMore') || 'Image uploaded successfully'
          : `${files.length} images uploaded successfully`
      );
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'clamp(1rem, 2vw, 2rem)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(1rem, 2vw, 2rem)'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '1rem', position: 'relative', padding: '0 1rem' }}>
        <button
          onClick={() => setIsHelpOpen(true)}
          className="glass-panel"
          aria-label={t('help.title')}
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
            gap: '0.5rem',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <span>?</span> <span className="help-text-mobile">{t('help.title')}</span>
        </button>
        <button
          onClick={toggleLanguage}
          className="glass-panel"
          aria-label="Toggle language"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            background: 'rgba(0, 0, 0, 0.2)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {i18n.language === 'zh' ? 'English' : '中文'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Vmark Logo" style={{ width: '3rem', height: '3rem' }} />
          <h1 style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: '800',
            background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            {t('app.title')}
          </h1>
        </div>
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
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
        ) : (
          <div style={{
            display: 'flex',
            gap: 'clamp(1rem, 2vw, 2rem)',
            width: '100%',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}>
            <div style={{ flex: '1 1 500px', minWidth: 'min(300px, 100%)', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
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
                        const newFiles = [...imageFiles, ...Array.from(files)];
                        setImageFiles(newFiles);
                        toast.success(`${files.length} image(s) added`);
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

            <div style={{ width: '100%', maxWidth: '300px', flexShrink: 0 }}>
              <ControlPanel
                config={config}
                onChange={setConfig}
                onDownload={handleDownload}
                exportOptions={exportOptions}
                onExportOptionsChange={setExportOptions}
                isBatchMode={imageFiles.length > 1}
                onDownloadAll={handleBatchDownload}
                batchProgress={batchProgress}
              />
            </div>
          </div>
        )}
      </main>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
}

export default App;
