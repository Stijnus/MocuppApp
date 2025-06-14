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
  };
  strategy: 'contain' | 'cover' | 'fill' | 'smart' | 'custom';
  reasoning: string;
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
 * Analyze uploaded image for optimization
 */
export async function analyzeImage(imageDataUrl: string): Promise<ImageAnalysis> {
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

      // Estimate quality based on dimensions and file size
      const fileSize = Math.round(imageDataUrl.length * 0.75); // Approximate file size
      const pixelCount = dimensions.width * dimensions.height;
      const bytesPerPixel = fileSize / pixelCount;

      let resolution: 'low' | 'medium' | 'high' | 'ultra';
      if (pixelCount < 500000) resolution = 'low';
      else if (pixelCount < 2000000) resolution = 'medium';
      else if (pixelCount < 8000000) resolution = 'high';
      else resolution = 'ultra';

      const estimatedDPI = Math.sqrt(pixelCount) / 6; // Rough DPI estimation

      // Determine orientation
      let orientation: 'portrait' | 'landscape' | 'square';
      if (dimensions.aspectRatio > 1.1) orientation = 'landscape';
      else if (dimensions.aspectRatio < 0.9) orientation = 'portrait';
      else orientation = 'square';

      // Format analysis
      const format = {
        type: imageDataUrl.split(';')[0].split(':')[1] || 'unknown',
        hasTransparency: imageDataUrl.includes('data:image/png'),
        colorDepth: 24, // Assume 24-bit for most images
      };

      // Compatibility analysis
      const recommendations: string[] = [];
      const warnings: string[] = [];
      let isOptimal = true;

      // Check resolution
      if (resolution === 'low') {
        warnings.push('Low resolution image may appear pixelated on high-DPI displays');
        recommendations.push('Use an image with at least 1080p resolution for best quality');
        isOptimal = false;
      }

      // Check aspect ratio for mobile compatibility
      const mobileAspectRatio = 19.5 / 9; // Modern phone aspect ratio
      const aspectRatioDiff = Math.abs(dimensions.aspectRatio - mobileAspectRatio);
      
      if (aspectRatioDiff > 0.5) {
        recommendations.push('Consider cropping to match device aspect ratios for better fit');
      }

      // Check file size
      if (fileSize > 10 * 1024 * 1024) { // 10MB
        warnings.push('Large file size may impact performance');
        recommendations.push('Consider compressing the image to reduce file size');
      }

      // Check for very wide or tall images
      if (dimensions.aspectRatio > 3 || dimensions.aspectRatio < 0.33) {
        warnings.push('Extreme aspect ratio may not display well on device frames');
        recommendations.push('Consider cropping to a more standard aspect ratio');
        isOptimal = false;
      }

      const analysis: ImageAnalysis = {
        dimensions,
        quality: {
          resolution,
          estimatedDPI,
          fileSize,
        },
        format,
        orientation,
        compatibility: {
          isOptimal,
          recommendations,
          warnings,
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
 * Generate device frame specifications from DeviceSpecs
 */
export function generateDeviceFrameSpecs(device: DeviceSpecs): DeviceFrameSpecs {
  const displayScale = 4.2; // Standard display scaling
  
  return {
    id: device.name.toLowerCase().replace(/\s+/g, '-'),
    name: device.name,
    viewport: {
      width: device.screen.width,
      height: device.screen.height,
      aspectRatio: device.screen.width / device.screen.height,
      cornerRadius: device.screen.cornerRadius,
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
        width: Math.round(device.screen.width * 1.5),
        height: Math.round(device.screen.height * 1.5),
      },
      recommended: {
        width: Math.round(device.screen.width * 2.5),
        height: Math.round(device.screen.height * 2.5),
      },
      max: {
        width: Math.round(device.screen.width * 4),
        height: Math.round(device.screen.height * 4),
      },
    },
    features: device.features || [],
  };
}

/**
 * Calculate optimal image configuration for a device frame
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
  
  let scale: number;
  let actualStrategy: typeof strategy;
  let reasoning: string;
  let crop: OptimizedImageConfig['crop'] = null;

  // Determine optimal strategy
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
      scale = Math.min(canvasWidth / imgDim.width, canvasHeight / imgDim.height);
      actualStrategy = 'fill';
      reasoning = 'Fill viewport exactly, may distort aspect ratio';
      break;

    case 'smart':
    default:
      const aspectRatioDiff = Math.abs(imgDim.aspectRatio - viewport.aspectRatio);
      const isHighRes = imageAnalysis.quality.resolution === 'high' || imageAnalysis.quality.resolution === 'ultra';
      
      if (aspectRatioDiff < 0.1 && isHighRes) {
        // Very similar aspect ratios with high resolution - use cover
        scale = Math.max(canvasWidth / imgDim.width, canvasHeight / imgDim.height);
        actualStrategy = 'cover';
        reasoning = 'Similar aspect ratios with high resolution - using cover for optimal fill';
      } else if (aspectRatioDiff < 0.3) {
        // Moderately similar aspect ratios - use smart cover with slight padding
        scale = Math.max(canvasWidth / imgDim.width, canvasHeight / imgDim.height) * 0.98;
        actualStrategy = 'cover';
        reasoning = 'Good aspect ratio match - using cover with minimal padding';
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
      } else {
        // Default case - use contain with standard padding
        scale = Math.min(canvasWidth / imgDim.width, canvasHeight / imgDim.height) * 0.95;
        actualStrategy = 'contain';
        reasoning = 'Default strategy - contain with padding for safe display';
      }
      break;
  }

  // Ensure reasonable scale limits
  scale = Math.max(0.1, Math.min(scale, 4));

  // Calculate intelligent cropping for cover strategy
  if (actualStrategy === 'cover' && aspectRatioDiff > 0.2) {
    const scaledWidth = imgDim.width * scale;
    const scaledHeight = imgDim.height * scale;
    
    if (scaledWidth > canvasWidth) {
      // Crop horizontally - focus on center
      const cropWidth = canvasWidth / scale;
      crop = {
        x: (imgDim.width - cropWidth) / 2,
        y: 0,
        width: cropWidth,
        height: imgDim.height,
      };
    } else if (scaledHeight > canvasHeight) {
      // Crop vertically - focus on upper portion (better for UI screenshots)
      const cropHeight = canvasHeight / scale;
      crop = {
        x: 0,
        y: Math.max(0, (imgDim.height - cropHeight) * 0.3), // 30% from top
        width: imgDim.width,
        height: cropHeight,
      };
    }
  }

  // Calculate position (center by default)
  const position = {
    x: canvasWidth / 2,
    y: canvasHeight / 2,
  };

  // Quality adjustments based on image analysis
  let compression = 0.95;
  let sharpening = 0;
  let saturation = 1;

  if (imageAnalysis.quality.resolution === 'low') {
    sharpening = 0.2; // Add slight sharpening for low-res images
  }

  if (scale > 2) {
    compression = 0.9; // Reduce compression for heavily scaled images
  }

  return {
    scale,
    position,
    crop,
    transform: {
      rotation: 0,
      flipX: false,
      flipY: false,
    },
    quality: {
      compression,
      sharpening,
      saturation,
    },
    strategy: actualStrategy,
    reasoning,
  };
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