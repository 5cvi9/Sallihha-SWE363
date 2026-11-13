import { createFileRoute } from "@tanstack/react-router";
import { RoleLayout } from "@/components/layout/AppShell";

export const Route = createFileRoute("/freelancer")({
  component: FreelancerLayout,
});

function FreelancerLayout() {
  return <RoleLayout role="freelancer" />;
}
