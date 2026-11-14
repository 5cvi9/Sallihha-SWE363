import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
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

export const Route = createFileRoute("/customer/requests/")({
  head: () => pageHead("My Repair Requests", "All repair requests you have posted on Sallihha."),
  component: MyRequests,
});

function MyRequests() {
  const { state, currentUser } = useStore();
  const [tab, setTab] = useState("all");
  const mine = state.requests.filter((r) => r.customerId === currentUser.id);
  const list = mine.filter((r) => tab === "all" || r.status === tab);

  return (
    <>
      <PageHeader
        title="My Repair Requests"
        description="Open a request to compare offers or track its progress."
        actions={
          <Button asChild>
            <Link to="/customer/requests/new">
              <PlusCircle className="h-4 w-4" aria-hidden /> New request
            </Link>
          </Button>
        }
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v)} className="mb-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="all">All ({mine.length})</TabsTrigger>
          <TabsTrigger value="Awaiting Offers">Awaiting Offers</TabsTrigger>
          <TabsTrigger value="In Progress">In Progress</TabsTrigger>
          <TabsTrigger value="Closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>
      {list.length === 0 ? (
        <EmptyState
          title="No requests here"
          description="Requests you post will appear in this list."
          action={
            <Button asChild>
              <Link to="/customer/requests/new">Post a repair request</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => {
            const cat = categoryName(state, r.categoryId);
            const offers = state.offers.filter(
              (o) => o.requestId === r.id && o.status !== "Withdrawn",
            ).length;
            return (
              <Link
                key={r.id}
                to="/customer/requests/$id"
                params={{ id: r.id }}
                className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative flex h-28 items-center justify-center bg-primary-soft text-primary">
                  {r.photos[0] ? (
                    <img src={r.photos[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <DeviceIcon category={cat} className="h-9 w-9" />
                  )}
                  <span className="absolute right-2 top-2">
                    <StatusBadge status={r.removed ? "Removed" : r.status} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <p className="eyebrow">
                    {cat} · {r.id}
                  </p>
                  <p className="mt-1 font-semibold group-hover:text-primary">{r.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted-foreground">
                    <span>{fmtDate(r.createdAt)}</span>
                    <span>
                      {r.status === "In Progress" ? (
                        <StageLabel stage={r.stage} />
                      ) : r.status === "Awaiting Customer Decision" ? (
                        <span className="font-semibold text-warning">Decision needed</span>
                      ) : r.status === "Closed" ? (
                        r.outcome
                      ) : (
                        `${offers} offer${offers === 1 ? "" : "s"}`
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
