import RequireAuth from "@/components/RequireAuth/RequireAuth";

export default function ProfileLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
