import React, { createContext, useContext, ReactNode } from 'react';
import { useDeviceState, DeviceState, DeviceAction } from '../hooks/useDeviceState';
import { useImageOptimization } from '../hooks/useImageOptimization';
import { DEVICE_SPECS } from '../data/DeviceSpecs';

interface AppContextType {
  // Device state
  deviceState: DeviceState;
  deviceActions: ReturnType<typeof useDeviceState>['actions'];
  dispatch: React.Dispatch<DeviceAction>;
  currentDevice: typeof DEVICE_SPECS[string];
  
  // Image optimization
  imageOptimization: ReturnType<typeof useImageOptimization>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { state: deviceState, actions: deviceActions, dispatch } = useDeviceState();
  const currentDevice = DEVICE_SPECS[deviceState.selectedDevice];
  
  const imageOptimization = useImageOptimization(
    deviceState.uploadedImage,
    currentDevice,
    deviceState.fitMode
  );

  const value: AppContextType = {
    deviceState,
    deviceActions,
    dispatch,
    currentDevice,
    imageOptimization,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}