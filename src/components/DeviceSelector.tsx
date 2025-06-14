import React from 'react';
import { DEVICE_SPECS } from '../data/DeviceSpecs';
import { Action } from '../App';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Added shadcn Select components

interface DeviceSelectorProps {
  dispatch: React.Dispatch<Action>;
  selectedDevice: string;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({ dispatch, selectedDevice }) => {
  const handleDeviceChange = (value: string) => {
    dispatch({ type: 'SET_DEVICE', payload: value });
  };

  return (
    <Select value={selectedDevice} onValueChange={handleDeviceChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Device" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(DEVICE_SPECS).map(([key, device]) => (
          <SelectItem key={key} value={key}>
            {device.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};