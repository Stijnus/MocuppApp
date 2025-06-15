import React from 'react';
import { DeviceSpecs, ViewAngle, PerspectiveView } from '../types/DeviceTypes';
import EnhancedFabricImageEditor, { ImageState, FitMode } from './EnhancedFabricImageEditor';
import { getViewConfig, getTransformStyle, getShadowStyle } from '../lib/viewUtils';
import { OptimizedImageConfig } from '../lib/imageOptimization';
import { ErrorBoundary } from './ErrorBoundary';

interface DeviceRendererProps {
  device: DeviceSpecs;
  uploadedImage?: string;
  viewAngle: ViewAngle;
  perspective: PerspectiveView;
  onImageStateChange: (state: ImageState) => void;
  imageState?: ImageState;
  fitMode?: FitMode;
  optimizationConfig?: OptimizedImageConfig;
}

// Z-index constants for better maintainability
const Z_INDEX = {
  DEVICE_FRAME: 1,
  SCREEN_CONTENT: 2,
  DEVICE_ELEMENTS: 3,
  FILE_UPLOAD: 4,
} as const;

export const DeviceRenderer: React.FC<DeviceRendererProps> = React.memo(({
  device,
  uploadedImage,
  viewAngle,
  perspective,
  onImageStateChange,
  imageState,
  fitMode,
  optimizationConfig
}) => {
  // Get the current view configuration
  const viewConfig = getViewConfig(viewAngle, perspective);
  const transformStyle = getTransformStyle(viewConfig);
  const shadowStyle = getShadowStyle(viewConfig);

  // Calculate realistic device scaling (3x instead of 4.2x for better proportions)
  const DEVICE_SCALE = 3;
  const deviceWidth = device.dimensions.width * DEVICE_SCALE;
  const deviceHeight = device.dimensions.height * DEVICE_SCALE;
  const screenWidth = device.screen.width * DEVICE_SCALE;
  const screenHeight = device.screen.height * DEVICE_SCALE;

  // Calculate screen position within device frame
  const screenOffsetX = (deviceWidth - screenWidth) / 2;
  const screenOffsetY = (deviceHeight - screenHeight) / 2;
  
  // Calculate proper corner radius based on screen size (realistic iPhone proportions)
  const screenCornerRadius = Math.min(screenWidth, screenHeight) * 0.08; // 8% of smaller dimension
  const frameCornerRadius = screenCornerRadius + 8;

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

    // Get device frame image path
    const frameImagePath = device.layoutImage ? device.layoutImage('portrait') : null;

    switch (device.category) {
      case 'iphone':
        return (
          <div 
            {...commonProps}
            style={{
              ...commonProps.style,
              display: 'inline-block',
            }}
          >
            <div
              className="relative device-frame"
              style={{
                width: `${deviceWidth}px`,
                height: `${deviceHeight}px`,
                background: frameImagePath 
                  ? `url('${frameImagePath}') no-repeat center center`
                  : device.materials.frame === 'titanium' 
                    ? 'linear-gradient(135deg, #2c2c2e 0%, #1c1c1e 100%)'
                    : 'linear-gradient(135deg, #3a3a3c 0%, #2c2c2e 100%)',
                backgroundSize: frameImagePath ? 'contain' : 'auto',
                borderRadius: frameImagePath ? '0' : `${frameCornerRadius}px`,
                border: frameImagePath ? 'none' : '2px solid rgba(0,0,0,0.3)',
                boxShadow: frameImagePath ? 'none' : `
                  inset 0 1px 2px rgba(255,255,255,0.1),
                  inset 0 -1px 2px rgba(0,0,0,0.2),
                  0 0 0 1px rgba(0,0,0,0.1),
                  0 8px 32px rgba(0,0,0,0.4)
                `,
                transformStyle: 'preserve-3d',
                position: 'relative',
              }}
            >
              {/* Only show CSS elements if no device frame image */}
              {!frameImagePath && (
                <>
                  {/* Dynamic Island */}
                  {device.features.includes('dynamic-island') && (
                    <div
                      className="absolute bg-black rounded-full"
                      style={{
                        top: `${screenOffsetY - 15}px`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '120px',
                        height: '35px',
                        borderRadius: '17.5px',
                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6)',
                        zIndex: Z_INDEX.DEVICE_ELEMENTS
                      }}
                    />
                  )}
                  
                  {/* Home indicator (for devices without home button) */}
                  <div
                    className="absolute bg-white rounded-full opacity-60"
                    style={{
                      bottom: `${screenOffsetY - 8}px`,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '134px',
                      height: '5px',
                      borderRadius: '2.5px',
                      zIndex: Z_INDEX.DEVICE_ELEMENTS
                    }}
                  />
                </>
              )}
              
              {/* Screen area */}
              <div
                className="absolute overflow-hidden"
                style={{
                  top: `${screenOffsetY}px`,
                  left: `${screenOffsetX}px`,
                  width: `${screenWidth}px`,
                  height: `${screenHeight}px`,
                  borderRadius: `${screenCornerRadius}px`,
                  background: uploadedImage ? 'transparent' : '#000',
                  zIndex: Z_INDEX.SCREEN_CONTENT,
                }}
              >
                {uploadedImage ? (
                  <ErrorBoundary
                    fallback={
                      <div className="w-full h-full flex items-center justify-center text-red-500 bg-red-50">
                        <div className="text-center">
                          <div className="text-2xl mb-2">⚠️</div>
                          <p className="text-sm">Image editor error</p>
                          <p className="text-xs text-gray-500 mt-1">Please try uploading a different image</p>
                        </div>
                      </div>
                    }
                  >
                    <EnhancedFabricImageEditor
                      uploadedImage={uploadedImage}
                      deviceScreenWidth={screenWidth}
                      deviceScreenHeight={screenHeight}
                      device={device}
                      onImageStateChange={onImageStateChange}
                      externalImageState={imageState}
                      externalFitMode={fitMode}
                      autoOptimize={false}
                      externalOptimizationConfig={optimizationConfig}
                      screenCornerRadius={screenCornerRadius}
                    />
                  </ErrorBoundary>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-black relative overflow-hidden">
                    {/* Background gradient for realism */}
                    <div 
                      className="absolute inset-0 opacity-30"
                      style={{
                        background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.3) 70%)'
                      }}
                    />
                    
                    <div className="text-center relative z-10" style={{
                      padding: `${screenHeight * 0.08}px ${screenWidth * 0.06}px`,
                      maxWidth: '90%'
                    }}>
                      {/* Device-specific app icon placeholder */}
                      <div 
                        className="mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex items-center justify-center"
                        style={{
                          width: `${Math.min(screenWidth, screenHeight) * 0.25}px`,
                          height: `${Math.min(screenWidth, screenHeight) * 0.25}px`,
                          borderRadius: `${Math.min(screenWidth, screenHeight) * 0.055}px`,
                        }}
                      >
                        <div 
                          className="text-white grid grid-cols-3 gap-1"
                          style={{
                            fontSize: `${Math.min(screenWidth, screenHeight) * 0.02}px`,
                          }}
                        >
                          {/* App icon grid */}
                          {Array.from({ length: 9 }, (_, i) => (
                            <div
                              key={i}
                              className="w-2 h-2 bg-white rounded-sm opacity-90"
                              style={{
                                width: `${Math.min(screenWidth, screenHeight) * 0.015}px`,
                                height: `${Math.min(screenWidth, screenHeight) * 0.015}px`,
                                borderRadius: `${Math.min(screenWidth, screenHeight) * 0.002}px`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {/* Upload message */}
                      <div className="space-y-2">
                        <p 
                          className="text-gray-300 font-medium"
                          style={{
                            fontSize: `${Math.min(screenWidth, screenHeight) * 0.055}px`,
                            lineHeight: 1.3
                          }}
                        >
                          Upload an image
                        </p>
                        
                        {/* Device info */}
                        <div className="space-y-1">
                          <p 
                            className="text-gray-500 font-normal"
                            style={{
                              fontSize: `${Math.min(screenWidth, screenHeight) * 0.04}px`,
                              lineHeight: 1.2
                            }}
                          >
                            {device.screen.resolution.width} × {device.screen.resolution.height}
                          </p>
                          
                          <p 
                            className="text-gray-600 font-light"
                            style={{
                              fontSize: `${Math.min(screenWidth, screenHeight) * 0.035}px`,
                              lineHeight: 1.2
                            }}
                          >
                            {device.name}
                          </p>
                        </div>
                      </div>
                      
                      {/* Subtle hint */}
                      <div 
                        className="mt-6 pt-4 border-t border-gray-800"
                        style={{
                          marginTop: `${screenHeight * 0.08}px`,
                          paddingTop: `${screenHeight * 0.03}px`,
                        }}
                      >
                        <p 
                          className="text-gray-600 text-xs"
                          style={{
                            fontSize: `${Math.min(screenWidth, screenHeight) * 0.03}px`,
                            opacity: 0.8
                          }}
                        >
                          Drag & drop or click to upload
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center text-gray-500 p-8">
            <p>Device category "{device.category}" not yet supported</p>
            <p className="text-sm mt-2">Currently supporting iPhone devices</p>
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

DeviceRenderer.displayName = 'DeviceRenderer';