import "../styles.css";
import { AppStoreProvider } from "@/context/AppStore";
import { QueryClientProvider } from "@tanstack/react-query";
import {
    Outlet,
    Link,
    createRootRouteWithContext,
    HeadContent,
    Scripts,
} from "@tanstack/react-router";

function NotFoundComponent() {
    return (
        <main>
            <h1>404 - Page not found</h1>
            <Link to="/">Go home</Link>
        </main>
    );
}

export const Route = createRootRouteWithContext()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            { name: "viewport", content: "width=device-width, initial-scale=1" },
            { title: "Sallihha - Electronic Device Repair Marketplace" },
        ],
    }),
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
});

function RootShell({ children }) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                {children}
                <Scripts />
            </body>
        </html>
    );
}

function RootComponent() {
    const { queryClient } = Route.useRouteContext();

    return (
        <QueryClientProvider client={queryClient}>
            <AppStoreProvider>
                <Outlet />
            </AppStoreProvider>
        </QueryClientProvider>
    );
}
