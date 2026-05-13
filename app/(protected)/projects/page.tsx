'use client';

import { useProject } from '@/lib/project-context';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function ProjectsPage() {
  const { projects, currentProject, createProject, deleteProject, setCurrentProject } = useProject();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreateProject = async () => {
    if (!newName.trim()) return;
    try {
      const project = await createProject(newName.trim(), newDescription.trim() || undefined);
      setNewName('');
      setNewDescription('');
      setIsCreating(false);
      setCurrentProject(project);
      router.push(`/projects/${project.id}/chat`);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('¿Está seguro? Se eliminarán todos los datos del proyecto.')) return;
    try {
      setDeleting(projectId);
      await deleteProject(projectId);
      if (currentProject?.id === projectId) {
        router.push('/projects');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleSelectProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      router.push(`/projects/${projectId}/chat`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
          Proyectos
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
          Gestiona tus proyectos y espacios de trabajo
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {/* Create Project Section */}
        <div style={{ marginBottom: 32 }}>
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '12px 16px',
                borderRadius: 8,
                border: '2px dashed var(--border)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }}
            >
              <Plus size={18} />
              Crear nuevo proyecto
            </button>
          ) : (
            <div style={{
              padding: 20,
              borderRadius: 8,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                Nuevo Proyecto
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input
                  type="text"
                  placeholder="Nombre del proyecto"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  }}
                />
                <textarea
                  placeholder="Descripción (opcional)"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                    minHeight: 80,
                    fontFamily: 'inherit',
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleCreateProject}
                    disabled={!newName.trim()}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      borderRadius: 6,
                      border: 'none',
                      background: newName.trim() ? 'var(--accent)' : 'var(--border)',
                      color: 'white',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: newName.trim() ? 'pointer' : 'not-allowed',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      if (newName.trim()) {
                        (e.currentTarget as HTMLElement).style.opacity = '0.9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = '1';
                    }}
                  >
                    Crear Proyecto
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewName('');
                      setNewDescription('');
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'var(--bg-surface)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)',
          }}>
            <p style={{ fontSize: 16, marginBottom: 16 }}>No hay proyectos aún</p>
            <p style={{ fontSize: 14 }}>Crea tu primer proyecto para empezar</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {projects.map(project => (
              <div
                key={project.id}
                style={{
                  padding: 16,
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--bg-elevated)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div
                  onClick={() => handleSelectProject(project.id)}
                  style={{ marginBottom: 12 }}
                >
                  <h3 style={{
                    margin: 0,
                    fontSize: 16,
                    fontWeight: 600,
                    color: project.id === currentProject?.id ? 'var(--accent)' : 'var(--text-primary)',
                  }}>
                    {project.name}
                    {project.id === currentProject?.id && ' ✓'}
                  </h3>
                  {project.description && (
                    <p style={{
                      margin: '8px 0 0',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4,
                    }}>
                      {project.description}
                    </p>
                  )}
                </div>

                <div style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  marginBottom: 12,
                  paddingBottom: 12,
                  borderBottom: '1px solid var(--border)',
                }}>
                  Creado: {new Date(project.created_at).toLocaleDateString()}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleSelectProject(project.id)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'var(--accent)',
                      color: 'white',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.opacity = '1';
                    }}
                  >
                    Abrir
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    disabled={deleting === project.id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      cursor: deleting === project.id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                      opacity: deleting === project.id ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (deleting !== project.id) {
                        (e.currentTarget as HTMLElement).style.borderColor = '#ef4444';
                        (e.currentTarget as HTMLElement).style.color = '#ef4444';
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
