import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader, StatusBadge, EmptyState, DeviceIcon, fmtDate } from "@/components/shared";
import { useStore } from "@/context/AppStore";
import { categoryName } from "@/lib/sallihha";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/customer/history")({
  head: () => pageHead("Repair History", "Your closed repair requests and their final outcomes."),
  component: History,
});

/** FR-C6 — closed requests with search + filters. */
function History() {
  const { state, currentUser } = useStore();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [outcome, setOutcome] = useState("all");
  const [period, setPeriod] = useState("all");
  const closed = state.requests.filter(
    (r) => r.customerId === currentUser.id && r.status === "Closed",
  );
  const cutoff = period === "all" ? 0 : Date.now() - Number(period) * 86400000;
  const list = closed
    .filter(
      (r) =>
        (cat === "all" || r.categoryId === cat) && (outcome === "all" || r.outcome === outcome),
    )
    .filter((r) => new Date(r.closedAt ?? r.createdAt).getTime() >= cutoff)
    .filter(
      (r) => !q || `${r.title} ${r.deviceModel} ${r.id}`.toLowerCase().includes(q.toLowerCase()),
    )
    .sort((a, b) => (b.closedAt ?? "").localeCompare(a.closedAt ?? ""));

  return (
    <>
      <PageHeader title="Repair History" description="Closed requests and their final outcomes." />
      <div className="mb-4 grid gap-2 sm:grid-cols-4">
        <div className="relative sm:col-span-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            className="pl-9"
            placeholder="Search device or title"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search history"
          />
        </div>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger aria-label="Device type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All device types</SelectItem>
            {state.categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={outcome} onValueChange={setOutcome}>
          <SelectTrigger aria-label="Outcome">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All outcomes</SelectItem>
            {["Completed", "Returned to Customer", "Donated", "Reused for Parts", "Recycled"].map(
              (o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger aria-label="Date">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any date</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {closed.length === 0 ? (
        <EmptyState title="No repair history yet" description="Closed repairs will appear here." />
      ) : list.length === 0 ? (
        <EmptyState title="No matching repairs" description="Try changing the filters." />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Device</th>
                <th className="hidden p-3 md:table-cell">Provider</th>
                <th className="hidden p-3 sm:table-cell">Closed</th>
                <th className="p-3">Outcome</th>
                <th className="hidden p-3 md:table-cell">Review</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const c = categoryName(state, r.categoryId);
                const reviewed = state.reviews.some((v) => v.requestId === r.id);
                return (
                  <tr key={r.id} className="border-t hover:bg-muted/50">
                    <td className="p-3">
                      <Link
                        to="/customer/requests/$id"
                        params={{ id: r.id }}
                        className="flex items-center gap-3"
                      >
                        <DeviceIcon category={c} className="h-5 w-5 shrink-0 text-primary" />
                        <span>
                          <span className="block font-semibold hover:text-primary">{r.title}</span>
                          <span className="block text-xs text-muted-foreground">
                            {r.deviceModel || c} · {r.id}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="hidden p-3 md:table-cell">
                      {state.users.find((u) => u.id === r.assignedFreelancerId)?.name}
                    </td>
                    <td className="hidden p-3 sm:table-cell">{fmtDate(r.closedAt)}</td>
                    <td className="p-3">
                      <StatusBadge status={r.outcome} />
                    </td>
                    <td className="hidden p-3 md:table-cell">
                      {r.outcome !== "Completed" ? (
                        <span className="text-xs text-muted-foreground">Not eligible</span>
                      ) : reviewed ? (
                        <span className="text-xs text-success">Reviewed</span>
                      ) : (
                        <Link
                          to="/customer/requests/$id"
                          params={{ id: r.id }}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          Leave a review
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
