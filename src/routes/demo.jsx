import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FlaskConical, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/shared";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DEMO_ACCOUNTS } from "@/data/seed";
import { useStore } from "@/context/AppStore";
import { login } from "@/lib/sallihha";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Evaluator demo accounts — Sallihha prototype" },
      {
        name: "description",
        content: "Development-only demo accounts for testing the Sallihha prototype roles.",
      },
      { property: "og:title", content: "Demo accounts — Sallihha prototype" },
      { property: "og:description", content: "Testing route for SWE 363 evaluation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DemoPage,
});

/** Separate testing route — NOT part of the normal user interface. */
function DemoPage() {
  const { state, signIn, signOut, resetDemo } = useStore();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);

  const quickLogin = (email, password) => {
    try {
      const u = login(state, email, password);
      signIn(u.id);
      navigate({ to: `/${u.role}` });
    } catch (e) {
      toast.error(e.message);
    }
  };

  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <Link to="/">
          <Wordmark />
        </Link>
        <div className="mt-8 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
          <p className="flex items-center gap-2 font-semibold">
            <FlaskConical className="h-4 w-4" aria-hidden /> Development-only testing page
          </p>
          <p className="mt-1">
            These are mock fixtures for SWE 363 evaluation. Authentication here is simulated in the
            browser and is not real security.
          </p>
        </div>
        <h1 className="mt-6 text-2xl font-bold">Demo accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You can also type these credentials on the normal{" "}
          <Link to="/login" className="text-primary underline">
            Login
          </Link>{" "}
          page — the role is detected automatically.
        </p>
        <div className="mt-5 overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Role</th>
                <th className="p-3">Email / password</th>
                <th className="hidden p-3 sm:table-cell">Notes</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {DEMO_ACCOUNTS.map((a) => (
                <tr key={a.email} className="border-t">
                  <td className="p-3 font-semibold">{a.role}</td>
                  <td className="p-3">
                    <code className="block">{a.email}</code>
                    <code className="block text-muted-foreground">{a.password}</code>
                  </td>
                  <td className="hidden p-3 text-muted-foreground sm:table-cell">{a.note}</td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => quickLogin(a.email, a.password)}
                    >
                      Sign in
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Other mock freelancers (lina@, yousef@, majed@example.com) use <code>Freelancer123</code>;
          faisal@example.com uses <code>Customer123</code>.
        </p>
        <div className="mt-8 rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Reset demo data</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Restores all requests, offers, reports and accounts to the original mock data and signs
            you out.
          </p>
          <Button variant="outline" className="mt-3" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Reset demo data
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset all demo data?"
        description="Every change made in this browser will be lost."
        confirmLabel="Reset"
        destructive
        onConfirm={() => {
          signOut();
          resetDemo();
          toast.success("Demo data restored");
        }}
      />
    </div>
  );
}
