import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  analyzeImage, 
  calculateOptimalImageConfig, 
  generateDeviceFrameSpecs,
  ImageAnalysis,
  OptimizedImageConfig 
} from '../lib/imageOptimization';
import { DeviceSpecs } from '../types/DeviceTypes';

export type FitMode = 'cover' | 'contain' | 'smart';

export interface ImageState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  baseScale: number;
}

interface EnhancedFabricImageEditorProps {
  uploadedImage?: string;
  deviceScreenWidth: number;
  deviceScreenHeight: number;
  device: DeviceSpecs;
  onImageStateChange?: (state: ImageState) => void;
  externalImageState?: Partial<ImageState>;
  externalFitMode?: FitMode;
  autoOptimize?: boolean;
}

export default function EnhancedFabricImageEditor({
  uploadedImage,
  deviceScreenWidth,
  deviceScreenHeight,
  device,
  onImageStateChange,
  externalImageState,
  externalFitMode,
  autoOptimize = true
}: EnhancedFabricImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [fitMode, setFitMode] = useState<FitMode>(externalFitMode || 'smart');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null);
  const [optimizedConfig, setOptimizedConfig] = useState<OptimizedImageConfig | null>(null);
  
  // Image transformation state
  const [imageState, setImageState] = useState<ImageState>({
    x: deviceScreenWidth / 2,
    y: deviceScreenHeight / 2,
    scale: 1,
    rotation: 0,
    baseScale: 1,
    ...externalImageState,
  });

  const canvasWidth = deviceScreenWidth;
  const canvasHeight = deviceScreenHeight;

  // Initialize canvas with high DPI support
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Get device pixel ratio for high DPI displays
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Set actual canvas size in memory (scaled up for high DPI)
    canvas.width = canvasWidth * devicePixelRatio;
    canvas.height = canvasHeight * devicePixelRatio;
    
    // Scale the canvas back down using CSS
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    
    // Scale the drawing context so everything draws at the correct size
    ctx.scale(devicePixelRatio, devicePixelRatio);
    
    // Enable high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    setCanvasReady(true);
    console.log('📐 Enhanced High-DPI Canvas initialized:', { 
      canvasWidth, 
      canvasHeight, 
      devicePixelRatio,
      actualWidth: canvas.width,
      actualHeight: canvas.height
    });
  }, [canvasWidth, canvasHeight]);

  // Analyze image when uploaded
  useEffect(() => {
    if (uploadedImage && autoOptimize) {
      analyzeImageAsync();
    }
  }, [uploadedImage, autoOptimize]);

  // Calculate optimization when analysis is complete
  useEffect(() => {
    if (imageAnalysis && autoOptimize) {
      const deviceFrame = generateDeviceFrameSpecs(device);
      const config = calculateOptimalImageConfig(imageAnalysis, deviceFrame, fitMode);
      setOptimizedConfig(config);
      
      // Auto-apply optimization if enabled
      if (config) {
        const newImageState: ImageState = {
          x: config.position.x,
          y: config.position.y,
          scale: config.scale,
          rotation: config.transform.rotation,
          baseScale: imageState.baseScale,
        };
        setImageState(newImageState);
        onImageStateChange?.(newImageState);
        
        console.log('🎯 Auto-optimization applied:', {
          strategy: config.strategy,
          scale: config.scale,
          reasoning: config.reasoning
        });
      }
    }
  }, [imageAnalysis, device, fitMode, autoOptimize]);

  const analyzeImageAsync = async () => {
    if (!uploadedImage) return;
    
    try {
      const analysis = await analyzeImage(uploadedImage);
      setImageAnalysis(analysis);
      console.log('🔍 Image analysis complete:', analysis);
    } catch (error) {
      console.error('Failed to analyze image:', error);
    }
  };

  // Enhanced image drawing with optimization support
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Enable high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Apply quality enhancements if optimization is available
    if (optimizedConfig) {
      // Apply quality adjustments
      ctx.filter = `
        brightness(${1 + (optimizedConfig.quality.sharpening * 0.1)})
        saturate(${optimizedConfig.quality.saturation})
        contrast(${1 + (optimizedConfig.quality.compression * 0.1)})
      `;
    }
    
    // Save context state
    ctx.save();
    
    // Handle cropping if specified
    let sourceX = 0, sourceY = 0, sourceWidth = img.naturalWidth, sourceHeight = img.naturalHeight;
    if (optimizedConfig?.crop) {
      sourceX = optimizedConfig.crop.x;
      sourceY = optimizedConfig.crop.y;
      sourceWidth = optimizedConfig.crop.width;
      sourceHeight = optimizedConfig.crop.height;
    }
    
    // Move to image center
    ctx.translate(imageState.x, imageState.y);
    
    // Apply rotation
    ctx.rotate((imageState.rotation * Math.PI) / 180);
    
    // Apply scaling
    const finalScale = imageState.baseScale * imageState.scale;
    ctx.scale(finalScale, finalScale);
    
    // Draw image (cropped if necessary) centered with high quality
    const drawWidth = sourceWidth;
    const drawHeight = sourceHeight;
    
    ctx.drawImage(
      img, 
      sourceX, sourceY, sourceWidth, sourceHeight,  // Source rectangle
      -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight  // Destination rectangle
    );
    
    // Restore context state
    ctx.restore();
    
    // Reset filter
    ctx.filter = 'none';
  }, [imageState, canvasWidth, canvasHeight, optimizedConfig]);

  // Load and setup image with enhanced processing
  useEffect(() => {
    if (!uploadedImage || !canvasReady) return;

    setIsLoading(true);
    setLoadError(null);

    const img = new Image();
    
    // Enable cross-origin for better compatibility
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      imageRef.current = img;
      
      // Use optimized configuration if available, otherwise calculate basic scale
      let baseScale: number;
      let newState: ImageState;
      
      if (optimizedConfig) {
        baseScale = optimizedConfig.scale;
        newState = {
          x: optimizedConfig.position.x,
          y: optimizedConfig.position.y,
          scale: externalImageState?.scale || 1,
          rotation: externalImageState?.rotation || optimizedConfig.transform.rotation,
          baseScale,
          ...externalImageState,
        };
      } else {
        // Fallback to basic calculation
        baseScale = Math.max(canvasWidth / img.naturalWidth, canvasHeight / img.naturalHeight);
        newState = {
          x: canvasWidth / 2,
          y: canvasHeight / 2,
          scale: externalImageState?.scale || 1,
          rotation: externalImageState?.rotation || 0,
          baseScale,
          ...externalImageState,
        };
      }
      
      setImageState(newState);
      onImageStateChange?.(newState);
      
      setIsLoading(false);
      console.log('🖼️ Enhanced image loaded:', {
        naturalSize: { width: img.naturalWidth, height: img.naturalHeight },
        baseScale,
        fitMode,
        hasOptimization: !!optimizedConfig,
        dataUrlLength: uploadedImage.length
      });
    };
    
    img.onerror = (error) => {
      console.error('Image load error:', error);
      setLoadError('Failed to load image');
      setIsLoading(false);
    };
    
    img.src = uploadedImage;
  }, [uploadedImage, canvasReady, optimizedConfig, fitMode, canvasWidth, canvasHeight]);

  // Redraw image when state changes
  useEffect(() => {
    if (imageRef.current) {
      drawImage();
    }
  }, [imageState, drawImage]);

  // Handle external image state changes
  useEffect(() => {
    if (externalImageState) {
      setImageState(prev => ({
        ...prev,
        ...externalImageState,
      }));
      onImageStateChange?.({
        ...imageState,
        ...externalImageState,
      });
    }
  }, [externalImageState, onImageStateChange]);

  // Handle external fit mode changes
  useEffect(() => {
    if (externalFitMode && externalFitMode !== fitMode) {
      setFitMode(externalFitMode);
      // Re-analyze if auto-optimization is enabled
      if (autoOptimize && imageAnalysis) {
        const deviceFrame = generateDeviceFrameSpecs(device);
        const config = calculateOptimalImageConfig(imageAnalysis, deviceFrame, externalFitMode);
        setOptimizedConfig(config);
      }
    }
  }, [externalFitMode, fitMode, autoOptimize, imageAnalysis, device]);

  // Mouse event handlers for dragging (enhanced with optimization awareness)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setDragStart({ x: x - imageState.x, y: y - imageState.y });
    e.preventDefault();
  }, [imageState]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newX = x - dragStart.x;
    const newY = y - dragStart.y;

    const newState = {
      ...imageState,
      x: newX,
      y: newY,
    };
    setImageState(newState);
    onImageStateChange?.(newState);
    
    e.preventDefault();
  }, [isDragging, dragStart, imageState, onImageStateChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (!uploadedImage) {
    return (
      <div className="w-full h-full flex items-center justify-center rounded-lg bg-gray-100">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">📱</div>
          <p className="text-sm font-medium">Upload an image to start editing</p>
          <p className="text-xs text-gray-400 mt-2">
            {autoOptimize ? 'Auto-optimization enabled' : 'Manual optimization mode'}
          </p>
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
            <p className="text-sm">
              {autoOptimize ? 'Loading and optimizing image...' : 'Loading high-quality image...'}
            </p>
          </div>
        </div>
      )}
      
      {/* Optimization indicator */}
      {optimizedConfig && autoOptimize && (
        <div className="absolute top-2 left-2 z-20 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          Optimized ({optimizedConfig.strategy})
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ 
          borderRadius: 'inherit',
          backgroundColor: 'transparent',
          cursor: isDragging ? 'grabbing' : 'grab',
          imageRendering: 'high-quality',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}