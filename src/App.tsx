import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import type { WatermarkConfig, ExportOptions } from './components/ControlPanel';
import { ImageSidebar } from './components/ImageSidebar';
import { WatermarkCanvas } from './components/WatermarkCanvas';
import { HeaderButton } from './components/HeaderButton';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { HelpModal } from './components/HelpModal';
import { DonationModal } from './components/DonationModal';
import { useToast } from './components/Toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { filterValidImageFiles, generateWatermarkedFilename } from './utils/fileUtils';
import { downloadCanvas } from './utils/exportUtils';
import { triggerFileInput } from './utils/fileInputUtils';
import { DEFAULT_WATERMARK_CONFIG, DEFAULT_EXPORT_OPTIONS } from './constants/defaultConfig';
import { useImageProcessor } from './hooks/useImageProcessor';

function App() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const { processImage } = useImageProcessor();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [config, setConfig] = useState<WatermarkConfig>(DEFAULT_WATERMARK_CONFIG);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>(DEFAULT_EXPORT_OPTIONS);

  const toggleLanguage = useCallback(() => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  }, [i18n]);

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
        if (isDonationOpen) {
          setIsDonationOpen(false);
        }
      },
    },
  ]);

  const handleDownload = useCallback((options: ExportOptions) => {
    if (!canvasRef.current || imageFiles.length === 0) {
      toast.error(t('upload.error') || 'No image to download');
      return;
    }

    try {
      const currentFile = imageFiles[selectedImageIndex];
      const downloadName = generateWatermarkedFilename(currentFile.name, options.format);

      downloadCanvas(canvasRef.current, downloadName, options);
      toast.success(t('settings.downloadSuccess') || 'Image downloaded successfully');
    } catch (error) {
      toast.error(t('upload.error') || 'Failed to download image');
    }
  }, [canvasRef, imageFiles, selectedImageIndex, toast, t]);

  const handleBatchDownload = async (options: ExportOptions) => {
    if (imageFiles.length === 0) {
      toast.error(t('upload.error') || 'No images to download');
      return;
    }

    const loadingToastId = toast.loading(
      t('settings.processing', { current: 0, total: imageFiles.length }) || `Processing ${imageFiles.length} images...`
    );
    setBatchProgress({ current: 0, total: imageFiles.length });

    // Declare watermarkObjectUrl outside try block so it's accessible in catch
    let watermarkObjectUrl: string | undefined;

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
        watermarkObjectUrl = URL.createObjectURL(config.imageFile);
        watermarkImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.src = watermarkObjectUrl!;
          img.onload = () => resolve(img);
          img.onerror = reject;
        });
      }

      // Process each image with progress tracking
      let processedCount = 0;
      const promises = imageFiles.map(async (file) => {
        const blob = await processImage(file, config, options, watermarkImg);
        if (blob) {
          const filename = generateWatermarkedFilename(file.name, options.format);
          folder.file(filename, blob);
        }
        processedCount++;
        setBatchProgress({ current: processedCount, total: imageFiles.length });
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'watermarked_images.zip');

      // Cleanup watermark object URL
      if (watermarkObjectUrl) {
        URL.revokeObjectURL(watermarkObjectUrl);
      }

      toast.removeToast(loadingToastId);
      toast.success(
        t('settings.downloadAllSuccess', { count: imageFiles.length }) || `Successfully downloaded ${imageFiles.length} images`
      );
      setBatchProgress(null);
    } catch (error) {
      // Cleanup watermark object URL on error
      if (watermarkObjectUrl) {
        URL.revokeObjectURL(watermarkObjectUrl);
      }
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
    toast.info(t('sidebar.removed') || 'Image removed');
  };

  const handleImageUpload = useCallback((files: File[]) => {
    const { valid, invalid } = filterValidImageFiles(files);

    if (invalid.length > 0) {
      toast.error(
        invalid.length === 1
          ? `"${invalid[0]}" is not a valid image file`
          : `${invalid.length} files are not valid images`
      );
    }

    if (valid.length > 0) {
      setImageFiles(valid);
      toast.success(
        valid.length === 1
          ? t('upload.success') || 'Image uploaded successfully'
          : t('upload.successMultiple', { count: valid.length }) || `${valid.length} images uploaded successfully`
      );
    }
  }, [toast, t]);

  return (
    <div style={{
      minHeight: '100vh',
      padding: 'clamp(1rem, 2vw, 2rem)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'clamp(1rem, 2vw, 2rem)'
    }}>
      <header style={{ textAlign: 'center', marginBottom: '1rem', position: 'relative', padding: '0 1rem' }}>
        <div style={{ position: 'absolute', left: 0, top: 0 }}>
          <HeaderButton
            onClick={() => setIsHelpOpen(true)}
            ariaLabel={t('help.title')}
          >
            <span>?</span> <span className="help-text-mobile">{t('help.title')}</span>
          </HeaderButton>
        </div>
        <div style={{ position: 'absolute', right: 0, top: 0, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <HeaderButton
            onClick={() => setIsDonationOpen(true)}
            ariaLabel={t('donation.ariaLabel')}
          >
            ☕ <span className="help-text-mobile">{t('donation.button')}</span>
          </HeaderButton>
          <HeaderButton
            onClick={toggleLanguage}
            ariaLabel="Toggle language"
          >
            {i18n.language === 'zh' ? 'English' : '中文'}
          </HeaderButton>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
          <img
            src={`${import.meta.env.BASE_URL}logo.svg`}
            alt="Vmark Logo"
            style={{ width: '3rem', height: '3rem' }}
            onError={(e) => {
              // Silently handle logo loading errors
              e.currentTarget.style.display = 'none';
            }}
          />
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
                    triggerFileInput({
                      multiple: true,
                      accept: 'image/*',
                      onSelect: (files) => {
                        const { valid } = filterValidImageFiles(files);
                        if (valid.length > 0) {
                          const newFiles = [...imageFiles, ...valid];
                          setImageFiles(newFiles);
                          toast.success(t('upload.added', { count: valid.length }) || `${valid.length} image(s) added`);
                        }
                      },
                    });
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
      <footer style={{
        textAlign: 'center',
        padding: '1.5rem 1rem',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem',
        marginTop: 'auto'
      }}>
        {t('footer.copyright')}
      </footer>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />
    </div>
  );
}

export default App;