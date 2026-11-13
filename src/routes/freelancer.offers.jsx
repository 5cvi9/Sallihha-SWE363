
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  PageHeader,
  StatusBadge,
  EmptyState,
  fmtDate,
  sar,
} from "@/components/shared";

import { useStore } from "@/context/AppStore";
import { categoryName } from "@/lib/sallihha";
import { pageHead } from "@/lib/head";

export const Route = createFileRoute("/freelancer/offers")({
  head: () =>
    pageHead(
      "My Offers",
      "Offers you have sent to customers and their status.",
    ),
  component: MyOffers,
});

function MyOffers() {
  const { state, currentUser } = useStore();
  const [tab, setTab] = useState("all");

  // Get freelancer's offers
  const mine = state.offers
    .filter((o) => o.freelancerId === currentUser.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Filter offers by status
  const list = mine.filter(
    (o) => tab === "all" || o.status === tab
  );

  return (
    <>
      <PageHeader
        title="My Offers"
        description="Track the offers you've sent."
      />

      <Tabs
        value={tab}
        onValueChange={setTab}
        className="mb-4"
      >
        <TabsList className="flex-wrap">
          {[
            "all",
            "Pending",
            "Accepted",
            "Not Selected",
            "Rejected",
            "Withdrawn",
          ].map((t) => (
            <TabsTrigger key={t} value={t}>
              {t === "all"
                ? `All (${mine.length})`
                : t}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {list.length === 0 ? (
        <EmptyState
          title="No offers here"
          description="Browse available requests to send your first offer."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-3">Request</th>
                <th className="p-3">Price</th>
                <th className="hidden p-3 sm:table-cell">
                  Sent
                </th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              {list.map((o) => {
                const r = state.requests.find(
                  (x) => x.id === o.requestId
                );

                const link =
                  o.status === "Accepted" ? (
                    <Link
                      to="/freelancer/repairs/$id"
                      params={{ id: r.id }}
                      className="font-semibold hover:text-primary"
                    >
                      {r.title}
                    </Link>
                  ) : o.status === "Pending" ? (
                    <Link
                      to="/freelancer/requests/$id"
                      params={{ id: r.id }}
                      className="font-semibold hover:text-primary"
                    >
                      {r.title}
                    </Link>
                  ) : (
                    <span className="font-semibold">
                      {r.title}
                    </span>
                  );

                return (
                  <tr
                    key={o.id}
                    className="border-t"
                  >
                    <td className="p-3">
                      {link}

                      <span className="block text-xs text-muted-foreground">
                        {categoryName(
                          state,
                          r.categoryId
                        )}{" "}
                        · {r.id}
                      </span>
                    </td>

                    <td className="p-3 font-semibold">
                      {sar(o.price)}
                    </td>

                    <td className="hidden p-3 sm:table-cell">
                      {fmtDate(o.createdAt)}
                    </td>

                    <td className="p-3">
                      <StatusBadge status={o.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
