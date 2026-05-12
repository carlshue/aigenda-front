import ProjectView from "@/components/ProjectView";
import { use } from "react";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProjectView projectId={id} />;
}
