import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  roleBadge?: React.ReactNode;
}

export function AppLayout({ children, navItems, roleBadge }: AppLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Sidebar (desktop only) ─────────────────────────────────── */}
      <aside className="hidden md:flex w-64 lg:w-72 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen z-40">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-[#2EC4A5] flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-slate-900 text-base leading-none block">Brain Tumor</span>
            <span className="text-[11px] text-[#2EC4A5] font-semibold">Detection System</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? "bg-[#2EC4A5]/10 text-[#2EC4A5]"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-[#2EC4A5]" : "text-slate-400 group-hover:text-slate-600"}`} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-pill"
                    className="absolute left-0 w-1 h-8 bg-[#2EC4A5] rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile + logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-2">
            <div className="w-9 h-9 rounded-full bg-[#2EC4A5]/20 flex items-center justify-center text-[#2EC4A5] font-bold text-base flex-shrink-0">
              {user?.fullName?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          {roleBadge && <div className="mb-2 px-1">{roleBadge}</div>}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar — mobile: full header, desktop: just top bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-3.5 flex items-center justify-between">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#2EC4A5] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" />
              </svg>
            </div>
            <span className="font-bold text-slate-800 text-base">Brain Tumor</span>
          </div>

          {/* Desktop: page title area */}
          <div className="hidden md:block">
            <p className="text-sm text-slate-400">
              Welcome back, <span className="text-slate-700 font-semibold">{user?.fullName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {roleBadge && <div className="hidden md:block">{roleBadge}</div>}
            <button className="relative p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            {/* Mobile logout */}
            <button onClick={logout} className="md:hidden p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
              <LogOut className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
            {children}
          </div>
        </main>

        {/* ── Bottom Nav (mobile only) ───────────────────────────── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-2">
          <ul className="flex justify-around items-center">
            {navItems.map((item) => {
              const isActive = location.startsWith(item.path);
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link href={item.path} className="flex flex-col items-center gap-1 px-3 py-1.5 min-w-[56px]">
                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${isActive ? "bg-[#2EC4A5]/10 text-[#2EC4A5]" : "text-slate-400"}`}>
                      {isActive && <motion.div layoutId="mobile-nav-pill" className="absolute inset-0 bg-[#2EC4A5]/10 rounded-xl" />}
                      <Icon className="w-5 h-5 relative z-10" />
                    </div>
                    <span className={`text-[10px] font-medium ${isActive ? "text-[#2EC4A5]" : "text-slate-400"}`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
