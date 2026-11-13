import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PageHeader,
  Panel,
  StatCard,
  StatusBadge,
  StageLabel,
  EmptyState,
  fmtDate,
} from "@/components/shared";
import { useStore } from "@/context/AppStore";
import { categoryName } from "@/lib/sallihha";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/admin/")({
  head: () =>
    pageHead("Platform Activity", "Read-only overview of repair activity across Sallihha."),
  component: Activity,
});

/** FR-AD6 — read-only; no editing here. */
function Activity() {
  const { state } = useStore();
  const [status, setStatus] = useState("all");
  const [cat, setCat] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const list = state.requests
    .filter(
      (r) => (status === "all" || r.status === status) && (cat === "all" || r.categoryId === cat),
    )
    .filter(
      (r) => (!from || r.createdAt.slice(0, 10) >= from) && (!to || r.createdAt.slice(0, 10) <= to),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const count = (f) => list.filter(f).length;
  const outcomes = ["Completed", "Returned to Customer", "Donated", "Reused for Parts", "Recycled"];

  return (
    <>
      <PageHeader
        eyebrow="Read-only"
        title="Platform repair activity"
        description="Monitor requests, statuses and outcomes across the platform."
      />
      <Panel className="mb-6">
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {["Awaiting Offers", "In Progress", "Closed"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {state.categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="from">From</Label>
            <Input
              id="from"
              type="date"
              className="mt-1.5"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="to">To</Label>
            <Input
              id="to"
              type="date"
              className="mt-1.5"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
      </Panel>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Requests" value={list.length} />
        <StatCard label="Awaiting offers" value={count((r) => r.status === "Awaiting Offers")} />
        <StatCard label="In progress" value={count((r) => r.status === "In Progress")} />
        <StatCard label="Closed" value={count((r) => r.status === "Closed")} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Repair outcomes">
          {outcomes.map((o) => {
            const n = count((r) => r.outcome === o);
            const total = count((r) => !!r.outcome) || 1;
            return (
              <div key={o} className="mb-3">
                <div className="flex justify-between text-sm">
                  <span>{o}</span>
                  <span className="font-semibold">{n}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${(n / total) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </Panel>
        <Panel title="By device category">
          {state.categories.map((c) => {
            const n = count((r) => r.categoryId === c.id);
            return (
              <div key={c.id} className="mb-3">
                <div className="flex justify-between text-sm">
                  <span>{c.name}</span>
                  <span className="font-semibold">{n}</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-navy"
                    style={{ width: `${(n / (list.length || 1)) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </Panel>
      </div>
      <Panel className="mt-6" title="Repair requests">
        {list.length === 0 ? (
          <EmptyState title="No requests match these filters" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-2">Request</th>
                  <th className="p-2">Category</th>
                  <th className="hidden p-2 md:table-cell">Posted</th>
                  <th className="p-2">Status</th>
                  <th className="hidden p-2 sm:table-cell">Current Stage / Outcome</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => (
                  <tr key={r.id} className="border-t">
                    <td className="p-2">
                      <span className="font-semibold">{r.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {r.id}
                        {r.removed && " · removed"}
                      </span>
                    </td>
                    <td className="p-2">{categoryName(state, r.categoryId)}</td>
                    <td className="hidden p-2 md:table-cell">{fmtDate(r.createdAt)}</td>
                    <td className="p-2">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="hidden p-2 sm:table-cell">
                      {r.outcome ? (
                        <StatusBadge status={r.outcome} />
                      ) : r.stage ? (
                        <StageLabel stage={r.stage} />
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
