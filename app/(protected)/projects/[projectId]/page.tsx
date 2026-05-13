'use client';

import { use } from 'react';
import ProjectView from '@/components/ProjectView';

export default function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  return <ProjectView projectId={projectId} />;
}
