
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Search, Send, Wrench, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  StatCard,
  Panel,
  StageLabel,
  EmptyState,
  DeviceIcon,
} from "@/components/shared";
import { useStore } from "@/context/AppStore";
import {
  categoryName,
  freelancerRating,
  relevantRequests,
} from "@/lib/sallihha";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/freelancer/")({
  head: () =>
    pageHead(
      "Repair provider dashboard",
      "Your matching requests, offers and assigned repairs."
    ),
  component: FreelancerDashboard,
});

function FreelancerDashboard() {
  const { state, currentUser, hydrated } = useStore();

  // Wait until the session has been restored.
  if (!hydrated) {
    return <div role="status">Loading your workspace…</div>;
  }

  // Only authenticated freelancers can access this dashboard.
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser.role !== "freelancer") {
    return <Navigate to={`/${currentUser.role}`} replace />;
  }

  const me = currentUser;

  const available = relevantRequests(state, me.id);

  const pending = state.offers.filter(
    (o) =>
      o.freelancerId === me.id &&
      o.status === "Pending"
  );

  const active = state.requests.filter(
    (r) =>
      r.assignedFreelancerId === me.id &&
      (r.status === "In Progress" ||
        r.status === "Awaiting Customer Decision")
  );

  const rating = freelancerRating(state, me.id);

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome, ${me.name.split(" ")[0]}`}
        actions={
          <Button asChild>
            <Link to="/freelancer/requests">
              <Search className="h-4 w-4" aria-hidden />
              Browse requests
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Matching requests"
          value={available.length}
          icon={<Search className="h-4 w-4" />}
        />

        <StatCard
          label="Pending offers"
          value={pending.length}
          icon={<Send className="h-4 w-4" />}
        />

        <StatCard
          label="Active repairs"
          value={active.length}
          icon={<Wrench className="h-4 w-4" />}
        />

        <StatCard
          label="Rating"
          value={rating.count ? rating.average.toFixed(1) : "—"}
          hint={`${rating.count} reviews`}
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      <Panel
        className="mt-6"
        title="Repairs in progress"
        action={
          <Link
            to="/freelancer/repairs"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        }
      >
        {active.length === 0 ? (
          <EmptyState
            title="No active repairs"
            description="When a customer accepts your offer, the repair appears here."
          />
        ) : (
          <ul className="divide-y">
            {active.map((r) => (
              <li key={r.id}>
                <Link
                  to="/freelancer/repairs/$id"
                  params={{ id: r.id }}
                  className="flex items-center gap-4 rounded-lg px-2 py-3 hover:bg-muted"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <DeviceIcon
                      category={categoryName(state, r.categoryId)}
                      className="h-5 w-5"
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {r.title}
                    </span>

                    <span className="block text-xs text-muted-foreground">
                      {r.id} ·{" "}
                      {state.users.find(
                        (u) => u.id === r.customerId
                      )?.name}
                    </span>
                  </span>

                  {r.status === "In Progress" ? (
                    <StageLabel stage={r.stage} />
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Customer is choosing the outcome
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
