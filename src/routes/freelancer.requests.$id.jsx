import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PageHeader,
  Panel,
  StatusBadge,
  EmptyState,
  PhotoStrip,
  FieldError,
  DeviceIcon,
  fmtDateTime,
  sar,
} from "@/components/shared";
import { BackLink } from "@/components/layout/AppShell";
import { ReportButton } from "@/components/ReportDialog";
import { useStore } from "@/context/AppStore";
import { categoryName, submitOffer, withdrawOffer } from "@/lib/sallihha";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/freelancer/requests/$id")({
  head: ({ params }) => pageHead(`Request ${params.id}`, "Repair request details and offer form."),
  component: RequestForProvider,
});

/** FR-F2 detail + FR-F3 submit offer. */
function RequestForProvider() {
  const { id } = Route.useParams();
  const { state, currentUser, run } = useStore();
  const me = currentUser;
  const req = state.requests.find((r) => r.id === id);
  const [price, setPrice] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const eligible =
    req &&
    !req.removed &&
    req.status === "Awaiting Offers" &&
    (me.categoryIds ?? []).includes(req.categoryId);
  if (!req || !eligible)
    return (
      <>
        <BackLink to="/freelancer/requests">Available Requests</BackLink>
        <EmptyState
          title="Request not available"
          description="This request is no longer accepting offers or doesn't match your repair categories."
        />
      </>
    );

  const cat = categoryName(state, req.categoryId);
  const myOffer = state.offers.find(
    (o) => o.requestId === req.id && o.freelancerId === me.id && o.status === "Pending",
  );
  const customer = state.users.find((u) => u.id === req.customerId);

  const submit = (e) => {
    e.preventDefault();
    if (busy) return;
    const p = Number(price);
    if (!price.trim() || !Number.isFinite(p) || p <= 0)
      return setErrors({ price: "Enter a price greater than 0." });
    setBusy(true);
    const res = run((s) => submitOffer(s, me.id, req.id, p, note));
    setBusy(false);
    if (!res.ok) return setErrors({ [res.field ?? "form"]: res.error });
    setErrors({});
    setShowForm(false);
    toast.success("Offer sent", {
      description: "The customer can now see your offer (notification simulated).",
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      <BackLink to="/freelancer/requests">Available Requests</BackLink>
      <PageHeader
        eyebrow={`${cat} · ${req.id}`}
        title={req.title}
        description={`Posted ${fmtDateTime(req.createdAt)} by ${customer.name.split(" ")[0]}`}
        actions={
          <>
            <StatusBadge status={req.status} />
            <ReportButton
              targetType="request"
              targetId={req.id}
              targetLabel={`${req.id} · ${req.title}`}
            />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Request details" className="lg:col-span-3">
          <PhotoStrip photos={req.photos} category={cat} />
          {req.deviceModel && (
            <p className="mt-4 text-sm">
              <span className="text-muted-foreground">Device:</span>{" "}
              <strong>{req.deviceModel}</strong>
            </p>
          )}
          <p className="mt-3 text-sm leading-relaxed">{req.description}</p>
        </Panel>
        <div className="lg:col-span-2">
          {myOffer ? (
            <Panel>
              <div className="flex items-start gap-3 text-success">
                <CheckCircle2 className="h-5 w-5" aria-hidden />
                <div>
                  <p className="font-semibold">Offer sent</p>
                  <p className="text-sm text-muted-foreground">
                    Your offer of <strong className="text-foreground">{sar(myOffer.price)}</strong>{" "}
                    is waiting for the customer.
                  </p>
                </div>
              </div>
              {myOffer.note && (
                <p className="mt-3 rounded-lg bg-muted p-3 text-sm">{myOffer.note}</p>
              )}
              <p className="mt-3 flex gap-2 rounded-lg bg-primary-soft p-3 text-xs text-accent-foreground">
                <Info className="h-4 w-4 shrink-0" aria-hidden />
                One active offer per request. Withdraw this offer if you want to send a new one.
              </p>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const r = run((s) => withdrawOffer(s, me.id, myOffer.id));
                    if (r.ok) toast.success("Offer withdrawn");
                    else toast.error(r.error);
                  }}
                >
                  Withdraw offer
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/freelancer/offers">My Offers</Link>
                </Button>
              </div>
            </Panel>
          ) : !showForm ? (
            <Panel title="Interested in this repair?">
              <p className="text-sm text-muted-foreground">
                Send the customer a clear price estimate.
              </p>
              <Button className="mt-4 w-full" onClick={() => setShowForm(true)}>
                Submit offer
              </Button>
            </Panel>
          ) : (
            <Panel title="Send a repair offer">
              <div className="mb-4 flex items-center gap-3 rounded-lg border p-3">
                <DeviceIcon category={cat} className="h-5 w-5 text-primary" />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">{req.title}</span>
              </div>
              <form onSubmit={submit} noValidate className="space-y-4">
                <div>
                  <Label htmlFor="price">Proposed price *</Label>
                  <div className="mt-1.5 flex">
                    <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm font-semibold text-muted-foreground">
                      SAR
                    </span>
                    <Input
                      id="price"
                      type="number"
                      inputMode="decimal"
                      min="1"
                      step="1"
                      className="rounded-l-none"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      aria-invalid={!!errors["price"]}
                    />
                  </div>
                  <FieldError id="price-err" message={errors["price"]} />
                </div>
                <div>
                  <div className="flex justify-between">
                    <Label htmlFor="note">Note to customer</Label>
                    <span className="text-xs text-muted-foreground">Optional</span>
                  </div>
                  <Textarea
                    id="note"
                    rows={4}
                    maxLength={500}
                    className="mt-1.5"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Explain your approach or what the price includes. Do not add private contact details."
                  />
                </div>
                <p className="flex gap-2 rounded-lg bg-primary-soft p-3 text-xs text-accent-foreground">
                  <Info className="h-4 w-4 shrink-0" aria-hidden />
                  One active offer per request. You can't send a duplicate offer while this one is
                  active.
                </p>
                <FieldError id="form-err" message={errors["form"]} />
                <div className="flex justify-between">
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={busy}>
                    {busy ? "Sending…" : "Send Offer"}
                  </Button>
                </div>
              </form>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
