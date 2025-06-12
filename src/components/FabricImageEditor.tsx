import React, { useEffect, useRef, useState, useCallback } from 'react';

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

  const canvasWidth = deviceScreenWidth;
  const canvasHeight = deviceScreenHeight;

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = canvasWidth + 'px';
    canvas.style.height = canvasHeight + 'px';
    
    setCanvasReady(true);
    console.log('📐 Canvas initialized:', { canvasWidth, canvasHeight });
  }, [canvasWidth, canvasHeight]);

  // Calculate optimal scale for different fit modes
  const calculateOptimalScale = useCallback((imgWidth: number, imgHeight: number, mode: FitMode): number => {
    switch (mode) {
      case 'cover':
        return Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
      case 'contain':
        return Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight) * 0.9;
      case 'smart':
      default:
        // Smart fit - cover by default for mobile screenshots
        return Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
    }
  }, [canvasWidth, canvasHeight]);

  // Draw image on canvas
  const drawImage = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Save context state
    ctx.save();
    
    // Move to image center
    ctx.translate(imageState.x, imageState.y);
    
    // Apply rotation
    ctx.rotate((imageState.rotation * Math.PI) / 180);
    
    // Apply scaling
    const finalScale = imageState.baseScale * imageState.scale;
    ctx.scale(finalScale, finalScale);
    
    // Draw image centered
    const drawWidth = img.naturalWidth;
    const drawHeight = img.naturalHeight;
    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    
    // Restore context state
    ctx.restore();
  }, [imageState, canvasWidth, canvasHeight]);

  // Load and setup image
  useEffect(() => {
    if (!uploadedImage || !canvasReady) return;

    setIsLoading(true);
    setLoadError(null);

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      
      // Calculate initial scale and position
      const baseScale = calculateOptimalScale(img.naturalWidth, img.naturalHeight, fitMode);
      
      const newState = {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        scale: externalImageState?.scale || 1,
        rotation: externalImageState?.rotation || 0,
        baseScale,
        ...externalImageState,
      };
      setImageState(newState);
      onImageStateChange?.(newState);
      
      setIsLoading(false);
      console.log('🖼️ Image loaded:', {
        naturalSize: { width: img.naturalWidth, height: img.naturalHeight },
        baseScale,
        fitMode
      });
    };
    
    img.onerror = () => {
      setLoadError('Failed to load image');
      setIsLoading(false);
    };
    
    img.src = uploadedImage;
  }, [uploadedImage, canvasReady, fitMode, calculateOptimalScale, canvasWidth, canvasHeight]);

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
      // Notify parent of the change
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
      // Recalculate base scale when fit mode changes
      if (imageRef.current) {
        const baseScale = calculateOptimalScale(imageRef.current.naturalWidth, imageRef.current.naturalHeight, externalFitMode);
        const newState = {
          ...imageState,
          baseScale,
        };
        setImageState(newState);
        onImageStateChange?.(newState);
      }
    }
  }, [externalFitMode, fitMode, imageState, calculateOptimalScale, onImageStateChange]);

  // Mouse event handlers for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    console.log('🖱️ Mouse down:', { x, y, imageState });
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
    
    console.log('🖱️ Mouse move:', { x, y, newX, newY, dragStart });

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
          <p className="text-xs text-gray-400 mt-2">Drag & drop or click to select</p>
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
            <p className="text-sm">Loading image...</p>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
        style={{ 
          borderRadius: 'inherit',
          backgroundColor: 'transparent',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}