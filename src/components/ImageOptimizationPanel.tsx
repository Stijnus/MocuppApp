import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Settings,
  Image as ImageIcon,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Info,
  Maximize2,
  Minimize2,
  Square,
  Crop,
  Sliders,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { 
  analyzeImage, 
  calculateOptimalImageConfig, 
  generateDeviceFrameSpecs,
  validateImageCompatibility,
  generateOptimizationReport,
  ImageAnalysis,
  OptimizedImageConfig,
  DeviceFrameSpecs
} from '../lib/imageOptimization';
import { DeviceSpecs } from '../types/DeviceTypes';
import { ImageState, FitMode } from './EnhancedFabricImageEditor';

// Move strategy mapping outside component to prevent recreation
const STRATEGY_TO_FIT_MODE: Record<string, FitMode> = {
  'contain': 'contain',
  'cover': 'cover',
  'smart': 'smart',
  'fill': 'cover', // Fill maps to cover for proper rendering
  'custom': 'smart',
};

interface ImageOptimizationPanelProps {
  uploadedImage?: string;
  currentDevice: DeviceSpecs;
  imageState?: ImageState;
  fitMode: FitMode;
  onImageStateChange: (state: ImageState) => void;
  onFitModeChange: (mode: FitMode) => void;
  onOptimizationApply: (config: OptimizedImageConfig) => void;
}

export const ImageOptimizationPanel: React.FC<ImageOptimizationPanelProps> = ({
  uploadedImage,
  currentDevice,
  imageState,
  onImageStateChange,
  onFitModeChange,
  onOptimizationApply
}) => {
  // All hooks must be declared before any conditional logic
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrameSpecs | null>(null);
  const [optimizedConfig, setOptimizedConfig] = useState<OptimizedImageConfig | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customStrategy, setCustomStrategy] = useState<'contain' | 'cover' | 'fill' | 'smart'>('smart');
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualConfig, setManualConfig] = useState<OptimizedImageConfig | null>(null);

  // Define analyzeImageAsync before any effects that use it
  const analyzeImageAsync = useCallback(async () => {
    if (!uploadedImage) return;
    
    setIsAnalyzing(true);
    try {
      const imageAnalysis = await analyzeImage(uploadedImage);
      setAnalysis(imageAnalysis);
    } catch (error) {
      console.error('Failed to analyze image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [uploadedImage]);

  // Analyze image when it changes
  useEffect(() => {
    if (uploadedImage) {
      analyzeImageAsync();
    } else {
      setAnalysis(null);
      setOptimizedConfig(null);
    }
  }, [uploadedImage, analyzeImageAsync]);

  // Update device frame when device changes
  useEffect(() => {
    if (!currentDevice) return;
    
    try {
      const frame = generateDeviceFrameSpecs(currentDevice);
      setDeviceFrame(frame);
    } catch (error) {
      console.error('Failed to generate device frame specs:', error);
      setDeviceFrame(null);
    }
  }, [currentDevice]);

  // Recalculate optimization when analysis, device, or strategy changes (only in auto mode)
  useEffect(() => {
    if (analysis && deviceFrame && !isManualMode) {
      try {
        const config = calculateOptimalImageConfig(analysis, deviceFrame, customStrategy);
        setOptimizedConfig(config);
        setManualConfig(null); // Clear manual config when auto-calculating
        console.log('🎯 Auto-calculated optimization config:', {
          strategy: config.strategy,
          scale: config.scale,
          position: config.position,
          reasoning: config.reasoning
        });
      } catch (error) {
        console.error('Failed to calculate optimization config:', error);
        setOptimizedConfig(null);
      }
    }
  }, [analysis, deviceFrame, customStrategy, isManualMode]);

  // Apply optimization when config is available (only in auto mode or when manually requested)
  const applyConfigToState = useCallback((config: OptimizedImageConfig) => {
    if (config && onImageStateChange && onFitModeChange && onOptimizationApply) {
      const newImageState: ImageState = {
        x: config.position.x,
        y: config.position.y,
        scale: config.scale,
        rotation: config.transform.rotation,
        baseScale: imageState?.baseScale || 1,
      };
      
      onImageStateChange(newImageState);
      onOptimizationApply(config);
      
      // Update fit mode based on strategy
      const newFitMode = STRATEGY_TO_FIT_MODE[config.strategy] || 'smart';
      onFitModeChange(newFitMode);
      
      console.log('🚀 Applied optimization:', {
        imageState: newImageState,
        fitMode: newFitMode,
        strategy: config.strategy,
        mode: isManualMode ? 'manual' : 'auto'
      });
    }
  }, [onImageStateChange, onFitModeChange, onOptimizationApply, imageState?.baseScale, isManualMode]);

  // Manual apply optimization function (must be declared before early returns)
  const applyOptimization = useCallback(() => {
    if (isManualMode && manualConfig) {
      // Apply manual config
      applyConfigToState(manualConfig);
    } else if (optimizedConfig) {
      // Re-calculate and apply auto config
      applyConfigToState(optimizedConfig);
    } else if (analysis && deviceFrame) {
      // Force recalculation
      try {
        const config = calculateOptimalImageConfig(analysis, deviceFrame, customStrategy);
        setOptimizedConfig(config);
        applyConfigToState(config);
      } catch (error) {
        console.error('Failed to recalculate optimization:', error);
      }
    }
  }, [isManualMode, manualConfig, optimizedConfig, analysis, deviceFrame, customStrategy, applyConfigToState]);

  // Auto-apply optimization only when not in manual mode
  useEffect(() => {
    if (optimizedConfig && !isManualMode) {
      applyConfigToState(optimizedConfig);
    }
  }, [optimizedConfig, isManualMode, applyConfigToState]);

  // Validation checks after all hooks are declared
  if (!currentDevice) {
    console.error('ImageOptimizationPanel: Missing currentDevice prop');
    return (
      <div className="p-4 text-center text-red-500">
        <div className="text-2xl mb-2">⚠️</div>
        <p className="text-sm">Device information not available</p>
        <p className="text-xs text-gray-500 mt-1">Please select a device first</p>
      </div>
    );
  }

  // Safety checks for callback functions
  if (!onImageStateChange || !onFitModeChange || !onOptimizationApply) {
    console.error('ImageOptimizationPanel: Missing required callback functions');
    return (
      <div className="p-4 text-center text-red-500">
        <div className="text-2xl mb-2">⚠️</div>
        <p className="text-sm">Component initialization error</p>
        <p className="text-xs text-gray-500 mt-1">Missing required handlers</p>
      </div>
    );
  }

  const getStatusIcon = (status: 'valid' | 'warning' | 'error') => {
    switch (status) {
      case 'valid':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  const getCompatibilityStatus = () => {
    if (!analysis || !deviceFrame) return null;
    
    const compatibility = validateImageCompatibility(analysis, deviceFrame);
    let status: 'valid' | 'warning' | 'error' = 'valid';
    
    if (compatibility.score < 50) status = 'error';
    else if (compatibility.score < 80) status = 'warning';
    
    return { ...compatibility, status };
  };

  const compatibility = getCompatibilityStatus();

  if (!uploadedImage) {
    return (
      <div className="p-4 text-center text-gray-500">
        <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">Upload an image to see optimization options</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Analysis Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            Image Analysis
          </h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={analyzeImageAsync}
            disabled={isAnalyzing}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Refresh'}
          </Button>
        </div>

        {isAnalyzing && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
              <span className="text-sm text-blue-700">Analyzing image properties...</span>
            </div>
          </div>
        )}

        {analysis && (
          <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
            {/* Image Properties */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Dimensions:</span>
                <p className="font-medium">{analysis.dimensions.width}×{analysis.dimensions.height}</p>
              </div>
              <div>
                <span className="text-gray-500">Aspect Ratio:</span>
                <p className="font-medium">{analysis.dimensions.aspectRatio.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-500">Resolution:</span>
                <p className="font-medium capitalize">{analysis.quality.resolution}</p>
              </div>
              <div>
                <span className="text-gray-500">File Size:</span>
                <p className="font-medium">{(analysis.quality.fileSize / 1024 / 1024).toFixed(1)}MB</p>
              </div>
              <div>
                <span className="text-gray-500">Sharpness:</span>
                <p className="font-medium">{Math.round(analysis.quality.sharpness * 100)}%</p>
              </div>
              <div>
                <span className="text-gray-500">Noise Level:</span>
                <p className="font-medium">{Math.round(analysis.quality.noise * 100)}%</p>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="pt-2 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="text-center">
                  <span className="text-gray-500">Complexity</span>
                  <p className="font-medium">{Math.round(analysis.performance.renderComplexity * 100)}%</p>
                </div>
                <div className="text-center">
                  <span className="text-gray-500">Memory</span>
                  <p className="font-medium">{analysis.performance.memoryUsage.toFixed(1)}MB</p>
                </div>
                <div className="text-center">
                  <span className="text-gray-500">Analysis</span>
                  <p className="font-medium">{analysis.performance.processingTime.toFixed(0)}ms</p>
                </div>
              </div>
            </div>

            {/* Compatibility Status */}
            {compatibility && (
              <div className={`p-2 rounded-lg border ${
                compatibility.status === 'valid' ? 'bg-green-50 border-green-200' :
                compatibility.status === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(compatibility.status)}
                  <span className="text-sm font-medium">
                    Compatibility Score: {compatibility.score}/100
                  </span>
                </div>
                
                {compatibility.issues.length > 0 && (
                  <div className="space-y-1">
                    {compatibility.issues.slice(0, 2).map((issue, index) => (
                      <p key={index} className="text-xs text-gray-600">• {issue}</p>
                    ))}
                    {compatibility.issues.length > 2 && (
                      <p className="text-xs text-gray-500">+{compatibility.issues.length - 2} more issues</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optimization Controls */}
      {optimizedConfig && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-600" />
              Optimization
              {isManualMode && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Manual
                </span>
              )}
            </h4>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsManualMode(!isManualMode);
                  if (!isManualMode) {
                    // Entering manual mode - save current config
                    setManualConfig(optimizedConfig);
                  } else {
                    // Exiting manual mode - clear manual config and trigger recalculation
                    setManualConfig(null);
                  }
                }}
                className={`h-7 px-2 text-xs ${
                  isManualMode ? 'bg-blue-100 text-blue-700' : ''
                }`}
              >
                <Settings className="w-3 h-3 mr-1" />
                {isManualMode ? 'Auto' : 'Manual'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="h-7 px-2 text-xs"
              >
                <Sliders className="w-3 h-3 mr-1" />
                {showAdvanced ? 'Simple' : 'Advanced'}
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
            {/* Strategy Selection */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-700">Fit Strategy</span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant={customStrategy === 'smart' ? 'default' : 'outline'}
                  className="h-8 text-xs"
                  onClick={() => {
                    setCustomStrategy('smart');
                    if (isManualMode) {
                      setIsManualMode(false);
                      setManualConfig(null);
                    }
                  }}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Smart
                </Button>
                <Button
                  size="sm"
                  variant={customStrategy === 'contain' ? 'default' : 'outline'}
                  className="h-8 text-xs"
                  onClick={() => {
                    setCustomStrategy('contain');
                    if (isManualMode) {
                      setIsManualMode(false);
                      setManualConfig(null);
                    }
                  }}
                >
                  <Minimize2 className="w-3 h-3 mr-1" />
                  Contain
                </Button>
                <Button
                  size="sm"
                  variant={customStrategy === 'cover' ? 'default' : 'outline'}
                  className="h-8 text-xs"
                  onClick={() => {
                    setCustomStrategy('cover');
                    if (isManualMode) {
                      setIsManualMode(false);
                      setManualConfig(null);
                    }
                  }}
                >
                  <Maximize2 className="w-3 h-3 mr-1" />
                  Cover
                </Button>
                <Button
                  size="sm"
                  variant={customStrategy === 'fill' ? 'default' : 'outline'}
                  className="h-8 text-xs"
                  onClick={() => {
                    setCustomStrategy('fill');
                    if (isManualMode) {
                      setIsManualMode(false);
                      setManualConfig(null);
                    }
                  }}
                >
                  <Square className="w-3 h-3 mr-1" />
                  Fill
                </Button>
              </div>
            </div>

            {/* Current Strategy Info */}
            <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-purple-800">
                    {optimizedConfig.strategy.charAt(0).toUpperCase() + optimizedConfig.strategy.slice(1)} Strategy
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {optimizedConfig.reasoning}
                  </p>
                </div>
              </div>
            </div>

            {/* Advanced Controls */}
            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t border-gray-100">
                {/* Scale Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">Scale</span>
                    <span className="text-xs text-gray-500">
                      {Math.round(optimizedConfig.scale * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[optimizedConfig.scale]}
                    min={0.1}
                    max={3}
                    step={0.01}
                    className="w-full"
                    onValueChange={(value) => {
                      if (optimizedConfig) {
                        setIsManualMode(true);
                        const updatedConfig = {
                          ...optimizedConfig,
                          scale: value[0]
                        };
                        setOptimizedConfig(updatedConfig);
                        setManualConfig(updatedConfig);
                        
                        // Apply the change immediately
                        const newImageState: ImageState = {
                          x: updatedConfig.position.x,
                          y: updatedConfig.position.y,
                          scale: value[0],
                          rotation: updatedConfig.transform.rotation,
                          baseScale: imageState?.baseScale || 1,
                        };
                        onImageStateChange(newImageState);
                        onOptimizationApply(updatedConfig);
                      }
                    }}
                  />
                </div>

                {/* Quality Controls */}
                <div className="space-y-3">
                  <span className="text-xs font-medium text-gray-700">Quality Adjustments</span>
                  
                  {/* Sharpening Control */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Sharpening</span>
                      <span className="text-xs text-gray-500">
                        {Math.round(optimizedConfig.quality.sharpening * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[optimizedConfig.quality.sharpening]}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                      onValueChange={(value) => {
                        if (optimizedConfig) {
                          setIsManualMode(true);
                          const updatedConfig = {
                            ...optimizedConfig,
                            quality: {
                              ...optimizedConfig.quality,
                              sharpening: value[0]
                            }
                          };
                          setOptimizedConfig(updatedConfig);
                          setManualConfig(updatedConfig);
                          onOptimizationApply(updatedConfig);
                        }
                      }}
                    />
                  </div>
                  
                  {/* Saturation Control */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Saturation</span>
                      <span className="text-xs text-gray-500">
                        {Math.round(optimizedConfig.quality.saturation * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[optimizedConfig.quality.saturation]}
                      min={0.5}
                      max={1.5}
                      step={0.01}
                      className="w-full"
                      onValueChange={(value) => {
                        if (optimizedConfig) {
                          setIsManualMode(true);
                          const updatedConfig = {
                            ...optimizedConfig,
                            quality: {
                              ...optimizedConfig.quality,
                              saturation: value[0]
                            }
                          };
                          setOptimizedConfig(updatedConfig);
                          setManualConfig(updatedConfig);
                          onOptimizationApply(updatedConfig);
                        }
                      }}
                    />
                  </div>
                  
                  {/* Brightness Control */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Brightness</span>
                      <span className="text-xs text-gray-500">
                        {Math.round(optimizedConfig.quality.brightness * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[optimizedConfig.quality.brightness]}
                      min={0.5}
                      max={1.5}
                      step={0.01}
                      className="w-full"
                      onValueChange={(value) => {
                        if (optimizedConfig) {
                          setIsManualMode(true);
                          const updatedConfig = {
                            ...optimizedConfig,
                            quality: {
                              ...optimizedConfig.quality,
                              brightness: value[0]
                            }
                          };
                          setOptimizedConfig(updatedConfig);
                          setManualConfig(updatedConfig);
                          onOptimizationApply(updatedConfig);
                        }
                      }}
                    />
                  </div>
                  
                  {/* Contrast Control */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Contrast</span>
                      <span className="text-xs text-gray-500">
                        {Math.round(optimizedConfig.quality.contrast * 100)}%
                      </span>
                    </div>
                    <Slider
                      value={[optimizedConfig.quality.contrast]}
                      min={0.5}
                      max={1.5}
                      step={0.01}
                      className="w-full"
                      onValueChange={(value) => {
                        if (optimizedConfig) {
                          setIsManualMode(true);
                          const updatedConfig = {
                            ...optimizedConfig,
                            quality: {
                              ...optimizedConfig.quality,
                              contrast: value[0]
                            }
                          };
                          setOptimizedConfig(updatedConfig);
                          setManualConfig(updatedConfig);
                          onOptimizationApply(updatedConfig);
                        }
                      }}
                    />
                  </div>
                  
                  {/* Compression Display */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-600">Compression</span>
                    <span className="text-xs font-medium">
                      {Math.round(optimizedConfig.quality.compression * 100)}%
                    </span>
                  </div>
                </div>

                {/* Performance Information */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-700">Performance</span>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-blue-700">Optimization Level</span>
                      <span className="text-xs font-medium text-blue-800 capitalize">
                        {optimizedConfig.performance.optimizationLevel}
                      </span>
                    </div>
                    {optimizedConfig.performance.renderingHints.length > 0 && (
                      <div className="text-xs text-blue-600">
                        Hints: {optimizedConfig.performance.renderingHints.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Crop Information */}
                {optimizedConfig.crop && (
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Crop className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Cropping Applied</span>
                    </div>
                    <p className="text-xs text-orange-600 mt-1">
                      Crop area: {Math.round(optimizedConfig.crop.width)}×{Math.round(optimizedConfig.crop.height)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Mode Status */}
            {isManualMode ? (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Manual Mode</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Adjustments are applied immediately. Use strategy buttons to return to auto mode.
                </p>
              </div>
            ) : (
              <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800">Auto Mode</span>
                  <Zap className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Optimization is automatically calculated and applied based on strategy
                </p>
              </div>
            )}
            
            {/* Manual Controls */}
            {showAdvanced && (
              <div className="space-y-2">
                {isManualMode && (
                  <Button
                    onClick={() => {
                      setIsManualMode(false);
                      setManualConfig(null);
                    }}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Return to Auto Mode
                  </Button>
                )}
                <Button
                  onClick={applyOptimization}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isManualMode ? 'Apply Current Settings' : 'Re-calculate & Apply'}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Device Compatibility */}
      {deviceFrame && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-600" />
            Device Compatibility
          </h4>
          
          <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Device:</span>
                <p className="font-medium">{deviceFrame.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Native Resolution:</span>
                <p className="font-medium text-green-700">{deviceFrame.optimalResolutions.recommended.width}×{deviceFrame.optimalResolutions.recommended.height}</p>
              </div>
              <div>
                <span className="text-gray-500">Aspect Ratio:</span>
                <p className="font-medium">{deviceFrame.viewport.aspectRatio.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-500">Display Scale:</span>
                <p className="font-medium">{deviceFrame.displayScale}x</p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div>
                <span className="text-xs text-gray-500">Physical Screen:</span>
                <p className="text-xs font-medium">
                  {deviceFrame.viewport.width.toFixed(1)}×{deviceFrame.viewport.height.toFixed(1)} mm
                </p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <span className="text-gray-500">Min</span>
                  <p className="font-medium">{deviceFrame.optimalResolutions.min.width}×{deviceFrame.optimalResolutions.min.height}</p>
                </div>
                <div className="text-center">
                  <span className="text-green-600">Recommended</span>
                  <p className="font-medium text-green-700">{deviceFrame.optimalResolutions.recommended.width}×{deviceFrame.optimalResolutions.recommended.height}</p>
                </div>
                <div className="text-center">
                  <span className="text-gray-500">Max</span>
                  <p className="font-medium">{deviceFrame.optimalResolutions.max.width}×{deviceFrame.optimalResolutions.max.height}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Information */}
      {showAdvanced && analysis && deviceFrame && optimizedConfig && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Download className="w-4 h-4 text-gray-600" />
            Debug Report
          </h4>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                const report = generateOptimizationReport(analysis, deviceFrame, optimizedConfig);
                const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `optimization-report-${Date.now()}.json`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="w-3 h-3 mr-1" />
              Download Debug Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};