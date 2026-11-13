import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Wrench, Check, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/shared";
import { useStore } from "@/context/AppStore";
import { register, validateRegistration } from "@/lib/sallihha";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up — Sallihha" },
      {
        name: "description",
        content: "Create a Sallihha customer or freelance repair provider account.",
      },
      { property: "og:title", content: "Sign Up — Sallihha" },
      {
        property: "og:description",
        content: "Join Sallihha as a customer or a freelance repair provider.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [step, setStep] = useState("type");
  const [type, setType] = useState(null);
  const [typeError, setTypeError] = useState("");

  if (step === "type")
    return (
      <AuthLayout back={{ to: "/login", label: "Back to login" }}>
        <h1 className="text-2xl font-bold">How will you use Sallihha?</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose an account type to continue.</p>
        <div role="radiogroup" aria-label="Account type" className="mt-6 space-y-3">
          {[
            {
              v: "customer",
              icon: User,
              title: "Customer",
              text: "Post repair requests, compare offers and track repairs.",
            },
            {
              v: "freelancer",
              icon: Wrench,
              title: "Freelance repair provider",
              text: "Offer repair services and manage accepted repairs.",
            },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              role="radio"
              aria-checked={type === o.v}
              onClick={() => {
                setType(o.v);
                setTypeError("");
              }}
              className={cn(
                "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                type === o.v ? "border-primary bg-primary-soft" : "hover:bg-muted",
              )}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card text-primary shadow-sm">
                <o.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="flex-1">
                <span className="block font-semibold">{o.title}</span>
                <span className="block text-sm text-muted-foreground">{o.text}</span>
              </span>
              {type === o.v && <Check className="h-5 w-5 text-primary" aria-hidden />}
            </button>
          ))}
        </div>
        <FieldError id="type-err" message={typeError} />
        <Button
          className="mt-6 w-full"
          onClick={() =>
            type ? setStep("form") : setTypeError("Select an account type to continue.")
          }
        >
          Continue as{" "}
          {type === "freelancer" ? "repair provider" : type === "customer" ? "customer" : "…"}
        </Button>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Admin accounts are created internally and cannot be registered here.
        </p>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </p>
      </AuthLayout>
    );

  return <RegistrationForm type={type} onBack={() => setStep("type")} />;
}

function RegistrationForm({ type, onBack }) {
  const { state, run } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [cats, setCats] = useState([]);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState({ password: false, confirmPassword: false });
  const activeCats = state.categories.filter((c) => c.active);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    if (busy) return;
    const input = { role: type, ...form, categoryIds: cats };
    const errs = validateRegistration(state, input);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    const res = run((s) => {
      const r = register(s, input);
      return { state: r.state, value: r.userId };
    });
    if (!res.ok) {
      setBusy(false);
      return setErrors({ [res.field ?? "form"]: res.error });
    }
    navigate({ to: "/activate", search: { email: input.email.trim().toLowerCase() } });
  };

  const field = (k, label, props = {}) => (
    <div>
      <Label htmlFor={k}>{label} *</Label>
      <Input
        id={k}
        className="mt-1.5"
        value={form[k]}
        onChange={set(k)}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `${k}-err` : undefined}
        {...props}
      />
      <FieldError id={`${k}-err`} message={errors[k]} />
    </div>
  );

  // Password input with a show/hide toggle, styled like the Login page field.
  const passwordField = (k, label, placeholder) => (
    <div>
      <Label htmlFor={k}>{label} *</Label>
      <div className="relative mt-1.5">
        <Input
          id={k}
          type={show[k] ? "text" : "password"}
          autoComplete="new-password"
          className="pr-10"
          value={form[k]}
          onChange={set(k)}
          aria-invalid={!!errors[k]}
          aria-describedby={errors[k] ? `${k}-err` : undefined}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow((v) => ({ ...v, [k]: !v[k] }))}
          aria-label={`${show[k] ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={show[k]}
          aria-controls={k}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {show[k] ? (
            <EyeOff className="h-4 w-4" aria-hidden />
          ) : (
            <Eye className="h-4 w-4" aria-hidden />
          )}
        </button>
      </div>
      <FieldError id={`${k}-err`} message={errors[k]} />
    </div>
  );

  return (
    <AuthLayout>
      <button
        onClick={onBack}
        className="mb-4 self-start text-sm text-muted-foreground hover:text-foreground"
      >
        ← Change account type
      </button>
      <h1 className="text-2xl font-bold">
        Create your {type === "customer" ? "customer" : "repair provider"} account
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">All fields marked * are required.</p>
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        {field("name", "Full name", { autoComplete: "name", placeholder: "e.g. Sara Al-Harbi" })}
        {field("email", "Email", {
          type: "email",
          autoComplete: "email",
          placeholder: "you@example.com",
        })}
        {field("phone", "Phone number", {
          type: "tel",
          autoComplete: "tel",
          placeholder: "+966 5X XXX XXXX",
        })}
        <div className="grid gap-4 sm:grid-cols-2">
          {passwordField("password", "Password", "Create a password")}
          {passwordField("confirmPassword", "Confirm password", "Re-enter your password")}
        </div>
        <p className="-mt-2 text-xs text-muted-foreground">
          At least 8 characters, including a letter and a number.
        </p>
        {type === "freelancer" && (
          <fieldset>
            <legend className="text-sm font-medium">Repair categories you offer *</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {activeCats.map((c) => (
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
                  />
                  {c.name}
                </label>
              ))}
            </div>
            <FieldError id="cat-err" message={errors["categoryIds"]} />
          </fieldset>
        )}
        <FieldError id="form-err" message={errors["form"]} />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}
