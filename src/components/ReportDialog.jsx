import { useState } from "react";
import { Flag, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/context/AppStore";
import { REPORT_REASONS, submitReport } from "@/lib/sallihha";
import { FieldError } from "./shared";

const MAX_EVIDENCE = 5 * 1024 * 1024;
const EVIDENCE_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function ReportButton(props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size={props.size ?? "sm"} onClick={() => setOpen(true)}>
        <Flag className="h-4 w-4" aria-hidden /> Report
      </Button>
      <ReportDialog open={open} onOpenChange={setOpen} {...props} />
    </>
  );
}

function ReportDialog({ open, onOpenChange, targetType, targetId, targetLabel }) {
  const { run, currentUser } = useStore();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState();
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onFile = (f) => {
  setErrors((e) => ({ ...e, evidence: "" }));
  setEvidence(undefined);

  if (!f) return;

  if (!EVIDENCE_TYPES.includes(f.type)) {
    return setErrors((e) => ({
      ...e,
      evidence: "Evidence must be JPG, PNG, WEBP or PDF.",
    }));
  }

  if (f.size > MAX_EVIDENCE) {
    return setErrors((e) => ({
      ...e,
      evidence: "Evidence must be 5 MB or smaller.",
    }));
  }

  setEvidence(f.name);
};

  const submit = () => {
    if (!currentUser || busy) return;
    const errs = {};
    if (!reason) errs["reason"] = "Choose a reason for the report.";
    if (description.trim().length < 10)
      errs["description"] = "Describe the issue in at least 10 characters.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const res = run((s) => {
      const r = submitReport(s, currentUser.id, {
        targetType,
        targetId,
        targetLabel,
        reason,
        description,
        evidenceName: evidence,
      });
      return { state: r.state, value: r.reportId };
    });
    setBusy(false);
    if (!res.ok) return setErrors({ [res.field ?? "form"]: res.error });
    toast.success(`Report submitted — reference ${res.value}`, {
      description: "Our admin team will review it.",
    });
    setReason("");
    setDescription("");
    setEvidence(undefined);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit a report</DialogTitle>
          <DialogDescription>Reporting: {targetLabel}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="report-reason">Reason *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger
                id="report-reason"
                className="mt-1.5"
                aria-invalid={!!errors["reason"]}
              >
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="report-reason-err" message={errors["reason"]} />
          </div>
          <div>
            <Label htmlFor="report-desc">Description *</Label>
            <Textarea
              id="report-desc"
              className="mt-1.5"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what happened so the admin can review it."
              aria-invalid={!!errors["description"]}
            />
            <FieldError id="report-desc-err" message={errors["description"]} />
          </div>
          <div>
            <Label htmlFor="report-evidence">Evidence (optional)</Label>
            <label
              htmlFor="report-evidence"
              className="mt-1.5 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground hover:bg-muted"
            >
              <Paperclip className="h-4 w-4" aria-hidden />{" "}
              {evidence ?? "Attach a screenshot or PDF (max 5 MB)"}
            </label>
            <input
              id="report-evidence"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <FieldError id="report-ev-err" message={errors["evidence"]} />
          </div>
          <FieldError id="report-form-err" message={errors["form"]} />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
