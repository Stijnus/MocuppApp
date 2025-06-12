import React from 'react';
import { ViewAngle, PerspectiveView } from '../types/DeviceTypes';
import { Monitor, RotateCcw, Box, Layers3, RotateCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface ViewAngleSelectorProps {
  currentAngle: ViewAngle;
  currentPerspective: PerspectiveView;
  onAngleChange: (angle: ViewAngle) => void;
  onPerspectiveChange: (perspective: PerspectiveView) => void;
}

const VIEW_ANGLES: { value: ViewAngle; label: string; icon?: React.ReactNode; group?: string }[] = [
  { value: 'front', label: 'Front View', icon: <Monitor size={16} />, group: 'center' },
  { value: 'angle--60', label: '60° Left', group: 'left' },
  { value: 'angle--45', label: '45° Left', group: 'left' },
  { value: 'angle--30', label: '30° Left', group: 'left' },
  { value: 'angle--15', label: '15° Left', group: 'left' },
  { value: 'angle-15', label: '15° Right', group: 'right' },
  { value: 'angle-30', label: '30° Right', group: 'right' },
  { value: 'angle-45', label: '45° Right', group: 'right' },
  { value: 'angle-60', label: '60° Right', group: 'right' },
  { value: 'side-left', label: 'Side Left', icon: <Box size={16} />, group: 'side' },
  { value: 'side-right', label: 'Side Right', icon: <Box size={16} />, group: 'side' },
];

const PERSPECTIVES: { value: PerspectiveView; label: string; icon?: React.ReactNode }[] = [
  { value: 'flat', label: 'Flat', icon: <Monitor size={16} /> },
  { value: 'perspective', label: 'Perspective', icon: <Layers3 size={16} /> },
  { value: 'isometric', label: 'Isometric', icon: <Box size={16} /> },
];

export const ViewAngleSelector: React.FC<ViewAngleSelectorProps> = ({
  currentAngle,
  currentPerspective,
  onAngleChange,
  onPerspectiveChange,
}) => {
  return (
    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
      {/* View Angle Selector */}
      <div className="flex items-center space-x-2">
        <label htmlFor="view-angle-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">Angle:</label>
        <Select value={currentAngle} onValueChange={(value) => onAngleChange(value as ViewAngle)}>
          <SelectTrigger id="view-angle-select" className="w-[150px] text-sm">
            <SelectValue placeholder="Select Angle" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Center</SelectLabel>
              {VIEW_ANGLES.filter(angle => angle.group === 'center').map((angle) => (
                <SelectItem key={angle.value} value={angle.value}>
                  {angle.icon && <span className="mr-2">{angle.icon}</span>}
                  {angle.label}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Left Angles</SelectLabel>
              {VIEW_ANGLES.filter(angle => angle.group === 'left').map((angle) => (
                <SelectItem key={angle.value} value={angle.value}>
                  {angle.label}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Right Angles</SelectLabel>
              {VIEW_ANGLES.filter(angle => angle.group === 'right').map((angle) => (
                <SelectItem key={angle.value} value={angle.value}>
                  {angle.label}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              <SelectLabel>Side Views</SelectLabel>
              {VIEW_ANGLES.filter(angle => angle.group === 'side').map((angle) => (
                <SelectItem key={angle.value} value={angle.value}>
                  {angle.icon && <span className="mr-2">{angle.icon}</span>}
                  {angle.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Perspective Selector */}
      <div className="flex items-center space-x-2 border-l border-gray-300 dark:border-gray-600 pl-3">
        <label htmlFor="perspective-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">Style:</label>
        <Select value={currentPerspective} onValueChange={(value) => onPerspectiveChange(value as PerspectiveView)}>
          <SelectTrigger id="perspective-select" className="w-[130px] text-sm">
            <SelectValue placeholder="Select Style" />
          </SelectTrigger>
          <SelectContent>
            {PERSPECTIVES.map((perspective) => (
              <SelectItem key={perspective.value} value={perspective.value}>
                {perspective.icon && <span className="mr-2">{perspective.icon}</span>}
                {perspective.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Angle Buttons */}
      <div className="flex items-center space-x-1 border-l border-gray-300 dark:border-gray-600 pl-3">
        <Button
          variant={currentAngle === 'angle--45' ? "default" : "ghost"}
          size="icon"
          onClick={() => onAngleChange('angle--45')}
          title="45° Left"
          aria-label="45 Degree Left"
        >
          <RotateCcw size={16} />
        </Button>
        <Button
          variant={currentAngle === 'front' ? "default" : "ghost"}
          size="icon"
          onClick={() => onAngleChange('front')}
          title="Front View"
          aria-label="Front View"
        >
          <Monitor size={16} />
        </Button>
        <Button
          variant={currentAngle === 'angle-45' ? "default" : "ghost"}
          size="icon"
          onClick={() => onAngleChange('angle-45')}
          title="45° Right"
          aria-label="45 Degree Right"
        >
          <RotateCw size={16} />
        </Button>
        <Button
          variant={currentPerspective === 'isometric' ? "default" : "ghost"}
          size="icon"
          onClick={() => onPerspectiveChange('isometric')}
          title="Isometric View"
          aria-label="Isometric View"
        >
          <Box size={16} />
        </Button>
      </div>
    </div>
  );
}; 