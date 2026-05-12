import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ChatProvider } from "@/lib/chat-context";
import { ProjectProvider } from "@/lib/project-context";

export default function ProjectLayout({ children, params }: { children: React.ReactNode; params: { projectId: string } }) {
  return (
    <ProtectedRoute>
      <ProjectProvider>
        <ChatProvider>
          <div style={{ display: "flex", height: "100%" }}>
            <Sidebar />
            <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {children}
            </main>
          </div>
        </ChatProvider>
      </ProjectProvider>
    </ProtectedRoute>
  );
}
