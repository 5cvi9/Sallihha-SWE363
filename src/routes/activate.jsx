import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { useStore } from "@/context/AppStore";
import { activate } from "@/lib/sallihha";

export const Route = createFileRoute("/activate")({
  validateSearch: (s) => ({ email: typeof s["email"] === "string" ? s["email"] : "" }),
  head: () => ({
    meta: [
      { title: "Activate your account — Sallihha" },
      { name: "description", content: "Confirm your email to activate your Sallihha account." },
      { property: "og:title", content: "Activate your account — Sallihha" },
      {
        property: "og:description",
        content: "Activate your Sallihha account to start using the platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ActivatePage,
});

/** FR-1 activation — SIMULATED: no real email is sent in this prototype. */
function ActivatePage() {
  const { email } = Route.useSearch();
  const { state, run } = useStore();
  const navigate = useNavigate();
  const [phase, setPhase] = useState("inbox");
  const [error, setError] = useState("");
  const user = state.users.find((u) => u.email === email);

  const doActivate = () => {
    if (!user) {
      setError("This activation link is invalid or has expired.");
      return setPhase("error");
    }
    if (user.status === "Active") return setPhase("success");
    const res = run((s) => activate(s, user.id));
    if (!res.ok) {
      setError(res.error);
      return setPhase("error");
    }
    setPhase("success");
  };

  if (phase === "success")
    return (
      <AuthLayout back={{ to: "/login" }}>
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-success-soft text-success">
            <CheckCircle2 className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Your account is active</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You're ready to sign in and start using Sallihha.
          </p>
          <Button className="mt-6 w-full" onClick={() => navigate({ to: "/login" })}>
            Continue to login
          </Button>
        </div>
      </AuthLayout>
    );

  if (phase === "error")
    return (
      <AuthLayout back={{ to: "/login" }}>
        <div className="text-center" role="alert">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-danger-soft text-destructive">
            <AlertCircle className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Activation failed</h1>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-6 w-full" asChild>
            <Link to="/signup">Create a new account</Link>
          </Button>
        </div>
      </AuthLayout>
    );

  return (
    <AuthLayout back={{ to: "/login" }}>
      <div className="text-center">
        <h1 className="text-2xl font-bold">Check your inbox</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent an activation link to{" "}
          <strong className="text-foreground">{email || "your email"}</strong>.
        </p>
        <span className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Mail className="h-6 w-6" aria-hidden />
        </span>
        <p className="mt-5 text-sm text-muted-foreground">
          Open the email and select <strong className="text-foreground">Activate account</strong>.
          The link will expire soon.
        </p>
        <Button
          className="mt-6 w-full"
          variant="outline"
          onClick={() =>
            toast.success("Activation link resent", {
              description: "Simulated — no real email is sent in this prototype.",
            })
          }
        >
          Resend activation link
        </Button>
        <div className="mt-6 rounded-lg border border-dashed p-3 text-left text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Prototype: simulate the email link</p>
          <p className="mt-0.5">
            Emails are not actually sent. Use this to open the activation link.
          </p>
          <Button size="sm" className="mt-2" onClick={doActivate}>
            Open activation link →
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}
