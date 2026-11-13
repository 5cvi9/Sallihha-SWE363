import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PageHeader,
  Panel,
  StatusBadge,
  EmptyState,
  PhotoStrip,
  FieldError,
  sar,
} from "@/components/shared";
import { BackLink } from "@/components/layout/AppShell";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ReportButton } from "@/components/ReportDialog";
import { StageStepper, HistoryTimeline } from "@/components/ProgressTracker";
import { useStore } from "@/context/AppStore";
import {
  advanceStage,
  categoryName,
  markUnrepairable,
  nextStage,
  recordOutcome,
} from "@/lib/sallihha";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/freelancer/repairs/$id")({
  head: ({ params }) =>
    pageHead(`Manage repair ${params.id}`, "Update repair progress and record the outcome."),
  component: ManageRepair,
});

/** FR-F5 progress + FR-F6 outcome (updated: customer decides unrepairable outcomes). */
function ManageRepair() {
  const { id } = Route.useParams();
  const { state, currentUser, run } = useStore();
  const me = currentUser;
  const req = state.requests.find((r) => r.id === id && r.assignedFreelancerId === me.id);
  const [note, setNote] = useState("");
  const [confirmStage, setConfirmStage] = useState(false);
  const [kind, setKind] = useState("");
  const [outErr, setOutErr] = useState("");
  const [confirmOutcome, setConfirmOutcome] = useState(false);

  if (!req)
    return (
      <>
        <BackLink to="/freelancer/repairs">My Accepted Repairs</BackLink>
        <EmptyState title="Repair not found" description="This repair is not assigned to you." />
      </>
    );
  const cat = categoryName(state, req.categoryId);
  const customer = state.users.find((u) => u.id === req.customerId);
  const offer = state.offers.find((o) => o.id === req.acceptedOfferId);
  const next = req.status === "In Progress" ? nextStage(req.stage) : null;

  const doStage = () => {
    if (!next) return;
    const r = run((s) => advanceStage(s, me.id, req.id, next, note));
    setConfirmStage(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    setNote("");
    toast.success(`Progress updated to "${next}"`, {
      description: "The customer's tracking page now shows this update.",
    });
  };
  const askOutcome = () => {
    if (!kind) {
      setOutErr("Choose an outcome.");
      return;
    }
    if (kind === "completed" && req.stage !== "Ready for Pickup") {
      setOutErr('Move the repair to "Ready for Pickup" first.');
      return;
    }
    setOutErr("");
    setConfirmOutcome(true);
  };
  const doOutcome = () => {
    const r = run((s) =>
      kind === "completed"
        ? recordOutcome(s, me.id, req.id, "Completed")
        : markUnrepairable(s, me.id, req.id),
    );
    setConfirmOutcome(false);
    if (!r.ok) {
      toast.error(r.error);
      return;
    }
    if (kind === "completed")
      toast.success("Outcome recorded", {
        description: "The request is closed and moved to repair history.",
      });
    else
      toast.success("Marked as unrepairable", {
        description: "The customer has been asked to choose what happens to their device.",
      });
  };

  return (
    <>
      <BackLink to="/freelancer/repairs">My Accepted Repairs</BackLink>
      <PageHeader
        eyebrow={`${cat} · ${req.id}`}
        title={req.title}
        actions={
          <>
            <StatusBadge status={req.status} />
            {req.outcome && <StatusBadge status={req.outcome} />}
            <ReportButton
              targetType="user"
              targetId={customer.id}
              targetLabel={`${customer.name} (customer)`}
            />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Repair progress">
            <StageStepper request={req} />
            {req.status === "In Progress" && (
              <div className="mt-6 border-t pt-5">
                {next ? (
                  <>
                    <p className="text-sm">
                      Next stage: <strong>{next}</strong>
                    </p>
                    <Label htmlFor="stage-note" className="mt-3 block">
                      Update note (optional)
                    </Label>
                    <Textarea
                      id="stage-note"
                      rows={2}
                      maxLength={300}
                      className="mt-1.5"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Replacement part installed."
                    />
                    <Button className="mt-3" onClick={() => setConfirmStage(true)}>
                      Mark as “{next}”
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Stages follow a fixed sequence and cannot be skipped or reversed.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    All stages complete. Record the final outcome below.
                  </p>
                )}
              </div>
            )}
          </Panel>
          {req.status === "In Progress" ? (
            <Panel title="Record repair outcome">
              <RadioGroup
                value={kind}
                onValueChange={(v) => {
                  setKind(v);
                  setOutErr("");
                }}
                className="gap-3"
              >
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                  <RadioGroupItem value="completed" />{" "}
                  <span>
                    <span className="block font-semibold">Repair Completed</span>
                    <span className="text-xs text-muted-foreground">
                      Requires “Ready for Pickup”
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3">
                  <RadioGroupItem value="unrepairable" />{" "}
                  <span>
                    <span className="block font-semibold">Unrepairable</span>
                    <span className="text-xs text-muted-foreground">
                      The customer chooses what happens to their device
                    </span>
                  </span>
                </label>
              </RadioGroup>
              <FieldError id="out-err" message={outErr} />
              <Button className="mt-4" onClick={askOutcome}>
                Record outcome
              </Button>
            </Panel>
          ) : req.status === "Awaiting Customer Decision" ? (
            <Panel title="Awaiting the customer's decision">
              <StatusBadge status="Awaiting Customer Decision" />
              <p className="mt-3 text-sm text-muted-foreground">
                You marked this device as unrepairable. The customer now chooses what happens to
                their device — return, donate, reuse for parts, or recycle. You can't record another
                outcome or change the decision on their behalf.
              </p>
            </Panel>
          ) : (
            <Panel title="Final outcome">
              <StatusBadge status={req.outcome} />
              <p className="mt-2 text-sm text-muted-foreground">
                {req.outcome === "Completed"
                  ? "The outcome is recorded and cannot be changed."
                  : "The customer chose this outcome. It is recorded and cannot be changed."}
              </p>
            </Panel>
          )}
          <Panel title="Status history">
            <HistoryTimeline request={req} />
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Customer">
            <p className="font-semibold">{customer.name}</p>
            <p className="text-sm text-muted-foreground">{customer.phone}</p>
            {offer && (
              <p className="mt-2 text-sm">
                Agreed price: <strong>{sar(offer.price)}</strong>
              </p>
            )}
          </Panel>
          <Panel title="Device">
            <PhotoStrip photos={req.photos} category={cat} />
            {req.deviceModel && <p className="mt-3 text-sm font-semibold">{req.deviceModel}</p>}
            <p className="mt-2 text-sm text-muted-foreground">{req.description}</p>
          </Panel>
        </div>
      </div>
      <ConfirmDialog
        open={confirmStage}
        onOpenChange={setConfirmStage}
        title={`Move to “${next}”?`}
        description="This update is shown to the customer and can't be undone."
        confirmLabel="Update progress"
        onConfirm={doStage}
      />
      <ConfirmDialog
        open={confirmOutcome}
        onOpenChange={setConfirmOutcome}
        title={
          kind === "completed" ? "Record outcome: Completed?" : "Mark this device as unrepairable?"
        }
        description={
          kind === "completed"
            ? "The request will be closed and moved to repair history. A second outcome can't be recorded."
            : "The customer will be asked to choose what happens to their device (return, donate, reuse for parts, or recycle). The request stays open until they decide, and you can't record another outcome."
        }
        confirmLabel={kind === "completed" ? "Confirm and close" : "Mark unrepairable"}
        onConfirm={doOutcome}
      />
    </>
  );
}
