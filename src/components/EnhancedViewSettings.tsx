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
  Zap,
  Camera,
  Sparkles,
  Palette,
  Play,
  Pause,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface EnhancedViewSettingsProps {
  currentAngle: ViewAngle;
  currentPerspective: PerspectiveView;
  onAngleChange: (angle: ViewAngle) => void;
  onPerspectiveChange: (perspective: PerspectiveView) => void;
  onReset: () => void;
}

const ANGLE_PRESETS = [
  { value: 'front' as ViewAngle, label: 'Front View', icon: <Monitor className="w-5 h-5" />, preview: '0°', gradient: 'from-gray-500 to-slate-500' },
  { value: 'angle-15' as ViewAngle, label: '15° Right', icon: <RotateCw className="w-5 h-5" />, preview: '15°', gradient: 'from-blue-500 to-cyan-500' },
  { value: 'angle-30' as ViewAngle, label: '30° Right', icon: <RotateCw className="w-5 h-5" />, preview: '30°', gradient: 'from-emerald-500 to-teal-500' },
  { value: 'angle-45' as ViewAngle, label: '45° Right', icon: <RotateCw className="w-5 h-5" />, preview: '45°', gradient: 'from-purple-500 to-pink-500' },
  { value: 'angle--15' as ViewAngle, label: '15° Left', icon: <RotateCcw className="w-5 h-5" />, preview: '-15°', gradient: 'from-orange-500 to-amber-500' },
  { value: 'angle--30' as ViewAngle, label: '30° Left', icon: <RotateCcw className="w-5 h-5" />, preview: '-30°', gradient: 'from-red-500 to-rose-500' },
  { value: 'angle--45' as ViewAngle, label: '45° Left', icon: <RotateCcw className="w-5 h-5" />, preview: '-45°', gradient: 'from-indigo-500 to-violet-500' },
];

const PERSPECTIVE_OPTIONS = [
  { 
    value: 'flat' as PerspectiveView, 
    label: 'Flat View', 
    icon: <Monitor className="w-5 h-5" />, 
    description: 'Clean 2D presentation',
    gradient: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  { 
    value: 'perspective' as PerspectiveView, 
    label: 'Perspective', 
    icon: <Layers3 className="w-5 h-5" />, 
    description: 'Realistic 3D depth',
    gradient: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200'
  },
  { 
    value: 'isometric' as PerspectiveView, 
    label: 'Isometric', 
    icon: <Box className="w-5 h-5" />, 
    description: 'Technical 3D view',
    gradient: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200'
  },
];

const QUICK_PRESETS = [
  { 
    name: 'Marketing Shot', 
    angle: 'angle-30' as ViewAngle, 
    perspective: 'perspective' as PerspectiveView,
    icon: <Zap className="w-5 h-5" />,
    description: 'Perfect for presentations',
    gradient: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  { 
    name: 'Clean Profile', 
    angle: 'front' as ViewAngle, 
    perspective: 'flat' as PerspectiveView,
    icon: <Eye className="w-5 h-5" />,
    description: 'Minimal and professional',
    gradient: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  { 
    name: 'Dynamic View', 
    angle: 'angle-45' as ViewAngle, 
    perspective: 'isometric' as PerspectiveView,
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Engaging 3D showcase',
    gradient: 'from-purple-400 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
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
  const [isAnimating, setIsAnimating] = useState(false);

  const handleQuickPreset = (preset: typeof QUICK_PRESETS[0]) => {
    onAngleChange(preset.angle);
    onPerspectiveChange(preset.perspective);
  };

  const currentAnglePreset = ANGLE_PRESETS.find(p => p.value === currentAngle);
  const currentPerspectiveOption = PERSPECTIVE_OPTIONS.find(p => p.value === currentPerspective);

  const runAnimation = async (type: 'rotate' | 'perspective') => {
    setIsAnimating(true);
    
    if (type === 'rotate') {
      const angles: ViewAngle[] = ['front', 'angle-15', 'angle-30', 'angle-45', 'angle-30', 'angle-15', 'front'];
      for (let i = 0; i < angles.length; i++) {
        onAngleChange(angles[i]);
        await new Promise(resolve => setTimeout(resolve, 400));
      }
    } else {
      const perspectives: PerspectiveView[] = ['flat', 'perspective', 'isometric', 'perspective', 'flat'];
      for (let i = 0; i < perspectives.length; i++) {
        onPerspectiveChange(perspectives[i]);
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }
    
    setIsAnimating(false);
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">Quick Presets</h4>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="h-9 px-3 rounded-xl hover:shadow-md transition-all duration-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
        
        <div className="space-y-3">
          {QUICK_PRESETS.map((preset) => {
            const isActive = currentAngle === preset.angle && currentPerspective === preset.perspective;
            return (
              <button
                key={preset.name}
                onClick={() => handleQuickPreset(preset)}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                  isActive
                    ? `${preset.bgColor} ${preset.borderColor} shadow-lg`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl shadow-lg ${
                    isActive 
                      ? `bg-gradient-to-r ${preset.gradient}` 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <div className={isActive ? 'text-white' : 'text-gray-600'}>
                      {preset.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className={`font-bold transition-colors ${
                      isActive ? 'text-gray-900' : 'text-gray-800 group-hover:text-gray-900'
                    }`}>
                      {preset.name}
                    </h5>
                    <p className={`text-sm transition-colors ${
                      isActive ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      {preset.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-lg">
                        {ANGLE_PRESETS.find(a => a.value === preset.angle)?.preview}
                      </span>
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-lg">
                        {preset.perspective}
                      </span>
                    </div>
                  </div>
                  {isActive && (
                    <div className="p-2 bg-white/80 rounded-xl">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-lg font-bold text-gray-900">Live Preview</h4>
        </div>
        
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
          <div className="flex items-center justify-center mb-6">
            <div 
              className={`w-24 h-40 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-2xl transform transition-all duration-700 ${
                currentPerspective === 'perspective' ? 'perspective-1000' : ''
              } ${
                currentPerspective === 'isometric' ? 'skew-y-2' : ''
              }`} 
              style={{
                transform: currentAngle === 'front' ? 'rotateY(0deg)' :
                          currentAngle === 'angle-15' ? 'rotateY(15deg)' :
                          currentAngle === 'angle-30' ? 'rotateY(30deg)' :
                          currentAngle === 'angle-45' ? 'rotateY(45deg)' :
                          currentAngle === 'angle--15' ? 'rotateY(-15deg)' :
                          currentAngle === 'angle--30' ? 'rotateY(-30deg)' :
                          currentAngle === 'angle--45' ? 'rotateY(-45deg)' : 'rotateY(0deg)'
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg m-2"></div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h5 className="text-lg font-bold text-gray-900">
              {currentAnglePreset?.label || 'Custom'} • {currentPerspectiveOption?.label}
            </h5>
            <p className="text-sm text-gray-600">
              {currentAnglePreset?.preview || currentAngle} rotation
            </p>
          </div>

          {/* Animation Controls */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => runAnimation('rotate')}
              disabled={isAnimating}
              className="flex-1 h-10 rounded-xl hover:shadow-md transition-all duration-300"
            >
              {isAnimating ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              Rotation Demo
            </Button>
            <Button
              variant="outline"
              onClick={() => runAnimation('perspective')}
              disabled={isAnimating}
              className="flex-1 h-10 rounded-xl hover:shadow-md transition-all duration-300"
            >
              <Palette className="w-4 h-4 mr-2" />
              Style Demo
            </Button>
          </div>
        </div>
      </div>

      {/* Angle Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
            <RotateCw className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-lg font-bold text-gray-900">Rotation Angles</h4>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {ANGLE_PRESETS.map((preset) => {
            const isSelected = currentAngle === preset.value;
            return (
              <button
                key={preset.value}
                onClick={() => onAngleChange(preset.value)}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 group hover:scale-[1.02] ${
                  isSelected
                    ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-all duration-300 ${
                    isSelected 
                      ? `bg-gradient-to-r ${preset.gradient} shadow-lg` 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <div className={isSelected ? 'text-white' : 'text-gray-600'}>
                      {preset.icon}
                    </div>
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`font-bold text-sm transition-colors ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {preset.preview}
                    </p>
                    <p className={`text-xs transition-colors ${
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {preset.label}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Perspective Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl">
            <Layers3 className="w-4 h-4 text-white" />
          </div>
          <h4 className="text-lg font-bold text-gray-900">Perspective Styles</h4>
        </div>

        <div className="space-y-3">
          {PERSPECTIVE_OPTIONS.map((option) => {
            const isSelected = currentPerspective === option.value;
            return (
              <button
                key={option.value}
                onClick={() => onPerspectiveChange(option.value)}
                className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-[1.02] ${
                  isSelected
                    ? `${option.bgColor} ${option.borderColor} shadow-lg`
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl shadow-lg ${
                    isSelected 
                      ? `bg-gradient-to-r ${option.gradient}` 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <div className={isSelected ? 'text-white' : 'text-gray-600'}>
                      {option.icon}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h5 className={`font-bold transition-colors ${
                      isSelected ? option.textColor : 'text-gray-900'
                    }`}>
                      {option.label}
                    </h5>
                    <p className={`text-sm transition-colors ${
                      isSelected ? 'text-gray-600' : 'text-gray-500'
                    }`}>
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="p-2 bg-white/80 rounded-xl">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Controls */}
      <div className="border-t border-gray-200 pt-6">
        <Button
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full justify-between h-12 px-4 rounded-xl hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <Settings2 className="w-5 h-5" />
            <span className="font-medium">Advanced Controls</span>
          </div>
          {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </Button>

        {showAdvanced && (
          <div className="mt-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
            {/* Custom Angle Slider */}
            <div className="space-y-4">
              <h5 className="text-md font-bold text-gray-900">Custom Rotation</h5>
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
                <div className="space-y-4">
                  <Slider
                    value={[customAngle]}
                    onValueChange={(value) => setCustomAngle(value[0])}
                    max={90}
                    min={-90}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>-90°</span>
                    <span className="font-bold text-lg text-gray-900">{customAngle}°</span>
                    <span>90°</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const customViewAngle = `angle-${customAngle}` as ViewAngle;
                      onAngleChange(customViewAngle);
                    }}
                    className="w-full h-10 rounded-xl hover:shadow-md transition-all duration-300"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Apply Custom Angle
                  </Button>
                </div>
              </div>
            </div>

            {/* Current Settings */}
            <div className="space-y-4">
              <h5 className="text-md font-bold text-gray-900">Current Settings</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <RotateCw className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Angle</span>
                  </div>
                  <p className="font-bold text-blue-900">
                    {currentAnglePreset?.preview || currentAngle}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers3 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Style</span>
                  </div>
                  <p className="font-bold text-purple-900">
                    {currentPerspectiveOption?.label || currentPerspective}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};