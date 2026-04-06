import ChatterShell from "@/components/ChatterShell/ChatterShell";
import RequireAuth from "@/components/RequireAuth/RequireAuth";

export default function ChatLayout({ children }) {
  return (
    <RequireAuth>
      <ChatterShell>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {children}
        </div>
      </ChatterShell>
    </RequireAuth>
  );
}
