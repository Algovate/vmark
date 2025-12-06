import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageUploaderProps {
  onImageUpload: (files: File[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const { t } = useTranslation();
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onImageUpload(Array.from(e.dataTransfer.files));
      }
    },
    [onImageUpload]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageUpload(Array.from(e.target.files));
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDropWithState = (e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);
    handleDrop(e);
  };

  return (
    <div
      className="glass-panel"
      onDrop={handleDropWithState}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      style={{
        padding: '3rem',
        textAlign: 'center',
        border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-color)'}`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        transition: 'all 0.2s ease',
        background: isDragging ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-glass)',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      }}
      role="button"
      tabIndex={0}
      aria-label={t('upload.dragDrop')}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          document.getElementById('file-upload')?.click();
        }
      }}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        style={{
          cursor: 'pointer',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem', transition: 'transform 0.2s ease' }}>
          {isDragging ? '📥' : '📂'}
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
          {isDragging ? t('upload.dragDrop') || 'Drop files here' : t('upload.dragDrop')}
        </h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('upload.supports')}
        </p>
      </label>
    </div>
  );
};
