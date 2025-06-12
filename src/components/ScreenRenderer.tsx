import React, { useEffect, useCallback, useRef } from 'react';
import { Action } from '../App';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { FileUpload } from './FileUpload';
// ZOOM_CONSTANTS, calculateNextZoom, formatZoom, createDebouncedZoomUpdate removed as zoom is disabled

interface ScreenRendererProps {
  uploadedImage?: string;
  // zoom: number; // Zoom prop removed
  positionX: number;
  positionY: number;
  dispatch: React.Dispatch<Action>;
}

export const ScreenRenderer: React.FC<ScreenRendererProps> = ({
  uploadedImage,
  // zoom, // Zoom prop removed
  positionX,
  positionY,
  dispatch,
}) => {
  const transformComponentRef = useRef<ReactZoomPanPinchRef>(null);

  const debouncedPositionUpdate = useCallback(
    () => {
      let timeoutId: NodeJS.Timeout;
      return (newPosition: { x: number; y: number }) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          dispatch({ type: 'SET_POSITION', payload: newPosition });
        }, 50); // Adjust delay as needed
      };
    },
    [dispatch]
  )(); // This immediately calls the function returned by useCallback, which is correct for this pattern


  // Sync external position changes with the transform component
  useEffect(() => {
    if (transformComponentRef.current) {
      const { setTransform } = transformComponentRef.current;
      // Set scale to 1 (no zoom) and use a short animation duration
      setTransform(positionX, positionY, 1, 50);
    }
  }, [positionX, positionY]);


  // Removed handleWheel for zoom
  // Removed useEffect for wheel event listener

  if (!uploadedImage) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
        <FileUpload dispatch={dispatch} />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden rounded-lg">
      <TransformWrapper
        ref={transformComponentRef}
        initialScale={1} // Default scale to 1 (no zoom)
        initialPositionX={positionX}
        initialPositionY={positionY}
        minScale={1} // Zoom disabled
        maxScale={1} // Zoom disabled
        limitToBounds={false} // Keep true if you want to limit panning within bounds
        centerOnInit={true} // Center image initially
        wheel={{
          disabled: true, // Zoom via wheel disabled
          step: 0, // Zoom via wheel disabled
        }}
        pinch={{
          disabled: true, // Zoom via pinch disabled
        }}
        doubleClick={{
          disabled: true, // Zoom via double click disabled
        }}
        onPanning={(ref) => { // Use onPanning or onPanningStop
            if (ref.state) {
                 debouncedPositionUpdate({ x: ref.state.positionX, y: ref.state.positionY });
            }
        }}
        onInit={(ref) => {
          if (ref) {
            ref.setTransform(positionX, positionY, 1, 0);
          }
        }}
        panning={{
          velocityDisabled: true, // Disables the "inertia" effect when panning
        }}
      >
        <TransformComponent
          wrapperClass="w-full h-full"
          contentClass="w-full h-full flex items-center justify-center"
        >
          <img
            src={uploadedImage}
            alt="Screen content"
            className="max-w-full max-h-full object-contain select-none" // crisp-text might not be relevant without zoom
            loading="lazy"
            draggable={false}
            style={{
              // imageRendering: zoom > 2 ? 'pixelated' : 'auto', // Style dependent on zoom removed
            }}
          />
        </TransformComponent>
      </TransformWrapper>
      
      {/* Zoom level indicator removed */}
    </div>
  );
};