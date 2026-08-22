// Drishti v0.1 — application shell with sidebar nav | 11-Jul-2026
import clsx from "clsx";
import {
  Activity,
  LayoutDashboard,
  LinkIcon,
  LogOut,
  Menu,
  Network,
  Radio,
  Route,
  ScrollText,
  Settings,
  ShieldAlert,
  Server,
  Wrench,
  X,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuroraBackground } from "./ui/AuroraBackground";
import { api } from "../api/client";
import { useAuth } from "../auth";
import { useToast } from "../store/graphStore";
import { Button } from "./Button";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/graph", label: "Attack Map", icon: Network, end: false },
  { to: "/app/live", label: "Live Watch", icon: Radio, end: false },
  { to: "/app/paths", label: "Paths", icon: Route, end: false },
  { to: "/app/findings", label: "Findings", icon: ShieldAlert, end: false },
  { to: "/app/assets", label: "Assets", icon: Server, end: false },
  { to: "/app/report", label: "Report", icon: ScrollText, end: false },
  { to: "/app/url-analyzer", label: "URL Analyzer", icon: LinkIcon, end: false },
];

export function Shell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const toast = useToast();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const recompute = useMutation({
    mutationFn: () => api.recompute(),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.show("Risk model recomputed", "success");
    },
    onError: () => toast.show("Couldn't recompute — retry", "error"),
  });

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const currentNav = NAV.find((item) =>
    item.end
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to)
  );

  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      {/* Top Application Header */}
      <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-hairline bg-paper-white/90 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-hairline bg-cloud-mist/40 text-graphite-ink transition-colors hover:bg-cloud-mist lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5 text-signal-orange" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          {/* Logo & Org Badge */}
          <NavLink to="/app" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-signal-orange text-paper-white shadow-sm">
              <Activity className="h-[18px] w-[18px]" />
            </div>
            <span className="font-display text-[24px] font-semibold leading-none tracking-tight text-graphite-ink">
              Drishti
            </span>
          </NavLink>

          <span className="hidden text-ash-mist sm:inline">·</span>

          {/* Workspace org name */}
          <span className="hidden rounded-full border border-hairline bg-cloud-mist/50 px-2.5 py-0.5 font-mono text-[11px] font-medium text-slate-pencil sm:inline">
            {user?.org_name || "Workspace"}
          </span>

          {/* Breadcrumb current page tag */}
          {currentNav && (
            <div className="hidden items-center gap-1.5 pl-2 text-body-sm font-medium text-slate-pencil md:flex">
              <span className="text-ash-mist">/</span>
              <span className="font-semibold text-graphite-ink">
                {currentNav.label}
              </span>
            </div>
          )}
        </div>

        {/* Top Navbar Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Top Quick Links for Tablet/Desktop */}
          <div className="hidden items-center gap-1 lg:flex xl:gap-2">
            {NAV.slice(0, 4).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-body-sm font-medium transition-colors",
                    isActive
                      ? "bg-signal-orange/10 font-semibold text-signal-orange"
                      : "text-slate-pencil hover:bg-cloud-mist/60 hover:text-graphite-ink"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          <div className="h-4 w-px bg-hairline hidden lg:block" />

          <Button
            variant="ghost"
            size="sm"
            loading={recompute.isPending}
            onClick={() => recompute.mutate()}
            className="hidden sm:inline-flex"
          >
            <Wrench className="h-3.5 w-3.5" /> Recompute
          </Button>

          <UserMenu />
        </div>
      </header>

      {/* Mobile Drawer Sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-20 overflow-hidden border-b border-hairline bg-paper-white/95 px-4 py-3 backdrop-blur-lg lg:hidden"
          >
            <nav className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      "flex items-center gap-3 rounded-md border px-3 py-2.5 text-body-sm font-medium transition-all",
                      isActive
                        ? "border-signal-orange/40 bg-cloud-mist text-graphite-ink font-semibold"
                        : "border-transparent text-slate-pencil hover:bg-cloud-mist/60 hover:text-graphite-ink"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={clsx(
                          "h-4 w-4 shrink-0",
                          isActive ? "text-signal-orange" : "text-ash-mist"
                        )}
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop & Tablet Sidebar */}
        <nav className="hidden shrink-0 flex-col border-r border-hairline bg-paper-white py-4 lg:flex lg:w-56">
          <div className="mb-2 px-4">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ash-mist">
              Navigation
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-1 px-3">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    "group relative flex items-center gap-3 rounded-md border px-3 py-2.5 text-body-sm font-semibold transition-all duration-150 active:translate-y-px",
                    isActive
                      ? "border-signal-orange/40 bg-cloud-mist text-graphite-ink shadow-subtle"
                      : "border-transparent text-slate-pencil hover:border-hairline hover:bg-cloud-mist/60 hover:text-graphite-ink"
                  )
                }
                title={item.label}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-signal-orange" />
                    )}
                    <item.icon
                      className={clsx(
                        "h-[18px] w-[18px] shrink-0 transition-colors",
                        isActive
                          ? "text-signal-orange"
                          : "text-ash-mist group-hover:text-slate-pencil"
                      )}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
          <div className="mx-4 border-t border-hairline pt-3">
            <p className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-ash-mist">
              Signal &amp; Terrain
              <br />
              defensive-only
            </p>
          </div>
        </nav>

        <AuroraBackground className="flex-1 overflow-y-auto scrollbar-thin overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.25, ease: "circOut" }}
              className="h-full w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </AuroraBackground>
      </div>
    </div>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, [open]);

  const initial = (user?.name || user?.email || "?").charAt(0).toUpperCase();

  const signOut = () => {
    setOpen(false);
    logout();
    navigate("/");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account menu"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-500/20 font-display text-small text-accent-400 transition-colors hover:bg-accent-500/30"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-30 w-56 rounded-md border border-edge-subtle bg-bg-surface p-1.5 shadow-lg">
          <div className="border-b border-edge-subtle px-2.5 pb-2 pt-1">
            <div className="text-small text-ink-primary">{user?.name || "—"}</div>
            <div className="font-mono text-[11px] text-ink-muted">{user?.email}</div>
            <div className="mt-0.5 text-[11px] uppercase tracking-[0.02em] text-ink-muted">
              {user?.role}
            </div>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              navigate("/app/settings");
            }}
            className="mt-1 flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-small text-ink-secondary hover:bg-bg-raised hover:text-ink-primary"
          >
            <Settings className="h-3.5 w-3.5" /> Settings
          </button>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-small text-ink-secondary hover:bg-bg-raised hover:text-ink-primary"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
