import React, { useState } from 'react';
import { DEVICE_SPECS } from '../data/DeviceSpecs';
import { Action } from '../App';
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Star,
  Crown
} from 'lucide-react';

interface DeviceSelectorProps {
  dispatch: React.Dispatch<Action>;
  selectedDevice?: string;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({ dispatch, selectedDevice }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDeviceChange = (value: string) => {
    dispatch({ type: 'SET_DEVICE', payload: value });
    setIsExpanded(false);
  };

  const getDeviceIcon = (deviceKey: string) => {
    if (deviceKey.includes('pro-max')) return <Crown className="w-5 h-5" />;
    if (deviceKey.includes('pro')) return <Star className="w-5 h-5" />;
    if (deviceKey.includes('plus')) return <Zap className="w-5 h-5" />;
    return <Smartphone className="w-5 h-5" />;
  };

  const getDeviceGradient = (deviceKey: string) => {
    if (deviceKey.includes('pro-max')) return 'from-purple-500 to-pink-500';
    if (deviceKey.includes('pro')) return 'from-blue-500 to-indigo-500';
    if (deviceKey.includes('plus')) return 'from-emerald-500 to-teal-500';
    return 'from-gray-500 to-slate-500';
  };

  const getDeviceBadgeColor = (deviceKey: string) => {
    if (deviceKey.includes('pro-max')) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (deviceKey.includes('pro')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (deviceKey.includes('plus')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getVariantBadge = (device: any) => {
    if (device.variant === 'Pro Max') return { text: 'PRO MAX', class: 'bg-gradient-to-r from-purple-500 to-pink-500' };
    if (device.variant === 'Pro') return { text: 'PRO', class: 'bg-gradient-to-r from-blue-500 to-indigo-500' };
    if (device.variant === 'Plus') return { text: 'PLUS', class: 'bg-gradient-to-r from-emerald-500 to-teal-500' };
    return { text: 'STANDARD', class: 'bg-gradient-to-r from-gray-500 to-slate-500' };
  };

  const selectedDeviceData = selectedDevice ? DEVICE_SPECS[selectedDevice] : null;

  return (
    <div className="space-y-4">
      {/* Current Selection Display */}
      {selectedDeviceData && (
        <div className="p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-2xl border border-blue-200/60 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-gradient-to-r ${getDeviceGradient(selectedDevice!)} rounded-xl shadow-lg`}>
              {getDeviceIcon(selectedDevice!)}
              <span className="text-white">{/* Icon will be white on gradient */}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900">{selectedDeviceData.name}</h3>
                <div className={`px-2 py-1 rounded-lg text-xs font-bold text-white ${getVariantBadge(selectedDeviceData).class}`}>
                  {getVariantBadge(selectedDeviceData).text}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  {selectedDeviceData.screen.resolution.width}×{selectedDeviceData.screen.resolution.height}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  {selectedDeviceData.screen.ppi} PPI
                </span>
              </div>
            </div>
            <div className="p-2 bg-blue-100 rounded-xl">
              <Check className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      )}

      {/* Device Selection */}
      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full h-12 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300 text-gray-700 hover:text-blue-700"
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">
                {selectedDevice ? 'Change Device' : 'Select Device Model'}
              </span>
            </div>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </Button>

        {/* Device Grid */}
        {isExpanded && (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
            {Object.entries(DEVICE_SPECS).map(([key, device]) => {
              const isSelected = selectedDevice === key;
              const variant = getVariantBadge(device);
              
              return (
                <button
                  key={key}
                  onClick={() => handleDeviceChange(key)}
                  className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                    isSelected
                      ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                      isSelected 
                        ? `bg-gradient-to-r ${getDeviceGradient(key)} shadow-lg` 
                        : 'bg-gray-100 group-hover:bg-gray-200'
                    }`}>
                      <div className={isSelected ? 'text-white' : 'text-gray-600'}>
                        {getDeviceIcon(key)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className={`font-bold transition-colors ${
                          isSelected ? 'text-blue-900' : 'text-gray-900 group-hover:text-gray-800'
                        }`}>
                          {device.name}
                        </h4>
                        <div className={`px-2 py-1 rounded-lg text-xs font-bold text-white ${variant.class}`}>
                          {variant.text}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className={`transition-colors ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                          <span className="font-medium">Resolution:</span>
                          <div className="font-mono text-xs">
                            {device.screen.resolution.width}×{device.screen.resolution.height}
                          </div>
                        </div>
                        <div className={`transition-colors ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                          <span className="font-medium">PPI:</span>
                          <div className="font-mono text-xs">{device.screen.ppi}</div>
                        </div>
                      </div>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {device.features.slice(0, 3).map((feature, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-md text-xs font-medium ${
                              isSelected 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                            }`}
                          >
                            {feature.replace('-', ' ')}
                          </span>
                        ))}
                        {device.features.length > 3 && (
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                            isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            +{device.features.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <Check className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {selectedDeviceData && (
        <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <h4 className="text-sm font-bold text-gray-800 mb-3">Device Specifications</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Material:</span>
                <div className="font-semibold text-gray-800 capitalize">
                  {selectedDeviceData.materials.frame}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Dimensions:</span>
                <div className="font-mono text-gray-800">
                  {selectedDeviceData.dimensions.width}×{selectedDeviceData.dimensions.height}mm
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-gray-600">Category:</span>
                <div className="font-semibold text-gray-800 capitalize">
                  {selectedDeviceData.category}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Thickness:</span>
                <div className="font-mono text-gray-800">
                  {selectedDeviceData.dimensions.depth}mm
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};