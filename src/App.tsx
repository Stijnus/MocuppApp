import { useReducer, useRef, useMemo, useEffect } from 'react';
import { DeviceRenderer } from './components/DeviceRenderer';
import { DEVICE_SPECS } from './data/DeviceSpecs';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { ImageState, FitMode } from './components/FabricImageEditor';
// import { ZOOM_CONSTANTS } from './lib/zoomUtils'; // Zoom constants no longer needed
import { ViewAngle, PerspectiveView } from './types/DeviceTypes';
import { storageManager } from './lib/storage';

type State = {
  selectedDevice: string;
  uploadedImage?: string;
  // zoom: number; // Zoom state removed
  positionX: number;
  positionY: number;
  // hasManualZoom: boolean; // Zoom state removed
  viewAngle: ViewAngle;
  perspective: PerspectiveView;
  orientation: 'portrait' | 'landscape';
  imageState?: ImageState;
  fitMode: FitMode;
};

export type Action =
  | { type: 'SET_DEVICE'; payload: string }
  | { type: 'SET_UPLOADED_IMAGE'; payload: string }
  // | { type: 'SET_ZOOM'; payload: number; manual?: boolean } // Zoom action removed
  | { type: 'SET_POSITION'; payload: { x: number; y: number } }
  | { type: 'SET_VIEW_ANGLE'; payload: ViewAngle }
  | { type: 'SET_PERSPECTIVE'; payload: PerspectiveView }
  // | { type: 'RESET_ZOOM' } // Zoom action removed
  | { type: 'RESET_VIEW' }
  | { type: 'SET_ORIENTATION'; payload: 'portrait' | 'landscape' }
  | { type: 'LOAD_SAVED_STATE'; payload: Partial<State> }
  | { type: 'SET_IMAGE_STATE'; payload: ImageState }
  | { type: 'SET_FIT_MODE'; payload: FitMode }
  | { type: 'RESET_IMAGE_STATE' };

const initialState: State = {
  selectedDevice: 'iphone-16-pro-max',
  uploadedImage: undefined,
  // zoom: ZOOM_CONSTANTS.DEFAULT_ZOOM, // Zoom state removed
  positionX: 0,
  positionY: 0,
  // hasManualZoom: false, // Zoom state removed
  viewAngle: 'front',
  perspective: 'flat',
  orientation: 'portrait',
  imageState: undefined,
  fitMode: 'smart',
};

function reducer(state: State, action: Action): State {
  console.log('🔄 Reducer action:', action.type, 'payload' in action ? 'with payload' : 'no payload');
  
  switch (action.type) {
    case 'SET_DEVICE':
      console.log('📱 Setting device to:', action.payload);
      return {
        ...state,
        selectedDevice: action.payload,
        // zoom: state.hasManualZoom ? state.zoom : ZOOM_CONSTANTS.DEFAULT_ZOOM, // Zoom logic removed
        positionX: 0,
        positionY: 0,
      };
    case 'SET_UPLOADED_IMAGE':
      console.log('🖼️ Setting uploaded image, length:', action.payload?.length || 0);
      return {
        ...state,
        uploadedImage: action.payload,
        // zoom: ZOOM_CONSTANTS.DEFAULT_ZOOM, // Zoom logic removed
        positionX: 0,
        positionY: 0,
        // hasManualZoom: false, // Zoom logic removed
      };

    // case 'SET_ZOOM': // Zoom action removed
    //   return {
    //     ...state,
    //     zoom: action.payload,
    //     hasManualZoom: action.manual !== false,
    //   };
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
    // case 'RESET_ZOOM': // Zoom action removed
    //   return {
    //     ...state,
    //     zoom: ZOOM_CONSTANTS.DEFAULT_ZOOM,
    //     positionX: 0,
    //     positionY: 0,
    //     hasManualZoom: false,
    //   };
    case 'RESET_VIEW':
      return {
        ...state,
        viewAngle: 'front',
        perspective: 'flat',
        // zoom: ZOOM_CONSTANTS.DEFAULT_ZOOM, // Zoom logic removed
        positionX: 0,
        positionY: 0,
        // hasManualZoom: false, // Zoom logic removed
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
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const mockupRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);

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
  }), [
    currentDevice,
    state.uploadedImage,
    state.viewAngle,
    state.perspective,
    state.imageState,
    state.fitMode,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        dispatch={dispatch}
        captureRef={captureRef}
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
            <div ref={mockupRef} className="relative z-10">
              <DeviceRenderer
                key={`${state.selectedDevice}-${state.viewAngle}-${state.perspective}`}
                {...deviceRendererProps}
                captureRef={captureRef}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;