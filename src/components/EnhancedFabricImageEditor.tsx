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
  externalOptimizationConfig?: OptimizedImageConfig;
  screenCornerRadius?: number;
}

export default function EnhancedFabricImageEditor({
  uploadedImage,
  deviceScreenWidth,
  deviceScreenHeight,
  device,
  onImageStateChange,
  externalImageState,
  externalFitMode,
  autoOptimize = true,
  externalOptimizationConfig,
  screenCornerRadius
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
  const prevExternalImageStateRef = useRef<Partial<ImageState> | undefined>();
  
  // Image transformation state
  const [imageState, setImageState] = useState<ImageState>(() => ({
    x: (deviceScreenWidth || 300) / 2,
    y: (deviceScreenHeight || 600) / 2,
    scale: 1,
    rotation: 0,
    baseScale: 1,
    ...externalImageState,
  }));

  const canvasWidth = deviceScreenWidth || 300;
  const canvasHeight = deviceScreenHeight || 600;

  // Initialize canvas with high DPI support
  useEffect(() => {
    if (!canvasRef.current || canvasWidth <= 0 || canvasHeight <= 0) return;
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Failed to get 2D context from canvas');
        return;
      }

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
    } catch (error) {
      console.error('Failed to initialize canvas:', error);
      setLoadError('Failed to initialize canvas');
    }
  }, [canvasWidth, canvasHeight]);

  // Define analyzeImageAsync before any effects that use it
  const analyzeImageAsync = useCallback(async () => {
    if (!uploadedImage) return;
    
    try {
      const analysis = await analyzeImage(uploadedImage);
      setImageAnalysis(analysis);
      console.log('🔍 Image analysis complete:', analysis);
    } catch (error) {
      console.error('Failed to analyze image:', error);
    }
  }, [uploadedImage]);

  // Analyze image when uploaded
  useEffect(() => {
    if (uploadedImage && autoOptimize) {
      analyzeImageAsync();
    }
  }, [uploadedImage, autoOptimize, analyzeImageAsync]);

  // Handle external optimization config
  useEffect(() => {
    if (externalOptimizationConfig) {
      setOptimizedConfig(externalOptimizationConfig);
      console.log('🎯 External optimization config applied:', {
        strategy: externalOptimizationConfig.strategy,
        scale: externalOptimizationConfig.scale,
        reasoning: externalOptimizationConfig.reasoning
      });
    }
  }, [externalOptimizationConfig]);

  // Calculate optimization when analysis is complete (only if no external config)
  useEffect(() => {
    if (imageAnalysis && autoOptimize && !externalOptimizationConfig) {
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
  }, [imageAnalysis, device, fitMode, autoOptimize, externalOptimizationConfig, imageState.baseScale, onImageStateChange]);

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
    
    // Apply clipping path for rounded rectangle if corner radius is provided
    if (screenCornerRadius && screenCornerRadius > 0) {
      ctx.save();
      ctx.beginPath();
      
      // Use roundRect if available, otherwise fallback to regular rect
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(0, 0, canvasWidth, canvasHeight, screenCornerRadius);
      } else {
        // Fallback for older browsers - create rounded rectangle manually
        const radius = Math.min(screenCornerRadius, canvasWidth / 2, canvasHeight / 2);
        ctx.moveTo(radius, 0);
        ctx.lineTo(canvasWidth - radius, 0);
        ctx.quadraticCurveTo(canvasWidth, 0, canvasWidth, radius);
        ctx.lineTo(canvasWidth, canvasHeight - radius);
        ctx.quadraticCurveTo(canvasWidth, canvasHeight, canvasWidth - radius, canvasHeight);
        ctx.lineTo(radius, canvasHeight);
        ctx.quadraticCurveTo(0, canvasHeight, 0, canvasHeight - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
      }
      
      ctx.clip();
    }
    
    // Apply quality enhancements if optimization is available
    if (optimizedConfig) {
      // Apply quality adjustments with proper CSS filter values
      const brightness = optimizedConfig.quality.brightness || 1;
      const contrast = optimizedConfig.quality.contrast || 1;
      const saturation = optimizedConfig.quality.saturation || 1;
      const sharpening = optimizedConfig.quality.sharpening || 0;
      
      // Build filter string with proper values
      ctx.filter = `
        brightness(${brightness})
        contrast(${contrast})
        saturate(${saturation})
        ${sharpening > 0 ? `blur(${-sharpening * 0.1}px)` : ''}
      `.replace(/\s+/g, ' ').trim();
      
      console.log('🎨 Applied quality filters:', {
        brightness,
        contrast,
        saturation,
        sharpening,
        filter: ctx.filter
      });
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
    
    // Restore clipping context if applied
    if (screenCornerRadius && screenCornerRadius > 0) {
      ctx.restore();
    }
  }, [imageState.x, imageState.y, imageState.scale, imageState.rotation, imageState.baseScale, canvasWidth, canvasHeight, optimizedConfig, screenCornerRadius]);

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
      // Notify parent of the initial state
      setTimeout(() => {
        onImageStateChange?.(newState);
      }, 0);
      
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
  }, [uploadedImage, canvasReady, canvasWidth, canvasHeight, externalImageState, fitMode, onImageStateChange, optimizedConfig]);

  // Redraw image when state changes
  useEffect(() => {
    if (imageRef.current) {
      drawImage();
    }
  }, [drawImage]);

  // Handle external image state changes with deep comparison and ref stability
  useEffect(() => {
    if (!externalImageState) return;
    
    const prevStateJson = prevExternalImageStateRef.current ? JSON.stringify(prevExternalImageStateRef.current) : '';
    const currentStateJson = JSON.stringify(externalImageState);
    
    // Only update if the JSON representation actually changed
    if (prevStateJson !== currentStateJson) {
      prevExternalImageStateRef.current = externalImageState;
      setImageState(prev => ({
        ...prev,
        ...externalImageState,
      }));
    }
  }, [externalImageState]);

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

  // Validation check after all hooks
  if (!device || typeof deviceScreenWidth !== 'number' || typeof deviceScreenHeight !== 'number') {
    console.error('EnhancedFabricImageEditor: Missing required props', { device, deviceScreenWidth, deviceScreenHeight });
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500 bg-red-50">
        <div className="text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm">Component initialization error</p>
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
          borderRadius: screenCornerRadius ? `${screenCornerRadius}px` : 'inherit',
          backgroundColor: 'transparent',
          cursor: isDragging ? 'grabbing' : 'grab',
          imageRendering: 'auto',
          overflow: 'hidden',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}