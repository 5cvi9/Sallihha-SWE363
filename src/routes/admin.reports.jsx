import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PageHeader, StatusBadge, EmptyState, FieldError, fmtDateTime } from "@/components/shared";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useStore } from "@/context/AppStore";
import { markReportReviewed, moderateReport, reportedAccountId } from "@/lib/sallihha";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/admin/reports")({
  head: () =>
    pageHead("User Reports", "Moderation queue for reports submitted by customers and providers."),
  component: Reports,
});

/** FR-AD4 review + FR-AD5 moderate. */
function Reports() {
  const { state, currentUser, run } = useStore();
  const admin = currentUser.id;
  const [tab, setTab] = useState("unresolved");
  const [openId, setOpenId] = useState(null);
  const [action, setAction] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState(false);
  const list = state.reports.filter(
    (r) =>
      tab === "all" || (tab === "Resolved" ? r.status === "Resolved" : r.status !== "Resolved"),
  );
  const report = state.reports.find((r) => r.id === openId);
  const name = (id) => state.users.find((u) => u.id === id)?.name ?? "—";

  const openReport = (id) => {
    setOpenId(id);
    setAction("");
    setNote("");
    setErr("");
  };
  const ask = () => {
    if (!action) return setErr("Choose a moderation action.");
    if (action !== "dismiss" && note.trim().length < 5)
      return setErr("Add a short note explaining the decision.");
    setErr("");
    setConfirm(true);
  };
  const apply = () => {
    const r = run((s) => moderateReport(s, admin, report.id, action, note));
    setConfirm(false);
    if (!r.ok) return setErr(r.error);
    toast.success(`${report.id} resolved`);
  };

  return (
    <>
      <PageHeader title="User Reports" description="Unresolved reports are shown by default." />
      <Tabs value={tab} onValueChange={(v) => setTab(v)} className="mb-4">
        <TabsList>
          <TabsTrigger value="unresolved">
            Unresolved ({state.reports.filter((r) => r.status !== "Resolved").length})
          </TabsTrigger>
          <TabsTrigger value="Resolved">Resolved</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>
      {list.length === 0 ? (
        <EmptyState title="No reports here" description="Nothing needs your attention." />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Report</th>
                <th className="hidden p-3 md:table-cell">Reporter</th>
                <th className="p-3">Reported</th>
                <th className="hidden p-3 sm:table-cell">Reason</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">
                    <span className="font-semibold">{r.id}</span>
                    <span className="block text-xs text-muted-foreground">
                      {fmtDateTime(r.createdAt)}
                    </span>
                  </td>
                  <td className="hidden p-3 md:table-cell">{name(r.reporterId)}</td>
                  <td className="p-3">{r.targetLabel}</td>
                  <td className="hidden p-3 sm:table-cell">{r.reason}</td>
                  <td className="p-3">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="outline" onClick={() => openReport(r.id)}>
                      Open
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Sheet open={!!report} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {report && (
            <>
              <SheetHeader>
                <SheetTitle>Report {report.id}</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-6 text-sm">
                <StatusBadge status={report.status} />
                <dl className="grid grid-cols-3 gap-2">
                  <dt className="text-muted-foreground">Reporter</dt>
                  <dd className="col-span-2">{name(report.reporterId)}</dd>
                  <dt className="text-muted-foreground">Reported</dt>
                  <dd className="col-span-2">{report.targetLabel}</dd>
                  <dt className="text-muted-foreground">Account</dt>
                  <dd className="col-span-2">{name(reportedAccountId(state, report))}</dd>
                  <dt className="text-muted-foreground">Reason</dt>
                  <dd className="col-span-2">{report.reason}</dd>
                </dl>
                <p className="rounded-lg bg-muted p-3">{report.description}</p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <Paperclip className="h-4 w-4" aria-hidden />
                  {report.evidenceName ?? "No evidence attached"}
                </p>
                {report.status === "Open" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      run((s) => markReportReviewed(s, admin, report.id));
                      toast.success("Marked as reviewed");
                    }}
                  >
                    Mark as Reviewed
                  </Button>
                )}
                {report.status === "Resolved" ? (
                  <div className="rounded-lg border border-success/30 bg-success-soft p-3 text-success">
                    <p className="font-semibold">{report.decision}</p>
                    {report.decisionNote && <p className="mt-1">{report.decisionNote}</p>}
                    <p className="mt-1 text-xs">{fmtDateTime(report.decidedAt)}</p>
                  </div>
                ) : (
                  <div className="border-t pt-4">
                    <p className="font-semibold">Moderation decision</p>
                    <RadioGroup
                      value={action}
                      onValueChange={(v) => {
                        setAction(v);
                        setErr("");
                      }}
                      className="mt-2 gap-2"
                    >
                      <label className="flex items-center gap-2 rounded-lg border p-3">
                        <RadioGroupItem value="dismiss" /> Dismiss report
                      </label>
                      {report.targetType !== "user" && (
                        <label className="flex items-center gap-2 rounded-lg border p-3">
                          <RadioGroupItem value="remove-content" /> Remove / restrict the reported{" "}
                          {report.targetType}
                        </label>
                      )}
                      <label className="flex items-center gap-2 rounded-lg border p-3">
                        <RadioGroupItem value="suspend-account" /> Suspend{" "}
                        {name(reportedAccountId(state, report))}
                      </label>
                    </RadioGroup>
                    <Label htmlFor="mod-note" className="mt-3 block">
                      Decision note
                    </Label>
                    <Textarea
                      id="mod-note"
                      rows={3}
                      className="mt-1.5"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                    <FieldError id="mod-err" message={err} />
                    <Button className="mt-3" onClick={ask}>
                      Apply decision
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Apply this moderation decision?"
        description="The report will be marked Resolved and the decision recorded."
        confirmLabel="Confirm"
        destructive={action !== "dismiss"}
        onConfirm={apply}
      />
    </>
  );
}
