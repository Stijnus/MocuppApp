import React, { useRef } from 'react';
import { EnhancedSidebar } from '../EnhancedSidebar';
import { TopNavbar } from '../TopNavbar';
import { DeviceRenderer } from '../DeviceRenderer';
import { useAppContext } from '../../contexts/AppContext';

export function MainLayout() {
  const mockupRef = useRef<HTMLDivElement>(null);
  const { deviceState, deviceActions, currentDevice, imageOptimization } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Enhanced Sidebar */}
      <EnhancedSidebar 
        captureRef={mockupRef}
        viewAngle={deviceState.viewAngle}
        perspective={deviceState.perspective}
        currentState={{
          selectedDevice: deviceState.selectedDevice,
          uploadedImage: deviceState.uploadedImage,
          viewAngle: deviceState.viewAngle,
          perspective: deviceState.perspective,
          orientation: deviceState.orientation,
          imageState: deviceState.imageState,
          fitMode: deviceState.fitMode,
          optimizationConfig: deviceState.optimizationConfig,
        }}
        onDeviceChange={deviceActions.setDevice}
        onImageUpload={deviceActions.setUploadedImage}
        onViewAngleChange={deviceActions.setViewAngle}
        onPerspectiveChange={deviceActions.setPerspective}
        onImageStateChange={deviceActions.setImageState}
        onFitModeChange={deviceActions.setFitMode}
        onOptimizationApply={deviceActions.setOptimizationConfig}
        onResetView={deviceActions.resetView}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <TopNavbar 
          currentState={{
            selectedDevice: deviceState.selectedDevice,
            uploadedImage: deviceState.uploadedImage,
            viewAngle: deviceState.viewAngle,
            perspective: deviceState.perspective,
            orientation: deviceState.orientation,
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
                key={`${deviceState.selectedDevice}-${deviceState.viewAngle}-${deviceState.perspective}`}
                device={currentDevice}
                uploadedImage={deviceState.uploadedImage}
                viewAngle={deviceState.viewAngle}
                perspective={deviceState.perspective}
                onImageStateChange={deviceActions.setImageState}
                imageState={deviceState.imageState}
                fitMode={deviceState.fitMode}
                optimizationConfig={imageOptimization.optimizedConfig || undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}