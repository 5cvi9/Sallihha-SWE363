import {
  Laptop,
  Smartphone,
  Tablet,
  Watch,
  Gamepad2,
  Headphones,
  Wrench,
  Star,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/logo.png";
import { format, formatDistanceToNow } from "date-fns";

export function Logo({ className }) {
  return (
    <img
      src={logoAsset}
      alt="Sallihha logo"
      aria-hidden
      width={36}
      height={36}
      className={cn("h-9 w-9 shrink-0 object-contain", className)}
    />
  );
}

export function Wordmark({ tone = "light" }) {
  return (
    <span className="flex items-center gap-2.5">
      <Logo />
      <span
        className={cn(
          "text-lg font-extrabold tracking-tight",
          tone === "dark" ? "text-navy-foreground" : "text-foreground",
        )}
      >
        Sallihha
      </span>
    </span>
  );
}

const ICONS = {
  phones: Smartphone,
  laptops: Laptop,
  tablets: Tablet,
  smartwatches: Watch,
  "gaming consoles": Gamepad2,
  "headphones & audio": Headphones,
};
export function DeviceIcon({ category, className }) {
  const I = ICONS[category.toLowerCase()] ?? Wrench;
  return <I className={className} aria-hidden />;
}
const TONES = {
  teal: "bg-primary-soft text-accent-foreground border-primary/20",
  warning: "bg-warning-soft text-warning border-warning/25",
  success: "bg-success-soft text-success border-success/25",
  info: "bg-info-soft text-info border-info/25",
  danger: "bg-danger-soft text-destructive border-destructive/25",
  muted: "bg-muted text-muted-foreground border-border",
  navy: "bg-navy text-navy-foreground border-navy",
};
const STATUS_TONE = {
  "Awaiting Offers": "warning",
  "In Progress": "info",
  "Awaiting Customer Decision": "warning",
  Closed: "muted",
  Pending: "warning",
  Accepted: "success",
  Rejected: "danger",
  "Not Selected": "muted",
  Withdrawn: "muted",
  "Diagnosis Confirmed": "teal",
  "In Repair": "info",
  "Ready for Pickup": "success",
  Completed: "success",
  "Returned to Customer": "teal",
  Donated: "teal",
  "Reused for Parts": "teal",
  Recycled: "teal",
  Open: "warning",
  Reviewed: "info",
  Resolved: "success",
  Active: "success",
  Suspended: "danger",
  "Pending Activation": "warning",
  Removed: "danger",
};

export function StatusBadge({ status, tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        TONES[tone ?? STATUS_TONE[status] ?? "muted"],
      )}
    >
      {status}
    </span>
  );
}


export function StageLabel({ stage, className }) {
  if (!stage) return null;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
      <span>Current Stage:</span>
      <span className="font-semibold text-foreground">{stage}</span>
    </span>
  );
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className }) {
  return (
    <section className={cn("rounded-xl border bg-card p-5 shadow-sm", className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ title, description, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-12 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
        {icon ?? <Inbox className="h-5 w-5" aria-hidden />}
      </div>
      <p className="font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Stars({ value, size = "sm" }) {
  const s = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(s, i <= Math.round(value) ? "fill-star text-star" : "text-border")}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function RatingLine({ average, count }) {
  if (!count) return <span className="text-xs text-muted-foreground">No reviews yet</span>;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <Stars value={average} />
      <span className="font-semibold">{average.toFixed(1)}</span>
      <span className="text-muted-foreground">({count})</span>
    </span>
  );
}

export function StatCard({ label, value, hint, icon }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        {icon && <span className="text-primary">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-xs font-medium text-destructive">
      {message}
    </p>
  );
}

export function PhotoStrip({ photos, category }) {
  if (!photos.length)
    return (
      <div className="flex h-28 items-center justify-center rounded-lg bg-primary-soft text-primary">
        <DeviceIcon category={category} className="h-9 w-9" />
        <span className="sr-only">No photos available</span>
      </div>
    );
  return (
    <div className="flex gap-2 overflow-x-auto">
      {photos.map((p, i) => (
        <img
          key={i}
          src={p}
          alt={`Device photo ${i + 1}`}
          className="h-28 w-28 shrink-0 rounded-lg border object-cover"
        />
      ))}
    </div>
  );
}

export const fmtDate = (iso) => (iso ? format(new Date(iso), "d MMM yyyy") : "—");
export const fmtDateTime = (iso) => (iso ? format(new Date(iso), "d MMM yyyy, HH:mm") : "—");
export const ago = (iso) => formatDistanceToNow(new Date(iso), { addSuffix: true });
export const sar = (n) => `SAR ${n.toLocaleString("en-US")}`;
export const initials = (name) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
