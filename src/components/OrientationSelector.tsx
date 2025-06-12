import React from 'react';
import { Action } from '../App';

interface OrientationSelectorProps {
  dispatch: React.Dispatch<Action>;
}

export const OrientationSelector: React.FC<OrientationSelectorProps> = ({ dispatch }) => {
  const handleOrientationChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_ORIENTATION', payload: event.target.value as 'portrait' | 'landscape' });
  };

  return (
    <select
      onChange={handleOrientationChange}
      className="bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700"
    >
      <option value="portrait">Portrait</option>
      <option value="landscape">Landscape</option>
    </select>
  );
};