import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import type { WatermarkConfig, ExportOptions } from './components/ControlPanel';
import { WatermarkCanvas } from './components/WatermarkCanvas';

function App() {
  const { t, i18n } = useTranslation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [config, setConfig] = useState<WatermarkConfig>({
    text: 'Watermark',
    color: '#ffffff',
    fontSize: 48,
    opacity: 0.8,
    rotation: 0,
    repeat: false,
    spacing: 200
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
    if (!canvasRef.current || !imageFile) return;

    // Generate filename based on original file name
    const originalName = imageFile.name;
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
        {!imageFile ? (
          <div style={{ width: '100%', maxWidth: '600px', marginTop: '4rem' }}>
            <ImageUploader onImageUpload={setImageFile} />
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
            <div style={{ flex: '1 1 500px', minWidth: '300px' }}>
              <WatermarkCanvas
                imageFile={imageFile}
                config={config}
                onCanvasReady={(canvas) => canvasRef.current = canvas}
              />
              <button
                className="btn-secondary"
                onClick={() => setImageFile(null)}
                style={{ marginTop: '1rem' }}
              >
                {t('upload.uploadDifferent')}
              </button>
            </div>

            <ControlPanel
              config={config}
              onChange={setConfig}
              onDownload={handleDownload}
              exportOptions={exportOptions}
              onExportOptionsChange={setExportOptions}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
