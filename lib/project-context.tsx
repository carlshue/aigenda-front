"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Project } from "./api";
import { listProjects, createProject as apiCreateProject, deleteProject as apiDeleteProject } from "./api";
import { getCurrentUser } from "./auth";

interface ProjectContextValue {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (p: Project | null) => void;
  loading: boolean;
  refresh: () => Promise<void>;
  createProject: (name: string, description?: string) => Promise<Project>;
  deleteProject: (id: string, cascade?: boolean) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const user = getCurrentUser();
    if (!user) return;
    setLoading(true);
    try {
      const data = await listProjects();
      setProjects(data);
      // Si el proyecto activo fue borrado/archivado, limpiar
      if (currentProject && !data.find((p) => p.id === currentProject.id)) {
        setCurrentProject(null);
      }
    } catch (e) {
      console.error("[projects] Error loading:", e);
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  useEffect(() => {
    refresh();
  }, []);

  async function createProject(name: string, description?: string): Promise<Project> {
    const project = await apiCreateProject(name, description);
    await refresh();
    return project;
  }

  async function deleteProject(id: string, cascade = false): Promise<void> {
    await apiDeleteProject(id, cascade);
    if (currentProject?.id === id) setCurrentProject(null);
    await refresh();
  }

  return (
    <ProjectContext.Provider
      value={{ projects, currentProject, setCurrentProject, loading, refresh, createProject, deleteProject }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used inside ProjectProvider");
  return ctx;
}
