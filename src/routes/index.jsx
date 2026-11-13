import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ClipboardList, Scale, Activity, Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/shared";
import { useStore } from "@/context/AppStore";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sallihha — Get your devices repaired by trusted freelancers" },
      {
        name: "description",
        content:
          "Post a repair request for your phone, laptop or tablet, compare offers from freelance technicians and track the repair.",
      },
      { property: "og:title", content: "Sallihha — Device repair, done thoughtfully" },
      {
        property: "og:description",
        content:
          "Compare repair offers, track progress, and choose responsible outcomes for devices that can't be fixed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const STEPS = [
  {
    icon: ClipboardList,
    title: "Post a request",
    text: "Describe the problem and add photos of your device.",
  },
  {
    icon: Scale,
    title: "Compare offers",
    text: "Review prices, ratings and profiles from repair providers.",
  },
  {
    icon: Activity,
    title: "Track the repair",
    text: "Follow each stage from diagnosis to pickup.",
  },
  {
    icon: Recycle,
    title: "Responsible outcome",
    text: "Unrepairable devices are donated, reused or recycled.",
  },
];

function Landing() {
  const { currentUser } = useStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (currentUser) navigate({ to: `/${currentUser.role}` });
  }, [currentUser, navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="w-full">
        <div className="flex w-full items-center justify-between gap-3 px-5 py-5 sm:px-8 lg:px-12">
          <Wordmark />
          <nav className="flex shrink-0 items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-10 sm:pt-16">
          <div className="overflow-hidden rounded-2xl bg-navy px-6 py-14 text-navy-foreground sm:px-12">
            <p className="eyebrow text-sidebar-primary">Device repair marketplace</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Repair is about choosing what deserves to continue.
            </h1>
            <p className="mt-4 max-w-xl text-navy-muted">
              Sallihha connects you with independent repair technicians for phones, laptops, tablets
              and more — with clear offers, visible progress and responsible outcomes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/signup">Create an account</Link>
              </Button>
              <Button size="lg" variant="secondary" asChild>
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </section>
        <section
          className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="How Sallihha works"
        >
          {STEPS.map((s, i) => (
            <div key={s.title} className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <s.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-xs font-bold text-muted-foreground">STEP {i + 1}</span>
              </div>
              <h2 className="mt-3 font-semibold">{s.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
