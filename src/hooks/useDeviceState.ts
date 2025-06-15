import { useReducer, useEffect, useCallback } from 'react';
import { ViewAngle, PerspectiveView } from '../types/DeviceTypes';
import { ImageState, FitMode } from '../components/FabricImageEditor';
import { OptimizedImageConfig } from '../lib/imageOptimization';
import { storageManager } from '../lib/storage';

export interface DeviceState {
  selectedDevice: string;
  uploadedImage?: string;
  positionX: number;
  positionY: number;
  viewAngle: ViewAngle;
  perspective: PerspectiveView;
  orientation: 'portrait' | 'landscape';
  imageState?: ImageState;
  fitMode: FitMode;
  optimizationConfig?: OptimizedImageConfig;
}

export type DeviceAction =
  | { type: 'SET_DEVICE'; payload: string }
  | { type: 'SET_UPLOADED_IMAGE'; payload: string }
  | { type: 'SET_POSITION'; payload: { x: number; y: number } }
  | { type: 'SET_VIEW_ANGLE'; payload: ViewAngle }
  | { type: 'SET_PERSPECTIVE'; payload: PerspectiveView }
  | { type: 'RESET_VIEW' }
  | { type: 'SET_ORIENTATION'; payload: 'portrait' | 'landscape' }
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<DeviceState> }
  | { type: 'SET_IMAGE_STATE'; payload: ImageState }
  | { type: 'SET_FIT_MODE'; payload: FitMode }
  | { type: 'RESET_IMAGE_STATE' }
  | { type: 'SET_OPTIMIZATION_CONFIG'; payload: OptimizedImageConfig };

const initialState: DeviceState = {
  selectedDevice: 'iphone-16-pro-max',
  uploadedImage: undefined,
  positionX: 0,
  positionY: 0,
  viewAngle: 'front',
  perspective: 'flat',
  orientation: 'portrait',
  imageState: undefined,
  fitMode: 'smart',
  optimizationConfig: undefined,
};

function deviceReducer(state: DeviceState, action: DeviceAction): DeviceState {
  console.log('🔄 Device action:', action.type);
  
  switch (action.type) {
    case 'SET_DEVICE':
      return {
        ...state,
        selectedDevice: action.payload,
        positionX: 0,
        positionY: 0,
        imageState: undefined,
        optimizationConfig: undefined,
      };
    case 'SET_UPLOADED_IMAGE':
      return {
        ...state,
        uploadedImage: action.payload,
        positionX: 0,
        positionY: 0,
      };
    case 'SET_POSITION':
      return {
        ...state,
        positionX: action.payload.x,
        positionY: action.payload.y,
      };
    case 'SET_VIEW_ANGLE':
      return {
        ...state,
        viewAngle: action.payload,
      };
    case 'SET_PERSPECTIVE':
      return {
        ...state,
        perspective: action.payload,
      };
    case 'RESET_VIEW':
      return {
        ...state,
        viewAngle: 'front',
        perspective: 'flat',
        positionX: 0,
        positionY: 0,
      };
    case 'SET_ORIENTATION':
      return {
        ...state,
        orientation: action.payload,
      };
    case 'LOAD_SAVED_STATE':
      return {
        ...state,
        ...action.payload,
      };
    case 'SET_IMAGE_STATE':
      return {
        ...state,
        imageState: action.payload,
      };
    case 'SET_FIT_MODE':
      return {
        ...state,
        fitMode: action.payload,
      };
    case 'RESET_IMAGE_STATE':
      return {
        ...state,
        imageState: undefined,
      };
    case 'SET_OPTIMIZATION_CONFIG':
      return {
        ...state,
        optimizationConfig: action.payload,
      };
    default:
      return state;
  }
}

export function useDeviceState() {
  const [state, dispatch] = useReducer(deviceReducer, initialState);

  // Load saved device configuration on mount
  useEffect(() => {
    const savedConfig = storageManager.loadDeviceConfig();
    if (savedConfig) {
      dispatch({
        type: 'LOAD_SAVED_STATE',
        payload: {
          selectedDevice: savedConfig.selectedDevice,
          viewAngle: savedConfig.viewAngle as ViewAngle,
          perspective: savedConfig.perspective as PerspectiveView,
          orientation: savedConfig.orientation as 'portrait' | 'landscape',
        },
      });
    }
  }, []);

  // Save device configuration when state changes
  useEffect(() => {
    storageManager.saveDeviceConfig({
      selectedDevice: state.selectedDevice,
      viewAngle: state.viewAngle,
      perspective: state.perspective,
      orientation: state.orientation,
    });
  }, [state.selectedDevice, state.viewAngle, state.perspective, state.orientation]);

  // Memoized action creators
  const actions = {
    setDevice: useCallback((device: string) => {
      dispatch({ type: 'SET_DEVICE', payload: device });
    }, []),
    
    setUploadedImage: useCallback((image: string) => {
      dispatch({ type: 'SET_UPLOADED_IMAGE', payload: image });
    }, []),
    
    setViewAngle: useCallback((angle: ViewAngle) => {
      dispatch({ type: 'SET_VIEW_ANGLE', payload: angle });
    }, []),
    
    setPerspective: useCallback((perspective: PerspectiveView) => {
      dispatch({ type: 'SET_PERSPECTIVE', payload: perspective });
    }, []),
    
    setImageState: useCallback((imageState: ImageState) => {
      dispatch({ type: 'SET_IMAGE_STATE', payload: imageState });
    }, []),
    
    setFitMode: useCallback((mode: FitMode) => {
      dispatch({ type: 'SET_FIT_MODE', payload: mode });
    }, []),
    
    setOptimizationConfig: useCallback((config: OptimizedImageConfig) => {
      dispatch({ type: 'SET_OPTIMIZATION_CONFIG', payload: config });
    }, []),
    
    resetView: useCallback(() => {
      dispatch({ type: 'RESET_VIEW' });
    }, []),
    
    resetImageState: useCallback(() => {
      dispatch({ type: 'RESET_IMAGE_STATE' });
    }, []),
  };

  return {
    state,
    dispatch,
    actions,
  };
}