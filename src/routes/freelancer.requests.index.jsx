
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Image as ImageIcon, MessageSquare } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  PageHeader,
  StatusBadge,
  EmptyState,
  DeviceIcon,
  ago,
} from "@/components/shared";

import { useStore } from "@/context/AppStore";
import { categoryName, relevantRequests } from "@/lib/sallihha";
import { pageHead } from "@/lib/head";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/freelancer/requests/")({
  head: () =>
    pageHead(
      "Available Requests",
      "Repair requests awaiting offers that match your services.",
    ),
  component: Available,
});

// Show eligible repair requests
function Available() {
  const { state, currentUser } = useStore();
  const me = currentUser;

  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");

  // Get matching requests
  const all = relevantRequests(state, me.id);

  // Filter and sort requests
  const list = all
    .filter((r) => cat === "all" || r.categoryId === cat)
    .filter(
      (r) =>
        !q ||
        `${r.title} ${r.description} ${r.deviceModel}`
          .toLowerCase()
          .includes(q.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "newest"
        ? b.createdAt.localeCompare(a.createdAt)
        : a.createdAt.localeCompare(b.createdAt),
    );

  const myCats = me.categoryIds ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Eligibility matched"
        title="Available repair requests"
        description={`Only awaiting-offer requests matching your ${myCats
          .map((c) => categoryName(state, c))
          .join(" and ")} services appear here.`}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-1.5"
          role="tablist"
          aria-label="Category"
        >
          {[
            {
              id: "all",
              name: `All matching (${all.length})`,
            },
            ...myCats.map((c) => ({
              id: c,
              name: categoryName(state, c),
            })),
          ].map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={cat === c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold",
                cat === c.id
                  ? "border-primary bg-primary-soft text-accent-foreground"
                  : "bg-card hover:bg-muted",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-56">
            <Search
              className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
              aria-hidden
            />

            <Input
              className="pl-9"
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search requests"
            />
          </div>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-36" aria-label="Sort">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="newest">
                Newest first
              </SelectItem>

              <SelectItem value="oldest">
                Oldest first
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No matching requests"
          description="New requests in your categories will appear here automatically."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => {
            const c = categoryName(state, r.categoryId);

            const offers = state.offers.filter(
              (o) =>
                o.requestId === r.id &&
                o.status === "Pending",
            ).length;

            const mine = state.offers.some(
              (o) =>
                o.requestId === r.id &&
                o.freelancerId === me.id &&
                o.status === "Pending",
            );

            return (
              <article
                key={r.id}
                className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm"
              >
                <div className="relative flex h-28 items-center justify-center bg-primary-soft text-primary">
                  {r.photos[0] ? (
                    <img
                      src={r.photos[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <DeviceIcon
                      category={c}
                      className="h-9 w-9"
                    />
                  )}

                  <span className="absolute right-2 top-2">
                    <StatusBadge status={r.status} />
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <p className="eyebrow">
                    {c} · posted {ago(r.createdAt)}
                  </p>

                  <h2 className="mt-1 font-semibold">
                    {r.title}
                  </h2>

                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {r.description}
                  </p>

                  <p className="mt-3 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ImageIcon
                        className="h-3.5 w-3.5"
                        aria-hidden
                      />
                      {r.photos.length} photos
                    </span>

                    <span className="flex items-center gap-1">
                      <MessageSquare
                        className="h-3.5 w-3.5"
                        aria-hidden
                      />
                      {offers} offers
                    </span>

                    {mine && (
                      <span className="font-semibold text-primary">
                        You offered
                      </span>
                    )}
                  </p>

                  <Button
                    variant="secondary"
                    className="mt-4 w-full"
                    asChild
                  >
                    <Link
                      to="/freelancer/requests/$id"
                      params={{ id: r.id }}
                    >
                      View request details
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
