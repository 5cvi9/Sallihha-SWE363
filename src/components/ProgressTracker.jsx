import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGES } from "@/lib/sallihha";
import { fmtDateTime } from "./shared";

export function StageStepper({ request }) {
  const current = request.stage ? STAGES.indexOf(request.stage) : -1;
  const closed = request.status === "Closed";
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label="Repair progress">
      {STAGES.map((s, i) => {
        const done = i < current || (closed && i <= current);
        const active = i === current && !closed;
        return (
          <li key={s} className="flex flex-col items-center text-center">
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "h-0.5 flex-1",
                  i === 0 ? "bg-transparent" : i <= current ? "bg-primary" : "bg-border",
                )}
              />
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary bg-primary-soft text-primary",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
              </span>
              <div
                className={cn(
                  "h-0.5 flex-1",
                  i === STAGES.length - 1
                    ? "bg-transparent"
                    : i < current
                      ? "bg-primary"
                      : "bg-border",
                )}
              />
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-semibold",
                i <= current ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function HistoryTimeline({ request }) {
  return (
    <ol className="relative space-y-4 border-l-2 border-border pl-5">
      {request.history.map((h, i) => (
        <li key={i} className="relative">
          <span
            className={cn(
              "absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-card",
              i === request.history.length - 1 ? "bg-primary" : "bg-muted-foreground/40",
            )}
          />
          <p className="text-sm font-semibold">{h.label}</p>
          <p className="text-xs text-muted-foreground">{fmtDateTime(h.at)}</p>
          {h.note && <p className="mt-1 text-sm text-muted-foreground">{h.note}</p>}
        </li>
      ))}
    </ol>
  );
}
