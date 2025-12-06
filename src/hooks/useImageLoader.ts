import { useEffect, useState } from 'react';

interface UseImageLoaderResult {
  image: HTMLImageElement | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to load an image file using FileReader
 * More reliable than Object URL in React Strict Mode
 */
export function useImageLoader(file: File | null | undefined): UseImageLoaderResult {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setImage(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    setIsLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onerror = () => {
      if (!isCancelled) {
        setError('upload.error');
        setIsLoading(false);
        setImage(null);
      }
    };

    reader.onload = (e) => {
      if (isCancelled || !e.target?.result) return;

      const img = new Image();

      img.onerror = () => {
        if (!isCancelled) {
          setError('upload.error');
          setIsLoading(false);
          setImage(null);
        }
      };

      img.onload = () => {
        if (!isCancelled) {
          setImage(img);
          setIsLoading(false);
        }
      };

      img.src = e.target.result as string;
    };

    reader.readAsDataURL(file);

    return () => {
      isCancelled = true;
      try {
        reader.abort();
      } catch (e) {
        // Ignore abort errors
      }
    };
  }, [file]);

  return { image, isLoading, error };
}

