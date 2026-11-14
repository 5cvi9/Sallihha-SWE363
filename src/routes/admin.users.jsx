import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, StatusBadge, EmptyState, RatingLine, fmtDate } from "@/components/shared";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useStore } from "@/context/AppStore";
import { categoryName, freelancerRating, setUserStatus } from "@/lib/sallihha";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/admin/users")({
  head: () => pageHead("User Accounts", "Manage customer and freelancer accounts."),
  component: Users,
});

/** FR-AD1 */
function Users() {
  const { state, currentUser, run } = useStore();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [detail, setDetail] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const list = state.users
    .filter((u) => u.role !== "admin")
    .filter((u) => (role === "all" || u.role === role) && (status === "all" || u.status === status))
    .filter((u) => !q || `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));

  const toggle = () => {
    if (!confirm) return;
    const target = confirm.status === "Suspended" ? "Active" : "Suspended";
    const r = run((s) => setUserStatus(s, currentUser.id, confirm.id, target));
    setConfirm(null);
    if (!r.ok) toast.error(r.error);
    else
      toast.success(
        target === "Suspended" ? `${confirm.name} suspended` : `${confirm.name} reactivated`,
      );
  };

  return (
    <>
      <PageHeader
        title="User Accounts"
        description="Customers and freelance repair providers. Suspended accounts cannot log in."
      />
      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden />
          <Input
            className="pl-9"
            placeholder="Search name or email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search users"
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger aria-label="Role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="customer">Customers</SelectItem>
            <SelectItem value="freelancer">Freelancers</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {["Active", "Suspended", "Pending Activation"].map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {list.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="hidden p-3 md:table-cell">Joined</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="p-3">
                    <span className="font-semibold">{u.name}</span>
                    <span className="block text-xs text-muted-foreground">{u.email}</span>
                  </td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="hidden p-3 md:table-cell">{fmtDate(u.joinedAt)}</td>
                  <td className="p-3">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setDetail(u)}>
                        Details
                      </Button>
                      {u.status === "Suspended" ? (
                        <Button size="sm" variant="outline" onClick={() => setConfirm(u)}>
                          Reactivate
                        </Button>
                      ) : u.status === "Active" ? (
                        <Button size="sm" variant="destructive" onClick={() => setConfirm(u)}>
                          Suspend
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detail?.name}</DialogTitle>
          </DialogHeader>
          {detail && (
            <dl className="grid grid-cols-3 gap-2 text-sm">
              <dt className="text-muted-foreground">ID</dt>
              <dd className="col-span-2">{detail.id}</dd>
              <dt className="text-muted-foreground">Role</dt>
              <dd className="col-span-2 capitalize">{detail.role}</dd>
              <dt className="text-muted-foreground">Email</dt>
              <dd className="col-span-2">{detail.email}</dd>
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="col-span-2">{detail.phone}</dd>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="col-span-2">
                <StatusBadge status={detail.status} />
              </dd>
              <dt className="text-muted-foreground">Requests</dt>
              <dd className="col-span-2">
                {
                  state.requests.filter(
                    (r) => r.customerId === detail.id || r.assignedFreelancerId === detail.id,
                  ).length
                }
              </dd>
              {detail.role === "freelancer" && (
                <>
                  <dt className="text-muted-foreground">Specializations</dt>
                  <dd className="col-span-2">
                    {(detail.categoryIds ?? []).length ? (
                      <span className="flex flex-wrap gap-1.5">
                        {detail.categoryIds.map((c) => (
                          <StatusBadge key={c} status={categoryName(state, c)} tone="teal" />
                        ))}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">None selected</span>
                    )}
                  </dd>
                  <dt className="text-muted-foreground">Rating</dt>
                  <dd className="col-span-2">
                    <RatingLine {...freelancerRating(state, detail.id)} />
                  </dd>
                </>
              )}
            </dl>
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={
          confirm?.status === "Suspended"
            ? `Reactivate ${confirm?.name}?`
            : `Suspend ${confirm?.name}?`
        }
        description={
          confirm?.status === "Suspended"
            ? "They will be able to log in again."
            : "They will be blocked from logging in. This action is logged."
        }
        confirmLabel={confirm?.status === "Suspended" ? "Reactivate" : "Suspend account"}
        destructive={confirm?.status !== "Suspended"}
        onConfirm={toggle}
      />
    </>
  );
}
