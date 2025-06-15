import { useState, useCallback } from 'react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { ViewAngle, PerspectiveView } from '../types/DeviceTypes';

export type ExportFormat = 'png' | 'jpeg' | 'svg';
export type ExportQuality = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0;

export interface DownloadOptions {
  format: ExportFormat;
  quality: ExportQuality;
  scale: number;
  backgroundColor: string;
  transparentBackground: boolean;
  useCurrentView: boolean;
  downloadAngle?: ViewAngle;
  downloadPerspective?: PerspectiveView;
}

export function useDownload() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const downloadMockup = useCallback(async (
    mockupRef: React.RefObject<HTMLDivElement>,
    options: DownloadOptions,
    onAngleChange?: (angle: ViewAngle) => void,
    onPerspectiveChange?: (perspective: PerspectiveView) => void,
    currentAngle?: ViewAngle,
    currentPerspective?: PerspectiveView
  ) => {
    if (!mockupRef.current) {
      throw new Error('Mockup reference not available');
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Store original view settings
      const originalAngle = currentAngle;
      const originalPerspective = currentPerspective;
      let needsViewRestore = false;

      // Change view if needed
      if (!options.useCurrentView && onAngleChange && onPerspectiveChange && options.downloadAngle && options.downloadPerspective) {
        needsViewRestore = true;
        setDownloadProgress(5);
        
        onAngleChange(options.downloadAngle);
        onPerspectiveChange(options.downloadPerspective);
        
        // Wait for view changes to complete
        await new Promise(resolve => setTimeout(resolve, 2000));
        setDownloadProgress(30);
      }

      setDownloadProgress(40);

      // Create high-quality capture options
      const baseOptions = {
        width: mockupRef.current.scrollWidth * options.scale,
        height: mockupRef.current.scrollHeight * options.scale,
        pixelRatio: options.scale,
        useCORS: true,
        allowTaint: true,
        cacheBust: true,
      };

      let dataUrl: string;
      let fileExtension: string;
      
      setDownloadProgress(60);

      switch (options.format) {
        case 'png':
          dataUrl = await toPng(mockupRef.current, {
            ...baseOptions,
            backgroundColor: options.transparentBackground ? 'transparent' : options.backgroundColor,
          });
          fileExtension = 'png';
          break;
          
        case 'jpeg':
          dataUrl = await toJpeg(mockupRef.current, {
            ...baseOptions,
            quality: options.quality,
            backgroundColor: options.backgroundColor,
          });
          fileExtension = 'jpg';
          break;
          
        case 'svg':
          dataUrl = await toSvg(mockupRef.current, { 
            ...baseOptions,
            backgroundColor: options.transparentBackground ? 'transparent' : options.backgroundColor 
          });
          fileExtension = 'svg';
          break;
          
        default:
          throw new Error('Unsupported format');
      }

      setDownloadProgress(80);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const qualityStr = options.format === 'jpeg' ? `_q${Math.round(options.quality * 100)}` : '';
      const scaleStr = `_${options.scale}x`;
      const viewAngle = options.useCurrentView ? currentAngle : options.downloadAngle;
      const viewPerspective = options.useCurrentView ? currentPerspective : options.downloadPerspective;
      const angleStr = viewAngle !== 'front' ? `_${viewAngle.replace('angle-', '').replace('angle--', 'neg')}deg` : '';
      const perspectiveStr = viewPerspective !== 'flat' ? `_${viewPerspective}` : '';
      const filename = `mocupp-mockup-${timestamp}${angleStr}${perspectiveStr}${qualityStr}${scaleStr}.${fileExtension}`;
      
      // Download file
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadProgress(100);

      // Restore original view if it was changed
      if (needsViewRestore && onAngleChange && onPerspectiveChange && originalAngle && originalPerspective) {
        setTimeout(() => {
          onAngleChange(originalAngle);
          onPerspectiveChange(originalPerspective);
        }, 500);
      }
      
      return filename;
      
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    } finally {
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
    }
  }, []);

  return {
    isDownloading,
    downloadProgress,
    downloadMockup,
  };
}