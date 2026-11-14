
import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, Clock, Wrench, CheckCircle2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  StatCard,
  Panel,
  StatusBadge,
  StageLabel,
  EmptyState,
  DeviceIcon,
  ago,
} from "@/components/shared";
import { useStore } from "@/context/AppStore";
import { categoryName } from "@/lib/sallihha";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/customer/")({
  head: () =>
    pageHead(
      "Customer dashboard",
      "Overview of your repair requests, offers and repairs in progress.",
    ),
  component: CustomerDashboard,
});

function CustomerDashboard() {
  const { state, currentUser } = useStore();

  // Get customer's requests
  const mine = state.requests.filter(
    (r) => r.customerId === currentUser.id
  );

  // Group requests by status
  const awaiting = mine.filter(
    (r) => r.status === "Awaiting Offers"
  );

  const inProgress = mine.filter(
    (r) => r.status === "In Progress"
  );

  const decision = mine.filter(
    (r) => r.status === "Awaiting Customer Decision"
  );

  const closed = mine.filter(
    (r) => r.status === "Closed"
  );

  // Count pending offers
  const pendingOffers = state.offers.filter(
    (o) =>
      o.status === "Pending" &&
      awaiting.some((r) => r.id === o.requestId)
  ).length;

  const active = [
    ...decision,
    ...inProgress,
    ...awaiting,
  ];

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={`Hello, ${currentUser.name.split(" ")[0]}`}
        description="Here's what's happening with your devices."
        actions={
          <Button asChild>
            <Link to="/customer/requests/new">
              <PlusCircle className="h-4 w-4" aria-hidden />
              New repair request
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Awaiting offers"
          value={awaiting.length}
          icon={<Clock className="h-4 w-4" />}
        />

        <StatCard
          label="New offers"
          value={pendingOffers}
          hint="Waiting for your decision"
          icon={<ClipboardList className="h-4 w-4" />}
        />

        <StatCard
          label="In progress"
          value={inProgress.length}
          icon={<Wrench className="h-4 w-4" />}
        />

        <StatCard
          label="Closed"
          value={closed.length}
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
      </div>

      <Panel
        className="mt-6"
        title="Active requests"
        action={
          <Link
            to="/customer/requests"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        }
      >
        {active.length === 0 ? (
          <EmptyState
            title="No active requests"
            description="Post a repair request to start receiving offers."
            action={
              <Button asChild>
                <Link to="/customer/requests/new">
                  New repair request
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y">
            {active.map((r) => {
              const offers = state.offers.filter(
                (o) =>
                  o.requestId === r.id &&
                  o.status === "Pending"
              ).length;

              const cat = categoryName(
                state,
                r.categoryId
              );

              return (
                <li key={r.id}>
                  <Link
                    to="/customer/requests/$id"
                    params={{ id: r.id }}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg px-2 py-3 hover:bg-muted"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                      <DeviceIcon
                        category={cat}
                        className="h-5 w-5"
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">
                        {r.title}
                      </span>

                      <span className="block text-xs text-muted-foreground">
                        {r.id} · {cat} · posted {ago(r.createdAt)}
                      </span>
                    </span>

                    <span className="ml-auto flex w-full items-center justify-between gap-2 sm:w-auto sm:flex-col sm:items-end">
                      {r.status === "In Progress" ? (
                        <StageLabel stage={r.stage} />
                      ) : r.status === "Awaiting Customer Decision" ? (
                        <span className="text-xs font-semibold text-warning">
                          Choose outcome
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {offers} offer{offers === 1 ? "" : "s"}
                        </span>
                      )}

                      <StatusBadge status={r.status} />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}
