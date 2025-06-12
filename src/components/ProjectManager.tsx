import React, { useState, useEffect } from 'react';
import { storageManager, StoredProject } from '../lib/storage';
import { Action } from '../App';
import { ViewAngle, PerspectiveView } from '../types/DeviceTypes';
import { Button } from "@/components/ui/button";

interface ProjectManagerProps {
  dispatch: React.Dispatch<Action>;
  currentState: {
    selectedDevice: string;
    uploadedImage?: string;
    viewAngle: string;
    perspective: string;
    orientation: string;
  };
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  dispatch,
  currentState,
}) => {
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [showManager, setShowManager] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const savedProjects = storageManager.loadProjects();
    setProjects(savedProjects.sort((a, b) => b.updatedAt - a.createdAt));
  };

  const saveCurrentProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    setIsLoading(true);
    try {
      // Capture current canvas as image if available
      let imageDataUrl: string | undefined;
      const canvasElements = document.querySelectorAll('canvas');
      if (canvasElements.length > 0 && currentState.uploadedImage) {
        const canvas = canvasElements[0];
        imageDataUrl = canvas.toDataURL('image/png');
      }

      const projectId = storageManager.saveProject({
        name: projectName,
        deviceConfig: {
          selectedDevice: currentState.selectedDevice,
          viewAngle: currentState.viewAngle,
          perspective: currentState.perspective,
          orientation: currentState.orientation,
          timestamp: Date.now(),
        },
        imageState: storageManager.loadImageState() || undefined,
        imageDataUrl,
      });

      storageManager.setCurrentProject(projectId);
      setProjectName('');
      loadProjects();
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProject = (project: StoredProject) => {
    setIsLoading(true);
    try {
      // Load device configuration
      dispatch({
        type: 'LOAD_SAVED_STATE',
        payload: {
          selectedDevice: project.deviceConfig.selectedDevice,
          viewAngle: project.deviceConfig.viewAngle as ViewAngle,
          perspective: project.deviceConfig.perspective as PerspectiveView,
          orientation: project.deviceConfig.orientation as 'portrait' | 'landscape',
        },
      });

      // Load image if available
      if (project.imageDataUrl) {
        dispatch({
          type: 'SET_UPLOADED_IMAGE',
          payload: project.imageDataUrl,
        });
      }

      // Set as current project
      storageManager.setCurrentProject(project.id);
      
      alert(`Project "${project.name}" loaded successfully!`);
      setShowManager(false);
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      storageManager.deleteProject(projectId);
      loadProjects();
    }
  };

  const exportProject = (project: StoredProject) => {
    const exportData = storageManager.exportProject(project.id);
    if (exportData) {
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const importProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const projectId = storageManager.importProject(content);
          if (projectId) {
            loadProjects();
            alert('Project imported successfully!');
          } else {
            alert('Failed to import project. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const storageStats = storageManager.getStorageStats();

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowManager(!showManager)}
        className="relative"
      >
        Projects
        {projects.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {projects.length}
          </span>
        )}
      </Button>

      {showManager && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold mb-3">Project Manager</h3>
            
            {/* Save Current Project */}
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                placeholder="Project name..."
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
                onKeyPress={(e) => e.key === 'Enter' && saveCurrentProject()}
              />
              <Button
                onClick={saveCurrentProject}
                disabled={isLoading || !projectName.trim()}
                size="sm"
              >
                Save
              </Button>
            </div>

            {/* Import/Export */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={importProject}
                size="sm"
                className="flex-1"
              >
                Import
              </Button>
              <Button
                variant="outline"
                onClick={() => storageManager.clearAllData()}
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="text-4xl mb-2">📁</div>
                <p>No saved projects</p>
                <p className="text-sm">Save your current mockup to get started</p>
              </div>
            ) : (
              <div className="p-2">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3 border rounded-lg mb-2 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{project.name}</h4>
                        <p className="text-xs text-gray-500">
                          {project.deviceConfig.selectedDevice} • {formatDate(project.updatedAt)}
                        </p>
                      </div>
                      {project.imageDataUrl && (
                        <img
                          src={project.imageDataUrl}
                          alt="Preview"
                          className="w-8 h-8 object-cover rounded border ml-2"
                        />
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      <Button
                        onClick={() => loadProject(project)}
                        disabled={isLoading}
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                      >
                        Load
                      </Button>
                      <Button
                        onClick={() => exportProject(project)}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        Export
                      </Button>
                      <Button
                        onClick={() => deleteProject(project.id)}
                        size="sm"
                        variant="outline"
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Storage Stats */}
          <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Projects: {storageStats.totalProjects}</span>
              <span>Storage: {Math.round(storageStats.storageUsed / 1024)}KB</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 