import { ViewAngle, PerspectiveView, ViewConfig } from '../types/DeviceTypes';

// Predefined view configurations for different angles and perspectives (including negative angles)
export const VIEW_CONFIGS: Record<ViewAngle, Record<PerspectiveView, ViewConfig>> = {
  'front': {
    'flat': { angle: 'front', perspective: 'flat', rotationX: 0, rotationY: 0, rotationZ: 0, scale: 1, shadow: false },
    'perspective': { angle: 'front', perspective: 'perspective', rotationX: -5, rotationY: 0, rotationZ: 0, scale: 1, shadow: true },
    'isometric': { angle: 'front', perspective: 'isometric', rotationX: -15, rotationY: 15, rotationZ: 0, scale: 1, shadow: true },
  },
  // Positive angles (right rotation)
  'angle-15': {
    'flat': { angle: 'angle-15', perspective: 'flat', rotationX: 0, rotationY: 15, rotationZ: 0, scale: 1, shadow: true },
    'perspective': { angle: 'angle-15', perspective: 'perspective', rotationX: -8, rotationY: 15, rotationZ: 0, scale: 1, shadow: true },
    'isometric': { angle: 'angle-15', perspective: 'isometric', rotationX: -20, rotationY: 25, rotationZ: 0, scale: 1, shadow: true },
  },
  'angle-30': {
    'flat': { angle: 'angle-30', perspective: 'flat', rotationX: 0, rotationY: 30, rotationZ: 0, scale: 1, shadow: true },
    'perspective': { angle: 'angle-30', perspective: 'perspective', rotationX: -12, rotationY: 30, rotationZ: 0, scale: 1, shadow: true },
    'isometric': { angle: 'angle-30', perspective: 'isometric', rotationX: -25, rotationY: 35, rotationZ: 0, scale: 1, shadow: true },
  },
  'angle-45': {
    'flat': { angle: 'angle-45', perspective: 'flat', rotationX: 0, rotationY: 45, rotationZ: 0, scale: 1, shadow: true },
    'perspective': { angle: 'angle-45', perspective: 'perspective', rotationX: -15, rotationY: 45, rotationZ: 0, scale: 1, shadow: true },
    'isometric': { angle: 'angle-45', perspective: 'isometric', rotationX: -30, rotationY: 45, rotationZ: 0, scale: 1, shadow: true },
  },
  'angle-60': {
    'flat': { angle: 'angle-60', perspective: 'flat', rotationX: 0, rotationY: 60, rotationZ: 0, scale: 1, shadow: true },
    'perspective': { angle: 'angle-60', perspective: 'perspective', rotationX: -18, rotationY: 60, rotationZ: 0, scale: 1, shadow: true },
    'isometric': { angle: 'angle-60', perspective: 'isometric', rotationX: -35, rotationY: 60, rotationZ: 0, scale: 1, shadow: true },
  },
  // Negative angles (left rotation)
  'angle--15': {
    'flat': { angle: 'angle--15', perspective: 'flat', rotationX: 0, rotationY: -15, rotationZ: 0, scale: 1, shadow: true },
    'perspective': { angle: 'angle--15', perspective: 'perspective', rotationX: -8, rotationY: -15, rotationZ: 0, scale: 1, shadow: true },
    'isometric': { angle: 'angle--15', perspective: 'isometric', rotationX: -20, rotationY: -25, rotationZ: 0, scale: 1, shadow: true },
  },
  'angle--30': {
    'flat': { angle: 'angle--30', perspective: 'flat', rotationX: 0, rotationY: -30, rotationZ: 0, scale: 1, shadow: true },
    'perspective': { angle: 'angle--30', perspective: 'perspective', rotationX: -12, rotationY: -30, rotationZ: 0, scale: 1, shadow: true },
    'isometric': { angle: 'angle--30', perspective: 'isometric', rotationX: -25, rotationY: -35, rotationZ: 0, scale: 1, shadow: true },
  },
  'angle--45': {
    'flat': { angle: 'angle--45', perspective: 'flat', rotationX: 0, rotationY: -45, rotationZ: 0, scale: 1, shadow: true },
    'perspective': { angle: 'angle--45', perspective: 'perspective', rotationX: -15, rotationY: -45, rotationZ: 0, scale: 1, shadow: true },
    'isometric': { angle: 'angle--45', perspective: 'isometric', rotationX: -30, rotationY: -45, rotationZ: 0, scale: 1, shadow: true },
  },
  'angle--60': {
    'flat': { angle: 'angle--60', perspective: 'flat', rotationX: 0, rotationY: -60, rotationZ: 0, scale: 1, shadow: true },
    'perspective': { angle: 'angle--60', perspective: 'perspective', rotationX: -18, rotationY: -60, rotationZ: 0, scale: 1, shadow: true },
    'isometric': { angle: 'angle--60', perspective: 'isometric', rotationX: -35, rotationY: -60, rotationZ: 0, scale: 1, shadow: true },
  },
  // Side views
  'side-left': {
    'flat': { angle: 'side-left', perspective: 'flat', rotationX: 0, rotationY: -90, rotationZ: 0, scale: 1, shadow: true },
    'perspective': { angle: 'side-left', perspective: 'perspective', rotationX: -10, rotationY: -90, rotationZ: 0, scale: 1, shadow: true },
    'isometric': { angle: 'side-left', perspective: 'isometric', rotationX: -25, rotationY: -75, rotationZ: 0, scale: 1, shadow: true },
  },
  'side-right': {
    'flat': { angle: 'side-right', perspective: 'flat', rotationX: 0, rotationY: 90, rotationZ: 0, scale: 1, shadow: true },
    'perspective': { angle: 'side-right', perspective: 'perspective', rotationX: -10, rotationY: 90, rotationZ: 0, scale: 1, shadow: true },
    'isometric': { angle: 'side-right', perspective: 'isometric', rotationX: -25, rotationY: 75, rotationZ: 0, scale: 1, shadow: true },
  },
};

/**
 * Get the view configuration for a specific angle and perspective
 */
export const getViewConfig = (angle: ViewAngle, perspective: PerspectiveView): ViewConfig => {
  return VIEW_CONFIGS[angle][perspective];
};

/**
 * Generate CSS transform string from view configuration
 */
export const getTransformStyle = (config: ViewConfig): string => {
  const { rotationX, rotationY, rotationZ, scale } = config;
  
  const transforms = [
    `perspective(1200px)`,
    `rotateX(${rotationX}deg)`,
    `rotateY(${rotationY}deg)`,
    `rotateZ(${rotationZ}deg)`,
    `scale(${scale})`,
  ];
  
  return transforms.join(' ');
};

/**
 * Generate CSS shadow based on view configuration
 */
export const getShadowStyle = (config: ViewConfig): string => {
  if (!config.shadow) return 'none';
  
  const { rotationY, perspective } = config;
  
  // Calculate shadow intensity and direction based on rotation
  const shadowIntensity = Math.abs(rotationY) / 90; // 0 to 1
  const shadowDirection = rotationY > 0 ? 1 : -1;
  
  // Different shadow styles for different perspectives
  switch (perspective) {
    case 'isometric':
      return `${shadowDirection * 20 * shadowIntensity}px ${10 + shadowIntensity * 20}px ${30 + shadowIntensity * 20}px rgba(0, 0, 0, ${0.15 + shadowIntensity * 0.1})`;
    
    case 'perspective':
      return `${shadowDirection * 15 * shadowIntensity}px ${5 + shadowIntensity * 15}px ${20 + shadowIntensity * 15}px rgba(0, 0, 0, ${0.1 + shadowIntensity * 0.05})`;
    
    case 'flat':
    default:
      return `${shadowDirection * 10 * shadowIntensity}px ${shadowIntensity * 10}px ${15 + shadowIntensity * 10}px rgba(0, 0, 0, ${0.05 + shadowIntensity * 0.03})`;
  }
};

/**
 * Get background gradient based on perspective style
 */
export const getBackgroundStyle = (perspective: PerspectiveView): string => {
  switch (perspective) {
    case 'isometric':
      return 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 50%, #cbd5e0 100%)';
    
    case 'perspective':
      return 'linear-gradient(180deg, #f7fafc 0%, #edf2f7 50%, #e2e8f0 100%)';
    
    case 'flat':
    default:
      return '#f8fafc';
  }
};

/**
 * Calculate the wrapper container adjustments for different views
 */
export const getContainerStyle = (config: ViewConfig) => {
  const { perspective } = config;
  
  // Adjust container size to accommodate rotated device
  const widthMultiplier = perspective === 'isometric' ? 1.4 : 1.2;
  const heightMultiplier = perspective === 'isometric' ? 1.3 : 1.1;
  
  return {
    transform: `scale(${1 / Math.max(widthMultiplier, heightMultiplier)})`, // Scale down to fit
    transformOrigin: 'center center',
    width: `${100 * widthMultiplier}%`,
    height: `${100 * heightMultiplier}%`,
  };
};

/**
 * Check if the current view shows the device at an angle
 */
export const isAngledView = (angle: ViewAngle): boolean => {
  return angle !== 'front';
};

/**
 * Check if the current view has 3D perspective
 */
export const has3DPerspective = (perspective: PerspectiveView): boolean => {
  return perspective !== 'flat';
};

/**
 * Get human-readable description of the current view
 */
export const getViewDescription = (angle: ViewAngle, perspective: PerspectiveView): string => {
  const angleMap: Record<ViewAngle, string> = {
    'front': 'Front',
    'angle-15': '15° Right',
    'angle-30': '30° Right', 
    'angle-45': '45° Right',
    'angle-60': '60° Right',
    'angle--15': '15° Left',
    'angle--30': '30° Left', 
    'angle--45': '45° Left',
    'angle--60': '60° Left',
    'side-left': 'Side Left',
    'side-right': 'Side Right',
  };
  
  const perspectiveMap: Record<PerspectiveView, string> = {
    'flat': 'Flat',
    'perspective': 'Perspective',
    'isometric': 'Isometric',
  };
  
  return `${angleMap[angle]} - ${perspectiveMap[perspective]}`;
}; 