import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, StatusBadge, RatingLine, Stars, initials } from "@/components/shared";
import { useStore } from "@/context/AppStore";
import { categoryName, freelancerRating } from "@/lib/sallihha";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/admin/freelancers")({
  head: () =>
    pageHead("Freelancer Profiles", "Review freelance repair provider profiles and services."),
  component: Freelancers,
});

/** FR-AD2 — no passwords or credentials are exposed. */
function Freelancers() {
  const { state } = useStore();
  const [open, setOpen] = useState(null);
  const list = state.users.filter((u) => u.role === "freelancer");
  const reportsAbout = (id) =>
    state.reports.filter((r) => r.targetId === id && r.status !== "Resolved").length;

  return (
    <>
      <PageHeader
        title="Freelancer Profiles & Services"
        description="Profile information, offered categories and public ratings."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((f) => (
          <div key={f.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-xs font-bold text-navy-foreground">
                {initials(f.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{f.name}</p>
                <RatingLine {...freelancerRating(state, f.id)} />
              </div>
              <StatusBadge status={f.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(f.categoryIds ?? []).map((c) => (
                <StatusBadge key={c} status={categoryName(state, c)} tone="teal" />
              ))}
            </div>
            {reportsAbout(f.id) > 0 && (
              <p className="mt-3 text-xs font-semibold text-destructive">
                {reportsAbout(f.id)} open report(s)
              </p>
            )}
            <Button size="sm" variant="outline" className="mt-4 w-full" onClick={() => setOpen(f)}>
              View profile
            </Button>
          </div>
        ))}
      </div>
      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{open?.name}</DialogTitle>
          </DialogHeader>
          {open && (
            <div className="space-y-3 text-sm">
              <p className="text-muted-foreground">{open.bio || "No bio."}</p>
              <p>
                {open.city} · {open.email} · {open.phone}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(open.categoryIds ?? []).map((c) => (
                  <StatusBadge key={c} status={categoryName(state, c)} tone="teal" />
                ))}
              </div>
              <p className="font-semibold">Reviews</p>
              {state.reviews
                .filter((r) => r.freelancerId === open.id)
                .map((r) => (
                  <div key={r.id} className="rounded-lg bg-muted p-2">
                    <Stars value={r.rating} /> <span>{r.text}</span>
                  </div>
                ))}
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" asChild>
                  <Link to="/admin/reports">Moderation queue</Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/admin/users">Manage account</Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
