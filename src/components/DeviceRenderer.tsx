import React, { useState, useEffect } from 'react';
import { DeviceSpecs, ViewAngle, PerspectiveView } from '../types/DeviceTypes';
import FabricImageEditor, { ImageState, FitMode } from './FabricImageEditor';
import { FileUpload } from './FileUpload';
import { ErrorBoundary } from './ErrorBoundary';
import { getViewConfig, getTransformStyle, getShadowStyle } from '../lib/viewUtils';
import { Action } from '../App';

interface DeviceRendererProps {
  device: DeviceSpecs;
  uploadedImage?: string;
  viewAngle: ViewAngle;
  perspective: PerspectiveView;
  dispatch: React.Dispatch<Action>;
  imageState?: ImageState;
  fitMode?: FitMode;
}

// Z-index constants for better maintainability
const Z_INDEX = {
  UPLOADED_IMAGE: 0,    // Behind device frame
  DEVICE_FRAME: 1,      // Device frame layer
  FILE_UPLOAD: 2,       // Interactive upload area (when no image)
  DEVICE_ELEMENTS: 10,  // Dynamic island, buttons, etc.
} as const;

export const DeviceRenderer: React.FC<DeviceRendererProps> = React.memo(({
  device,
  uploadedImage,
  viewAngle,
  perspective,
  dispatch,
  imageState,
  fitMode
}) => {
  const [layoutImageLoaded, setLayoutImageLoaded] = useState(false);

  const handleImageStateChange = (newImageState: ImageState) => {
    dispatch({ type: 'SET_IMAGE_STATE', payload: newImageState });
  };

  useEffect(() => {
    setLayoutImageLoaded(true);
  }, [device]);

  // Get the current view configuration
  const viewConfig = getViewConfig(viewAngle, perspective);
  const transformStyle = getTransformStyle(viewConfig);
  const shadowStyle = getShadowStyle(viewConfig);

  const renderDevice = () => {
    const commonProps = {
      className: "transition-all duration-700 ease-out device-mockup device-3d",
      style: {
        transform: transformStyle,
        filter: `drop-shadow(${shadowStyle})`,
        willChange: 'transform',
        backfaceVisibility: 'visible' as const,
        transformOrigin: 'center center',
        WebkitTransform: transformStyle,
        WebkitBackfaceVisibility: 'visible' as const,
      }
    };

    switch (device.category) {
      case 'iphone':
        if (device.layoutImage && layoutImageLoaded) {
          const imageUrl = device.layoutImage('portrait');
          const width = device.dimensions.width;
          const height = device.dimensions.height;
          
          return (
            <div
              {...commonProps}
              style={{
                ...commonProps.style,
                width: `${width * 4.2}px`,
                height: `${height * 4.2}px`,
                position: 'relative',
                zIndex: 0,
              }}
            >
              {/* Device frame image - always on top */}
              <img
                src={imageUrl}
                alt={`${device.name}`}
                className="w-full h-full"
                style={{ 
                  position: 'relative', 
                  zIndex: Z_INDEX.DEVICE_FRAME,
                  transform: 'translateZ(0)',
                  willChange: 'auto',
                }}
                loading="lazy"
                onError={() => {
                  console.warn(`Failed to load device image: ${imageUrl}`);
                  setLayoutImageLoaded(false);
                }}
              />
              
              {/* Screen content container with overflow hidden */}
              <div
                className="absolute overflow-hidden"
                style={{
                  top: `${Math.max(0, (device.dimensions.height - device.screen.height) / 2) * 4.2}px`,
                  left: `${Math.max(0, (device.dimensions.width - device.screen.width) / 2) * 4.2}px`,
                  width: `${device.screen.width * 4.2}px`,
                  height: `${device.screen.height * 4.2}px`,
                  borderRadius: `${device.screen.cornerRadius}px`,
                  zIndex: uploadedImage ? Z_INDEX.UPLOADED_IMAGE : Z_INDEX.FILE_UPLOAD,
                  transform: 'translateZ(1px)',
                }}
              >
                {uploadedImage ? (
                  <ErrorBoundary
                    fallback={
                      <div className="w-full h-full flex items-center justify-center bg-red-900/20 rounded-lg">
                        <div className="text-center text-red-400">
                          <div className="text-2xl mb-2">⚠️</div>
                          <p className="text-xs">Image editor error</p>
                          <button 
                            onClick={() => window.location.reload()}
                            className="mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Reload
                          </button>
                        </div>
                      </div>
                    }
                  >
                    <FabricImageEditor
                      uploadedImage={uploadedImage}
                      deviceScreenWidth={device.screen.width * 4.2}
                      deviceScreenHeight={device.screen.height * 4.2}
                      onImageStateChange={handleImageStateChange}
                      externalImageState={imageState}
                      externalFitMode={fitMode}
                    />
                  </ErrorBoundary>
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-lg">
                    <FileUpload dispatch={dispatch} />
                  </div>
                )}
              </div>
            </div>
          );
        }

        // Fallback CSS-drawn device frame
        return (
          <div 
            {...commonProps}
            style={{
              ...commonProps.style,
              display: 'inline-block',
            }}
          >
            <div
              className="relative rounded-[3.5rem] border-[3px] device-frame"
              style={{
                width: `${device.dimensions.width * 4.2}px`,
                height: `${device.dimensions.height * 4.2}px`,
                background: 'black',
                borderColor: 'rgba(0,0,0,0.15)',
                backdropFilter: 'blur(20px)',
                boxShadow: `
                  inset 0 2px 3px rgba(255,255,255,0.25),
                  inset 0 -2px 3px rgba(0,0,0,0.15),
                  0 0 0 1px rgba(0,0,0,0.1)
                `,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Dynamic Island */}
              <div
                className="absolute bg-black rounded-full"
                style={{
                  top: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '126px',
                  height: '37px',
                  borderRadius: '19px',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                  zIndex: Z_INDEX.DEVICE_ELEMENTS
                }}
              />
              
              {/* Screen area */}
              <div
                className="absolute rounded-[3rem] overflow-hidden device-screen"
                style={{
                  top: '18px',
                  left: '18px',
                  right: '18px',
                  bottom: '18px',
                  background: uploadedImage ? '#000000' : 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
                  isolation: 'isolate'
                }}
              >
                {uploadedImage ? (
                  <ErrorBoundary
                    fallback={
                      <div className="w-full h-full flex items-center justify-center bg-red-900/20 rounded-lg">
                        <div className="text-center text-red-400">
                          <div className="text-2xl mb-2">⚠️</div>
                          <p className="text-xs">Image editor error</p>
                          <button 
                            onClick={() => window.location.reload()}
                            className="mt-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Reload
                          </button>
                        </div>
                      </div>
                    }
                  >
                    <FabricImageEditor
                      uploadedImage={uploadedImage}
                      deviceScreenWidth={device.screen.width * 4.2}
                      deviceScreenHeight={device.screen.height * 4.2}
                      onImageStateChange={handleImageStateChange}
                      externalImageState={imageState}
                      externalFitMode={fitMode}
                    />
                  </ErrorBoundary>
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-lg">
                    <FileUpload dispatch={dispatch} />
                  </div>
                )}
              </div>

              {/* Side buttons */}
              <div
                className="absolute rounded-sm"
                style={{
                  right: '-2px',
                  top: '80px',
                  width: '4px',
                  height: '32px',
                  background: 'black',
                  zIndex: Z_INDEX.DEVICE_ELEMENTS
                }}
              />
              <div
                className="absolute rounded-sm"
                style={{
                  right: '-2px',
                  top: '120px',
                  width: '4px',
                  height: '56px',
                  background: 'black',
                  zIndex: Z_INDEX.DEVICE_ELEMENTS
                }}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500">
            <p>Device type not supported yet</p>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8 relative">
      {renderDevice()}
    </div>
  );
});