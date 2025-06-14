/**
 * Device Frame Audit System
 * 
 * Comprehensive audit and validation of all configured device frames
 */

import { DEVICE_SPECS } from '../data/DeviceSpecs';
import { DeviceSpecs } from '../types/DeviceTypes';
import { generateDeviceFrameSpecs, DeviceFrameSpecs } from './imageOptimization';

export interface DeviceAuditResult {
  deviceId: string;
  deviceName: string;
  status: 'valid' | 'warning' | 'error';
  issues: DeviceIssue[];
  recommendations: string[];
  frameSpecs: DeviceFrameSpecs;
  imageCompatibility: {
    supportedFormats: string[];
    optimalResolutions: {
      min: string;
      recommended: string;
      max: string;
    };
    aspectRatioRange: {
      min: number;
      max: number;
      optimal: number;
    };
  };
}

export interface DeviceIssue {
  type: 'error' | 'warning' | 'info';
  category: 'dimensions' | 'layout' | 'features' | 'compatibility' | 'performance';
  message: string;
  impact: 'high' | 'medium' | 'low';
  suggestion?: string;
}

export interface AuditSummary {
  totalDevices: number;
  validDevices: number;
  devicesWithWarnings: number;
  devicesWithErrors: number;
  commonIssues: string[];
  recommendations: string[];
  supportedResolutions: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  };
  aspectRatioDistribution: {
    portrait: number;
    landscape: number;
    square: number;
  };
}

/**
 * Audit a single device configuration
 */
export function auditDevice(deviceId: string, device: DeviceSpecs): DeviceAuditResult {
  const issues: DeviceIssue[] = [];
  const recommendations: string[] = [];
  let status: 'valid' | 'warning' | 'error' = 'valid';

  // Generate frame specifications
  const frameSpecs = generateDeviceFrameSpecs(device);

  // Validate basic device properties
  validateBasicProperties(device, issues);
  
  // Validate dimensions and proportions
  validateDimensions(device, issues);
  
  // Validate screen specifications
  validateScreenSpecs(device, issues);
  
  // Validate layout image availability
  validateLayoutImage(device, issues);
  
  // Validate features and compatibility
  validateFeatures(device, issues);
  
  // Check for performance considerations
  validatePerformance(device, frameSpecs, issues);

  // Generate recommendations based on issues
  generateRecommendations(issues, recommendations);

  // Determine overall status
  const hasErrors = issues.some(issue => issue.type === 'error');
  const hasWarnings = issues.some(issue => issue.type === 'warning');
  
  if (hasErrors) status = 'error';
  else if (hasWarnings) status = 'warning';

  // Calculate image compatibility info
  const imageCompatibility = calculateImageCompatibility(frameSpecs);

  return {
    deviceId,
    deviceName: device.name,
    status,
    issues,
    recommendations,
    frameSpecs,
    imageCompatibility,
  };
}

/**
 * Validate basic device properties
 */
function validateBasicProperties(device: DeviceSpecs, issues: DeviceIssue[]): void {
  if (!device.name || device.name.trim().length === 0) {
    issues.push({
      type: 'error',
      category: 'compatibility',
      message: 'Device name is missing or empty',
      impact: 'high',
      suggestion: 'Provide a descriptive device name',
    });
  }

  if (!device.category) {
    issues.push({
      type: 'error',
      category: 'compatibility',
      message: 'Device category is missing',
      impact: 'high',
      suggestion: 'Specify device category (iphone, ipad, etc.)',
    });
  }

  if (!device.variant || device.variant.trim().length === 0) {
    issues.push({
      type: 'warning',
      category: 'compatibility',
      message: 'Device variant is missing',
      impact: 'low',
      suggestion: 'Specify device variant for better organization',
    });
  }
}

/**
 * Validate device dimensions
 */
function validateDimensions(device: DeviceSpecs, issues: DeviceIssue[]): void {
  const { dimensions } = device;

  // Check for missing or invalid dimensions
  if (!dimensions || dimensions.width <= 0 || dimensions.height <= 0 || dimensions.depth <= 0) {
    issues.push({
      type: 'error',
      category: 'dimensions',
      message: 'Invalid or missing device dimensions',
      impact: 'high',
      suggestion: 'Provide valid width, height, and depth measurements',
    });
    return;
  }

  // Check for unrealistic dimensions (for mobile devices)
  if (device.category === 'iphone') {
    if (dimensions.width < 50 || dimensions.width > 100) {
      issues.push({
        type: 'warning',
        category: 'dimensions',
        message: `Unusual device width: ${dimensions.width}mm`,
        impact: 'medium',
        suggestion: 'Verify device width is correct (typical range: 50-100mm)',
      });
    }

    if (dimensions.height < 120 || dimensions.height > 180) {
      issues.push({
        type: 'warning',
        category: 'dimensions',
        message: `Unusual device height: ${dimensions.height}mm`,
        impact: 'medium',
        suggestion: 'Verify device height is correct (typical range: 120-180mm)',
      });
    }

    if (dimensions.depth < 6 || dimensions.depth > 15) {
      issues.push({
        type: 'warning',
        category: 'dimensions',
        message: `Unusual device depth: ${dimensions.depth}mm`,
        impact: 'low',
        suggestion: 'Verify device depth is correct (typical range: 6-15mm)',
      });
    }
  }

  // Check aspect ratio
  const aspectRatio = dimensions.width / dimensions.height;
  if (aspectRatio > 1) {
    issues.push({
      type: 'warning',
      category: 'dimensions',
      message: 'Device appears to be in landscape orientation',
      impact: 'medium',
      suggestion: 'Ensure dimensions are correct for portrait orientation',
    });
  }
}

/**
 * Validate screen specifications
 */
function validateScreenSpecs(device: DeviceSpecs, issues: DeviceIssue[]): void {
  const { screen, dimensions } = device;

  if (!screen) {
    issues.push({
      type: 'error',
      category: 'layout',
      message: 'Screen specifications are missing',
      impact: 'high',
      suggestion: 'Provide complete screen specifications',
    });
    return;
  }

  // Validate screen dimensions
  if (screen.width <= 0 || screen.height <= 0) {
    issues.push({
      type: 'error',
      category: 'layout',
      message: 'Invalid screen dimensions',
      impact: 'high',
      suggestion: 'Provide valid screen width and height',
    });
  }

  // Check if screen fits within device dimensions
  if (screen.width > dimensions.width || screen.height > dimensions.height) {
    issues.push({
      type: 'error',
      category: 'layout',
      message: 'Screen dimensions exceed device dimensions',
      impact: 'high',
      suggestion: 'Ensure screen fits within device frame',
    });
  }

  // Validate resolution
  if (!screen.resolution || screen.resolution.width <= 0 || screen.resolution.height <= 0) {
    issues.push({
      type: 'error',
      category: 'layout',
      message: 'Invalid or missing screen resolution',
      impact: 'high',
      suggestion: 'Provide valid screen resolution',
    });
  }

  // Check PPI
  if (!screen.ppi || screen.ppi < 100 || screen.ppi > 600) {
    issues.push({
      type: 'warning',
      category: 'layout',
      message: `Unusual PPI value: ${screen.ppi}`,
      impact: 'low',
      suggestion: 'Verify PPI is correct (typical range: 200-500)',
    });
  }

  // Validate corner radius
  if (screen.cornerRadius < 0 || screen.cornerRadius > 100) {
    issues.push({
      type: 'warning',
      category: 'layout',
      message: `Unusual corner radius: ${screen.cornerRadius}px`,
      impact: 'low',
      suggestion: 'Verify corner radius is appropriate',
    });
  }

  // Check screen aspect ratio vs resolution aspect ratio
  const screenAspectRatio = screen.width / screen.height;
  const resolutionAspectRatio = screen.resolution.width / screen.resolution.height;
  const aspectRatioDiff = Math.abs(screenAspectRatio - resolutionAspectRatio);

  if (aspectRatioDiff > 0.01) {
    issues.push({
      type: 'warning',
      category: 'layout',
      message: 'Screen dimensions and resolution aspect ratios do not match',
      impact: 'medium',
      suggestion: 'Ensure screen dimensions and resolution have matching aspect ratios',
    });
  }
}

/**
 * Validate layout image availability
 */
function validateLayoutImage(device: DeviceSpecs, issues: DeviceIssue[]): void {
  if (!device.layoutImage) {
    issues.push({
      type: 'warning',
      category: 'layout',
      message: 'No layout image function provided',
      impact: 'medium',
      suggestion: 'Provide layout image function for better visual representation',
    });
    return;
  }

  // Test layout image function
  try {
    const portraitPath = device.layoutImage('portrait');
    if (!portraitPath || typeof portraitPath !== 'string') {
      issues.push({
        type: 'error',
        category: 'layout',
        message: 'Layout image function returns invalid path',
        impact: 'high',
        suggestion: 'Ensure layout image function returns valid file paths',
      });
    }
  } catch {
    issues.push({
      type: 'error',
      category: 'layout',
      message: 'Layout image function throws error',
      impact: 'high',
      suggestion: 'Fix layout image function implementation',
    });
  }
}

/**
 * Validate device features
 */
function validateFeatures(device: DeviceSpecs, issues: DeviceIssue[]): void {
  if (!device.features || !Array.isArray(device.features)) {
    issues.push({
      type: 'info',
      category: 'features',
      message: 'No features specified',
      impact: 'low',
      suggestion: 'Consider adding device features for better categorization',
    });
    return;
  }

  // Check for conflicting features
  const hasNotch = device.features.includes('notch');
  const hasDynamicIsland = device.features.includes('dynamic-island');

  if (hasNotch && hasDynamicIsland) {
    issues.push({
      type: 'warning',
      category: 'features',
      message: 'Device has both notch and dynamic island features',
      impact: 'medium',
      suggestion: 'Remove conflicting features - devices typically have one or the other',
    });
  }

  // Validate feature names
  const validFeatures = [
    'notch', 'dynamic-island', 'home-button', 'face-id', 'touch-id',
    'wireless-charging', 'magsafe', 'action-button', 'usb-c', 'lightning',
    'dual-camera', 'triple-camera', 'camera-control', 'always-on-display'
  ];

  device.features.forEach(feature => {
    if (!validFeatures.includes(feature)) {
      issues.push({
        type: 'info',
        category: 'features',
        message: `Unknown feature: ${feature}`,
        impact: 'low',
        suggestion: 'Verify feature name or add to valid features list',
      });
    }
  });
}

/**
 * Validate performance considerations
 */
function validatePerformance(device: DeviceSpecs, frameSpecs: DeviceFrameSpecs, issues: DeviceIssue[]): void {
  const canvasPixels = (frameSpecs.viewport.width * frameSpecs.displayScale) * 
                      (frameSpecs.viewport.height * frameSpecs.displayScale);

  // Check for very high resolution that might impact performance
  if (canvasPixels > 16000000) { // 16 megapixels
    issues.push({
      type: 'warning',
      category: 'performance',
      message: 'Very high canvas resolution may impact performance',
      impact: 'medium',
      suggestion: 'Consider optimizing display scale or resolution for better performance',
    });
  }

  // Check memory usage estimation
  const estimatedMemory = (canvasPixels * 4) / 1024 / 1024; // MB
  if (estimatedMemory > 100) {
    issues.push({
      type: 'warning',
      category: 'performance',
      message: `High memory usage estimated: ${estimatedMemory.toFixed(1)}MB`,
      impact: 'medium',
      suggestion: 'Consider reducing canvas size for better memory efficiency',
    });
  }
}

/**
 * Generate recommendations based on issues
 */
function generateRecommendations(issues: DeviceIssue[], recommendations: string[]): void {
  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;

  if (errorCount > 0) {
    recommendations.push(`Fix ${errorCount} critical error${errorCount > 1 ? 's' : ''} before using this device`);
  }

  if (warningCount > 0) {
    recommendations.push(`Address ${warningCount} warning${warningCount > 1 ? 's' : ''} to improve compatibility`);
  }

  // Add specific recommendations based on issue categories
  const categories = [...new Set(issues.map(i => i.category))];
  
  if (categories.includes('layout')) {
    recommendations.push('Verify all layout specifications are accurate');
  }
  
  if (categories.includes('performance')) {
    recommendations.push('Consider performance optimizations for better user experience');
  }
  
  if (categories.includes('dimensions')) {
    recommendations.push('Double-check device measurements against official specifications');
  }
}

/**
 * Calculate image compatibility information
 */
function calculateImageCompatibility(frameSpecs: DeviceFrameSpecs) {
  const { optimalResolutions, viewport } = frameSpecs;
  
  return {
    supportedFormats: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    optimalResolutions: {
      min: `${optimalResolutions.min.width}×${optimalResolutions.min.height}`,
      recommended: `${optimalResolutions.recommended.width}×${optimalResolutions.recommended.height}`,
      max: `${optimalResolutions.max.width}×${optimalResolutions.max.height}`,
    },
    aspectRatioRange: {
      min: viewport.aspectRatio * 0.7,
      max: viewport.aspectRatio * 1.3,
      optimal: viewport.aspectRatio,
    },
  };
}

/**
 * Audit all configured devices
 */
export function auditAllDevices(): AuditSummary {
  const results: DeviceAuditResult[] = [];
  
  // Audit each device
  Object.entries(DEVICE_SPECS).forEach(([deviceId, device]) => {
    const result = auditDevice(deviceId, device);
    results.push(result);
  });

  // Calculate summary statistics
  const totalDevices = results.length;
  const validDevices = results.filter(r => r.status === 'valid').length;
  const devicesWithWarnings = results.filter(r => r.status === 'warning').length;
  const devicesWithErrors = results.filter(r => r.status === 'error').length;

  // Find common issues
  const allIssues = results.flatMap(r => r.issues);
  const issueMessages = allIssues.map(i => i.message);
  const commonIssues = [...new Set(issueMessages)]
    .map(message => ({
      message,
      count: issueMessages.filter(m => m === message).length,
    }))
    .filter(item => item.count > 1)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map(item => `${item.message} (${item.count} devices)`);

  // Calculate supported resolutions
  const allFrameSpecs = results.map(r => r.frameSpecs);
  const supportedResolutions = {
    minWidth: Math.min(...allFrameSpecs.map(f => f.optimalResolutions.min.width)),
    minHeight: Math.min(...allFrameSpecs.map(f => f.optimalResolutions.min.height)),
    maxWidth: Math.max(...allFrameSpecs.map(f => f.optimalResolutions.max.width)),
    maxHeight: Math.max(...allFrameSpecs.map(f => f.optimalResolutions.max.height)),
  };

  // Calculate aspect ratio distribution
  const aspectRatios = allFrameSpecs.map(f => f.viewport.aspectRatio);
  const aspectRatioDistribution = {
    portrait: aspectRatios.filter(ar => ar < 0.9).length,
    landscape: aspectRatios.filter(ar => ar > 1.1).length,
    square: aspectRatios.filter(ar => ar >= 0.9 && ar <= 1.1).length,
  };

  // Generate overall recommendations
  const recommendations: string[] = [];
  
  if (devicesWithErrors > 0) {
    recommendations.push(`${devicesWithErrors} device${devicesWithErrors > 1 ? 's' : ''} have critical errors that need immediate attention`);
  }
  
  if (devicesWithWarnings > 0) {
    recommendations.push(`${devicesWithWarnings} device${devicesWithWarnings > 1 ? 's' : ''} have warnings that should be addressed`);
  }
  
  if (commonIssues.length > 0) {
    recommendations.push('Address common issues across multiple devices for consistency');
  }
  
  recommendations.push('Regularly validate device specifications against official documentation');
  recommendations.push('Test image rendering across all device frames to ensure quality');

  return {
    totalDevices,
    validDevices,
    devicesWithWarnings,
    devicesWithErrors,
    commonIssues,
    recommendations,
    supportedResolutions,
    aspectRatioDistribution,
  };
}

/**
 * Get detailed audit report for a specific device
 */
export function getDeviceAuditReport(deviceId: string): DeviceAuditResult | null {
  const device = DEVICE_SPECS[deviceId];
  if (!device) return null;
  
  return auditDevice(deviceId, device);
}

/**
 * Export audit results for external analysis
 */
export function exportAuditResults(): string {
  const summary = auditAllDevices();
  const detailedResults = Object.entries(DEVICE_SPECS).map(([deviceId, device]) => 
    auditDevice(deviceId, device)
  );

  const exportData = {
    timestamp: new Date().toISOString(),
    summary,
    devices: detailedResults,
    metadata: {
      totalDeviceCount: Object.keys(DEVICE_SPECS).length,
      auditVersion: '1.0.0',
      categories: [...new Set(Object.values(DEVICE_SPECS).map(d => d.category))],
    },
  };

  return JSON.stringify(exportData, null, 2);
}