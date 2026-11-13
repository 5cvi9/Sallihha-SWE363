import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Leaf, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  StatusBadge,
  EmptyState,
  RatingLine,
  PhotoStrip,
  Stars,
  FieldError,
  fmtDateTime,
  fmtDate,
  sar,
  ago,
  initials,
  StageLabel,
} from "@/components/shared";
import { BackLink } from "@/components/layout/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ReportButton } from "@/components/ReportDialog";
import { StageStepper, HistoryTimeline } from "@/components/ProgressTracker";
import { useStore } from "@/context/AppStore";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  acceptOffer,
  rejectOffer,
  submitReview,
  reviewEligibility,
  categoryName,
  chooseOutcome,
  CUSTOMER_OUTCOMES,
  freelancerRating,
} from "@/lib/sallihha";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customer/requests/$id")({
  head: ({ params }) =>
    pageHead(`Request ${params.id}`, "Repair request details, offers and progress."),
  component: RequestDetail,
});

function RequestDetail() {
  const { id } = Route.useParams();
  const { state, currentUser, run } = useStore();
  const req = state.requests.find((r) => r.id === id && r.customerId === currentUser.id);
  const [sort, setSort] = useState("price-asc");
  const [show, setShow] = useState("active");
  const [confirm, setConfirm] = useState(null);

  const offers = useMemo(() => {
    if (!req) return [];
    const list = state.offers.filter(
      (o) =>
        o.requestId === req.id &&
        o.status !== "Withdrawn" &&
        (show === "all" || o.status === "Pending" || o.status === "Accepted"),
    );
    const rating = (o) => freelancerRating(state, o.freelancerId).average;
    return [...list].sort((a, b) =>
      sort === "price-asc"
        ? a.price - b.price
        : sort === "price-desc"
          ? b.price - a.price
          : sort === "rating"
            ? rating(b) - rating(a)
            : b.createdAt.localeCompare(a.createdAt),
    );
  }, [state, req, sort, show]);

  // Ownership check — customers can only open their own requests (FR-C2 validation).
  if (!req)
    return (
      <EmptyState
        title="Request not found"
        description="This request doesn't exist or doesn't belong to your account."
        action={
          <Button asChild>
            <Link to="/customer/requests">Back to my requests</Link>
          </Button>
        }
      />
    );

  const cat = categoryName(state, req.categoryId);
  const freelancer = state.users.find((u) => u.id === req.assignedFreelancerId);
  const acceptedOffer = state.offers.find((o) => o.id === req.acceptedOfferId);

  const doConfirm = () => {
    if (!confirm) return;
    const res = run((s) =>
      (confirm.type === "accept" ? acceptOffer : rejectOffer)(s, currentUser.id, confirm.offer.id),
    );
    if (!res.ok) toast.error(res.error);
    else if (confirm.type === "accept")
      toast.success("Offer accepted", {
        description:
          "The request is now In Progress. The repair provider has been notified (simulated).",
      });
    else
      toast.success("Offer rejected", {
        description: "Your request is still open for other offers.",
      });
    setConfirm(null);
  };

  const confirmName = confirm
    ? state.users.find((u) => u.id === confirm.offer.freelancerId)?.name
    : "";
  const confirmRating = confirm ? freelancerRating(state, confirm.offer.freelancerId) : null;

  return (
    <>
      <BackLink to={req.status === "Closed" ? "/customer/history" : "/customer/requests"}>
        {req.status === "Closed" ? "Repair History" : "My Repair Requests"}
      </BackLink>
      <PageHeader
        eyebrow={`${cat} · ${req.id}`}
        title={req.title}
        description={`Posted ${fmtDateTime(req.createdAt)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={req.status} />
            {req.stage && req.status === "In Progress" && <StageLabel stage={req.stage} />}
            {req.outcome && <StatusBadge status={req.outcome} />}
          </div>
        }
      />
      {req.removed && (
        <p
          className="mb-4 rounded-lg border border-destructive/30 bg-danger-soft p-3 text-sm text-destructive"
          role="alert"
        >
          This request was removed by a moderator and is no longer visible to repair providers.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {req.status !== "Awaiting Offers" && (
            <Panel title="Repair progress">
              <StageStepper request={req} />
              {req.status === "Closed" && req.outcome && (
                <OutcomeBanner outcome={req.outcome} closedAt={req.closedAt} />
              )}
            </Panel>
          )}

          {req.status === "Awaiting Customer Decision" && <DecisionSection request={req} />}

          {req.status === "Awaiting Offers" ? (
            <Panel
              title={`Offers (${offers.length})`}
              action={
                <div className="flex flex-wrap gap-2">
                  <Select value={show} onValueChange={(v) => setShow(v)}>
                    <SelectTrigger className="h-8 w-32 text-xs" aria-label="Filter offers">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Pending only</SelectItem>
                      <SelectItem value="all">All offers</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sort} onValueChange={(v) => setSort(v)}>
                    <SelectTrigger className="h-8 w-40 text-xs" aria-label="Sort offers">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-asc">Price: low to high</SelectItem>
                      <SelectItem value="price-desc">Price: high to low</SelectItem>
                      <SelectItem value="rating">Highest rated</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
            >
              {offers.length === 0 ? (
                <EmptyState
                  title="No offers yet"
                  description="Repair providers offering this category will send offers soon. This list updates automatically."
                />
              ) : (
                <ul className="grid gap-3 md:grid-cols-2">
                  {offers.map((o) => {
                    const f = state.users.find((u) => u.id === o.freelancerId);
                    const r = freelancerRating(state, f.id);
                    return (
                      <li
                        key={o.id}
                        className={cn(
                          "flex flex-col rounded-xl border p-4",
                          o.status !== "Pending" && "bg-muted/50",
                        )}
                      >
                        <div className="flex flex-wrap items-start gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-xs font-bold text-navy-foreground">
                            {initials(f.name)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <Link
                              to="/customer/freelancers/$id"
                              params={{ id: f.id }}
                              search={{ from: req.id }}
                              className="font-semibold hover:text-primary hover:underline"
                            >
                              {f.name}
                            </Link>
                            <div>
                              <RatingLine {...r} />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">{sar(o.price)}</p>
                            <p className="text-xs text-muted-foreground">{ago(o.createdAt)}</p>
                          </div>
                        </div>
                        {o.note && <p className="mt-3 text-sm text-muted-foreground">{o.note}</p>}
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                          <StatusBadge status={o.status} />
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="ghost" asChild>
                              <Link
                                to="/customer/freelancers/$id"
                                params={{ id: f.id }}
                                search={{ from: req.id }}
                              >
                                View profile
                              </Link>
                            </Button>
                            <ReportButton
                              targetType="offer"
                              targetId={o.id}
                              targetLabel={`Offer ${o.id} on ${req.id}`}
                            />
                            {o.status === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setConfirm({ type: "reject", offer: o })}
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => setConfirm({ type: "accept", offer: o })}
                                >
                                  Accept offer
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          ) : (
            <Panel title="Status history">
              <HistoryTimeline request={req} />
            </Panel>
          )}

          {req.status === "Closed" && <ReviewSection requestId={req.id} />}
        </div>

        <div className="space-y-6">
          <Panel title="Request details">
            <PhotoStrip photos={req.photos} category={cat} />
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Category</dt>
                <dd className="font-medium">{cat}</dd>
              </div>
              {req.deviceModel && (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Device</dt>
                  <dd className="font-medium">{req.deviceModel}</dd>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <dt className="text-muted-foreground">Request status</dt>
                <dd>
                  <StatusBadge status={req.status} />
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed">{req.description}</p>
          </Panel>
          {freelancer && (
            <Panel title="Your repair provider">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-xs font-bold text-navy-foreground">
                  {initials(freelancer.name)}
                </span>
                <div>
                  <Link
                    to="/customer/freelancers/$id"
                    params={{ id: freelancer.id }}
                    search={{ from: req.id }}
                    className="font-semibold hover:underline"
                  >
                    {freelancer.name}
                  </Link>
                  <div>
                    <RatingLine {...freelancerRating(state, freelancer.id)} />
                  </div>
                </div>
              </div>
              {acceptedOffer && (
                <p className="mt-3 text-sm">
                  Agreed price: <strong>{sar(acceptedOffer.price)}</strong>
                </p>
              )}
              <p className="mt-1 text-sm text-muted-foreground">Contact: {freelancer.phone}</p>
              <div className="mt-3">
                <ReportButton
                  targetType="user"
                  targetId={freelancer.id}
                  targetLabel={`${freelancer.name} (freelancer profile)`}
                />
              </div>
            </Panel>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.type === "accept" ? `Accept ${confirmName}'s offer?` : "Reject this offer?"}
        description={
          confirm && (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted p-3 text-foreground">
                <span>
                  <span className="block font-semibold">{confirmName}</span>
                  {confirmRating && <RatingLine {...confirmRating} />}
                </span>
                <span className="font-bold">{sar(confirm.offer.price)}</span>
              </div>
              <p>
                {confirm.type === "accept"
                  ? "The request will move to In Progress, this provider will be assigned, and all other pending offers will be marked Not Selected."
                  : "Only this offer will be marked Rejected. Your request stays open for other offers."}
              </p>
            </div>
          )
        }
        confirmLabel={confirm?.type === "accept" ? "Confirm acceptance" : "Reject offer"}
        destructive={confirm?.type === "reject"}
        onConfirm={doConfirm}
      />
    </>
  );
}

/** FR-F6 (updated): the owning customer picks what happens to an unrepairable device. */
const DECISION_LABELS = {
  "Returned to Customer": "Return My Device",
  Donated: "Donate",
  "Reused for Parts": "Reuse for Parts",
  Recycled: "Recycle",
};
const DECISION_HINTS = {
  "Returned to Customer": "You keep the device as it is.",
  Donated: "The device is donated.",
  "Reused for Parts": "The device is reused for spare parts.",
  Recycled: "The device is recycled.",
};

function DecisionSection({ request }) {
  const { currentUser, run } = useStore();
  const [choice, setChoice] = useState("");
  const [err, setErr] = useState("");
  const [confirming, setConfirming] = useState(false);

  const ask = () => {
    if (!choice) {
      setErr("Choose one option.");
      return;
    }
    setErr("");
    setConfirming(true);
  };
  const confirm = () => {
    const res = run((s) => chooseOutcome(s, currentUser.id, request.id, choice));
    setConfirming(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Decision recorded", {
      description: "The request is closed and moved to your repair history.",
    });
  };

  return (
    <Panel title="Your decision is needed">
      <p
        className="rounded-lg border border-warning/25 bg-warning-soft p-3 text-sm font-medium text-warning"
        role="alert"
      >
        Your device could not be repaired. Please choose how you would like to proceed.
      </p>
      <RadioGroup
        value={choice}
        onValueChange={(v) => {
          setChoice(v);
          setErr("");
        }}
        className="mt-4 gap-3"
        aria-label="Device outcome options"
      >
        {CUSTOMER_OUTCOMES.map((o) => (
          <label key={o} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
            <RadioGroupItem value={o} />
            <span>
              <span className="block font-semibold">{DECISION_LABELS[o]}</span>
              <span className="text-xs text-muted-foreground">{DECISION_HINTS[o]}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
      <p className="mt-2 text-xs text-muted-foreground">
        Sallihha records your choice; it does not arrange collection, donation or recycling.
      </p>
      <FieldError id="decision-err" message={err} />
      <Button className="mt-3" onClick={ask}>
        Confirm Decision
      </Button>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={`Confirm: ${choice ? DECISION_LABELS[choice] : ""}?`}
        description="The request will be closed and moved to your repair history. This decision can't be changed."
        confirmLabel="Confirm decision"
        onConfirm={confirm}
      />
    </Panel>
  );
}

function OutcomeBanner({ outcome, closedAt }) {
  const completed = outcome === "Completed";
  return (
    <div
      className={cn(
        "mt-5 flex items-start gap-3 rounded-lg p-4",
        completed ? "bg-success-soft text-success" : "bg-primary-soft text-accent-foreground",
      )}
    >
      {completed ? (
        <CheckCircle2 className="mt-0.5 h-5 w-5" aria-hidden />
      ) : (
        <Leaf className="mt-0.5 h-5 w-5" aria-hidden />
      )}
      <div>
        <p className="font-semibold">
          {completed ? "Repair completed" : `Device could not be repaired — ${outcome}`}
        </p>
        <p className="text-sm opacity-90">
          {completed
            ? "Your device is repaired."
            : "You chose how your device should be handled. Sallihha records this outcome but does not arrange collection, donation or recycling."}{" "}
          Closed {fmtDate(closedAt)}.
        </p>
      </div>
    </div>
  );
}

function ReviewSection({ requestId }) {
  const { state, currentUser, run } = useStore();
  const existing = state.reviews.find((r) => r.requestId === requestId);
  const problem = reviewEligibility(state, currentUser.id, requestId);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (existing)
    return (
      <Panel title="Your review">
        <Stars value={existing.rating} size="md" />
        {existing.text && <p className="mt-2 text-sm">{existing.text}</p>}
        <p className="mt-2 text-xs text-muted-foreground">
          Submitted {fmtDate(existing.createdAt)} · one review per repair
        </p>
      </Panel>
    );
  if (problem)
    return (
      <Panel title="Rate this repair">
        <p className="text-sm text-muted-foreground">{problem}</p>
      </Panel>
    );

  const submit = () => {
    if (busy) return;
    if (!rating) return setError("Choose a rating from 1 to 5.");
    setBusy(true);
    const res = run((s) => submitReview(s, currentUser.id, requestId, rating, text));
    setBusy(false);
    if (!res.ok) return setError(res.error);
    toast.success("Thank you for your review", {
      description: "The provider's rating has been updated.",
    });
  };

  return (
    <Panel title="Rate this repair">
      <div
        role="radiogroup"
        aria-label="Rating"
        className="flex gap-1"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={rating === i}
            aria-label={`${i} star${i > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(i)}
            onClick={() => {
              setRating(i);
              setError("");
            }}
            className="rounded p-0.5"
          >
            <Star
              className={cn(
                "h-7 w-7",
                i <= (hover || rating) ? "fill-star text-star" : "text-border",
              )}
              aria-hidden
            />
          </button>
        ))}
      </div>
      <Label htmlFor="review-text" className="mt-4 block">
        Review (optional)
      </Label>
      <Textarea
        id="review-text"
        rows={3}
        maxLength={500}
        className="mt-1.5"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="How was the service?"
      />
      <p className="mt-1 text-right text-xs text-muted-foreground">{text.length}/500</p>
      <FieldError id="review-err" message={error} />
      <Button className="mt-2" onClick={submit} disabled={busy}>
        Submit review
      </Button>
    </Panel>
  );
}
