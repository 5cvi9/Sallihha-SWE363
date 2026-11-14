import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PageHeader,
  StatusBadge,
  StageLabel,
  EmptyState,
  DeviceIcon,
  fmtDate,
} from "@/components/shared";
import { useStore } from "@/context/AppStore";
import { categoryName } from "@/lib/sallihha";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/freelancer/repairs/")({
  head: () => pageHead("My Accepted Repairs", "Repairs assigned to you and their progress."),
  component: Repairs,
});

/** FR-F4 — repairs assigned to the logged-in provider. */
function Repairs() {
  const { state, currentUser } = useStore();
  const [tab, setTab] = useState("In Progress");
  const mine = state.requests.filter((r) => r.assignedFreelancerId === currentUser.id);
  const list = mine.filter((r) => r.status === tab);

  return (
    <>
      <PageHeader
        title="My Accepted Repairs"
        description="Update progress and record the final outcome for each repair."
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v)} className="mb-4">
        <TabsList>
          <TabsTrigger value="In Progress">
            In progress ({mine.filter((r) => r.status === "In Progress").length})
          </TabsTrigger>
          <TabsTrigger value="Awaiting Customer Decision">
            Awaiting decision (
            {mine.filter((r) => r.status === "Awaiting Customer Decision").length})
          </TabsTrigger>
          <TabsTrigger value="Closed">
            Closed ({mine.filter((r) => r.status === "Closed").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {list.length === 0 ? (
        <EmptyState
          title={
            tab === "In Progress"
              ? "No repairs in progress"
              : tab === "Awaiting Customer Decision"
                ? "Nothing waiting for a customer decision"
                : "No closed repairs yet"
          }
          description="Accepted offers become repairs here."
        />
      ) : (
        <div className="space-y-3">
          {list.map((r) => {
            const c = categoryName(state, r.categoryId);
            const customer = state.users.find((u) => u.id === r.customerId);
            return (
              <div
                key={r.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4 shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <DeviceIcon category={c} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{r.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.deviceModel || c} · {r.id} · Customer: {customer.name}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={r.status} />
                  {r.status === "In Progress" ? (
                    <StageLabel stage={r.stage} />
                  ) : r.status === "Awaiting Customer Decision" ? (
                    <span className="text-xs text-muted-foreground">
                      Customer chooses the final outcome
                    </span>
                  ) : (
                    <StatusBadge status={r.outcome} />
                  )}
                  {r.closedAt && (
                    <span className="text-xs text-muted-foreground">{fmtDate(r.closedAt)}</span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant={r.status === "In Progress" ? "default" : "outline"}
                  asChild
                >
                  <Link to="/freelancer/repairs/$id" params={{ id: r.id }}>
                    {r.status === "In Progress" ? "Manage repair" : "View"}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
