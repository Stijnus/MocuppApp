export interface StoredImageState {
  scale: number;
  rotation: number;
  left: number;
  top: number;
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  deviceId?: string;
  timestamp: number;
}

export interface StoredDeviceConfig {
  selectedDevice: string;
  viewAngle: string;
  perspective: string;
  orientation: string;
  timestamp: number;
}

export interface StoredProject {
  id: string;
  name: string;
  deviceConfig: StoredDeviceConfig;
  imageState?: StoredImageState;
  imageDataUrl?: string;
  createdAt: number;
  updatedAt: number;
}

class StorageManager {
  private readonly KEYS = {
    IMAGE_STATE: 'mocupp-image-state',
    DEVICE_CONFIG: 'mocupp-device-config',
    PROJECTS: 'mocupp-projects',
    CURRENT_PROJECT: 'mocupp-current-project',
  };

  // Image State Management
  saveImageState(state: Omit<StoredImageState, 'timestamp'>): void {
    const stateWithTimestamp: StoredImageState = {
      ...state,
      timestamp: Date.now(),
    };
    localStorage.setItem(this.KEYS.IMAGE_STATE, JSON.stringify(stateWithTimestamp));
  }

  loadImageState(): StoredImageState | null {
    const saved = localStorage.getItem(this.KEYS.IMAGE_STATE);
    return saved ? JSON.parse(saved) : null;
  }

  clearImageState(): void {
    localStorage.removeItem(this.KEYS.IMAGE_STATE);
  }

  // Device Configuration Management
  saveDeviceConfig(config: Omit<StoredDeviceConfig, 'timestamp'>): void {
    const configWithTimestamp: StoredDeviceConfig = {
      ...config,
      timestamp: Date.now(),
    };
    localStorage.setItem(this.KEYS.DEVICE_CONFIG, JSON.stringify(configWithTimestamp));
  }

  loadDeviceConfig(): StoredDeviceConfig | null {
    const saved = localStorage.getItem(this.KEYS.DEVICE_CONFIG);
    return saved ? JSON.parse(saved) : null;
  }

  clearDeviceConfig(): void {
    localStorage.removeItem(this.KEYS.DEVICE_CONFIG);
  }

  // Project Management
  saveProject(project: Omit<StoredProject, 'id' | 'createdAt' | 'updatedAt'>): string {
    const projects = this.loadProjects();
    const projectId = this.generateProjectId();
    const now = Date.now();

    const newProject: StoredProject = {
      ...project,
      id: projectId,
      createdAt: now,
      updatedAt: now,
    };

    projects.push(newProject);
    localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(projects));
    
    return projectId;
  }

  updateProject(projectId: string, updates: Partial<Omit<StoredProject, 'id' | 'createdAt'>>): boolean {
    const projects = this.loadProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);

    if (projectIndex === -1) return false;

    projects[projectIndex] = {
      ...projects[projectIndex],
      ...updates,
      updatedAt: Date.now(),
    };

    localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(projects));
    return true;
  }

  loadProjects(): StoredProject[] {
    const saved = localStorage.getItem(this.KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : [];
  }

  loadProject(projectId: string): StoredProject | null {
    const projects = this.loadProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  deleteProject(projectId: string): boolean {
    const projects = this.loadProjects();
    const filteredProjects = projects.filter(p => p.id !== projectId);
    
    if (filteredProjects.length === projects.length) return false;

    localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(filteredProjects));
    return true;
  }

  // Current Project Management
  setCurrentProject(projectId: string): void {
    localStorage.setItem(this.KEYS.CURRENT_PROJECT, projectId);
  }

  getCurrentProject(): string | null {
    return localStorage.getItem(this.KEYS.CURRENT_PROJECT);
  }

  clearCurrentProject(): void {
    localStorage.removeItem(this.KEYS.CURRENT_PROJECT);
  }

  // Utility Methods
  private generateProjectId(): string {
    return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  exportProject(projectId: string): string | null {
    const project = this.loadProject(projectId);
    return project ? JSON.stringify(project, null, 2) : null;
  }

  importProject(projectData: string): string | null {
    try {
      const project: StoredProject = JSON.parse(projectData);
      
      // Validate project structure
      if (!project.name || !project.deviceConfig) {
        throw new Error('Invalid project structure');
      }

      // Generate new ID and timestamps
      const projectId = this.generateProjectId();
      const now = Date.now();

      const importedProject: StoredProject = {
        ...project,
        id: projectId,
        createdAt: now,
        updatedAt: now,
      };

      const projects = this.loadProjects();
      projects.push(importedProject);
      localStorage.setItem(this.KEYS.PROJECTS, JSON.stringify(projects));

      return projectId;
    } catch (error) {
      console.error('Failed to import project:', error);
      return null;
    }
  }

  // Storage Statistics
  getStorageStats(): {
    totalProjects: number;
    storageUsed: number;
    lastActivity: number | null;
  } {
    const projects = this.loadProjects();
    const storageUsed = this.calculateStorageSize();
    const lastActivity = projects.length > 0 
      ? Math.max(...projects.map(p => p.updatedAt))
      : null;

    return {
      totalProjects: projects.length,
      storageUsed,
      lastActivity,
    };
  }

  private calculateStorageSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (key.startsWith('mocupp-')) {
        total += localStorage[key].length;
      }
    }
    return total;
  }

  // Clear all data
  clearAllData(): void {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

export const storageManager = new StorageManager(); 