import AuthenticatedLayoutGate from "@/components/AuthenticatedLayoutGate/AuthenticatedLayoutGate";

export default function ProfileLayout({ children }) {
  return <AuthenticatedLayoutGate>{children}</AuthenticatedLayoutGate>;
}
