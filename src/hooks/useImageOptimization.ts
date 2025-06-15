import { useState, useEffect, useCallback } from 'react';
import { 
  analyzeImage, 
  calculateOptimalImageConfig, 
  generateDeviceFrameSpecs,
  ImageAnalysis,
  OptimizedImageConfig 
} from '../lib/imageOptimization';
import { DeviceSpecs } from '../types/DeviceTypes';
import { FitMode } from '../components/FabricImageEditor';

export function useImageOptimization(
  uploadedImage?: string,
  device?: DeviceSpecs,
  fitMode: FitMode = 'smart'
) {
  const [analysis, setAnalysis] = useState<ImageAnalysis | null>(null);
  const [optimizedConfig, setOptimizedConfig] = useState<OptimizedImageConfig | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Analyze image when it changes
  const analyzeImageAsync = useCallback(async (imageDataUrl: string) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const imageAnalysis = await analyzeImage(imageDataUrl);
      setAnalysis(imageAnalysis);
      return imageAnalysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze image';
      setError(errorMessage);
      console.error('Image analysis failed:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Calculate optimization when analysis or device changes
  const calculateOptimization = useCallback((
    imageAnalysis: ImageAnalysis,
    targetDevice: DeviceSpecs,
    strategy: FitMode = 'smart'
  ) => {
    try {
      const deviceFrame = generateDeviceFrameSpecs(targetDevice);
      const config = calculateOptimalImageConfig(imageAnalysis, deviceFrame, strategy);
      setOptimizedConfig(config);
      return config;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate optimization';
      setError(errorMessage);
      console.error('Optimization calculation failed:', err);
      return null;
    }
  }, []);

  // Auto-analyze when image changes
  useEffect(() => {
    if (uploadedImage) {
      analyzeImageAsync(uploadedImage);
    } else {
      setAnalysis(null);
      setOptimizedConfig(null);
      setError(null);
    }
  }, [uploadedImage, analyzeImageAsync]);

  // Auto-optimize when analysis or device changes
  useEffect(() => {
    if (analysis && device) {
      calculateOptimization(analysis, device, fitMode);
    }
  }, [analysis, device, fitMode, calculateOptimization]);

  // Manual optimization trigger
  const optimizeImage = useCallback(async (
    imageDataUrl: string,
    targetDevice: DeviceSpecs,
    strategy: FitMode = 'smart'
  ) => {
    const imageAnalysis = await analyzeImageAsync(imageDataUrl);
    if (imageAnalysis) {
      return calculateOptimization(imageAnalysis, targetDevice, strategy);
    }
    return null;
  }, [analyzeImageAsync, calculateOptimization]);

  return {
    analysis,
    optimizedConfig,
    isAnalyzing,
    error,
    optimizeImage,
    analyzeImageAsync,
    calculateOptimization,
  };
}