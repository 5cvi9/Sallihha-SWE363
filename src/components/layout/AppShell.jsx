
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  History,
  Search,
  Send,
  Wrench,
  UserCog,
  Users,
  BadgeCheck,
  Tags,
  ShieldAlert,
  Activity,
  LogOut,
  Menu,
  Leaf,
  ChevronDown,
} from "lucide-react";
import { useStore } from "@/context/AppStore";
import { cn } from "@/lib/utils";
import { Logo, initials } from "@/components/shared";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = {
  customer: {
    portal: "Customer portal",
    items: [
      { to: "/customer", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/customer/requests/new", label: "New Repair Request", icon: PlusCircle },
      { to: "/customer/requests", label: "My Repair Requests", icon: ClipboardList },
      { to: "/customer/history", label: "Repair History", icon: History },
    ],
  },
  freelancer: {
    portal: "Repair provider portal",
    items: [
      { to: "/freelancer", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { to: "/freelancer/requests", label: "Available Requests", icon: Search },
      { to: "/freelancer/offers", label: "My Offers", icon: Send },
      { to: "/freelancer/repairs", label: "My Accepted Repairs", icon: Wrench },
      { to: "/freelancer/profile", label: "My Profile & Services", icon: UserCog },
    ],
  },
  admin: {
    portal: "Admin console",
    items: [
      { to: "/admin", label: "Platform Activity", icon: Activity, exact: true },
      { to: "/admin/users", label: "User Accounts", icon: Users },
      { to: "/admin/freelancers", label: "Freelancer Profiles", icon: BadgeCheck },
      { to: "/admin/categories", label: "Repair Categories", icon: Tags },
      { to: "/admin/reports", label: "User Reports", icon: ShieldAlert },
    ],
  },
};

const ROLE_LABEL = { customer: "Customer", freelancer: "Repair provider", admin: "Administrator" };

/** Most specific nav item matching the current URL (used for highlight + top-bar title). */
function useActiveNav(role) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return NAV[role].items
    .filter((i) => (i.exact ? path === i.to : path === i.to || path.startsWith(i.to + "/")))
    .sort((a, b) => b.to.length - a.to.length)[0];
}

const WORKSPACE = {
  customer: "Customer workspace",
  freelancer: "Freelancer workspace",
  admin: "Admin workspace",
};

function SidebarNav({ role, onNavigate, onLogout }) {
  const items = NAV[role].items;
  const activeTo = useActiveNav(role)?.to;
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Logo />
        <span className="text-lg font-extrabold text-sidebar-accent-foreground">Sallihha</span>
      </div>
      <p className="px-5 pb-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-navy-muted">
        {NAV[role].portal}
      </p>
      <nav className="flex-1 space-y-0.5 px-3" aria-label="Main navigation">
        {items.map((i) => {
          const active = i.to === activeTo;
          return (
            <Link
              key={i.to}
              to={i.to}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_var(--color-sidebar-primary)]"
                  : "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
              )}
            >
              <i.icon className={cn("h-4 w-4", active && "text-sidebar-primary")} aria-hidden />
              {i.label}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-3 p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4" aria-hidden /> Logout
        </button>
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="flex items-center gap-2 text-xs font-semibold text-sidebar-accent-foreground">
            <Leaf className="h-3.5 w-3.5 text-sidebar-primary" aria-hidden /> Second chances matter
          </p>
          <p className="mt-0.5 text-[0.7rem] text-navy-muted">Repair · reuse · recycle</p>
        </div>
      </div>
    </div>
  );
}

export function RoleLayout({ role }) {
  const { currentUser, hydrated, signOut } = useStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = useActiveNav(role);

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser) navigate({ to: "/login", replace: true });
    else if (currentUser.role !== role) navigate({ to: `/${currentUser.role}`, replace: true });
  }, [hydrated, currentUser, role, navigate]);

  if (!hydrated || !currentUser || currentUser.role !== role) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm text-muted-foreground"
        role="status"
      >
        Loading your workspace…
      </div>
    );
  }

  const logout = () => {
    signOut();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
        <SidebarNav role={role} onLogout={logout} />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-72 border-0 p-0 [&>button]:bg-transparent [&>button]:text-sidebar-accent-foreground [&>button]:opacity-100"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarNav role={role} onNavigate={() => setMobileOpen(false)} onLogout={logout} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur sm:px-6">
          <button
            className="rounded-md p-2 hover:bg-muted lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{WORKSPACE[role]}</p>
            <p className="truncate text-sm font-semibold">{active?.label ?? "Sallihha"}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {initials(currentUser.name)}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-sm font-semibold leading-tight">
                  {currentUser.name}
                </span>
                <span className="block text-xs text-muted-foreground">{ROLE_LABEL[role]}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <span className="block">{currentUser.name}</span>
                <span className="block text-xs font-normal text-muted-foreground">
                  {currentUser.email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {role === "freelancer" && (
                <DropdownMenuItem onSelect={() => navigate({ to: "/freelancer/profile" })}>
                  My profile
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={logout}>
                <LogOut className="h-4 w-4" aria-hidden /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
    >
      ← {children}
    </Link>
  );
}
