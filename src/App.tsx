import { useReducer, useRef, useMemo, useEffect } from 'react';
import { DeviceRenderer } from './components/DeviceRenderer';
import { DEVICE_SPECS } from './data/DeviceSpecs';
import { EnhancedSidebar } from './components/EnhancedSidebar';
import { TopNavbar } from './components/TopNavbar';
import { ImageState, FitMode } from './components/FabricImageEditor';
import { ViewAngle, PerspectiveView } from './types/DeviceTypes';
import { storageManager } from './lib/storage';
import { OptimizedImageConfig } from './lib/imageOptimization';

type State = {
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
};

export type Action =
  | { type: 'SET_DEVICE'; payload: string }
  | { type: 'SET_UPLOADED_IMAGE'; payload: string }
  | { type: 'SET_POSITION'; payload: { x: number; y: number } }
  | { type: 'SET_VIEW_ANGLE'; payload: ViewAngle }
  | { type: 'SET_PERSPECTIVE'; payload: PerspectiveView }
  | { type: 'RESET_VIEW' }
  | { type: 'SET_ORIENTATION'; payload: 'portrait' | 'landscape' }
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<State> }
  | { type: 'SET_IMAGE_STATE'; payload: ImageState }
  | { type: 'SET_FIT_MODE'; payload: FitMode }
  | { type: 'RESET_IMAGE_STATE' }
  | { type: 'SET_OPTIMIZATION_CONFIG'; payload: OptimizedImageConfig };

const initialState: State = {
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

function reducer(state: State, action: Action): State {
  console.log('🔄 Reducer action:', action.type, 'payload' in action ? 'with payload' : 'no payload');
  
  switch (action.type) {
    case 'SET_DEVICE':
      console.log('📱 Setting device to:', action.payload);
      return {
        ...state,
        selectedDevice: action.payload,
        positionX: 0,
        positionY: 0,
        imageState: undefined, // Reset image state so it re-fits to new device
        optimizationConfig: undefined, // Reset optimization for new device
      };
    case 'SET_UPLOADED_IMAGE':
      console.log('🖼️ Setting uploaded image, length:', action.payload?.length || 0);
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

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const mockupRef = useRef<HTMLDivElement>(null);

  const currentDevice = DEVICE_SPECS[state.selectedDevice];

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

  // Memoize device renderer props to prevent unnecessary re-renders
  const deviceRendererProps = useMemo(() => ({
    device: currentDevice,
    uploadedImage: state.uploadedImage,
    viewAngle: state.viewAngle,
    perspective: state.perspective,
    dispatch,
    imageState: state.imageState,
    fitMode: state.fitMode,
    optimizationConfig: state.optimizationConfig,
  }), [
    currentDevice,
    state.uploadedImage,
    state.viewAngle,
    state.perspective,
    state.imageState,
    state.fitMode,
    state.optimizationConfig,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Enhanced Sidebar */}
      <EnhancedSidebar 
        dispatch={dispatch}
        captureRef={mockupRef}
        viewAngle={state.viewAngle}
        perspective={state.perspective}
        currentState={{
          selectedDevice: state.selectedDevice,
          uploadedImage: state.uploadedImage,
          viewAngle: state.viewAngle,
          perspective: state.perspective,
          orientation: state.orientation,
          imageState: state.imageState,
          fitMode: state.fitMode,
          optimizationConfig: state.optimizationConfig,
        }}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <TopNavbar 
          currentState={{
            selectedDevice: state.selectedDevice,
            uploadedImage: state.uploadedImage,
            viewAngle: state.viewAngle,
            perspective: state.perspective,
            orientation: state.orientation,
          }}
        />
        
        {/* Main Canvas Area */}
        <div className="flex-1 p-6">
          <div className="h-full bg-white rounded-2xl shadow-lg p-6 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 pointer-events-none"></div>
            <div 
              ref={mockupRef} 
              className="relative z-10 perspective-container"
              style={{
                perspective: '1200px',
                perspectiveOrigin: 'center center',
                transformStyle: 'preserve-3d'
              }}
            >
              <DeviceRenderer
                key={`${state.selectedDevice}-${state.viewAngle}-${state.perspective}`}
                {...deviceRendererProps}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;