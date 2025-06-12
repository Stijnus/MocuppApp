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
  // It might be beneficial to pass the current selected device value as a prop
  // to control the Select component if it's managed in the parent state.
  // For now, we'll let the Select component manage its own state internally
  // and just dispatch the change.
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({ dispatch }) => {
  const handleDeviceChange = (value: string) => {
    dispatch({ type: 'SET_DEVICE', payload: value });
  };

  // Assuming DEVICE_SPECS has a structure like:
  // { "iphone15": { name: "iPhone 15", ... }, ... }
  // And we want to display the current device name in the trigger.
  // We'd need the current device key from the parent state to do this properly.
  // For simplicity, we'll use a placeholder for now.

  return (
    <Select onValueChange={handleDeviceChange}>
      <SelectTrigger className="w-[180px]">
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