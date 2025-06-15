import React, { useState, useCallback } from 'react';
import { DeviceSelector } from './DeviceSelector';
import { EnhancedViewSettings } from './EnhancedViewSettings';
import { EnhancedProjectManager } from './EnhancedProjectManager';
import { FileUpload } from './FileUpload';
import { DownloadModal } from './DownloadModal';
import { Action } from '../App';
import { ViewAngle, PerspectiveView } from '../types/DeviceTypes';
import { ImageState, FitMode } from './EnhancedFabricImageEditor';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  FolderOpen,
  Smartphone,
  Camera,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Maximize2,
  Minimize2,
  Settings,
  Sparkles,
  Image as ImageIcon,
  Palette
} from 'lucide-react';

interface SidebarProps {
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
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  dispatch,
  captureRef,
  viewAngle,
  perspective,
  currentState
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('device');
  const [showDownloadModal, setShowDownloadModal] = useState(false);

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

  const handleScaleChange = (scale: number) => {
    if (currentState.imageState) {
      dispatch({ 
        type: 'SET_IMAGE_STATE', 
        payload: { ...currentState.imageState, scale } 
      });
    }
  };

  const handleRotate = () => {
    if (currentState.imageState) {
      const newRotation = (currentState.imageState.rotation + 90) % 360;
      dispatch({ 
        type: 'SET_IMAGE_STATE', 
        payload: { ...currentState.imageState, rotation: newRotation } 
      });
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_IMAGE_STATE' });
  };

  const sidebarSections = [
    {
      id: 'device',
      icon: <Smartphone className="w-5 h-5" />,
      label: 'Device',
      description: 'Select your device model',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      hasContent: !!currentState.selectedDevice
    },
    {
      id: 'upload',
      icon: <ImageIcon className="w-5 h-5" />,
      label: 'Media',
      description: 'Upload your screenshot',
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      hasContent: !!currentState.uploadedImage
    },
    {
      id: 'view',
      icon: <Palette className="w-5 h-5" />,
      label: 'Style',
      description: 'Customize perspective & view',
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      hasContent: currentState.viewAngle !== 'front' || currentState.perspective !== 'flat'
    },
    {
      id: 'projects',
      icon: <FolderOpen className="w-5 h-5" />,
      label: 'Projects',
      description: 'Save & manage projects',
      gradient: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200',
      hasContent: false
    }
  ];

  const getTabButtonClasses = (section: typeof sidebarSections[0]) => {
    const isActive = activeSection === section.id;
    
    if (isActive) {
      return `relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] ${section.bgColor} ${section.textColor} border ${section.borderColor} shadow-lg shadow-${section.textColor.split('-')[1]}-500/20`;
    }
    
    return "relative p-4 rounded-2xl text-gray-600 transition-all duration-300 hover:bg-gray-50 hover:text-gray-800 hover:shadow-md hover:scale-[1.02] border border-transparent";
  };

  return (
    <div className={`bg-gradient-to-br from-gray-50 via-white to-gray-50 shadow-2xl border-r border-gray-200/80 transition-all duration-500 flex flex-col backdrop-blur-sm ${
      isCollapsed ? 'w-20' : 'w-96'
    }`}>
      {/* Enhanced Header */}
      <div className="p-6 border-b border-gray-200/60 flex items-center justify-between bg-white/90 backdrop-blur-md">
        {!isCollapsed && (
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse shadow-sm"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Mocupp
              </h1>
              <p className="text-sm text-gray-500 font-medium">Device Mockup Studio</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-3 hover:bg-gray-100/80 rounded-xl transition-all duration-300 hover:scale-110"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Enhanced Navigation Tabs */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200/60 bg-gradient-to-r from-white/80 to-gray-50/80">
          <div className="grid grid-cols-2 gap-3">
            {sidebarSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={getTabButtonClasses(section)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${activeSection === section.id ? 'bg-white/70' : 'bg-gray-100/70'} transition-colors duration-300`}>
                      {section.icon}
                    </div>
                    <span className="font-semibold text-sm">{section.label}</span>
                  </div>
                  {section.hasContent && (
                    <div className="relative">
                      <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse shadow-sm"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed transition-colors duration-300">
                  {section.description}
                </p>
                
                {/* Enhanced Active indicator */}
                {activeSection === section.id && (
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-offset-2 ring-offset-white ring-opacity-60 ring-current pointer-events-none"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Content Area */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white/60 to-gray-50/60">
        {!isCollapsed && (
          <div className="p-6 space-y-8">
            {/* Device Selection */}
            {activeSection === 'device' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Device Selection</h3>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-gray-200/60">
                    <DeviceSelector dispatch={dispatch} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-800">Current Device</h3>
                  <div className="p-5 bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-2xl border border-blue-200/60 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-md">
                          {currentState.selectedDevice ? 
                            currentState.selectedDevice.split('-').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ') 
                            : 'No device selected'
                          }
                        </p>
                        <p className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                          Orientation: <span className="font-semibold">{currentState.orientation}</span>
                        </p>
                      </div>
                      {currentState.selectedDevice && (
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Upload Section */}
            {activeSection === 'upload' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Media Upload</h3>
                  </div>
                  <div className="border-2 border-dashed border-emerald-300 hover:border-emerald-400 transition-all duration-300 rounded-2xl p-8 bg-gradient-to-br from-white to-emerald-50/30">
                    <FileUpload dispatch={dispatch} />
                  </div>
                </div>
                
                {currentState.uploadedImage && (
                  <div className="space-y-4">
                    <h3 className="text-md font-semibold text-gray-800">Current Image</h3>
                    <div className="p-5 bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200/60 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-100 rounded-xl">
                          <Camera className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-md font-bold text-emerald-800">Image uploaded successfully</p>
                          <p className="text-sm text-emerald-600 mt-1">Ready for device preview</p>
                        </div>
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Image Editing Controls */}
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                          <Settings className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-md font-bold text-gray-900">Image Controls</h4>
                      </div>
                      
                      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/60 shadow-lg">
                        {/* Enhanced Fit Mode Controls */}
                        <div className="space-y-5">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700">Fit Mode</span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={currentState.fitMode === 'cover' ? 'default' : 'outline'}
                                className="h-10 w-10 p-0 rounded-xl transition-all duration-300"
                                title="Fill Screen"
                                onClick={() => handleFitModeChange('cover')}
                              >
                                <Maximize2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={currentState.fitMode === 'contain' ? 'default' : 'outline'}
                                className="h-10 w-10 p-0 rounded-xl transition-all duration-300"
                                title="Fit Image"
                                onClick={() => handleFitModeChange('contain')}
                              >
                                <Minimize2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={currentState.fitMode === 'smart' ? 'default' : 'outline'}
                                className="h-10 w-10 p-0 rounded-xl transition-all duration-300"
                                title="Smart Fit"
                                onClick={() => handleFitModeChange('smart')}
                              >
                                <Sparkles className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Enhanced Scale Control */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-gray-700">Scale</span>
                              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg font-mono">
                                {Math.round((currentState.imageState?.scale || 1) * 100)}%
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <ZoomOut className="h-4 w-4 text-gray-400" />
                              <Slider
                                value={[currentState.imageState?.scale || 1]}
                                min={0.5}
                                max={2}
                                step={0.01}
                                className="flex-1"
                                onValueChange={(value) => handleScaleChange(value[0])}
                              />
                              <ZoomIn className="h-4 w-4 text-gray-400" />
                            </div>
                          </div>
                          
                          {/* Enhanced Action Buttons */}
                          <div className="flex gap-3 pt-4 border-t border-gray-200">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-10 text-sm font-medium rounded-xl hover:shadow-md transition-all duration-300"
                              onClick={handleRotate}
                            >
                              <RotateCw className="h-4 w-4 mr-2" />
                              Rotate
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 h-10 text-sm font-medium rounded-xl hover:shadow-md transition-all duration-300"
                              onClick={handleReset}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reset
                            </Button>
                          </div>
                          
                          {/* Enhanced Drag Hint */}
                          <div className="flex items-center gap-3 text-sm text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                            <Move className="h-4 w-4 text-gray-500" />
                            <span>Drag the image in the preview to reposition</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced View Controls */}
            {activeSection === 'view' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Style & View</h3>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/60">
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

            {/* Enhanced Projects */}
            {activeSection === 'projects' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
                      <FolderOpen className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Project Management</h3>
                  </div>
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60">
                    <EnhancedProjectManager
                      dispatch={dispatch}
                      currentState={currentState}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Collapsed state icons */}
        {isCollapsed && (
          <div className="p-4 space-y-4">
            {sidebarSections.map((section) => (
              <div key={section.id} className="relative">
                <button
                  onClick={() => {
                    setActiveSection(section.id);
                    setIsCollapsed(false);
                  }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                    activeSection === section.id
                      ? `${section.bgColor} ${section.textColor} shadow-lg shadow-${section.textColor.split('-')[1]}-500/20`
                      : 'hover:bg-gray-100 text-gray-600 hover:shadow-md'
                  }`}
                  title={section.label}
                >
                  {section.icon}
                </button>
                {section.hasContent && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white shadow-sm">
                    <div className="w-full h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-ping opacity-75"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Footer Actions */}
      <div className="p-6 border-t border-gray-200/60 bg-gradient-to-r from-white/90 to-gray-50/90 backdrop-blur-md">
        {!isCollapsed ? (
          <div className="space-y-4">
            <Button
              onClick={handleDownloadClick}
              className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] rounded-2xl font-semibold text-white"
              disabled={!currentState.uploadedImage}
            >
              <Download className="w-5 h-5 mr-3" />
              Download Mockup
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="font-semibold">Multiple formats</span> • <span className="font-semibold">Custom quality</span> • <span className="font-semibold">High resolution</span> • <span className="font-semibold">Any angle</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <Button
              onClick={handleDownloadClick}
              size="sm"
              className="w-12 h-12 p-0 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-110 shadow-lg"
              disabled={!currentState.uploadedImage}
              title="Download Mockup"
            >
              <Download className="w-5 h-5" />
            </Button>
            {currentState.uploadedImage && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white animate-pulse shadow-sm"></div>
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