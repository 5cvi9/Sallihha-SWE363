import { createFileRoute } from "@tanstack/react-router";
import { RoleLayout } from "@/components/layout/AppShell";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return <RoleLayout role="admin" />;
}

