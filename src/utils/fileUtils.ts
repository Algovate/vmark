/**
 * Validates if a file is a valid image file
 */
export function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Validates and filters image files from a list
 */
export function filterValidImageFiles(files: File[]): {
  valid: File[];
  invalid: string[];
} {
  const valid: File[] = [];
  const invalid: string[] = [];

  files.forEach((file) => {
    if (isValidImageFile(file)) {
      valid.push(file);
    } else {
      invalid.push(file.name);
    }
  });

  return { valid, invalid };
}

/**
 * Generates a filename for watermarked image
 */
export function generateWatermarkedFilename(
  originalName: string,
  format: 'png' | 'jpeg' | 'webp'
): string {
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExt}-watermarked.${format}`;
}

/**
 * Gets MIME type and quality settings for export format
 */
export function getExportMimeType(
  format: 'png' | 'jpeg' | 'webp'
): { mimeType: string; needsQuality: boolean } {
  switch (format) {
    case 'jpeg':
      return { mimeType: 'image/jpeg', needsQuality: true };
    case 'webp':
      return { mimeType: 'image/webp', needsQuality: true };
    default:
      return { mimeType: 'image/png', needsQuality: false };
  }
}

