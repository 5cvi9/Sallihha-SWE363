import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader, Panel, FieldError, RatingLine } from "@/components/shared";
import { useStore } from "@/context/AppStore";
import { freelancerRating, updateProfile } from "@/lib/sallihha";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/freelancer/profile")({
  head: () =>
    pageHead("My Profile & Services", "Edit your public profile and offered repair categories."),
  component: Profile,
});

/** FR-F1 */
function Profile() {
  const { state, currentUser, run } = useStore();
  const me = currentUser;
  const [form, setForm] = useState({
    name: me.name,
    phone: me.phone,
    city: me.city ?? "",
    bio: me.bio ?? "",
  });
  const [cats, setCats] = useState(me.categoryIds ?? []);
  const [errors, setErrors] = useState({});
  const options = state.categories.filter((c) => c.active || cats.includes(c.id));

  const save = (e) => {
    e.preventDefault();
    const res = run((s) => updateProfile(s, me.id, { ...form, categoryIds: cats }));
    if (!res.ok) return setErrors({ [res.field ?? "form"]: res.error });
    setErrors({});
    toast.success("Profile saved", { description: "Customers now see your updated profile." });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="My Profile & Services"
        description={
          <>
            Public rating: <RatingLine {...freelancerRating(state, me.id)} />
          </>
        }
      />
      <form onSubmit={save} noValidate>
        <Panel className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full name *</Label>
              <Input
                id="name"
                className="mt-1.5"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <FieldError id="n" message={errors["name"]} />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                className="mt-1.5"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <FieldError id="p" message={errors["phone"]} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" className="mt-1.5" value={me.email} disabled />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                className="mt-1.5"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">About your services</Label>
            <Textarea
              id="bio"
              rows={4}
              maxLength={400}
              className="mt-1.5"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
            <FieldError id="b" message={errors["bio"]} />
          </div>
          <fieldset>
            <legend className="text-sm font-medium">Repair categories *</legend>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {options.map((c) => (
                <label
                  key={c.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                    cats.includes(c.id) && "border-primary bg-primary-soft",
                  )}
                >
                  <Checkbox
                    checked={cats.includes(c.id)}
                    onCheckedChange={(v) =>
                      setCats(v ? [...cats, c.id] : cats.filter((x) => x !== c.id))
                    }
                  />{" "}
                  {c.name}
                  {!c.active && " (inactive)"}
                </label>
              ))}
            </div>
            <FieldError id="c" message={errors["categoryIds"]} />
          </fieldset>
          <FieldError id="f" message={errors["form"]} />
          <div className="flex justify-end border-t pt-4">
            <Button type="submit">Save Changes</Button>
          </div>
        </Panel>
      </form>
    </div>
  );
}
