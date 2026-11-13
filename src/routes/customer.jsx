import { createFileRoute } from "@tanstack/react-router";
import { RoleLayout } from "@/components/layout/AppShell";

export const Route = createFileRoute("/customer")({
  component: CustomerLayout,
});

function CustomerLayout() {
  return <RoleLayout role="customer" />;
}
