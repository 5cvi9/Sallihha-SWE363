import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ImagePlus, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, FieldError, DeviceIcon, Panel } from "@/components/shared";
import { BackLink } from "@/components/layout/AppShell";
import { useStore } from "@/context/AppStore";
import { createRequest, validateRequest, MIN_DESCRIPTION } from "@/lib/sallihha";
import { pageHead, readPhoto, ALLOWED_PHOTO_TYPES, MAX_PHOTO_BYTES, MAX_PHOTOS } from "@/lib/head";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/customer/requests/new")({
  head: () =>
    pageHead("New Repair Request", "Describe your device problem and post a repair request."),
  component: NewRequest,
});

function NewRequest() {
  const { state, run, currentUser } = useStore();
  const navigate = useNavigate();
  const cats = state.categories.filter((c) => c.active);
  const [form, setForm] = useState({ categoryId: "", title: "", deviceModel: "", description: "" });
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);

  const addFiles = async (files) => {
    if (!files) return;
    const errs = [];
    const next = [...photos];
    for (const f of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) {
        errs.push(`You can upload up to ${MAX_PHOTOS} photos.`);
        break;
      }
      if (!ALLOWED_PHOTO_TYPES.includes(f.type)) {
        errs.push(`${f.name}: only JPG, PNG or WEBP images are allowed.`);
        continue;
      }
      if (f.size > MAX_PHOTO_BYTES) {
        errs.push(`${f.name}: each photo must be 5 MB or smaller.`);
        continue;
      }
      try {
        next.push(await readPhoto(f));
      } catch {
        errs.push(`${f.name}: could not be read.`);
      }
    }
    setPhotos(next);
    setErrors((e) => ({ ...e, photos: errs.join(" ") }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (busy) return;
    const input = { ...form, photos };
    const errs = validateRequest(state, input);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const res = run((s) => {
      const r = createRequest(s, currentUser.id, input);
      return { state: r.state, value: r.requestId };
    });
    setBusy(false);
    if (!res.ok) return setErrors({ [res.field ?? "form"]: res.error });
    setCreated(res.value);
  };

  if (created)
    return (
      <div className="mx-auto max-w-lg py-10 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Your request has been posted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Request <strong className="text-foreground">{created}</strong> is now{" "}
          <strong className="text-foreground">Awaiting Offers</strong> and visible to repair
          providers in this category.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button
            onClick={() => navigate({ to: "/customer/requests/$id", params: { id: created } })}
          >
            View request
          </Button>
          <Button variant="outline" asChild>
            <Link to="/customer/requests">My Repair Requests</Link>
          </Button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      <BackLink to="/customer/requests">My Repair Requests</BackLink>
      <PageHeader
        title="New Repair Request"
        description="Tell repair providers what's wrong. Clear details and photos help you get accurate offers."
      />
      <form onSubmit={submit} noValidate>
        <Panel className="space-y-5">
          <fieldset>
            <legend className="text-sm font-medium">Device category *</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup">
              {cats.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={form.categoryId === c.id}
                  onClick={() => setForm({ ...form, categoryId: c.id })}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-3 text-sm font-medium",
                    form.categoryId === c.id
                      ? "border-primary bg-primary-soft text-accent-foreground"
                      : "hover:bg-muted",
                  )}
                >
                  <DeviceIcon category={c.name} className="h-4 w-4" /> {c.name}
                </button>
              ))}
            </div>
            <FieldError id="cat-err" message={errors["categoryId"]} />
          </fieldset>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="title">Short title *</Label>
              <Input
                id="title"
                className="mt-1.5"
                maxLength={80}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Cracked screen"
                aria-invalid={!!errors["title"]}
              />
              <FieldError id="title-err" message={errors["title"]} />
            </div>
            <div>
              <Label htmlFor="model">Device model (optional)</Label>
              <Input
                id="model"
                className="mt-1.5"
                maxLength={60}
                value={form.deviceModel}
                onChange={(e) => setForm({ ...form, deviceModel: e.target.value })}
                placeholder="e.g. iPhone 13"
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between">
              <Label htmlFor="desc">Problem description *</Label>
              <span className="text-xs text-muted-foreground">
                {form.description.trim().length}/{MIN_DESCRIPTION} min
              </span>
            </div>
            <Textarea
              id="desc"
              rows={5}
              maxLength={1000}
              className="mt-1.5"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What happened? When did it start? What have you tried?"
              aria-invalid={!!errors["description"]}
            />
            <FieldError id="desc-err" message={errors["description"]} />
          </div>
          <div>
            <p className="text-sm font-medium">
              Device photos *{" "}
              <span className="font-normal text-muted-foreground">
                (JPG, PNG or WEBP, up to 5 MB each, max {MAX_PHOTOS})
              </span>
            </p>
            <div className="mt-2 flex flex-wrap gap-3">
              {photos.map((p, i) => (
                <div key={i} className="relative">
                  <img
                    src={p}
                    alt={`Selected photo ${i + 1}`}
                    className="h-24 w-24 rounded-lg border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                    className="absolute -right-2 -top-2 rounded-full bg-foreground p-1 text-background"
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-xs text-muted-foreground hover:border-primary hover:text-primary">
                  <ImagePlus className="h-5 w-5" aria-hidden /> Add photo
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    multiple
                    className="sr-only"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                    aria-label="Upload device photos"
                  />
                </label>
              )}
            </div>
            <FieldError id="photo-err" message={errors["photos"]} />
            <p className="mt-1 text-xs text-muted-foreground">
              Prototype: photos stay in this browser only.
            </p>
          </div>
          <FieldError id="form-err" message={errors["form"]} />
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate({ to: "/customer/requests" })}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Posting…" : "Post Request"}
            </Button>
          </div>
        </Panel>
      </form>
    </div>
  );
}
