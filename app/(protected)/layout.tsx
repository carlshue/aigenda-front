import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ChatProvider } from "@/lib/chat-context";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <ChatProvider>
        <div style={{ display: "flex", height: "100%" }}>
          <Sidebar />
          <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {children}
          </main>
        </div>
      </ChatProvider>
    </ProtectedRoute>
  );
}
