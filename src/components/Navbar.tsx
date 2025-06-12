import React from 'react';
import { toPng } from 'html-to-image';
import { DeviceSelector } from './DeviceSelector';
// import { ZoomSlider } from './ZoomSlider'; // Removed ZoomSlider import
import { ViewAngleSelector } from './ViewAngleSelector';
import { ProjectManager } from './ProjectManager';
import { Action } from '../App';
import { ViewAngle, PerspectiveView } from '../types/DeviceTypes';
import { Button } from "@/components/ui/button";

interface NavbarProps {
  dispatch: React.Dispatch<Action>;
  mockupRef: React.RefObject<HTMLDivElement>;
  // zoom: number; // Removed zoom prop
  viewAngle: ViewAngle;
  perspective: PerspectiveView;
  currentState: {
    selectedDevice: string;
    uploadedImage?: string;
    viewAngle: string;
    perspective: string;
    orientation: string;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  dispatch,
  mockupRef,
  // zoom, // Removed zoom prop
  viewAngle,
  perspective,
  currentState
}) => {
  const handleDownload = () => {
    if (mockupRef.current) {
      toPng(mockupRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'mockup.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.error('Failed to generate image', err);
        });
    }
  };

  const handleAngleChange = (angle: ViewAngle) => {
    dispatch({ type: 'SET_VIEW_ANGLE', payload: angle });
  };

  const handlePerspectiveChange = (perspectiveView: PerspectiveView) => {
    dispatch({ type: 'SET_PERSPECTIVE', payload: perspectiveView });
  };

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold text-gray-800">
          Device Mockup Generator
        </div>
        
        {/* Controls Section */}
        <div className="flex items-center space-x-4 flex-wrap">
          {/* Device Selection */}
          <div className="flex items-center space-x-3">
            <DeviceSelector dispatch={dispatch} />
          </div>
          
          {/* View Controls */}
          <ViewAngleSelector
            currentAngle={viewAngle}
            currentPerspective={perspective}
            onAngleChange={handleAngleChange}
            onPerspectiveChange={handlePerspectiveChange}
          />
          
          {/* Zoom Controls Removed */}
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <ProjectManager
              dispatch={dispatch}
              currentState={currentState}
            />
            <Button
              variant="outline" // Example variant, can be adjusted
              onClick={() => dispatch({ type: 'RESET_VIEW' })}
              title="Reset all view settings"
            >
              Reset View
            </Button>
            <Button
              onClick={handleDownload}
            >
              Download
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};