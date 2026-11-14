import { Logo } from "@/components/shared";

export function SiteFooter({ className }) {
  return (
    <footer className={"border-t bg-background/70 " + (className ?? "")}>
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-1.5 px-5 py-5 text-center sm:flex-row sm:justify-between sm:gap-4 sm:text-left">
        <div className="flex items-center gap-2.5">
          <Logo className="h-6 w-6" />
          <span className="text-sm font-extrabold tracking-tight text-foreground">Sallihha</span>
          <span className="text-xs text-muted-foreground">Repair smarter. Reduce waste.</span>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 Sallihha. All rights reserved.</p>
      </div>
    </footer>
  );
}
