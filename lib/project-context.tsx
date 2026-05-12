'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  loading: boolean;
  setCurrentProject: (project: Project) => void;
  createProject: (name: string, description?: string) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Cargar usuario y proyectos al montar
  useEffect(() => {
    const storedUserId = localStorage.getItem('genda:currentUser');
    if (storedUserId) {
      setUserId(storedUserId);
      refreshProjects(storedUserId);
    } else {
      setLoading(false);
    }
  }, []);

  // Restaurar proyecto actual del localStorage
  useEffect(() => {
    if (userId && projects.length > 0) {
      const storedProjectId = localStorage.getItem(`genda:${userId}:currentProject`);
      if (storedProjectId) {
        const project = projects.find(p => p.id === storedProjectId);
        if (project) {
          setCurrentProjectState(project);
        } else {
          // Si no existe, usar el primero
          setCurrentProjectState(projects[0]);
          localStorage.setItem(`genda:${userId}:currentProject`, projects[0].id);
        }
      } else {
        // Primer acceso, seleccionar primer proyecto
        setCurrentProjectState(projects[0]);
        localStorage.setItem(`genda:${userId}:currentProject`, projects[0].id);
      }
    }
  }, [userId, projects]);

  async function refreshProjects(uid: string) {
    if (!uid) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/projects/?user_id=${uid}`
      );
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  }

  const setCurrentProject = (project: Project) => {
    setCurrentProjectState(project);
    if (userId) {
      localStorage.setItem(`genda:${userId}:currentProject`, project.id);
    }
  };

  const createProject = async (name: string, description?: string): Promise<Project> => {
    if (!userId) throw new Error('No user logged in');

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/?user_id=${userId}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    const newProject = await response.json();
    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    return newProject;
  };

  const deleteProject = async (projectId: string) => {
    if (!userId) throw new Error('No user logged in');

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/projects/${projectId}?user_id=${userId}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }

    const updated = projects.filter(p => p.id !== projectId);
    setProjects(updated);

    if (currentProject?.id === projectId && updated.length > 0) {
      setCurrentProject(updated[0]);
    } else {
      setCurrentProjectState(null);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        loading,
        setCurrentProject,
        createProject,
        deleteProject,
        refreshProjects: () => userId ? refreshProjects(userId) : Promise.resolve(),
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject debe usarse dentro de ProjectProvider');
  }
  return context;
}
