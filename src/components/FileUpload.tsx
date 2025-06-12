import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Action } from '../App';

interface FileUploadProps {
  dispatch: React.Dispatch<Action>;
}

interface ImageInfo {
  width: number;
  height: number;
  size: number;
  type: string;
  name: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ dispatch }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [imageInfo, setImageInfo] = useState<ImageInfo | null>(null);
  const [progress, setProgress] = useState(0);

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file (JPG, PNG, GIF, WebP).';
    }
    const maxSize = 50 * 1024 * 1024; // 50MB - increased limit
    if (file.size > maxSize) {
      return 'File size must be less than 50MB.';
    }
    return null;
  };

  // Compress image if it's too large
  const compressImage = useCallback((file: File, maxWidth: number = 2048, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxWidth) {
          const ratio = Math.min(maxWidth / width, maxWidth / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL(
          file.type === 'image/png' ? 'image/png' : 'image/jpeg',
          quality
        );
        
        resolve(compressedDataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  // Get image information
  const getImageInfo = useCallback((file: File): Promise<ImageInfo> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type,
          name: file.name,
        });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadStatus('error');
      setErrorMessage(validationError);
      setTimeout(() => setUploadStatus('idle'), 5000);
      return;
    }

    try {
      setUploadStatus('uploading');
      setErrorMessage('');
      setProgress(10);

      // Get image information
      const info = await getImageInfo(file);
      setImageInfo(info);
      setProgress(30);

      setUploadStatus('processing');
      
      let finalDataUrl: string;
      
      // Check if compression is needed
      const needsCompression = info.size > 5 * 1024 * 1024 || info.width > 2048 || info.height > 2048;
      
      if (needsCompression) {
        setProgress(50);
        finalDataUrl = await compressImage(file, 2048, 0.85);
        setProgress(80);
      } else {
        // Use original file
        finalDataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              reject(new Error('Failed to read file'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
        setProgress(80);
      }

      // Final validation
      const testImg = new Image();
      testImg.onload = () => {
        setProgress(100);
        dispatch({ type: 'SET_UPLOADED_IMAGE', payload: finalDataUrl });
        setUploadStatus('idle');
        setProgress(0);
      };
      testImg.onerror = () => {
        setUploadStatus('error');
        setErrorMessage('Failed to process image.');
        setTimeout(() => setUploadStatus('idle'), 5000);
      };
      testImg.src = finalDataUrl;

    } catch (error) {
      console.error('Error processing image:', error);
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process image.');
      setTimeout(() => setUploadStatus('idle'), 5000);
      setProgress(0);
    }
  }, [dispatch, getImageInfo, compressImage]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      handleFileSelect(acceptedFiles[0]);
    }
  }, [handleFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp', '.svg']
    },
    multiple: false,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'uploading':
      case 'processing':
        return 'border-blue-500 bg-blue-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      default:
        return isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
      case 'processing':
        return (
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        );
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return isDragActive ? (
          <ImageIcon className="w-8 h-8 text-blue-500" />
        ) : (
          <Upload className="w-8 h-8 text-gray-400" />
        );
    }
  };

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all duration-200 ${getStatusColor()}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-3">
        {getStatusIcon()}
        
        <div className="space-y-1">
          {uploadStatus === 'uploading' && (
            <p className="text-blue-600 font-medium">Uploading image...</p>
          )}
          {uploadStatus === 'processing' && (
            <p className="text-blue-600 font-medium">Processing image...</p>
          )}
          {uploadStatus === 'error' && (
            <p className="text-red-600 font-medium">Upload failed</p>
          )}
          {uploadStatus === 'idle' && (
            <>
              {isDragActive ? (
                <p className="text-blue-600 font-medium">Drop the image here</p>
              ) : (
                <p className="text-gray-700 font-medium">Drop an image here, or click to select</p>
              )}
            </>
          )}
          
          {uploadStatus === 'idle' && (
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, GIF, WebP up to 50MB
            </p>
          )}
        </div>

        {/* Progress bar */}
        {(uploadStatus === 'uploading' || uploadStatus === 'processing') && (
          <div className="w-full max-w-xs">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress}%</p>
          </div>
        )}

        {/* Image info */}
        {imageInfo && uploadStatus === 'processing' && (
          <div className="text-xs text-gray-600 bg-white/80 rounded px-2 py-1">
            {imageInfo.width}×{imageInfo.height} • {formatFileSize(imageInfo.size)}
          </div>
        )}

        {/* Error message */}
        {uploadStatus === 'error' && errorMessage && (
          <p className="text-red-600 text-sm max-w-xs">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};