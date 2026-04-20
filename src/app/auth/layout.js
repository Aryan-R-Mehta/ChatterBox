import GuestRouteGate from "@/components/GuestRouteGate/GuestRouteGate";

export default function AuthLayout({ children }) {
  return <GuestRouteGate>{children}</GuestRouteGate>;
}
