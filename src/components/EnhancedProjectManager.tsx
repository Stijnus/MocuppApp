import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { storageManager, StoredProject } from '../lib/storage';
import { Action } from '../App';
import { ViewAngle, PerspectiveView } from '../types/DeviceTypes';
import { Button } from "@/components/ui/button";
import {
  Save,
  FolderOpen,
  Trash2,
  Download,
  Upload,
  Plus,
  Search,
  Clock,
  Smartphone,
  Image,
  Copy,
  Grid3X3,
  List,
  CheckSquare,
  Square,
  X
} from 'lucide-react';

interface EnhancedProjectManagerProps {
  dispatch: React.Dispatch<Action>;
  currentState: {
    selectedDevice: string;
    uploadedImage?: string;
    viewAngle: string;
    perspective: string;
    orientation: string;
  };
}

export const EnhancedProjectManager: React.FC<EnhancedProjectManagerProps> = ({
  dispatch,
  currentState,
}) => {
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'device'>('recent');
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterBy, setFilterBy] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const loadProjects = useCallback(() => {
    const savedProjects = storageManager.loadProjects();
    const sortedProjects = [...savedProjects];
    
    switch (sortBy) {
      case 'name':
        sortedProjects.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'device':
        sortedProjects.sort((a, b) => a.deviceConfig.selectedDevice.localeCompare(b.deviceConfig.selectedDevice));
        break;
      case 'recent':
      default:
        sortedProjects.sort((a, b) => b.updatedAt - a.updatedAt);
        break;
    }
    
    setProjects(sortedProjects);
  }, [sortBy]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const saveCurrentProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name');
      return;
    }

    setIsLoading(true);
    try {
      let imageDataUrl: string | undefined;
      const canvasElements = document.querySelectorAll('canvas');
      if (canvasElements.length > 0 && currentState.uploadedImage) {
        const canvas = canvasElements[0];
        imageDataUrl = canvas.toDataURL('image/png');
      }

      const projectId = storageManager.saveProject({
        name: projectName.trim(),
        deviceConfig: {
          selectedDevice: currentState.selectedDevice,
          viewAngle: currentState.viewAngle,
          perspective: currentState.perspective,
          orientation: currentState.orientation,
          timestamp: Date.now(),
        },
        imageDataUrl,
      });

      storageManager.setCurrentProject(projectId);
      setProjectName('');
      setProjectDescription('');
      setShowNewProject(false);
      loadProjects();
      
      // Show success message
      alert(`Project "${projectName}" saved successfully!`);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProject = async (project: StoredProject) => {
    setIsLoading(true);
    try {
      dispatch({
        type: 'LOAD_SAVED_STATE',
        payload: {
          selectedDevice: project.deviceConfig.selectedDevice,
          viewAngle: project.deviceConfig.viewAngle as ViewAngle,
          perspective: project.deviceConfig.perspective as PerspectiveView,
          orientation: project.deviceConfig.orientation as 'portrait' | 'landscape',
        },
      });

      if (project.imageDataUrl) {
        dispatch({
          type: 'SET_UPLOADED_IMAGE',
          payload: project.imageDataUrl,
        });
      }

      storageManager.setCurrentProject(project.id);
      alert(`Project "${project.name}" loaded successfully!`);
    } catch (error) {
      console.error('Failed to load project:', error);
      alert('Failed to load project');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && confirm(`Are you sure you want to delete "${project.name}"?`)) {
      storageManager.deleteProject(projectId);
      setSelectedProjects(prev => prev.filter(id => id !== projectId));
      loadProjects();
    }
  };

  const duplicateProject = (project: StoredProject) => {
    storageManager.saveProject({
      name: `${project.name} (Copy)`,
      deviceConfig: project.deviceConfig,
      imageDataUrl: project.imageDataUrl,
    });
    loadProjects();
    alert(`Project duplicated as "${project.name} (Copy)"`);
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

  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.deviceConfig.selectedDevice.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply time-based filtering
    if (filterBy !== 'all') {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      const timeThresholds = {
        today: now - day,
        week: now - (7 * day),
        month: now - (30 * day)
      };
      
      filtered = filtered.filter(project => 
        project.updatedAt > timeThresholds[filterBy]
      );
    }

    return filtered;
  }, [projects, searchTerm, filterBy]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatDeviceName = (deviceId: string) => {
    return deviceId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedProjects(prev => 
      prev.length === filteredProjects.length 
        ? [] 
        : filteredProjects.map(p => p.id)
    );
  };

  const bulkDeleteProjects = () => {
    if (selectedProjects.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedProjects.length} project(s)?`)) {
      selectedProjects.forEach(projectId => {
        storageManager.deleteProject(projectId);
      });
      setSelectedProjects([]);
      loadProjects();
    }
  };

  const bulkExportProjects = () => {
    if (selectedProjects.length === 0) return;
    
    selectedProjects.forEach(projectId => {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        exportProject(project);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">Your Projects</h4>
          <Button
            onClick={() => setShowNewProject(true)}
            size="sm"
            className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-3 h-3 mr-1" />
            New
          </Button>
        </div>

        {/* Search and Controls */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-7 pl-7 pr-2 text-xs border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-7 w-7 p-0"
              title="Grid View"
            >
              <Grid3X3 className="w-3 h-3" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-7 w-7 p-0"
              title="List View"
            >
              <List className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as 'all' | 'today' | 'week' | 'month')}
              className="h-7 px-2 text-xs border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'recent' | 'name' | 'device')}
              className="h-7 px-2 text-xs border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Recent</option>
              <option value="name">Name</option>
              <option value="device">Device</option>
            </select>
            
            {selectedProjects.length > 0 && (
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-gray-500">{selectedProjects.length} selected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkExportProjects}
                  className="h-7 px-2 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkDeleteProjects}
                  className="h-7 px-2 text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProjects([])}
                  className="h-7 w-7 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Project Form */}
      {showNewProject && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-blue-900">Save Current Project</h5>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNewProject(false)}
              className="h-6 w-6 p-0 text-blue-600"
            >
              ×
            </Button>
          </div>
          
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <textarea
              placeholder="Description (optional)..."
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={saveCurrentProject}
              disabled={!projectName.trim() || isLoading}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-3 h-3 mr-1" />
              {isLoading ? 'Saving...' : 'Save Project'}
            </Button>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-2">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              {searchTerm || filterBy !== 'all' ? 'No projects found' : 'No projects yet'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {searchTerm || filterBy !== 'all' ? 'Try adjusting your filters' : 'Create your first project to get started'}
            </p>
          </div>
        ) : (
          <>
            {/* Select All Header */}
            {filteredProjects.length > 1 && (
              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-800"
                >
                  {selectedProjects.length === filteredProjects.length ? (
                    <CheckSquare className="w-3 h-3" />
                  ) : (
                    <Square className="w-3 h-3" />
                  )}
                  {selectedProjects.length === filteredProjects.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-xs text-gray-500">
                  {selectedProjects.length} of {filteredProjects.length} selected
                </span>
              </div>
            )}

            {/* Projects Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-2'}>
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className={`group border rounded-lg transition-all duration-150 ${
                    selectedProjects.includes(project.id)
                      ? 'border-blue-300 bg-blue-50/50 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  } ${viewMode === 'grid' ? 'p-3' : 'p-2'}`}
                >
                  <div className={`flex items-start gap-3 ${viewMode === 'list' ? 'items-center' : ''}`}>
                    {/* Selection Checkbox */}
                    <button
                      onClick={() => toggleProjectSelection(project.id)}
                      className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      {selectedProjects.includes(project.id) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {/* Project Preview */}
                    <div className={`bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden ${
                      viewMode === 'grid' ? 'w-12 h-12' : 'w-8 h-8'
                    }`}>
                      {project.imageDataUrl ? (
                        <img
                          src={project.imageDataUrl}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Smartphone className={`text-gray-400 ${viewMode === 'grid' ? 'w-6 h-6' : 'w-4 h-4'}`} />
                      )}
                    </div>

                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-start justify-between ${viewMode === 'list' ? 'items-center' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <h6 className={`font-medium text-gray-900 truncate ${viewMode === 'grid' ? 'text-sm' : 'text-xs'}`}>
                            {project.name}
                          </h6>

                          <div className={`flex items-center gap-3 text-xs text-gray-500 ${
                            viewMode === 'grid' ? 'mt-2' : 'mt-1'
                          }`}>
                            <div className="flex items-center gap-1">
                              <Smartphone className="w-3 h-3" />
                              {formatDeviceName(project.deviceConfig.selectedDevice)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(project.updatedAt)}
                            </div>
                            {project.imageDataUrl && (
                              <div className="flex items-center gap-1">
                                <Image className="w-3 h-3" />
                                Image
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadProject(project)}
                            className="h-7 w-7 p-0"
                            title="Load Project"
                          >
                            <FolderOpen className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateProject(project)}
                            className="h-7 w-7 p-0"
                            title="Duplicate"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => exportProject(project)}
                            className="h-7 w-7 p-0"
                            title="Export"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteProject(project.id)}
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer Actions & Stats */}
      {projects.length > 0 && (
        <div className="pt-3 border-t border-gray-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span>
                {filteredProjects.length} of {projects.length} project{projects.length === 1 ? '' : 's'}
              </span>
              {filterBy !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  {filterBy === 'today' ? 'Today' : 
                   filterBy === 'week' ? 'This Week' : 'This Month'}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.json';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        try {
                          const projectData = e.target?.result as string;
                          const projectId = storageManager.importProject(projectData);
                          if (projectId) {
                            loadProjects();
                            alert('Project imported successfully!');
                          } else {
                            alert('Failed to import project');
                          }
                        } catch {
                          alert('Invalid project file');
                        }
                      };
                      reader.readAsText(file);
                    }
                  };
                  input.click();
                }}
                className="h-6 px-2 text-xs"
              >
                <Upload className="w-3 h-3 mr-1" />
                Import
              </Button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-gray-50 rounded-md p-2 text-center">
              <div className="font-medium text-gray-900">{projects.filter(p => p.imageDataUrl).length}</div>
              <div className="text-gray-500">With Images</div>
            </div>
            <div className="bg-gray-50 rounded-md p-2 text-center">
              <div className="font-medium text-gray-900">
                {new Set(projects.map(p => p.deviceConfig.selectedDevice)).size}
              </div>
              <div className="text-gray-500">Devices</div>
            </div>
            <div className="bg-gray-50 rounded-md p-2 text-center">
              <div className="font-medium text-gray-900">
                {projects.filter(p => p.updatedAt > Date.now() - 7 * 24 * 60 * 60 * 1000).length}
              </div>
              <div className="text-gray-500">This Week</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};