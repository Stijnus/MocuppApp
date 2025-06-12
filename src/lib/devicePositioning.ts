/**
 * Device Positioning System Documentation
 * 
 * This file explains how image positioning works across different device models
 * and provides utilities for consistent placement across all supported devices.
 */

import { DeviceSpecs } from '../types/DeviceTypes';

export interface DevicePositioning {
  // Screen area calculations
  screenArea: {
    width: number;
    height: number;
    aspectRatio: number;
  };
  
  // Canvas dimensions (scaled for display)
  canvasDimensions: {
    width: number;
    height: number;
  };
  
  // Positioning within device frame
  framePosition: {
    top: number;
    left: number;
    centerX: number;
    centerY: number;
  };
  
  // Scaling factors
  scaling: {
    displayScale: number; // 4.2x for high-res display
    deviceScale: number;  // Relative to base device size
  };
}

/**
 * Calculate positioning information for any device model
 */
export function calculateDevicePositioning(device: DeviceSpecs): DevicePositioning {
  const displayScale = 4.2; // Standard scaling factor for high-res display
  
  // Calculate screen area
  const screenArea = {
    width: device.screen.width,
    height: device.screen.height,
    aspectRatio: device.screen.width / device.screen.height,
  };
  
  // Calculate canvas dimensions (what Fabric.js uses)
  const canvasDimensions = {
    width: device.screen.width * displayScale,
    height: device.screen.height * displayScale,
  };
  
  // Calculate position within device frame
  const framePosition = {
    top: Math.max(0, (device.dimensions.height - device.screen.height) / 2) * displayScale,
    left: Math.max(0, (device.dimensions.width - device.screen.width) / 2) * displayScale,
    centerX: (device.screen.width * displayScale) / 2,
    centerY: (device.screen.height * displayScale) / 2,
  };
  
  // Calculate scaling factors
  const scaling = {
    displayScale,
    deviceScale: Math.min(device.screen.width, device.screen.height) / 100, // Relative scaling
  };
  
  return {
    screenArea,
    canvasDimensions,
    framePosition,
    scaling,
  };
}

/**
 * Image Placement Strategies
 */
export type PlacementStrategy = 'contain' | 'cover' | 'fill' | 'smart';

export interface ImagePlacement {
  scale: number;
  left: number;
  top: number;
  strategy: PlacementStrategy;
  reasoning: string;
}

/**
 * Calculate optimal image placement for a device
 */
export function calculateImagePlacement(
  imageWidth: number,
  imageHeight: number,
  device: DeviceSpecs,
  strategy: PlacementStrategy = 'smart'
): ImagePlacement {
  const positioning = calculateDevicePositioning(device);
  const { canvasDimensions, framePosition } = positioning;
  
  const imageAspectRatio = imageWidth / imageHeight;
  const screenAspectRatio = positioning.screenArea.aspectRatio;
  const aspectRatioDiff = Math.abs(imageAspectRatio - screenAspectRatio);
  
  let scale: number;
  let actualStrategy: PlacementStrategy;
  let reasoning: string;
  
  switch (strategy) {
    case 'contain':
      scale = Math.min(canvasDimensions.width / imageWidth, canvasDimensions.height / imageHeight);
      scale *= 0.95; // Add 5% padding
      actualStrategy = 'contain';
      reasoning = 'Fit entire image with padding';
      break;
      
    case 'cover':
      scale = Math.max(canvasDimensions.width / imageWidth, canvasDimensions.height / imageHeight);
      actualStrategy = 'cover';
      reasoning = 'Fill entire screen, may crop image';
      break;
      
    case 'fill':
      scale = Math.min(canvasDimensions.width / imageWidth, canvasDimensions.height / imageHeight);
      actualStrategy = 'fill';
      reasoning = 'Fill screen exactly';
      break;
      
    case 'smart':
    default:
      if (aspectRatioDiff < 0.15) {
        // Similar aspect ratios - use cover for better fill
        scale = Math.max(canvasDimensions.width / imageWidth, canvasDimensions.height / imageHeight);
        actualStrategy = 'cover';
        reasoning = 'Similar aspect ratios - using cover for better fill';
      } else if (imageAspectRatio > screenAspectRatio * 1.5) {
        // Very wide image - use contain with more padding
        scale = Math.min(canvasDimensions.width / imageWidth, canvasDimensions.height / imageHeight);
        scale *= 0.9; // More padding for wide images
        actualStrategy = 'contain';
        reasoning = 'Wide image - using contain with extra padding';
      } else if (imageAspectRatio < screenAspectRatio * 0.7) {
        // Very tall image - use contain
        scale = Math.min(canvasDimensions.width / imageWidth, canvasDimensions.height / imageHeight);
        scale *= 0.95;
        actualStrategy = 'contain';
        reasoning = 'Tall image - using contain';
      } else {
        // Default to contain with padding
        scale = Math.min(canvasDimensions.width / imageWidth, canvasDimensions.height / imageHeight);
        scale *= 0.95;
        actualStrategy = 'contain';
        reasoning = 'Default strategy - contain with padding';
      }
      break;
  }
  
  // Ensure reasonable scale limits
  scale = Math.max(0.1, Math.min(scale, 5));
  
  return {
    scale,
    left: framePosition.centerX,
    top: framePosition.centerY,
    strategy: actualStrategy,
    reasoning,
  };
}

/**
 * Device Model Compatibility
 */
export interface DeviceCompatibility {
  isSupported: boolean;
  hasLayoutImage: boolean;
  screenType: 'standard' | 'notched' | 'dynamic-island';
  recommendedStrategy: PlacementStrategy;
  notes: string[];
}

/**
 * Check device compatibility and get recommendations
 */
export function checkDeviceCompatibility(device: DeviceSpecs): DeviceCompatibility {
  const hasLayoutImage = Boolean(device.layoutImage);
  const hasDynamicIsland = device.features?.includes('dynamic-island') || false;
  const hasNotch = device.features?.includes('notch') || false;
  
  let screenType: 'standard' | 'notched' | 'dynamic-island' = 'standard';
  if (hasDynamicIsland) {
    screenType = 'dynamic-island';
  } else if (hasNotch) {
    screenType = 'notched';
  }
  
  const notes: string[] = [];
  let recommendedStrategy: PlacementStrategy = 'smart';
  
  // Add device-specific notes
  if (device.category === 'iphone') {
    if (device.variant === 'Pro Max' || device.variant === 'Plus') {
      notes.push('Large screen - images will have more space');
      recommendedStrategy = 'cover';
    } else if (device.variant === 'Pro') {
      notes.push('Pro model with advanced features');
    } else {
      notes.push('Standard model');
    }
  }
  
  if (hasDynamicIsland) {
    notes.push('Has Dynamic Island - consider top area when positioning');
  }
  
  if (device.screen.cornerRadius > 50) {
    notes.push('Large corner radius - ensure content fits within rounded corners');
  }
  
  if (!hasLayoutImage) {
    notes.push('No layout image available - using CSS fallback');
  }
  
  return {
    isSupported: device.category === 'iphone', // Currently only iPhone is supported
    hasLayoutImage,
    screenType,
    recommendedStrategy,
    notes,
  };
}

/**
 * Get positioning summary for debugging
 */
export function getPositioningSummary(device: DeviceSpecs, imageWidth?: number, imageHeight?: number) {
  const positioning = calculateDevicePositioning(device);
  const compatibility = checkDeviceCompatibility(device);
  
  let imagePlacement: ImagePlacement | null = null;
  if (imageWidth && imageHeight) {
    imagePlacement = calculateImagePlacement(imageWidth, imageHeight, device);
  }
  
  return {
    device: {
      name: device.name,
      category: device.category,
      variant: device.variant,
    },
    positioning,
    compatibility,
    imagePlacement,
    debug: {
      screenArea: `${positioning.screenArea.width}×${positioning.screenArea.height}`,
      canvasSize: `${positioning.canvasDimensions.width}×${positioning.canvasDimensions.height}`,
      aspectRatio: positioning.screenArea.aspectRatio.toFixed(3),
      framePosition: `top: ${positioning.framePosition.top}px, left: ${positioning.framePosition.left}px`,
    },
  };
}

/**
 * Validate image placement for quality assurance
 */
export function validateImagePlacement(
  imageWidth: number,
  imageHeight: number,
  device: DeviceSpecs,
  placement: ImagePlacement
): { isValid: boolean; warnings: string[]; suggestions: string[] } {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  const positioning = calculateDevicePositioning(device);
  const scaledImageWidth = imageWidth * placement.scale;
  const scaledImageHeight = imageHeight * placement.scale;
  
  // Check if image is too small
  if (placement.scale < 0.3) {
    warnings.push('Image appears very small on device screen');
    suggestions.push('Consider using a higher resolution image');
  }
  
  // Check if image is too large
  if (placement.scale > 3) {
    warnings.push('Image is scaled very large, may appear pixelated');
    suggestions.push('Consider using a smaller image or different placement strategy');
  }
  
  // Check aspect ratio compatibility
  const imageAspectRatio = imageWidth / imageHeight;
  const screenAspectRatio = positioning.screenArea.aspectRatio;
  const aspectRatioDiff = Math.abs(imageAspectRatio - screenAspectRatio);
  
  if (aspectRatioDiff > 0.5) {
    warnings.push('Image aspect ratio differs significantly from device screen');
    suggestions.push('Consider cropping image to better match device aspect ratio');
  }
  
  // Check if image fits within screen bounds
  if (scaledImageWidth > positioning.canvasDimensions.width * 1.1 || 
      scaledImageHeight > positioning.canvasDimensions.height * 1.1) {
    warnings.push('Image extends significantly beyond screen bounds');
    suggestions.push('Use "contain" strategy to ensure full image visibility');
  }
  
  const isValid = warnings.length === 0;
  
  return { isValid, warnings, suggestions };
} 