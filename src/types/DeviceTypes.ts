export interface DeviceSpecs {
  name: string;
  category: 'iphone' | 'ipad' | 'macbook' | 'watch';
  variant: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  screen: {
    width: number;
    height: number;
    resolution: {
      width: number;
      height: number;
    };
    ppi: number;
    cornerRadius: number;
  };
  materials: {
    frame: 'aluminum' | 'titanium' | 'ceramic';
    back: 'glass' | 'aluminum' | 'ceramic';
    finish: 'matte' | 'glossy' | 'brushed';
  };
  features: string[];
  layoutImage?: (orientation: 'portrait') => string;
}

// Enhanced types for 3D views with negative angles
export type ViewAngle = 
  | 'front' 
  | 'angle-15' | 'angle-30' | 'angle-45' | 'angle-60' 
  | 'angle--15' | 'angle--30' | 'angle--45' | 'angle--60'
  | 'side-left' | 'side-right';

export type PerspectiveView = 'isometric' | 'perspective' | 'flat';

export interface ViewConfig {
  angle: ViewAngle;
  perspective: PerspectiveView;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  shadow: boolean;
}

export interface ThemeConfig {
  name: string;
  background: string;
  shadow: string;
  lighting: 'natural' | 'studio' | 'soft' | 'dramatic';
}