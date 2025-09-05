'use client';

import { useState } from 'react';

interface UploadResponse {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  message?: string;
  error?: string;
}

interface UseFileUploadReturn {
  uploading: boolean;
  error: string | null;
  uploadFile: (file: File, instanceName: string) => Promise<UploadResponse | null>;
  clearError: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, instanceName: string): Promise<UploadResponse | null> => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('instanceName', instanceName);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result: UploadResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro no upload');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido no upload';
      setError(errorMessage);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    uploading,
    error,
    uploadFile,
    clearError,
  };
}