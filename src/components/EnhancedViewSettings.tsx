import React, { useState } from 'react';
import { ViewAngle, PerspectiveView } from '../types/DeviceTypes';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Monitor,
  RotateCcw,
  RotateCw,
  Box,
  Layers3,
  Eye,
  RefreshCw,
  Settings2,
  Zap
} from 'lucide-react';

interface EnhancedViewSettingsProps {
  currentAngle: ViewAngle;
  currentPerspective: PerspectiveView;
  onAngleChange: (angle: ViewAngle) => void;
  onPerspectiveChange: (perspective: PerspectiveView) => void;
  onReset: () => void;
}

const ANGLE_PRESETS = [
  { value: 'front' as ViewAngle, label: 'Front', icon: <Monitor className="w-4 h-4" />, preview: '0°' },
  { value: 'angle-15' as ViewAngle, label: '15° Right', icon: <RotateCw className="w-4 h-4" />, preview: '15°' },
  { value: 'angle-30' as ViewAngle, label: '30° Right', icon: <RotateCw className="w-4 h-4" />, preview: '30°' },
  { value: 'angle-45' as ViewAngle, label: '45° Right', icon: <RotateCw className="w-4 h-4" />, preview: '45°' },
  { value: 'angle--15' as ViewAngle, label: '15° Left', icon: <RotateCcw className="w-4 h-4" />, preview: '-15°' },
  { value: 'angle--30' as ViewAngle, label: '30° Left', icon: <RotateCcw className="w-4 h-4" />, preview: '-30°' },
  { value: 'angle--45' as ViewAngle, label: '45° Left', icon: <RotateCcw className="w-4 h-4" />, preview: '-45°' },
];

const PERSPECTIVE_OPTIONS = [
  { 
    value: 'flat' as PerspectiveView, 
    label: 'Flat', 
    icon: <Monitor className="w-4 h-4" />, 
    description: 'Clean 2D view',
    color: 'blue'
  },
  { 
    value: 'perspective' as PerspectiveView, 
    label: 'Perspective', 
    icon: <Layers3 className="w-4 h-4" />, 
    description: 'Realistic 3D depth',
    color: 'purple'
  },
  { 
    value: 'isometric' as PerspectiveView, 
    label: 'Isometric', 
    icon: <Box className="w-4 h-4" />, 
    description: 'Technical 3D view',
    color: 'green'
  },
];

const QUICK_PRESETS = [
  { 
    name: 'Marketing Shot', 
    angle: 'angle-30' as ViewAngle, 
    perspective: 'perspective' as PerspectiveView,
    icon: <Zap className="w-4 h-4" />,
    description: 'Perfect for presentations'
  },
  { 
    name: 'Clean Profile', 
    angle: 'front' as ViewAngle, 
    perspective: 'flat' as PerspectiveView,
    icon: <Eye className="w-4 h-4" />,
    description: 'Minimal and clean'
  },
  { 
    name: 'Dynamic View', 
    angle: 'angle-45' as ViewAngle, 
    perspective: 'isometric' as PerspectiveView,
    icon: <RotateCw className="w-4 h-4" />,
    description: 'Engaging 3D angle'
  }
];

export const EnhancedViewSettings: React.FC<EnhancedViewSettingsProps> = ({
  currentAngle,
  currentPerspective,
  onAngleChange,
  onPerspectiveChange,
  onReset
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customAngle, setCustomAngle] = useState(0);

  const handleQuickPreset = (preset: typeof QUICK_PRESETS[0]) => {
    onAngleChange(preset.angle);
    onPerspectiveChange(preset.perspective);
  };

  const currentAnglePreset = ANGLE_PRESETS.find(p => p.value === currentAngle);
  const currentPerspectiveOption = PERSPECTIVE_OPTIONS.find(p => p.value === currentPerspective);

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Quick Presets</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleQuickPreset(preset)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left group hover:shadow-sm ${
                currentAngle === preset.angle && currentPerspective === preset.perspective
                  ? 'border-blue-200 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  currentAngle === preset.angle && currentPerspective === preset.perspective
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                }`}>
                  {preset.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">{preset.name}</p>
                  <p className="text-xs text-gray-500">{preset.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Settings Display */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Current Settings</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <RotateCw className="w-3 h-3 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Angle</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {currentAnglePreset?.preview || currentAngle}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Layers3 className="w-3 h-3 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Style</span>
            </div>
            <p className="text-sm font-medium text-gray-900">
              {currentPerspectiveOption?.label || currentPerspective}
            </p>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Live Preview</h4>
        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="flex items-center justify-center">
            <div className={`w-16 h-24 bg-gradient-to-b from-blue-500 to-blue-600 rounded-lg shadow-lg transform transition-all duration-300 ${
              currentPerspective === 'perspective' ? 'perspective-1000' : ''
            } ${
              currentPerspective === 'isometric' ? 'skew-y-3' : ''
            }`} style={{
              transform: currentAngle === 'front' ? 'rotateY(0deg)' :
                        currentAngle === 'angle-15' ? 'rotateY(15deg)' :
                        currentAngle === 'angle-30' ? 'rotateY(30deg)' :
                        currentAngle === 'angle-45' ? 'rotateY(45deg)' :
                        currentAngle === 'angle--15' ? 'rotateY(-15deg)' :
                        currentAngle === 'angle--30' ? 'rotateY(-30deg)' :
                        currentAngle === 'angle--45' ? 'rotateY(-45deg)' : 'rotateY(0deg)'
            }}>
              <div className="w-full h-full bg-white/20 rounded-sm m-1"></div>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            {currentAnglePreset?.label || 'Custom'} • {currentPerspectiveOption?.label}
          </p>
        </div>
      </div>

      {/* Advanced Controls Toggle */}
      <div className="border-t border-gray-200 pt-4">
        <Button
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full justify-between h-8 px-3"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" />
            <span className="text-sm">Advanced Controls</span>
          </div>
          <RotateCw className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </Button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {/* Angle Selection */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-900">Rotation Angle</h5>
              <div className="grid grid-cols-2 gap-2">
                {ANGLE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => onAngleChange(preset.value)}
                    className={`p-2 rounded-lg border text-left transition-all duration-150 ${
                      currentAngle === preset.value
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {preset.icon}
                      <div>
                        <p className="text-xs font-medium">{preset.preview}</p>
                        <p className="text-xs text-gray-500">{preset.label}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Perspective Selection */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-900">Perspective Style</h5>
              <div className="space-y-2">
                {PERSPECTIVE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onPerspectiveChange(option.value)}
                    className={`w-full p-3 rounded-lg border text-left transition-all duration-150 ${
                      currentPerspective === option.value
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        currentPerspective === option.value
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Angle Slider */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-900">Custom Rotation</h5>
              <div className="space-y-2">
                <Slider
                  value={[customAngle]}
                  onValueChange={(value) => setCustomAngle(value[0])}
                  max={90}
                  min={-90}
                  step={5}
                  className="w-full"
                />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>-90°</span>
                  <span className="font-medium">{customAngle}°</span>
                  <span>90°</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const customViewAngle = `angle-${customAngle}` as ViewAngle;
                    onAngleChange(customViewAngle);
                  }}
                  className="w-full h-7 text-xs"
                >
                  Apply Custom Angle
                </Button>
              </div>
            </div>

            {/* Animation Presets */}
            <div className="space-y-3">
              <h5 className="text-sm font-medium text-gray-900">Animation Presets</h5>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const angles: ViewAngle[] = ['angle--45', 'front', 'angle-45', 'front'];
                    let index = 0;
                    const interval = setInterval(() => {
                      onAngleChange(angles[index]);
                      index++;
                      if (index >= angles.length) clearInterval(interval);
                    }, 500);
                  }}
                  className="h-8 text-xs"
                >
                  🔄 Rotate Demo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const perspectives: PerspectiveView[] = ['flat', 'perspective', 'isometric', 'flat'];
                    let index = 0;
                    const interval = setInterval(() => {
                      onPerspectiveChange(perspectives[index]);
                      index++;
                      if (index >= perspectives.length) clearInterval(interval);
                    }, 600);
                  }}
                  className="h-8 text-xs"
                >
                  ✨ Style Demo
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};