import React, { useState, useCallback } from 'react';
import { DeviceSelector } from './DeviceSelector';
import { EnhancedViewSettings } from './EnhancedViewSettings';
import { EnhancedProjectManager } from './EnhancedProjectManager';
import { FileUpload } from './FileUpload';
import { DownloadModal } from './DownloadModal';
import { ImageOptimizationPanel } from './ImageOptimizationPanel';
import { DeviceAuditPanel } from './DeviceAuditPanel';
import { ErrorBoundary } from './ErrorBoundary';
import { Action } from '../App';
import { ViewAngle, PerspectiveView } from '../types/DeviceTypes';
import { ImageState, FitMode } from './FabricImageEditor';
import { OptimizedImageConfig } from '../lib/imageOptimization';
import { DEVICE_SPECS } from '../data/DeviceSpecs';
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FolderOpen,
  Smartphone,
  Camera,
  Upload,
  Layers3,
  CheckCircle2,
  Shield,
  Zap
} from 'lucide-react';

interface EnhancedSidebarProps {
  dispatch: React.Dispatch<Action>;
  captureRef: React.RefObject<HTMLDivElement>;
  viewAngle: ViewAngle;
  perspective: PerspectiveView;
  currentState: {
    selectedDevice: string;
    uploadedImage?: string;
    viewAngle: string;
    perspective: string;
    orientation: string;
    imageState?: ImageState;
    fitMode: FitMode;
    optimizationConfig?: OptimizedImageConfig;
  };
}

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  dispatch,
  captureRef,
  viewAngle,
  perspective,
  currentState
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('device');
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const currentDevice = DEVICE_SPECS[currentState.selectedDevice];

  const handleDownloadClick = useCallback(() => {
    setShowDownloadModal(true);
  }, []);

  const handleAngleChange = (angle: ViewAngle) => {
    dispatch({ type: 'SET_VIEW_ANGLE', payload: angle });
  };

  const handlePerspectiveChange = (perspectiveView: PerspectiveView) => {
    dispatch({ type: 'SET_PERSPECTIVE', payload: perspectiveView });
  };

  const handleFitModeChange = (mode: FitMode) => {
    dispatch({ type: 'SET_FIT_MODE', payload: mode });
  };

  const handleImageStateChange = (state: ImageState) => {
    dispatch({ type: 'SET_IMAGE_STATE', payload: state });
  };

  const handleOptimizationApply = (config: OptimizedImageConfig) => {
    console.log('🎯 Optimization applied:', config);
    dispatch({ type: 'SET_OPTIMIZATION_CONFIG', payload: config });
  };

  const sidebarSections = [
    {
      id: 'device',
      icon: <Smartphone className="w-4 h-4" />,
      label: 'Device',
      description: 'Select device model',
      color: 'blue',
      hasContent: !!currentState.selectedDevice
    },
    {
      id: 'upload',
      icon: <Upload className="w-4 h-4" />,
      label: 'Upload',
      description: 'Add screenshot',
      color: 'green',
      hasContent: !!currentState.uploadedImage
    },
    {
      id: 'optimize',
      icon: <Zap className="w-4 h-4" />,
      label: 'Optimize',
      description: 'Image optimization',
      color: 'purple',
      hasContent: !!currentState.uploadedImage,
      badge: currentState.uploadedImage ? 'NEW' : undefined
    },
    {
      id: 'view',
      icon: <Layers3 className="w-4 h-4" />,
      label: 'View',
      description: 'Adjust perspective',
      color: 'indigo',
      hasContent: currentState.viewAngle !== 'front' || currentState.perspective !== 'flat'
    },
    {
      id: 'projects',
      icon: <FolderOpen className="w-4 h-4" />,
      label: 'Projects',
      description: 'Save & manage',
      color: 'orange',
      hasContent: false
    },
    {
      id: 'audit',
      icon: <Shield className="w-4 h-4" />,
      label: 'Audit',
      description: 'Device validation',
      color: 'red',
      hasContent: false,
      badge: 'BETA'
    }
  ];

  const getTabButtonClasses = (section: typeof sidebarSections[0]) => {
    const isActive = activeSection === section.id;
    
    const baseClasses = "group relative p-3 rounded-xl text-left transition-all duration-200";
    const colorClasses = {
      blue: isActive ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'hover:bg-blue-50/50',
      green: isActive ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm' : 'hover:bg-green-50/50',
      purple: isActive ? 'bg-purple-50 text-purple-700 border border-purple-200 shadow-sm' : 'hover:bg-purple-50/50',
      indigo: isActive ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm' : 'hover:bg-indigo-50/50',
      orange: isActive ? 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm' : 'hover:bg-orange-50/50',
      red: isActive ? 'bg-red-50 text-red-700 border border-red-200 shadow-sm' : 'hover:bg-red-50/50',
    };
    
    return `${baseClasses} ${colorClasses[section.color as keyof typeof colorClasses] || colorClasses.blue} ${
      !isActive ? 'hover:bg-gray-50/80 text-gray-700 hover:shadow-sm' : ''
    }`;
  };

  return (
    <div className={`bg-gradient-to-b from-white to-gray-50/50 shadow-xl border-r border-gray-200/60 transition-all duration-300 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-80'
    }`}>
      {/* Header */}
      <div className="p-5 border-b border-gray-200/60 flex items-center justify-between bg-white/80 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Mocupp</h1>
              <p className="text-xs text-gray-500">Enhanced Device Mockup Generator</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100/80 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation Tabs */}
      {!isCollapsed && (
        <div className="p-3 border-b border-gray-200/60 bg-white/60">
          <div className="grid grid-cols-2 gap-2">
            {sidebarSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={getTabButtonClasses(section)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {section.icon}
                    <span className="font-medium text-sm">{section.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {section.hasContent && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                    {section.badge && (
                      <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                        {section.badge}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors">
                  {section.description}
                </p>
                
                {/* Active indicator */}
                {activeSection === section.id && (
                  <div className="absolute inset-0 rounded-xl ring-2 ring-blue-200/50 pointer-events-none"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-white/40">
        {!isCollapsed && (
          <div className="p-5 space-y-6">
            {/* Device Selection */}
            {activeSection === 'device' && (
              <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Device Model</h3>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                    <DeviceSelector dispatch={dispatch} selectedDevice={currentState.selectedDevice} />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900">Current Device</h3>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">
                          {currentState.selectedDevice ? 
                            currentState.selectedDevice.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ') 
                            : 'No device selected'
                          }
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Orientation: <span className="font-medium">{currentState.orientation}</span>
                        </p>
                        {currentDevice && (
                          <p className="text-xs text-gray-600 mt-1">
                            Screen: {currentDevice.screen.width}×{currentDevice.screen.height}
                          </p>
                        )}
                      </div>
                      {currentState.selectedDevice && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Upload Section */}
            {activeSection === 'upload' && (
              <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Upload Screenshot</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Optimized for {currentDevice.name}
                    </span>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors rounded-xl p-6 bg-white">
                    <FileUpload dispatch={dispatch} device={currentDevice} />
                  </div>
                </div>
                
                {currentState.uploadedImage && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Current Image</h3>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Camera className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">Image uploaded successfully</p>
                          <p className="text-xs text-green-600 mt-1">Ready for device preview</p>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Image Optimization */}
            {activeSection === 'optimize' && (
              <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Image Optimization</h3>
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full font-medium">
                      NEW
                    </span>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <ErrorBoundary
                      fallback={
                        <div className="p-4 text-center text-red-500">
                          <div className="text-2xl mb-2">⚠️</div>
                          <p className="text-sm font-medium">Optimization Error</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Failed to load image optimization panel
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Try uploading a different image or refreshing the page
                          </p>
                        </div>
                      }
                    >
                      <ImageOptimizationPanel
                        uploadedImage={currentState.uploadedImage}
                        currentDevice={currentDevice}
                        imageState={currentState.imageState}
                        fitMode={currentState.fitMode}
                        onImageStateChange={handleImageStateChange}
                        onFitModeChange={handleFitModeChange}
                        onOptimizationApply={handleOptimizationApply}
                      />
                    </ErrorBoundary>
                  </div>
                </div>
              </div>
            )}

            {/* View Controls */}
            {activeSection === 'view' && (
              <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers3 className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-semibold text-gray-900">View Settings</h3>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <EnhancedViewSettings
                      currentAngle={viewAngle}
                      currentPerspective={perspective}
                      onAngleChange={handleAngleChange}
                      onPerspectiveChange={handlePerspectiveChange}
                      onReset={() => dispatch({ type: 'RESET_VIEW' })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Projects */}
            {activeSection === 'projects' && (
              <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-orange-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Project Management</h3>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <EnhancedProjectManager
                      dispatch={dispatch}
                      currentState={currentState}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Device Audit */}
            {activeSection === 'audit' && (
              <div className="space-y-5 animate-in slide-in-from-right-2 duration-300">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Device Audit</h3>
                    <span className="text-xs bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full font-medium">
                      BETA
                    </span>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                    <DeviceAuditPanel />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Collapsed state icons */}
        {isCollapsed && (
          <div className="p-3 space-y-3">
            {sidebarSections.map((section) => (
              <div key={section.id} className="relative">
                <button
                  onClick={() => {
                    setActiveSection(section.id);
                    setIsCollapsed(false);
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-200/50'
                      : 'hover:bg-gray-100 text-gray-600 hover:scale-105'
                  }`}
                  title={section.label}
                >
                  {section.icon}
                </button>
                {section.hasContent && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                )}
                {section.badge && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200/60 bg-white/80 backdrop-blur-sm">
        {!isCollapsed ? (
          <div className="space-y-3">
            <Button
              onClick={handleDownloadClick}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={!currentState.uploadedImage}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Mockup
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Enhanced with AI optimization • Multiple formats • High resolution
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <Button
              onClick={handleDownloadClick}
              size="sm"
              className="w-10 h-10 p-0 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              disabled={!currentState.uploadedImage}
              title="Download Mockup"
            >
              <Download className="w-4 h-4" />
            </Button>
            {currentState.uploadedImage && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </div>
        )}
      </div>
      
      {/* Enhanced Download Modal with View Selection */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        mockupRef={captureRef}
        currentAngle={viewAngle}
        currentPerspective={perspective}
        onAngleChange={handleAngleChange}
        onPerspectiveChange={handlePerspectiveChange}
      />
    </div>
  );
};