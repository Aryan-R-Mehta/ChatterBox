import ChatWorkspaceLayout from "@/components/ChatWorkspaceLayout/ChatWorkspaceLayout";
import AuthenticatedLayoutGate from "@/components/AuthenticatedLayoutGate/AuthenticatedLayoutGate";

export default function ChatLayout({ children }) {
  return (
    <AuthenticatedLayoutGate>
      <ChatWorkspaceLayout>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {children}
        </div>
      </ChatWorkspaceLayout>
    </AuthenticatedLayoutGate>
  );
}
