import React, { useState, useCallback } from 'react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { Button } from "@/components/ui/button";
import { ViewAngle, PerspectiveView } from '../types/DeviceTypes';
import {
  Download,
  X,
  Image,
  FileImage,
  Palette,
  Check,
  RotateCw,
  Monitor,
  Box,
  Layers3
} from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  mockupRef: React.RefObject<HTMLDivElement>;
  currentAngle?: ViewAngle;
  currentPerspective?: PerspectiveView;
  onAngleChange?: (angle: ViewAngle) => void;
  onPerspectiveChange?: (perspective: PerspectiveView) => void;
}

type ExportFormat = 'png' | 'jpeg' | 'svg';
type ExportQuality = 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | 1.0;

const FORMAT_OPTIONS = [
  { 
    value: 'png' as ExportFormat, 
    label: 'PNG', 
    icon: <FileImage className="w-4 h-4" />,
    description: 'Lossless, transparent background support',
    supportsQuality: false,
    supportsBackground: true
  },
  { 
    value: 'jpeg' as ExportFormat, 
    label: 'JPEG', 
    icon: <Image className="w-4 h-4" />,
    description: 'Smaller file size, adjustable quality',
    supportsQuality: true,
    supportsBackground: true
  },
  { 
    value: 'svg' as ExportFormat, 
    label: 'SVG', 
    icon: <Palette className="w-4 h-4" />,
    description: 'Vector format, infinite scalability',
    supportsQuality: false,
    supportsBackground: false
  }
];

const QUALITY_OPTIONS = [
  { value: 0.5 as ExportQuality, label: '50%' },
  { value: 0.7 as ExportQuality, label: '70%' },
  { value: 0.8 as ExportQuality, label: '80%' },
  { value: 0.9 as ExportQuality, label: '90%' },
  { value: 1.0 as ExportQuality, label: '100%' }
];

const SCALE_OPTIONS = [
  { value: 1, label: '1x (Original)', description: 'Original size' },
  { value: 2, label: '2x (High-DPI)', description: 'Retina displays' },
  { value: 3, label: '3x (Ultra-HD)', description: 'Maximum quality' },
  { value: 4, label: '4x (Print)', description: 'Print resolution' }
];

const DOWNLOAD_ANGLE_PRESETS = [
  { value: 'front' as ViewAngle, label: 'Front', icon: <Monitor className="w-4 h-4" />, preview: '0°' },
  { value: 'angle-15' as ViewAngle, label: '15° Right', icon: <RotateCw className="w-4 h-4" />, preview: '15°' },
  { value: 'angle-30' as ViewAngle, label: '30° Right', icon: <RotateCw className="w-4 h-4" />, preview: '30°' },
  { value: 'angle-45' as ViewAngle, label: '45° Right', icon: <RotateCw className="w-4 h-4" />, preview: '45°' },
  { value: 'angle--30' as ViewAngle, label: '30° Left', icon: <RotateCw className="w-4 h-4" />, preview: '-30°' },
  { value: 'angle--45' as ViewAngle, label: '45° Left', icon: <RotateCw className="w-4 h-4" />, preview: '-45°' },
];

const DOWNLOAD_PERSPECTIVE_OPTIONS = [
  { value: 'flat' as PerspectiveView, label: 'Flat', icon: <Monitor className="w-4 h-4" /> },
  { value: 'perspective' as PerspectiveView, label: 'Perspective', icon: <Layers3 className="w-4 h-4" /> },
  { value: 'isometric' as PerspectiveView, label: 'Isometric', icon: <Box className="w-4 h-4" /> },
];

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  mockupRef,
  currentAngle = 'front',
  currentPerspective = 'flat',
  onAngleChange,
  onPerspectiveChange
}) => {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [quality, setQuality] = useState<ExportQuality>(0.9 as ExportQuality);
  const [scale, setScale] = useState(2);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [transparentBackground, setTransparentBackground] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadAngle, setDownloadAngle] = useState<ViewAngle>(currentAngle);
  const [downloadPerspective, setDownloadPerspective] = useState<PerspectiveView>(currentPerspective);
  const [useCurrentView, setUseCurrentView] = useState(true);

  const selectedFormat = FORMAT_OPTIONS.find(f => f.value === format)!;
  const selectedQuality = QUALITY_OPTIONS.find(q => q.value === quality)!;

  // Helper function to wait for DOM updates and animations
  const waitForViewUpdate = (duration: number = 2000): Promise<void> => {
    return new Promise(resolve => {
      // Force multiple reflows to ensure DOM is updated
      if (mockupRef.current) {
        // Force reflow on the main container multiple times
        for (let i = 0; i < 3; i++) {
          void mockupRef.current.offsetHeight;
          void mockupRef.current.scrollTop;
          void mockupRef.current.clientHeight;
          void mockupRef.current.getBoundingClientRect();
        }
      }
      
      // Force style recalculation on all device elements
      const elements = mockupRef.current?.querySelectorAll('.device-mockup, .device-frame, .device-screen');
      elements?.forEach(el => {
        const htmlElement = el as HTMLElement;
        // Force multiple reflows on each element
        for (let i = 0; i < 3; i++) {
          void htmlElement.offsetHeight;
          void htmlElement.getBoundingClientRect();
        }
      });
      
      // Wait for CSS transitions and transforms to complete
      setTimeout(resolve, duration);
    });
  };

  // Force style recalculation and ensure transforms are applied
  const forceStyleRecalculation = (): void => {
    if (!mockupRef.current) return;
    
    // Hide the element temporarily
    mockupRef.current.style.display = 'none';
    void mockupRef.current.offsetHeight;
    void mockupRef.current.getBoundingClientRect();
    mockupRef.current.style.display = '';
    
    // Force reflow on all device elements
    const deviceElements = mockupRef.current.querySelectorAll('.device-mockup, .device-frame, .device-screen');
    deviceElements.forEach(element => {
      const htmlElement = element as HTMLElement;
      // Re-apply transform to force recalculation
      const currentTransform = htmlElement.style.transform;
      htmlElement.style.transform = 'none';
      void htmlElement.offsetHeight;
      void htmlElement.getBoundingClientRect();
      htmlElement.style.transform = currentTransform;
      // Force another reflow
      void htmlElement.offsetHeight;
      void htmlElement.getBoundingClientRect();
    });
  };

  const handleDownload = useCallback(async () => {
    if (!mockupRef.current) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      // Store original view settings
      const originalAngle = currentAngle;
      const originalPerspective = currentPerspective;
      let needsViewRestore = false;

      console.log('🎯 Starting download process:', {
        useCurrentView,
        currentView: { angle: currentAngle, perspective: currentPerspective },
        downloadView: { angle: downloadAngle, perspective: downloadPerspective },
        needsChange: !useCurrentView
      });

      // Change view if needed
      if (!useCurrentView && onAngleChange && onPerspectiveChange) {
        console.log('🔄 Changing view for download...');
        needsViewRestore = true;
        setDownloadProgress(5);
        
        // Apply the new view settings
        onAngleChange(downloadAngle);
        onPerspectiveChange(downloadPerspective);
        
        setDownloadProgress(10);
        
        // Initial style recalculation
        forceStyleRecalculation();
        
        // Wait for initial transform changes
        await waitForViewUpdate(1500);
        
        // Force another style recalculation
        forceStyleRecalculation();
        
        // Wait longer for view changes to complete
        console.log('⏳ Waiting for view update and transforms...');
        await waitForViewUpdate(2500);
        
        // Final style recalculation before capture
        forceStyleRecalculation();
        
        // Additional wait to ensure everything is settled
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDownloadProgress(30);
      }

      console.log('📸 Starting image capture...');
      setDownloadProgress(40);

      // Create high-quality capture options with enhanced settings for CSS transforms
      const baseOptions = {
        width: mockupRef.current.scrollWidth * scale,
        height: mockupRef.current.scrollHeight * scale,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
          position: 'relative',
          margin: '0',
          padding: '0',
          transformStyle: 'preserve-3d',
          perspective: '1200px',
          backfaceVisibility: 'visible',
          WebkitTransformStyle: 'preserve-3d',
          WebkitBackfaceVisibility: 'visible',
        },
        cacheBust: true,
        pixelRatio: scale,
        useCORS: true,
        allowTaint: true,
        // Enhanced filter to ensure we capture the current state properly
        filter: (node: HTMLElement) => {
          // Skip any loading indicators or temporary elements
          if (node.classList?.contains('loading') || node.classList?.contains('temp')) {
            return false;
          }
          // Ensure we capture all device-related elements
          if (node.classList?.contains('device-mockup') || 
              node.classList?.contains('device-frame') || 
              node.classList?.contains('device-screen')) {
            return true;
          }
          return true;
        },
        // Add these options to better handle CSS transforms
        skipAutoScale: true,
        includeQueryParams: true,
        // Ensure we capture the full transform hierarchy
        captureArea: mockupRef.current,
      };

      let dataUrl: string;
      let fileExtension: string;
      
      setDownloadProgress(60);

      // Force a final reflow before capture
      forceStyleRecalculation();
      await waitForViewUpdate(500);

      switch (format) {
        case 'png':
          dataUrl = await toPng(mockupRef.current, {
            ...baseOptions,
            backgroundColor: transparentBackground ? 'transparent' : backgroundColor,
          });
          fileExtension = 'png';
          break;
          
        case 'jpeg':
          dataUrl = await toJpeg(mockupRef.current, {
            ...baseOptions,
            quality: quality,
            backgroundColor: backgroundColor,
          });
          fileExtension = 'jpg';
          break;
          
        case 'svg':
          dataUrl = await toSvg(mockupRef.current, { 
            ...baseOptions,
            backgroundColor: transparentBackground ? 'transparent' : backgroundColor 
          });
          fileExtension = 'svg';
          break;
          
        default:
          throw new Error('Unsupported format');
      }

      setDownloadProgress(80);
      
      // Generate descriptive filename
      const timestamp = new Date().toISOString().split('T')[0];
      const qualityStr = selectedFormat.supportsQuality ? `_q${Math.round(quality * 100)}` : '';
      const scaleStr = `_${scale}x`;
      const viewAngle = useCurrentView ? currentAngle : downloadAngle;
      const viewPerspective = useCurrentView ? currentPerspective : downloadPerspective;
      const angleStr = viewAngle !== 'front' ? `_${viewAngle.replace('angle-', '').replace('angle--', 'neg')}deg` : '';
      const perspectiveStr = viewPerspective !== 'flat' ? `_${viewPerspective}` : '';
      const filename = `mocupp-mockup-${timestamp}${angleStr}${perspectiveStr}${qualityStr}${scaleStr}.${fileExtension}`;
      
      // Create and trigger download
      const link = document.createElement('a');
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setDownloadProgress(100);

      console.log('✅ Download completed:', {
        filename,
        format,
        quality: selectedFormat.supportsQuality ? quality : 'N/A',
        scale,
        viewUsed: { angle: viewAngle, perspective: viewPerspective },
        estimatedSize: `${Math.round(dataUrl.length / 1024)}KB`
      });

      // Restore original view if it was changed
      if (needsViewRestore && onAngleChange && onPerspectiveChange) {
        console.log('🔄 Restoring original view...');
        setTimeout(() => {
          onAngleChange(originalAngle);
          onPerspectiveChange(originalPerspective);
        }, 500);
      }
      
      // Close modal after successful download
      setTimeout(() => {
        onClose();
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
      
    } catch (err) {
      console.error('❌ Failed to generate image:', err);
      setIsDownloading(false);
      setDownloadProgress(0);
      
      // Restore view even if download failed
      if (!useCurrentView && onAngleChange && onPerspectiveChange) {
        onAngleChange(currentAngle);
        onPerspectiveChange(currentPerspective);
      }
      
      alert('Failed to download image. Please try again with different settings.');
    }
  }, [mockupRef, format, quality, scale, backgroundColor, transparentBackground, selectedFormat, onClose, useCurrentView, downloadAngle, downloadPerspective, currentAngle, currentPerspective, onAngleChange, onPerspectiveChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Download Mockup</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* View Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Download View</h4>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={useCurrentView}
                  onChange={() => setUseCurrentView(true)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Use current view</span>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {currentAngle} • {currentPerspective}
                </span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!useCurrentView}
                  onChange={() => setUseCurrentView(false)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Select custom view for download</span>
              </label>
            </div>

            {!useCurrentView && (
              <div className="space-y-4 p-3 bg-gray-50 rounded-lg animate-in slide-in-from-top-2 duration-200">
                {/* Angle Selection */}
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-700">Download Angle</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {DOWNLOAD_ANGLE_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => setDownloadAngle(preset.value)}
                        className={`p-2 rounded-lg border text-center transition-all duration-150 ${
                          downloadAngle === preset.value
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {preset.icon}
                          <span className="text-xs font-medium">{preset.preview}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Perspective Selection */}
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-gray-700">Download Perspective</h5>
                  <div className="grid grid-cols-3 gap-2">
                    {DOWNLOAD_PERSPECTIVE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setDownloadPerspective(option.value)}
                        className={`p-2 rounded-lg border text-center transition-all duration-150 ${
                          downloadPerspective === option.value
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {option.icon}
                          <span className="text-xs font-medium">{option.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    <div 
                      className={`w-12 h-20 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg shadow-lg transform transition-all duration-300 ${
                        downloadPerspective === 'perspective' ? 'perspective-1000' : ''
                      } ${
                        downloadPerspective === 'isometric' ? 'skew-y-1' : ''
                      }`} 
                      style={{
                        transform: downloadAngle === 'front' ? 'rotateY(0deg)' :
                                  downloadAngle === 'angle-15' ? 'rotateY(15deg)' :
                                  downloadAngle === 'angle-30' ? 'rotateY(30deg)' :
                                  downloadAngle === 'angle-45' ? 'rotateY(45deg)' :
                                  downloadAngle === 'angle--30' ? 'rotateY(-30deg)' :
                                  downloadAngle === 'angle--45' ? 'rotateY(-45deg)' : 'rotateY(0deg)'
                      }}
                    >
                      <div className="w-full h-full bg-blue-500/20 rounded-sm m-1"></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {DOWNLOAD_ANGLE_PRESETS.find(p => p.value === downloadAngle)?.label} • {downloadPerspective}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Export Format</h4>
            <div className="grid grid-cols-1 gap-2">
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormat(option.value)}
                  className={`p-3 rounded-lg border text-left transition-all duration-150 ${
                    format === option.value
                      ? 'border-blue-200 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      format === option.value
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{option.label}</p>
                      <p className="text-xs text-gray-500">{option.description}</p>
                    </div>
                    {format === option.value && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quality Settings */}
          {selectedFormat.supportsQuality && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Quality Settings</h4>
              <div className="space-y-2">
                {QUALITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setQuality(option.value as ExportQuality)}
                    className={`w-full p-3 rounded-lg border text-left transition-all duration-150 ${
                      quality === option.value
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{option.label}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Quality Preview */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Selected Quality:</span>
                  <span className="font-medium text-gray-900">{selectedQuality.label}</span>
                </div>
              </div>
            </div>
          )}

          {/* Resolution Scale */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Resolution Scale</h4>
            <div className="grid grid-cols-2 gap-2">
              {SCALE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setScale(option.value)}
                  className={`p-2 rounded-lg border text-center transition-all duration-150 ${
                    scale === option.value
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <p className="text-xs font-medium">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Background Settings */}
          {selectedFormat.supportsBackground && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900">Background</h4>
              <div className="space-y-3">
                {format === 'png' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transparentBackground}
                      onChange={(e) => setTransparentBackground(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Transparent background</span>
                  </label>
                )}
                
                {!transparentBackground && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Color:</label>
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                      placeholder="#ffffff"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Download Preview */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h5 className="text-sm font-medium text-blue-900 mb-2">Download Preview</h5>
            <div className="space-y-1 text-xs text-blue-700">
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="font-medium">{selectedFormat.label}</span>
              </div>
              <div className="flex justify-between">
                <span>View:</span>
                <span className="font-medium">
                  {useCurrentView ? 'Current' : `${downloadAngle} • ${downloadPerspective}`}
                </span>
              </div>
              {selectedFormat.supportsQuality && (
                <div className="flex justify-between">
                  <span>Quality:</span>
                  <span className="font-medium">{Math.round(quality * 100)}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Resolution:</span>
                <span className="font-medium">{scale}x scaling</span>
              </div>
              <div className="flex justify-between">
                <span>Background:</span>
                <span className="font-medium">
                  {transparentBackground ? 'Transparent' : backgroundColor}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          {isDownloading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {downloadProgress < 15 ? 'Preparing view...' : 
                   downloadProgress < 40 ? 'Applying transforms...' :
                   downloadProgress < 70 ? 'Generating high-quality image...' : 
                   'Finalizing download...'}
                </span>
                <span className="font-medium text-blue-600">{downloadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!mockupRef.current}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};