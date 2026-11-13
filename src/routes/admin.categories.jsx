import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, Panel, StatusBadge, FieldError, DeviceIcon } from "@/components/shared";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useStore } from "@/context/AppStore";
import {
  addCategory,
  categoryUsage,
  removeCategory,
  renameCategory,
  setCategoryActive,
} from "@/lib/sallihha";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/admin/categories")({
  head: () => pageHead("Repair Categories", "Add, rename, deactivate or remove repair categories."),
  component: Categories,
});

/** FR-AD3 */
function Categories() {
  const { state, currentUser, run } = useStore();
  const admin = currentUser.id;
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [remove, setRemove] = useState(null);

  const add = (e) => {
    e.preventDefault();
    const r = run((s) => addCategory(s, admin, name));
    if (!r.ok) return setErr(r.error);
    setErr("");
    setName("");
    toast.success("Category added");
  };
  const saveEdit = () => {
    if (!editing) return;
    const r = run((s) => renameCategory(s, admin, editing.id, editing.name));
    if (!r.ok) return setEditing({ ...editing, err: r.error });
    setEditing(null);
    toast.success("Category renamed");
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Repair Categories"
        description="Changes appear immediately in customer request and provider profile forms."
      />
      <Panel className="mb-6" title="Add a category">
        <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row" noValidate>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cameras"
            aria-label="New category name"
            aria-invalid={!!err}
          />
          <Button type="submit">Add category</Button>
        </form>
        <FieldError id="add-err" message={err} />
      </Panel>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Category</th>
              <th className="hidden p-3 sm:table-cell">Usage</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {state.categories.map((c) => {
              const u = categoryUsage(state, c.id);
              const isEditing = editing?.id === c.id;
              return (
                <tr key={c.id} className="border-t align-top">
                  <td className="p-3">
                    {isEditing ? (
                      <div>
                        <Input
                          value={editing.name}
                          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                          aria-label="Category name"
                          autoFocus
                        />
                        <FieldError id="ed-err" message={editing.err} />
                      </div>
                    ) : (
                      <span className="flex items-center gap-2 font-semibold">
                        <DeviceIcon category={c.name} className="h-4 w-4 text-primary" />
                        {c.name}
                      </span>
                    )}
                  </td>
                  <td className="hidden p-3 text-xs text-muted-foreground sm:table-cell">
                    {u.activeRequests} active requests · {u.providers} providers
                  </td>
                  <td className="p-3">
                    <StatusBadge
                      status={c.active ? "Active" : "Inactive"}
                      tone={c.active ? "success" : "muted"}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={saveEdit}>
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditing({ id: c.id, name: c.name })}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                const result = run((s) =>
                                  setCategoryActive(s, admin, c.id, !c.active)
                                );
                              
                                if (result.ok) {
                                  toast.success(
                                    c.active ? "Category deactivated" : "Category activated"
                                  );
                                } else {
                                  toast.error(result.error);
                                }
                              }}
                          >
                            {c.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            disabled={u.anyRequests > 0}
                            title={
                              u.anyRequests > 0
                                ? "Used by requests — deactivate instead"
                                : undefined
                            }
                            onClick={() => setRemove(c)}
                          >
                            Remove
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Categories used by requests can't be removed — deactivate them to hide them from new
        requests.
      </p>
      <ConfirmDialog
        open={!!remove}
        onOpenChange={(o) => !o && setRemove(null)}
        title={`Remove “${remove?.name}”?`}
        description="This category will be removed from all provider profiles."
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          const r = run((s) => removeCategory(s, admin, remove.id));
          setRemove(null);
          if (r.ok) toast.success("Category removed");
          else toast.error(r.error);
        }}
      />
    </div>
  );
}
