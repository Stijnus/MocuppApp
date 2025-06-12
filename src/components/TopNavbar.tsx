import React from 'react';
import { Button } from "@/components/ui/button";
import { Github, ExternalLink, Lightbulb } from 'lucide-react';

interface TopNavbarProps {
  currentState: {
    selectedDevice: string;
    uploadedImage?: string;
    viewAngle: string;
    perspective: string;
    orientation: string;
  };
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ currentState }) => {
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-3">
      <div className="flex justify-between items-center">
        {/* Status Info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              currentState.uploadedImage ? 'bg-green-500' : 'bg-gray-400'
            }`} />
            <span className="text-sm text-gray-600">
              {currentState.uploadedImage ? 'Ready to export' : 'Upload an image to start'}
            </span>
          </div>
          
          {currentState.uploadedImage && (
            <div className="text-sm text-gray-500">
              {currentState.selectedDevice?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} • {currentState.viewAngle} • {currentState.perspective}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => window.open('https://github.com/your-repo/mocupp', '_blank')}
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => window.open('https://mocupp.com/docs', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Docs
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            title="Tips & Shortcuts"
          >
            <Lightbulb className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
};