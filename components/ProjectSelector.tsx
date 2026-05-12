'use client';

import React, { useState } from 'react';
import { useProject } from '@/lib/project-context';
import { ChevronDown, Plus } from 'lucide-react';

export function ProjectSelector() {
  const { currentProject, projects, setCurrentProject, createProject } = useProject();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      await createProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  if (!currentProject) {
    return (
      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
        No project selected
      </div>
    );
  }

  return (
    <div className="relative mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <div className="text-left">
          <p className="text-xs text-gray-500 dark:text-gray-400">Proyecto:</p>
          <p className="font-semibold text-sm text-gray-900 dark:text-white">
            {currentProject.name}
          </p>
        </div>
        <ChevronDown size={16} className={`transition ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Lista de proyectos */}
          <div className="max-h-48 overflow-y-auto">
            {projects.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">
                No projects yet
              </div>
            ) : (
              projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => {
                    setCurrentProject(project);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition ${
                    project.id === currentProject.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {project.name}
                </button>
              ))
            )}
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200 dark:border-gray-700" />

          {/* Crear nuevo proyecto */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Plus size={16} />
              New Project
            </button>
          ) : (
            <div className="p-3 space-y-2">
              <input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') setIsCreating(false);
                }}
                autoFocus
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateProject}
                  className="flex-1 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 px-2 py-1 text-sm bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
