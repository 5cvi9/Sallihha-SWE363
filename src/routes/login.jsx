
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/context/AppStore";
import { login, RuleError } from "@/lib/sallihha";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — Sallihha" },
      {
        name: "description",
        content:
          "Sign in to Sallihha to manage your repair requests, offers or the platform.",
      },
      {
        property: "og:title",
        content: "Login — Sallihha",
      },
      {
        property: "og:description",
        content: "Sign in to your Sallihha account.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        name: "twitter:card",
        content: "summary",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { state, signIn } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Validate credentials and redirect by role
  const submit = (e) => {
    e.preventDefault();

    if (busy) return;

    setBusy(true);
    setError(null);

    try {
      const user = login(state, email, password);

      signIn(user.id);

      navigate({
        to: `/${user.role}`,
      });
    } catch (err) {
      setError({
        msg:
          err instanceof RuleError
            ? err.message
            : "Something went wrong.",
        kind: err.field,
      });

      setBusy(false);
    }
  };

  return (
    <AuthLayout back={{ to: "/" }}>
      <h1 className="text-2xl font-bold">
        Welcome back
      </h1>

      <p className="mt-1 text-sm text-muted-foreground">
        Sign in to continue to Sallihha.
      </p>

      <form
        onSubmit={submit}
        className="mt-6 space-y-4"
        noValidate
      >
        {error && (
          <div
            role="alert"
            className="flex gap-2 rounded-lg border border-destructive/30 bg-danger-soft p-3 text-sm text-destructive"
          >
            <AlertCircle
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden
            />

            <div>
              {error.msg}

              {error.kind === "inactive" && (
                <Link
                  to="/activate"
                  search={{
                    email: email.trim().toLowerCase(),
                  }}
                  className="mt-1 block font-semibold underline"
                >
                  Resend activation link
                </Link>
              )}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="email">
            Email
          </Label>

          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <Label htmlFor="password">
            Password
          </Label>

          <div className="relative mt-1.5">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="pr-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              aria-pressed={showPassword}
              aria-controls="password"
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showPassword ? (
                <EyeOff
                  className="h-4 w-4"
                  aria-hidden
                />
              ) : (
                <Eye
                  className="h-4 w-4"
                  aria-hidden
                />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={busy}
        >
          {busy ? "Signing in…" : "Login"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Sallihha?{" "}
        <Link
          to="/signup"
          className="font-semibold text-primary hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
