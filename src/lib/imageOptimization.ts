/**
 * Image Optimization System for Device Frame Rendering
 * 
 * This module handles intelligent image processing, scaling, and positioning
 * for optimal display across all supported device frames.
 */

import { DeviceSpecs } from '../types/DeviceTypes';

export interface ImageAnalysis {
  dimensions: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  quality: {
    resolution: 'low' | 'medium' | 'high' | 'ultra';
    estimatedDPI: number;
    fileSize: number;
    sharpness: number; // 0-1 scale
    noise: number; // 0-1 scale
  };
  format: {
    type: string;
    hasTransparency: boolean;
    colorDepth: number;
  };
  orientation: 'portrait' | 'landscape' | 'square';
  compatibility: {
    isOptimal: boolean;
    recommendations: string[];
    warnings: string[];
  };
  performance: {
    renderComplexity: number; // 0-1 scale
    memoryUsage: number; // MB
    processingTime: number; // ms
  };
}

export interface OptimizedImageConfig {
  scale: number;
  position: {
    x: number;
    y: number;
  };
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null;
  transform: {
    rotation: number;
    flipX: boolean;
    flipY: boolean;
  };
  quality: {
    compression: number;
    sharpening: number;
    saturation: number;
    brightness: number;
    contrast: number;
  };
  strategy: 'contain' | 'cover' | 'fill' | 'smart' | 'custom';
  reasoning: string;
  performance: {
    renderingHints: string[];
    optimizationLevel: 'basic' | 'standard' | 'high' | 'maximum';
  };
}

export interface DeviceFrameSpecs {
  id: string;
  name: string;
  viewport: {
    width: number;
    height: number;
    aspectRatio: number;
    cornerRadius: number;
  };
  frame: {
    totalWidth: number;
    totalHeight: number;
    bezels: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
  displayScale: number;
  optimalResolutions: {
    min: { width: number; height: number };
    recommended: { width: number; height: number };
    max: { width: number; height: number };
  };
  features: string[];
}

/**
 * Enhanced image analysis with performance metrics
 */
export async function analyzeImage(imageDataUrl: string): Promise<ImageAnalysis> {
  const startTime = performance.now();
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Analyze image properties
      const dimensions = {
        width: img.width,
        height: img.height,
        aspectRatio: img.width / img.height,
      };

      // Enhanced quality analysis
      const fileSize = Math.round(imageDataUrl.length * 0.75);
      const pixelCount = dimensions.width * dimensions.height;

      let resolution: 'low' | 'medium' | 'high' | 'ultra';
      if (pixelCount < 500000) resolution = 'low';
      else if (pixelCount < 2000000) resolution = 'medium';
      else if (pixelCount < 8000000) resolution = 'high';
      else resolution = 'ultra';

      const estimatedDPI = Math.sqrt(pixelCount) / 6;

      // Advanced quality metrics
      const sharpness = calculateImageSharpness(ctx, canvas.width, canvas.height);
      const noise = calculateImageNoise(ctx, canvas.width, canvas.height);

      // Determine orientation
      let orientation: 'portrait' | 'landscape' | 'square';
      if (dimensions.aspectRatio > 1.1) orientation = 'landscape';
      else if (dimensions.aspectRatio < 0.9) orientation = 'portrait';
      else orientation = 'square';

      // Format analysis
      const format = {
        type: imageDataUrl.split(';')[0].split(':')[1] || 'unknown',
        hasTransparency: imageDataUrl.includes('data:image/png'),
        colorDepth: 24,
      };

      // Performance analysis
      const renderComplexity = calculateRenderComplexity(dimensions, format, sharpness);
      const memoryUsage = calculateMemoryUsage(dimensions);
      const processingTime = performance.now() - startTime;

      // Enhanced compatibility analysis
      const recommendations: string[] = [];
      const warnings: string[] = [];
      let isOptimal = true;

      // Resolution checks
      if (resolution === 'low') {
        warnings.push('Low resolution may appear pixelated on high-DPI displays');
        recommendations.push('Use at least 1080p resolution for optimal quality');
        isOptimal = false;
      }

      // Sharpness checks
      if (sharpness < 0.3) {
        warnings.push('Image appears blurry or out of focus');
        recommendations.push('Use a sharper image or apply sharpening filter');
        isOptimal = false;
      }

      // Noise checks
      if (noise > 0.7) {
        warnings.push('High noise levels detected in image');
        recommendations.push('Consider noise reduction or use a cleaner image');
      }

      // File size optimization
      if (fileSize > 10 * 1024 * 1024) {
        warnings.push('Large file size may impact performance');
        recommendations.push('Compress image to reduce loading time');
      }

      // Aspect ratio compatibility
      const mobileAspectRatio = 19.5 / 9;
      const aspectRatioDiff = Math.abs(dimensions.aspectRatio - mobileAspectRatio);
      
      if (aspectRatioDiff > 0.5) {
        recommendations.push('Consider cropping to match device aspect ratios');
      }

      // Extreme dimensions check
      if (dimensions.aspectRatio > 3 || dimensions.aspectRatio < 0.33) {
        warnings.push('Extreme aspect ratio may not display well');
        recommendations.push('Consider cropping to standard aspect ratio');
        isOptimal = false;
      }

      const analysis: ImageAnalysis = {
        dimensions,
        quality: {
          resolution,
          estimatedDPI,
          fileSize,
          sharpness,
          noise,
        },
        format,
        orientation,
        compatibility: {
          isOptimal,
          recommendations,
          warnings,
        },
        performance: {
          renderComplexity,
          memoryUsage,
          processingTime,
        },
      };

      resolve(analysis);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for analysis'));
    };

    img.src = imageDataUrl;
  });
}

/**
 * Calculate image sharpness using edge detection
 */
function calculateImageSharpness(ctx: CanvasRenderingContext2D, width: number, height: number): number {
  // Sample a smaller area for performance
  const sampleSize = Math.min(200, Math.min(width, height));
  const sampleX = (width - sampleSize) / 2;
  const sampleY = (height - sampleSize) / 2;
  
  const imageData = ctx.getImageData(sampleX, sampleY, sampleSize, sampleSize);
  const data = imageData.data;
  
  let sharpness = 0;
  let count = 0;
  
  // Simple edge detection using gradient magnitude
  for (let y = 1; y < sampleSize - 1; y++) {
    for (let x = 1; x < sampleSize - 1; x++) {
      const idx = (y * sampleSize + x) * 4;
      
      // Convert to grayscale
      const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const grayRight = (data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3;
      const grayDown = (data[idx + sampleSize * 4] + data[idx + sampleSize * 4 + 1] + data[idx + sampleSize * 4 + 2]) / 3;
      
      // Calculate gradient
      const gradX = Math.abs(grayRight - gray);
      const gradY = Math.abs(grayDown - gray);
      const magnitude = Math.sqrt(gradX * gradX + gradY * gradY);
      
      sharpness += magnitude;
      count++;
    }
  }
  
  return Math.min(1, (sharpness / count) / 50); // Normalize to 0-1
}

/**
 * Calculate image noise level
 */
function calculateImageNoise(ctx: CanvasRenderingContext2D, width: number, height: number): number {
  // Sample a smaller area for performance
  const sampleSize = Math.min(100, Math.min(width, height));
  const sampleX = (width - sampleSize) / 2;
  const sampleY = (height - sampleSize) / 2;
  
  const imageData = ctx.getImageData(sampleX, sampleY, sampleSize, sampleSize);
  const data = imageData.data;
  
  let variance = 0;
  let mean = 0;
  let count = 0;
  
  // Calculate mean
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    mean += gray;
    count++;
  }
  mean /= count;
  
  // Calculate variance
  for (let i = 0; i < data.length; i += 4) {
    const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
    variance += Math.pow(gray - mean, 2);
  }
  variance /= count;
  
  return Math.min(1, Math.sqrt(variance) / 50); // Normalize to 0-1
}

/**
 * Calculate rendering complexity
 */
function calculateRenderComplexity(
  dimensions: { width: number; height: number },
  format: { hasTransparency: boolean; colorDepth: number },
  sharpness: number
): number {
  const pixelCount = dimensions.width * dimensions.height;
  const baseComplexity = Math.min(1, pixelCount / 8000000); // Normalize by 8MP
  
  let complexity = baseComplexity;
  if (format.hasTransparency) complexity += 0.1;
  if (format.colorDepth > 24) complexity += 0.1;
  if (sharpness > 0.8) complexity += 0.1; // High detail images are more complex
  
  return Math.min(1, complexity);
}

/**
 * Calculate memory usage
 */
function calculateMemoryUsage(dimensions: { width: number; height: number }): number {
  const pixelCount = dimensions.width * dimensions.height;
  const bytesPerPixel = 4; // RGBA
  return (pixelCount * bytesPerPixel) / (1024 * 1024); // MB
}

/**
 * Generate device frame specifications from DeviceSpecs
 */
export function generateDeviceFrameSpecs(device: DeviceSpecs): DeviceFrameSpecs {
  const displayScale = 3; // Match DeviceRenderer DEVICE_SCALE
  
  // Calculate proper corner radius based on screen size (match DeviceRenderer calculation)
  const screenWidth = device.screen.width * displayScale;
  const screenHeight = device.screen.height * displayScale;
  const cornerRadius = Math.min(screenWidth, screenHeight) * 0.08; // 8% of smaller dimension
  
  // Use actual pixel resolution for proper recommendations
  const pixelWidth = device.screen.resolution.width;
  const pixelHeight = device.screen.resolution.height;

  return {
    id: device.name.toLowerCase().replace(/\s+/g, '-'),
    name: device.name,
    viewport: {
      width: device.screen.width,  // Keep physical dimensions for layout
      height: device.screen.height,
      aspectRatio: device.screen.width / device.screen.height,
      cornerRadius: cornerRadius / displayScale,
    },
    frame: {
      totalWidth: device.dimensions.width,
      totalHeight: device.dimensions.height,
      bezels: {
        top: (device.dimensions.height - device.screen.height) / 2,
        bottom: (device.dimensions.height - device.screen.height) / 2,
        left: (device.dimensions.width - device.screen.width) / 2,
        right: (device.dimensions.width - device.screen.width) / 2,
      },
    },
    displayScale,
    optimalResolutions: {
      min: {
        width: Math.round(pixelWidth * 0.75),  // 75% of native resolution
        height: Math.round(pixelHeight * 0.75),
      },
      recommended: {
        width: pixelWidth,  // Native resolution
        height: pixelHeight,
      },
      max: {
        width: Math.round(pixelWidth * 2),  // 2x native resolution
        height: Math.round(pixelHeight * 2),
      },
    },
    features: device.features || [],
  };
}

/**
 * Enhanced optimal image configuration calculation
 */
export function calculateOptimalImageConfig(
  imageAnalysis: ImageAnalysis,
  deviceFrame: DeviceFrameSpecs,
  strategy: 'contain' | 'cover' | 'fill' | 'smart' | 'custom' = 'smart'
): OptimizedImageConfig {
  const { dimensions: imgDim } = imageAnalysis;
  const { viewport } = deviceFrame;
  
  // Calculate canvas dimensions (scaled for display)
  const canvasWidth = viewport.width * deviceFrame.displayScale;
  const canvasHeight = viewport.height * deviceFrame.displayScale;
  
  // Calculate aspect ratio difference (used in multiple places)
  const aspectRatioDiff = Math.abs(imgDim.aspectRatio - viewport.aspectRatio);
  
  let scale: number;
  let actualStrategy: typeof strategy;
  let reasoning: string;
  let crop: OptimizedImageConfig['crop'] = null;

  // Enhanced strategy determination with performance considerations
  switch (strategy) {
    case 'contain':
      scale = Math.min(canvasWidth / imgDim.width, canvasHeight / imgDim.height) * 0.95;
      actualStrategy = 'contain';
      reasoning = 'Fit entire image with padding to ensure full visibility';
      break;

    case 'cover':
      scale = Math.max(canvasWidth / imgDim.width, canvasHeight / imgDim.height);
      actualStrategy = 'cover';
      reasoning = 'Fill entire viewport, may crop image edges';
      break;

    case 'fill':
      scale = Math.max(canvasWidth / imgDim.width, canvasHeight / imgDim.height);
      actualStrategy = 'cover'; // Fill acts like cover for better visual results
      reasoning = 'Fill viewport completely without distortion';
      break;

    case 'smart':
    default: {
      const isHighRes = imageAnalysis.quality.resolution === 'high' || imageAnalysis.quality.resolution === 'ultra';
      const isHighQuality = imageAnalysis.quality.sharpness > 0.6 && imageAnalysis.quality.noise < 0.4;
      const isLowComplexity = imageAnalysis.performance.renderComplexity < 0.5;
      
      if (aspectRatioDiff < 0.05 && isHighRes && isHighQuality) {
        // Perfect match with high quality - use cover for maximum impact
        scale = Math.max(canvasWidth / imgDim.width, canvasHeight / imgDim.height);
        actualStrategy = 'cover';
        reasoning = 'Perfect aspect ratio match with high quality - using cover for maximum impact';
      } else if (aspectRatioDiff < 0.1 && isHighRes) {
        // Very similar aspect ratios with high resolution - use cover
        scale = Math.max(canvasWidth / imgDim.width, canvasHeight / imgDim.height);
        actualStrategy = 'cover';
        reasoning = 'Similar aspect ratios with high resolution - using cover for optimal fill';
      } else if (aspectRatioDiff < 0.3 && isLowComplexity) {
        // Moderately similar aspect ratios with low complexity - use smart cover
        scale = Math.max(canvasWidth / imgDim.width, canvasHeight / imgDim.height) * 0.98;
        actualStrategy = 'cover';
        reasoning = 'Good aspect ratio match with low complexity - using cover with minimal padding';
      } else if (imgDim.aspectRatio > viewport.aspectRatio * 1.5) {
        // Very wide image - use contain with more padding
        scale = Math.min(canvasWidth / imgDim.width, canvasHeight / imgDim.height) * 0.9;
        actualStrategy = 'contain';
        reasoning = 'Wide image - using contain with extra padding to prevent cropping';
      } else if (imgDim.aspectRatio < viewport.aspectRatio * 0.7) {
        // Very tall image - use contain
        scale = Math.min(canvasWidth / imgDim.width, canvasHeight / imgDim.height) * 0.95;
        actualStrategy = 'contain';
        reasoning = 'Tall image - using contain to show full height';
      } else if (!isHighQuality) {
        // Lower quality image - use contain to avoid magnifying artifacts
        scale = Math.min(canvasWidth / imgDim.width, canvasHeight / imgDim.height) * 0.92;
        actualStrategy = 'contain';
        reasoning = 'Lower quality image - using contain to minimize artifacts';
      } else {
        // Default case - use contain with standard padding
        scale = Math.min(canvasWidth / imgDim.width, canvasHeight / imgDim.height) * 0.95;
        actualStrategy = 'contain';
        reasoning = 'Default strategy - contain with padding for safe display';
      }
      break;
    }
  }

  // Enhanced scale limits with quality considerations
  const minScale = imageAnalysis.quality.sharpness > 0.7 ? 0.1 : 0.2; // Allow smaller scale for sharp images
  const maxScale = imageAnalysis.quality.resolution === 'ultra' ? 6 : 4; // Allow larger scale for ultra-high res
  scale = Math.max(minScale, Math.min(scale, maxScale));

  // Enhanced intelligent cropping with focus detection
  if (actualStrategy === 'cover' && aspectRatioDiff > 0.15) {
    const scaledWidth = imgDim.width * scale;
    const scaledHeight = imgDim.height * scale;
    
    if (scaledWidth > canvasWidth) {
      // Crop horizontally - use smart focus detection
      const cropWidth = canvasWidth / scale;
      const focusX = detectHorizontalFocus(imageAnalysis);
      crop = {
        x: Math.max(0, Math.min(imgDim.width - cropWidth, focusX - cropWidth / 2)),
        y: 0,
        width: cropWidth,
        height: imgDim.height,
      };
    } else if (scaledHeight > canvasHeight) {
      // Crop vertically - use smart focus detection
      const cropHeight = canvasHeight / scale;
      const focusY = detectVerticalFocus(imageAnalysis);
      crop = {
        x: 0,
        y: Math.max(0, Math.min(imgDim.height - cropHeight, focusY - cropHeight / 2)),
        width: imgDim.width,
        height: cropHeight,
      };
    }
  }

  // Enhanced positioning with viewport optimization
  const position = calculateOptimalPosition(canvasWidth, canvasHeight, crop);

  // Enhanced quality adjustments based on comprehensive analysis
  const qualityConfig = calculateQualityAdjustments(imageAnalysis, scale, actualStrategy);

  // Performance optimization hints
  const renderingHints = generateRenderingHints(imageAnalysis, scale, actualStrategy);
  const optimizationLevel = determineOptimizationLevel(imageAnalysis, scale);

  const result = {
    scale,
    position,
    crop,
    transform: {
      rotation: 0,
      flipX: false,
      flipY: false,
    },
    quality: qualityConfig,
    strategy: actualStrategy,
    reasoning,
    performance: {
      renderingHints,
      optimizationLevel,
    },
  };

  console.log('🔧 Calculated optimization config:', {
    inputStrategy: strategy,
    outputStrategy: actualStrategy,
    scale,
    position,
    hasCrop: crop !== null,
    qualityConfig,
    reasoning
  });

  return result;
}

/**
 * Detect horizontal focus point for smart cropping
 */
function detectHorizontalFocus(imageAnalysis: ImageAnalysis): number {
  // For now, use rule of thirds as default
  // In the future, this could use actual content analysis
  const { width } = imageAnalysis.dimensions;
  
  // Check if image is likely a UI screenshot (common case)
  if (imageAnalysis.dimensions.aspectRatio > 1.5) {
    return width * 0.5; // Center for wide UI screenshots
  }
  
  // Use rule of thirds for other images
  return width * 0.33;
}

/**
 * Detect vertical focus point for smart cropping
 */
function detectVerticalFocus(imageAnalysis: ImageAnalysis): number {
  const { height } = imageAnalysis.dimensions;
  
  // For UI screenshots, focus on upper portion
  if (imageAnalysis.dimensions.aspectRatio < 0.8) {
    return height * 0.25; // Upper quarter for tall UI screenshots
  }
  
  // Use rule of thirds for other images
  return height * 0.33;
}

/**
 * Calculate optimal position considering crop and scale
 */
function calculateOptimalPosition(
  canvasWidth: number,
  canvasHeight: number,
  crop: OptimizedImageConfig['crop']
): { x: number; y: number } {
  if (crop) {
    // Position cropped image to center the visible area
    return {
      x: canvasWidth / 2,
      y: canvasHeight / 2,
    };
  }
  
  // Standard centering for non-cropped images
  return {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
  };
}

/**
 * Calculate quality adjustments based on image analysis
 */
function calculateQualityAdjustments(
  imageAnalysis: ImageAnalysis,
  scale: number,
  strategy: string
): OptimizedImageConfig['quality'] {
  let compression = 0.95;
  let sharpening = 0;
  let saturation = 1;
  const brightness = 1;
  let contrast = 1;

  // Adjust based on image quality
  if (imageAnalysis.quality.resolution === 'low') {
    sharpening = 0.3; // More aggressive sharpening for low-res
    contrast = 1.1; // Slight contrast boost
  } else if (imageAnalysis.quality.sharpness < 0.4) {
    sharpening = 0.2; // Moderate sharpening for blurry images
  }

  // Adjust based on noise levels
  if (imageAnalysis.quality.noise > 0.6) {
    sharpening = Math.max(0, sharpening - 0.1); // Reduce sharpening for noisy images
    compression = 0.9; // Higher compression to reduce noise artifacts
  }

  // Adjust based on scaling
  if (scale > 2) {
    compression = 0.9; // Reduce compression for heavily scaled images
    sharpening = Math.min(0.4, sharpening + 0.1); // Add sharpening for upscaled images
  } else if (scale < 0.5) {
    compression = 0.98; // Higher compression for downscaled images
  }

  // Strategy-specific adjustments
  if (strategy === 'cover') {
    saturation = 1.05; // Slight saturation boost for cover images
    contrast = 1.02; // Slight contrast boost
  }

  return {
    compression,
    sharpening,
    saturation,
    brightness,
    contrast,
  };
}

/**
 * Generate rendering hints for performance optimization
 */
function generateRenderingHints(
  imageAnalysis: ImageAnalysis,
  scale: number,
  strategy: string
): string[] {
  const hints: string[] = [];
  
  if (imageAnalysis.performance.renderComplexity > 0.7) {
    hints.push('high-complexity');
  }
  
  if (scale > 2) {
    hints.push('upscaling');
  }
  
  if (scale < 0.5) {
    hints.push('downscaling');
  }
  
  if (imageAnalysis.quality.sharpness < 0.3) {
    hints.push('blur-compensation');
  }
  
  if (imageAnalysis.quality.noise > 0.6) {
    hints.push('noise-reduction');
  }
  
  if (strategy === 'cover') {
    hints.push('crop-optimization');
  }
  
  return hints;
}

/**
 * Determine optimization level based on image characteristics
 */
function determineOptimizationLevel(
  imageAnalysis: ImageAnalysis,
  scale: number
): 'basic' | 'standard' | 'high' | 'maximum' {
  let score = 0;
  
  if (imageAnalysis.performance.renderComplexity > 0.5) score += 1;
  if (imageAnalysis.quality.resolution === 'ultra') score += 1;
  if (scale > 1.5) score += 1;
  if (imageAnalysis.quality.sharpness < 0.4) score += 1;
  if (imageAnalysis.quality.noise > 0.5) score += 1;
  
  if (score >= 4) return 'maximum';
  if (score >= 3) return 'high';
  if (score >= 2) return 'standard';
  return 'basic';
}

/**
 * Validate image compatibility with device frame
 */
export function validateImageCompatibility(
  imageAnalysis: ImageAnalysis,
  deviceFrame: DeviceFrameSpecs
): {
  isCompatible: boolean;
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Check resolution compatibility
  const { min, recommended } = deviceFrame.optimalResolutions;
  const { width, height } = imageAnalysis.dimensions;

  if (width < min.width || height < min.height) {
    issues.push('Image resolution is below minimum recommended for this device');
    recommendations.push(`Use an image at least ${min.width}×${min.height} pixels`);
    score -= 30;
  } else if (width < recommended.width || height < recommended.height) {
    recommendations.push(`For best quality, use ${recommended.width}×${recommended.height} pixels or higher`);
    score -= 10;
  }

  // Check aspect ratio compatibility
  const aspectRatioDiff = Math.abs(imageAnalysis.dimensions.aspectRatio - deviceFrame.viewport.aspectRatio);
  if (aspectRatioDiff > 0.5) {
    issues.push('Image aspect ratio differs significantly from device viewport');
    recommendations.push('Consider cropping image to better match device aspect ratio');
    score -= 20;
  } else if (aspectRatioDiff > 0.3) {
    recommendations.push('Image aspect ratio could be optimized for better fit');
    score -= 10;
  }

  // Check file size
  if (imageAnalysis.quality.fileSize > 20 * 1024 * 1024) { // 20MB
    issues.push('Very large file size may impact performance');
    recommendations.push('Consider compressing the image');
    score -= 15;
  }

  // Check for extreme dimensions
  if (imageAnalysis.dimensions.aspectRatio > 4 || imageAnalysis.dimensions.aspectRatio < 0.25) {
    issues.push('Extreme aspect ratio may not display well');
    recommendations.push('Consider using a more standard aspect ratio');
    score -= 25;
  }

  const isCompatible = issues.length === 0;
  
  return {
    isCompatible,
    score: Math.max(0, score),
    issues,
    recommendations,
  };
}

/**
 * Generate optimization report for debugging
 */
export function generateOptimizationReport(
  imageAnalysis: ImageAnalysis,
  deviceFrame: DeviceFrameSpecs,
  config: OptimizedImageConfig
) {
  const compatibility = validateImageCompatibility(imageAnalysis, deviceFrame);
  
  return {
    timestamp: new Date().toISOString(),
    image: {
      dimensions: `${imageAnalysis.dimensions.width}×${imageAnalysis.dimensions.height}`,
      aspectRatio: imageAnalysis.dimensions.aspectRatio.toFixed(3),
      resolution: imageAnalysis.quality.resolution,
      fileSize: `${(imageAnalysis.quality.fileSize / 1024 / 1024).toFixed(2)}MB`,
      format: imageAnalysis.format.type,
    },
    device: {
      name: deviceFrame.name,
      viewport: `${deviceFrame.viewport.width}×${deviceFrame.viewport.height}`,
      aspectRatio: deviceFrame.viewport.aspectRatio.toFixed(3),
      displayScale: deviceFrame.displayScale,
    },
    optimization: {
      strategy: config.strategy,
      scale: config.scale.toFixed(3),
      reasoning: config.reasoning,
      hasCrop: config.crop !== null,
      cropArea: config.crop ? `${config.crop.width}×${config.crop.height}` : 'none',
    },
    compatibility: {
      score: compatibility.score,
      isCompatible: compatibility.isCompatible,
      issueCount: compatibility.issues.length,
      recommendationCount: compatibility.recommendations.length,
    },
    performance: {
      estimatedRenderTime: calculateEstimatedRenderTime(imageAnalysis, config),
      memoryUsage: calculateEstimatedMemoryUsage(imageAnalysis, deviceFrame),
    },
  };
}

/**
 * Calculate estimated render time based on image complexity
 */
function calculateEstimatedRenderTime(
  imageAnalysis: ImageAnalysis,
  config: OptimizedImageConfig
): number {
  const pixelCount = imageAnalysis.dimensions.width * imageAnalysis.dimensions.height;
  const baseTime = pixelCount / 1000000; // Base time per megapixel
  
  let multiplier = 1;
  if (config.crop) multiplier += 0.2;
  if (config.scale > 2) multiplier += 0.3;
  if (config.quality.sharpening > 0) multiplier += 0.1;
  
  return Math.round(baseTime * multiplier * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate estimated memory usage
 */
function calculateEstimatedMemoryUsage(
  imageAnalysis: ImageAnalysis,
  deviceFrame: DeviceFrameSpecs
): number {
  const canvasPixels = (deviceFrame.viewport.width * deviceFrame.displayScale) * 
                      (deviceFrame.viewport.height * deviceFrame.displayScale);
  const bytesPerPixel = 4; // RGBA
  const canvasMemory = canvasPixels * bytesPerPixel;
  
  const imagePixels = imageAnalysis.dimensions.width * imageAnalysis.dimensions.height;
  const imageMemory = imagePixels * bytesPerPixel;
  
  return Math.round((canvasMemory + imageMemory) / 1024 / 1024 * 100) / 100; // MB
}