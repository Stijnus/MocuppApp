import { DeviceSpecs } from '../types/DeviceTypes';

export const DEVICE_SPECS: Record<string, DeviceSpecs> = {
  'iphone-16-pro-max': {
    name: 'iPhone 16 Pro Max',
    category: 'iphone',
    variant: 'Pro Max',
    dimensions: { width: 77.6, height: 163.0, depth: 8.25 },
    screen: {
      width: 74.24,
      height: 160.71,
      resolution: { width: 1320, height: 2868 },
      ppi: 460,
      cornerRadius: 55
    },
    materials: { frame: 'titanium', back: 'glass', finish: 'matte' },
    features: ['dynamic-island', 'action-button', 'usb-c', 'triple-camera', 'camera-control', 'always-on-display'],
    layoutImage: (orientation) => `/apple/iphone 16 models/iPhone 16 Pro Max/iPhone 16 Pro Max - Black Titanium - ${orientation.charAt(0).toUpperCase() + orientation.slice(1)}.png`,
  },
  'iphone-16-pro': {
    name: 'iPhone 16 Pro',
    category: 'iphone',
    variant: 'Pro',
    dimensions: { width: 71.5, height: 149.6, depth: 8.25 },
    screen: {
      width: 68.1,
      height: 147.3,
      resolution: { width: 1200, height: 2600 },
      ppi: 460,
      cornerRadius: 50
    },
    materials: { frame: 'titanium', back: 'glass', finish: 'matte' },
    features: ['dynamic-island', 'action-button', 'usb-c', 'triple-camera', 'camera-control', 'always-on-display'],
    layoutImage: (orientation) => `/apple/iphone 16 models/iPhone 16 Pro/iPhone 16 Pro - Black Titanium - ${orientation.charAt(0).toUpperCase() + orientation.slice(1)}.png`,
  },
  'iphone-16-plus': {
    name: 'iPhone 16 Plus',
    category: 'iphone',
    variant: 'Plus',
    dimensions: { width: 77.6, height: 163.0, depth: 7.8 },
    screen: {
      width: 74.24,
      height: 160.71,
      resolution: { width: 1290, height: 2796 },
      ppi: 460,
      cornerRadius: 55
    },
    materials: { frame: 'aluminum', back: 'glass', finish: 'glossy' },
    features: ['dynamic-island', 'usb-c', 'dual-camera'],
    layoutImage: (orientation) => `/apple/iphone 16 models/iPhone 16 Plus/iPhone 16 Plus - Black - ${orientation.charAt(0).toUpperCase() + orientation.slice(1)}.png`,
  },
  'iphone-16': {
    name: 'iPhone 16',
    category: 'iphone',
    variant: 'Standard',
    dimensions: { width: 71.5, height: 149.6, depth: 7.8 },
    screen: {
      width: 68.1,
      height: 147.3,
      resolution: { width: 1179, height: 2556 },
      ppi: 460,
      cornerRadius: 50
    },
    materials: { frame: 'aluminum', back: 'glass', finish: 'glossy' },
    features: ['dynamic-island', 'usb-c', 'dual-camera'],
    layoutImage: (orientation) => `/apple/iphone 16 models/iPhone 16/iPhone 16 - Black - ${orientation.charAt(0).toUpperCase() + orientation.slice(1)}.png`,
  },
  'iphone-15-pro-max': {
    name: 'iPhone 15 Pro Max',
    category: 'iphone',
    variant: 'Pro Max',
    dimensions: { width: 76.7, height: 159.9, depth: 8.25 },
    screen: {
      width: 73.3,
      height: 157.6,
      resolution: { width: 1290, height: 2796 },
      ppi: 460,
      cornerRadius: 55
    },
    materials: { frame: 'titanium', back: 'glass', finish: 'matte' },
    features: ['dynamic-island', 'action-button', 'usb-c', 'triple-camera', 'always-on-display'],
    layoutImage: (orientation) => `/apple/iphone 15 models/iPhone 15 Pro Max/iPhone 15 Pro Max - Black Titanium - ${orientation.charAt(0).toUpperCase() + orientation.slice(1)}.png`,
  },
  'iphone-15-pro': {
    name: 'iPhone 15 Pro',
    category: 'iphone',
    variant: 'Pro',
    dimensions: { width: 70.6, height: 146.6, depth: 8.25 },
    screen: {
      width: 67.2,
      height: 144.3,
      resolution: { width: 1179, height: 2556 },
      ppi: 460,
      cornerRadius: 50
    },
    materials: { frame: 'titanium', back: 'glass', finish: 'matte' },
    features: ['dynamic-island', 'action-button', 'usb-c', 'triple-camera', 'always-on-display'],
    layoutImage: (orientation) => `/apple/iphone 15 models/iPhone 15 Pro/iPhone 15 Pro - Black Titanium - ${orientation.charAt(0).toUpperCase() + orientation.slice(1)}.png`,
  },
  'iphone-15-plus': {
    name: 'iPhone 15 Plus',
    category: 'iphone',
    variant: 'Plus',
    dimensions: { width: 77.8, height: 160.9, depth: 7.8 },
    screen: {
      width: 74.4,
      height: 158.6,
      resolution: { width: 1290, height: 2796 },
      ppi: 460,
      cornerRadius: 55
    },
    materials: { frame: 'aluminum', back: 'glass', finish: 'glossy' },
    features: ['dynamic-island', 'usb-c', 'dual-camera'],
    layoutImage: (orientation) => `/apple/iphone 15 models/iPhone 15 Plus/iPhone 15 Plus - Black - ${orientation.charAt(0).toUpperCase() + orientation.slice(1)}.png`,
  },
  'iphone-15': {
    name: 'iPhone 15',
    category: 'iphone',
    variant: 'Standard',
    dimensions: { width: 71.6, height: 147.6, depth: 7.8 },
    screen: {
      width: 68.2,
      height: 145.3,
      resolution: { width: 1179, height: 2556 },
      ppi: 460,
      cornerRadius: 50
    },
    materials: { frame: 'aluminum', back: 'glass', finish: 'glossy' },
    features: ['dynamic-island', 'usb-c', 'dual-camera'],
    layoutImage: (orientation) => `/apple/iphone 15 models/iPhone 15/iPhone 15 - Black - ${orientation.charAt(0).toUpperCase() + orientation.slice(1)}.png`,
  },
};

// Helper functions for device categorization and filtering
export const getDevicesByCategory = (category: string): Record<string, DeviceSpecs> => {
  return Object.fromEntries(
    Object.entries(DEVICE_SPECS).filter(([, device]) => device.category === category)
  );
};

export const getLatestDevices = (): Record<string, DeviceSpecs> => {
  const latestModels = [
    'iphone-16-pro-max',
    'iphone-16-pro',
    'iphone-16-plus',
    'iphone-16',
  ];
  
  return Object.fromEntries(
    Object.entries(DEVICE_SPECS).filter(([key]) => latestModels.includes(key))
  );
};

export const getDeviceByName = (name: string): DeviceSpecs | undefined => {
  return DEVICE_SPECS[name];
};