import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';

export type FitMode = 'cover' | 'contain' | 'smart';

export interface ImageState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  baseScale: number;
}

interface FabricImageEditorProps {
  uploadedImage?: string;
  deviceScreenWidth: number;
  deviceScreenHeight: number;
  onImageStateChange?: (state: ImageState) => void;
  externalImageState?: Partial<ImageState>;
  externalFitMode?: FitMode;
}

// Performance optimization constants
const RENDER_DEBOUNCE_MS = 16; // ~60fps
const HIGH_DPI_THRESHOLD = 2;
const QUALITY_SETTINGS = {
  low: { imageSmoothingQuality: 'low' as ImageSmoothingQuality, filter: 'none' },
  medium: { imageSmoothingQuality: 'medium' as ImageSmoothingQuality, filter: 'none' },
  high: { imageSmoothingQuality: 'high' as ImageSmoothingQuality, filter: 'contrast(1.02) saturate(1.01)' },
};

export default function FabricImageEditor({
  uploadedImage,
  deviceScreenWidth,
  deviceScreenHeight,
  onImageStateChange,
  externalImageState,
  externalFitMode,
}: FabricImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout>();
  const lastRenderTime = useRef<number>(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [fitMode, setFitMode] = useState<FitMode>(externalFitMode || 'smart');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Image transformation state
  const [imageState, setImageState] = useState<ImageState>({
    x: deviceScreenWidth / 2,
    y: deviceScreenHeight / 2,
    scale: 1,
    rotation: 0,
    baseScale: 1,
    ...externalImageState,
  });

  // Memoized canvas dimensions and device pixel ratio
  const canvasConfig = useMemo(() => {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const isHighDPI = devicePixelRatio >= HIGH_DPI_THRESHOLD;
    
    return {
      width: deviceScreenWidth,
      height: deviceScreenHeight,
      devicePixelRatio,
      isHighDPI,
      actualWidth: deviceScreenWidth * devicePixelRatio,
      actualHeight: deviceScreenHeight * devicePixelRatio,
    };
  }, [deviceScreenWidth, deviceScreenHeight]);

  // Initialize canvas with optimized high DPI support
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', {
      alpha: false, // Disable alpha for better performance
      desynchronized: true, // Allow async rendering
    });
    
    if (!ctx) return;

    // Set actual canvas size in memory (scaled up for high DPI)
    canvas.width = canvasConfig.actualWidth;
    canvas.height = canvasConfig.actualHeight;
    
    // Scale the canvas back down using CSS
    canvas.style.width = canvasConfig.width + 'px';
    canvas.style.height = canvasConfig.height + 'px';
    
    // Scale the drawing context so everything draws at the correct size
    ctx.scale(canvasConfig.devicePixelRatio, canvasConfig.devicePixelRatio);
    
    // Set optimal rendering settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = canvasConfig.isHighDPI ? 'high' : 'medium';
    
    setCanvasReady(true);
    console.log('📐 Enhanced Canvas initialized:', canvasConfig);
  }, [canvasConfig]);

  // Calculate optimal scale for different fit modes with performance considerations
  const calculateOptimalScale = useCallback((imgWidth: number, imgHeight: number, mode: FitMode): number => {
    const scaleX = canvasConfig.width / imgWidth;
    const scaleY = canvasConfig.height / imgHeight;
    
    switch (mode) {
      case 'cover':
        return Math.max(scaleX, scaleY);
      case 'contain':
        return Math.min(scaleX, scaleY) * 0.9;
              case 'smart':
        default: {
          // Smart fit with aspect ratio consideration
          const aspectRatioDiff = Math.abs((imgWidth / imgHeight) - (canvasConfig.width / canvasConfig.height));
          if (aspectRatioDiff < 0.1) {
            // Similar aspect ratios - use cover for better fill
            return Math.max(scaleX, scaleY) * 0.98;
          } else if (aspectRatioDiff > 0.5) {
            // Very different aspect ratios - use contain to avoid cropping
            return Math.min(scaleX, scaleY) * 0.9;
          } else {
            // Moderate difference - balanced approach
            return Math.max(scaleX, scaleY) * 0.95;
          }
        }
    }
  }, [canvasConfig]);

  // Optimized image drawing with quality enhancements
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img || !canvasReady) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Throttle rendering for performance
    const now = performance.now();
    if (now - lastRenderTime.current < RENDER_DEBOUNCE_MS) {
      if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
      renderTimeoutRef.current = setTimeout(() => drawImage(), RENDER_DEBOUNCE_MS);
      return;
    }
    lastRenderTime.current = now;

    // Clear canvas with optimized method
    ctx.clearRect(0, 0, canvasConfig.width, canvasConfig.height);
    
    // Determine quality settings based on scale and device capabilities
    const finalScale = imageState.baseScale * imageState.scale;
    const qualityLevel = finalScale > 2 ? 'high' : finalScale > 1 ? 'medium' : 'low';
    const quality = QUALITY_SETTINGS[qualityLevel];
    
    // Apply quality settings
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = quality.imageSmoothingQuality;
    ctx.filter = quality.filter;
    
    // Save context state
    ctx.save();
    
    // Move to image center
    ctx.translate(imageState.x, imageState.y);
    
    // Apply rotation
    if (imageState.rotation !== 0) {
      ctx.rotate((imageState.rotation * Math.PI) / 180);
    }
    
    // Apply scaling
    if (finalScale !== 1) {
      ctx.scale(finalScale, finalScale);
    }
    
    // Draw image centered with optimized dimensions
    const drawWidth = img.naturalWidth;
    const drawHeight = img.naturalHeight;
    
    // Use optimized drawing for large images
    if (drawWidth * drawHeight > 4000000) { // 4MP threshold
      // For very large images, use source rectangle optimization
      const sourceScale = Math.min(1, 2000 / Math.max(drawWidth, drawHeight));
      const sourceWidth = drawWidth * sourceScale;
      const sourceHeight = drawHeight * sourceScale;
      
      ctx.drawImage(
        img,
        0, 0, drawWidth, drawHeight, // Source rectangle
        -sourceWidth / 2, -sourceHeight / 2, sourceWidth, sourceHeight // Destination rectangle
      );
    } else {
      // Standard drawing for smaller images
      ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    }
    
    // Restore context state
    ctx.restore();
    
    // Reset filter
    ctx.filter = 'none';
  }, [imageState, canvasConfig, canvasReady]);

  // Enhanced image loading with error handling and optimization
  useEffect(() => {
    if (!uploadedImage || !canvasReady) return;

    setIsLoading(true);
    setLoadError(null);

    const img = new Image();
    
    // Enable cross-origin for better compatibility
    img.crossOrigin = 'anonymous';
    
    // Add loading optimization
    img.decoding = 'async';
    
    img.onload = () => {
      imageRef.current = img;
      
      // Calculate initial scale and position with optimization
      const baseScale = calculateOptimalScale(img.naturalWidth, img.naturalHeight, fitMode);
      
      const newState = {
        x: canvasConfig.width / 2,
        y: canvasConfig.height / 2,
        scale: externalImageState?.scale || 1,
        rotation: externalImageState?.rotation || 0,
        baseScale,
        ...externalImageState,
      };
      
      setImageState(newState);
      onImageStateChange?.(newState);
      
      setIsLoading(false);
      console.log('🖼️ Enhanced image loaded:', {
        naturalSize: { width: img.naturalWidth, height: img.naturalHeight },
        baseScale,
        fitMode,
        memoryUsage: `${((img.naturalWidth * img.naturalHeight * 4) / 1024 / 1024).toFixed(1)}MB`,
        dataUrlLength: uploadedImage.length
      });
    };
    
    img.onerror = (error) => {
      console.error('Image load error:', error);
      setLoadError('Failed to load image');
      setIsLoading(false);
    };
    
    img.src = uploadedImage;
    
    // Cleanup function
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [uploadedImage, canvasReady, fitMode, calculateOptimalScale, canvasConfig, externalImageState, onImageStateChange]);

  // Optimized redraw when state changes
  useEffect(() => {
    if (imageRef.current && canvasReady) {
      drawImage();
    }
  }, [imageState, drawImage, canvasReady]);

  // Handle external image state changes with optimization
  useEffect(() => {
    if (externalImageState) {
      setImageState(prev => {
        const newState = { ...prev, ...externalImageState };
        return newState;
      });
    }
  }, [externalImageState]);

  // Handle external fit mode changes with recalculation
  useEffect(() => {
    if (externalFitMode && externalFitMode !== fitMode) {
      setFitMode(externalFitMode);
      // Recalculate base scale when fit mode changes
      if (imageRef.current) {
        const baseScale = calculateOptimalScale(
          imageRef.current.naturalWidth, 
          imageRef.current.naturalHeight, 
          externalFitMode
        );
        const newState = { ...imageState, baseScale };
        setImageState(newState);
        onImageStateChange?.(newState);
      }
    }
  }, [externalFitMode, fitMode, imageState, calculateOptimalScale, onImageStateChange]);

  // Optimized mouse event handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasConfig.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasConfig.height / rect.height);

    setIsDragging(true);
    setDragStart({ x: x - imageState.x, y: y - imageState.y });
    e.preventDefault();
  }, [imageState, canvasConfig]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasConfig.width / rect.width);
    const y = (e.clientY - rect.top) * (canvasConfig.height / rect.height);

    const newX = x - dragStart.x;
    const newY = y - dragStart.y;

    const newState = { ...imageState, x: newX, y: newY };
    setImageState(newState);
    onImageStateChange?.(newState);
    
    e.preventDefault();
  }, [isDragging, dragStart, imageState, onImageStateChange, canvasConfig]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, []);

  if (!uploadedImage) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-lg bg-gray-100">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📱</div>
          <p className="text-sm font-medium">Upload an image to start editing</p>
          <p className="text-xs text-gray-400 mt-2">Enhanced rendering engine ready</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 rounded-lg">
        <div className="text-center text-red-600">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-sm font-medium">{loadError}</p>
          <button 
            onClick={() => {
              setLoadError(null);
              setIsLoading(true);
            }}
            className="mt-3 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center text-white">
            <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm">Loading with enhanced quality...</p>
          </div>
        </div>
      )}
      
      {/* Performance indicator for high DPI displays */}
      {canvasConfig.isHighDPI && (
        <div className="absolute top-2 right-2 z-20 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          HD {canvasConfig.devicePixelRatio}x
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ 
          borderRadius: 'inherit',
          backgroundColor: 'transparent',
          cursor: isDragging ? 'grabbing' : 'grab',
          imageRendering: 'auto',
          willChange: isDragging ? 'transform' : 'auto', // Optimize for dragging
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}