import { Link } from "@tanstack/react-router";
import { ArrowLeft, Leaf } from "lucide-react";
import { Logo } from "@/components/shared";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function AuthLayout({ children, back }) {
  return (
    <div className="flex min-h-screen bg-card">
      <aside className="relative hidden w-[38%] max-w-md flex-col justify-between overflow-hidden bg-navy p-10 text-navy-foreground lg:flex">
        <Link to="/" aria-label="Sallihha home">
          <Logo />
        </Link>
        <div className="relative z-10">
          <p className="text-5xl leading-none text-primary">“</p>
          <p className="mt-2 text-2xl font-semibold leading-snug">
            Repair is not only about fixing what is broken. It is about choosing what deserves to
            continue.
          </p>
          <p className="mt-6 flex items-center gap-2 text-sm font-semibold">
            <Leaf className="h-4 w-4 text-primary" aria-hidden /> A more thoughtful repair
            experience
          </p>
          <p className="ml-6 text-xs text-navy-muted">
            Clear choices. Visible progress. Responsible outcomes.
          </p>
        </div>
        <p className="relative z-10 text-xs text-navy-muted">صلّحها · Sallihha</p>
        <div
          className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-navy-accent"
          aria-hidden
        />
      </aside>
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col px-5 py-6 sm:px-10">
          <div className="flex items-center justify-between">
            {back ? (
              <Link
                to={back.to}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden /> {back.label ?? "Back"}
              </Link>
            ) : (
              <span />
            )}
            <Link to="/" className="lg:hidden" aria-label="Sallihha home">
              <Logo />
            </Link>
          </div>
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
            {children}
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
