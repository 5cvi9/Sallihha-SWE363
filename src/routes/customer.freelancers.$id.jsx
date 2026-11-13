import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PageHeader,
  Panel,
  EmptyState,
  RatingLine,
  Stars,
  StatusBadge,
  fmtDate,
  initials,
} from "@/components/shared";
import { BackLink } from "@/components/layout/AppShell";
import { ReportButton } from "@/components/ReportDialog";
import { useStore } from "@/context/AppStore";
import { categoryName, freelancerRating } from "@/lib/sallihha";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/customer/freelancers/$id")({
  validateSearch: (s) => ({ from: typeof s["from"] === "string" ? s["from"] : undefined }),
  head: () =>
    pageHead(
      "Repair provider profile",
      "Public profile, services and reviews of a Sallihha repair provider.",
    ),
  component: FreelancerProfile,
});

/** FR-C3 — public freelancer profile (no private data). */
function FreelancerProfile() {
  const { id } = Route.useParams();
  const { from } = Route.useSearch();
  const { state } = useStore();
  const f = state.users.find((u) => u.id === id && u.role === "freelancer");
  const back = from ? (
    <Link
      to="/customer/requests/$id"
      params={{ id: from }}
      className="mb-3 inline-flex text-sm font-medium text-primary hover:underline"
    >
      ← Back to offers
    </Link>
  ) : (
    <BackLink to="/customer/requests">My Repair Requests</BackLink>
  );

  if (!f || f.status !== "Active")
    return (
      <>
        {back}
        <EmptyState
          title="Profile unavailable"
          description="This repair provider's profile is not available right now (the account may be suspended)."
        />
      </>
    );

  const rating = freelancerRating(state, f.id);
  const reviews = state.reviews.filter((r) => r.freelancerId === f.id);
  const completed = state.requests.filter(
    (r) => r.assignedFreelancerId === f.id && r.status === "Closed",
  ).length;

  return (
    <>
      {back}
      <PageHeader
        eyebrow="Repair provider"
        title={f.name}
        actions={
          <ReportButton
            targetType="user"
            targetId={f.id}
            targetLabel={`${f.name} (freelancer profile)`}
          />
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="self-start">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-navy text-2xl font-bold text-navy-foreground">
              {initials(f.name)}
            </span>
            <p className="mt-3 text-lg font-bold">{f.name}</p>
            <div className="mt-1">
              <RatingLine {...rating} />
            </div>
          </div>
          <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
            {f.city && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden />
                {f.city}
              </div>
            )}
            {f.yearsExperience && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" aria-hidden />
                {f.yearsExperience} years experience
              </div>
            )}
            <div className="text-muted-foreground">
              Member since {fmtDate(f.joinedAt)} · {completed} closed repairs
            </div>
          </dl>
        </Panel>
        <div className="space-y-6 lg:col-span-2">
          <Panel title="About">
            <p className="text-sm text-muted-foreground">
              {f.bio || "This provider hasn't added a bio yet."}
            </p>
            <p className="mt-4 text-sm font-semibold">Repair categories</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(f.categoryIds ?? []).map((c) => (
                <StatusBadge key={c} status={categoryName(state, c)} tone="teal" />
              ))}
            </div>
          </Panel>
          <Panel title="Rating summary">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="text-center sm:w-32">
                <p className="text-4xl font-extrabold">
                  {rating.count ? rating.average.toFixed(1) : "—"}
                </p>
                <Stars value={rating.average} />
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on {rating.count} review{rating.count === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((n) => {
                  const c = reviews.filter((r) => r.rating === n).length;
                  return (
                    <div key={n} className="flex items-center gap-2 text-xs">
                      <span className="w-8 text-muted-foreground">{n} ★</span>
                      <div className="h-2 flex-1 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-star"
                          style={{ width: `${reviews.length ? (c / reviews.length) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="w-4 text-right text-muted-foreground">{c}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Panel>
          <Panel title={`Customer reviews (${reviews.length})`}>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <ul className="divide-y">
                {reviews.map((r) => (
                  <li key={r.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <Stars value={r.rating} />
                      <span className="text-xs text-muted-foreground">{fmtDate(r.createdAt)}</span>
                    </div>
                    {r.text && <p className="mt-1 text-sm">{r.text}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      — {state.users.find((u) => u.id === r.customerId)?.name.split(" ")[0]}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          {from && (
            <Button variant="outline" asChild>
              <Link to="/customer/requests/$id" params={{ id: from }}>
                Return to offers list
              </Link>
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
