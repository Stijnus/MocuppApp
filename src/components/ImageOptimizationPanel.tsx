import React, { useState, useEffect } from 'react';
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
  RotateCw,
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
import { ImageState, FitMode } from './FabricImageEditor';

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
  fitMode,
  onImageStateChange,
  onFitModeChange,
  onOptimizationApply
}) => {
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrameSpecs | null>(null);
  const [optimizedConfig, setOptimizedConfig] = useState<OptimizedImageConfig | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customStrategy, setCustomStrategy] = useState<'contain' | 'cover' | 'fill' | 'smart'>('smart');

  // Analyze image when it changes
  useEffect(() => {
    if (uploadedImage) {
      analyzeImageAsync();
    } else {
      setAnalysis(null);
      setOptimizedConfig(null);
    }
  }, [uploadedImage]);

  // Update device frame when device changes
  useEffect(() => {
    const frame = generateDeviceFrameSpecs(currentDevice);
    setDeviceFrame(frame);
  }, [currentDevice]);

  // Recalculate optimization when analysis or device changes
  useEffect(() => {
    if (analysis && deviceFrame) {
      const config = calculateOptimalImageConfig(analysis, deviceFrame, customStrategy);
      setOptimizedConfig(config);
    }
  }, [analysis, deviceFrame, customStrategy]);

  const analyzeImageAsync = async () => {
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
  };

  const applyOptimization = () => {
    if (optimizedConfig && analysis) {
      // Convert optimization config to ImageState
      const newImageState: ImageState = {
        x: optimizedConfig.position.x,
        y: optimizedConfig.position.y,
        scale: optimizedConfig.scale,
        rotation: optimizedConfig.transform.rotation,
        baseScale: imageState?.baseScale || 1,
      };
      
      onImageStateChange(newImageState);
      onOptimizationApply(optimizedConfig);
      
      // Update fit mode based on strategy
      const strategyToFitMode: Record<string, FitMode> = {
        'contain': 'contain',
        'cover': 'cover',
        'smart': 'smart',
        'fill': 'cover',
      };
      
      const newFitMode = strategyToFitMode[optimizedConfig.strategy] || 'smart';
      onFitModeChange(newFitMode);
    }
  };

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
            </h4>
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

          <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-3">
            {/* Strategy Selection */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-700">Fit Strategy</span>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant={customStrategy === 'smart' ? 'default' : 'outline'}
                  className="h-8 text-xs"
                  onClick={() => setCustomStrategy('smart')}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Smart
                </Button>
                <Button
                  size="sm"
                  variant={customStrategy === 'contain' ? 'default' : 'outline'}
                  className="h-8 text-xs"
                  onClick={() => setCustomStrategy('contain')}
                >
                  <Minimize2 className="w-3 h-3 mr-1" />
                  Contain
                </Button>
                <Button
                  size="sm"
                  variant={customStrategy === 'cover' ? 'default' : 'outline'}
                  className="h-8 text-xs"
                  onClick={() => setCustomStrategy('cover')}
                >
                  <Maximize2 className="w-3 h-3 mr-1" />
                  Cover
                </Button>
                <Button
                  size="sm"
                  variant={customStrategy === 'fill' ? 'default' : 'outline'}
                  className="h-8 text-xs"
                  onClick={() => setCustomStrategy('fill')}
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
                        setOptimizedConfig({
                          ...optimizedConfig,
                          scale: value[0]
                        });
                      }
                    }}
                  />
                </div>

                {/* Quality Controls */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-gray-700">Quality Adjustments</span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <span className="text-gray-500">Compression</span>
                      <p className="font-medium">{Math.round(optimizedConfig.quality.compression * 100)}%</p>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-500">Sharpening</span>
                      <p className="font-medium">{Math.round(optimizedConfig.quality.sharpening * 100)}%</p>
                    </div>
                    <div className="text-center">
                      <span className="text-gray-500">Saturation</span>
                      <p className="font-medium">{Math.round(optimizedConfig.quality.saturation * 100)}%</p>
                    </div>
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

            {/* Apply Button */}
            <Button
              onClick={applyOptimization}
              className="w-full bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Apply Optimization
            </Button>
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
          
          <div className="bg-white rounded-lg border border-gray-200 p-3 space-y-2">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Device:</span>
                <p className="font-medium">{deviceFrame.name}</p>
              </div>
              <div>
                <span className="text-gray-500">Viewport:</span>
                <p className="font-medium">{deviceFrame.viewport.width}×{deviceFrame.viewport.height}</p>
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

            <div className="pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">Recommended Resolution:</span>
              <p className="text-xs font-medium">
                {deviceFrame.optimalResolutions.recommended.width}×{deviceFrame.optimalResolutions.recommended.height}
              </p>
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