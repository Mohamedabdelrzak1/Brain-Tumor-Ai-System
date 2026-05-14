import React, { useState, useCallback, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Brain, ChevronLeft } from "lucide-react";

interface NavItem {
  path: string;
  icon: any;
  label: string;
}

interface AppLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  roleBadge: React.ReactNode;
}

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 72;

// ─── Hook to detect screen size ────────────────────────────────────────────────
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  React.useEffect(() => {
    const mql = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export function AppLayout({ children, navItems, roleBadge }: AppLayoutProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isTabletCollapsed, setIsTabletCollapsed] = useState(false);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Auto-collapse sidebar on tablet
  useEffect(() => {
    if (isTablet) {
      setIsTabletCollapsed(true);
    }
  }, [isTablet]);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const toggleTabletSidebar = useCallback(() => {
    setIsTabletCollapsed((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // Desktop sidebar width based on collapse state
  const sidebarWidth = isTablet && isTabletCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_WIDTH;

  const NavItem = ({
    item,
    collapsed,
    onClick,
  }: {
    item: NavItem;
    collapsed?: boolean;
    onClick?: () => void;
  }) => {
    const Icon = item.icon;
    const isActive = location === item.path;

    return (
      <Link href={item.path}>
        <a
          onClick={onClick}
          className={`
            flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300
            ${isActive
              ? "bg-gradient-to-r from-[#2EC4A5] to-[#1fa88c] text-white shadow-md shadow-[#2EC4A5]/20"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }
            ${collapsed ? "justify-center px-0 mx-2" : ""}
          `}
          title={collapsed ? item.label : undefined}
        >
          <Icon
            size={20}
            className={isActive ? "animate-pulse shrink-0" : "shrink-0"}
          />
          {!collapsed && (
            <span className="truncate">{item.label}</span>
          )}
        </a>
      </Link>
    );
  };

  const SidebarContent = ({
    collapsed,
    onItemClick,
    showToggle,
    onToggle,
  }: {
    collapsed?: boolean;
    onItemClick?: () => void;
    showToggle?: boolean;
    onToggle?: () => void;
  }) => (
    <div className="flex flex-col h-full py-6 bg-white overflow-y-auto overflow-x-hidden">
      {/* Logo */}
      <div
        className={`
          flex items-center px-4 mb-10
          ${collapsed ? "justify-center px-0" : "gap-3"}
        `}
      >
        <div className="w-10 h-10 bg-[#2EC4A5] rounded-xl flex items-center justify-center shadow-lg shadow-[#2EC4A5]/30 text-white shrink-0">
          <Brain size={24} />
        </div>
        {!collapsed && (
          <span className="font-bold text-xl tracking-tight text-slate-900 whitespace-nowrap">
            BrainAI
          </span>
        )}
      </div>

      {/* Role Badge Area */}
      {!collapsed && <div className="px-4 mb-8">{roleBadge}</div>}

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-2">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            onClick={onItemClick}
          />
        ))}
      </nav>

      {/* Toggle button for tablet */}
      {showToggle && onToggle && (
        <div className="px-4 mt-4">
          <button
            onClick={onToggle}
            className={`
              w-full flex items-center justify-center gap-2 py-3 rounded-2xl
              text-slate-400 hover:text-slate-600 hover:bg-slate-100
              transition-all duration-300
              ${collapsed ? "px-0" : "px-4"}
            `}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              size={18}
              className={`transition-transform duration-300 ${
                collapsed ? "rotate-180" : ""
              }`}
            />
            {!collapsed && <span className="text-xs font-medium">Collapse</span>}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] overflow-x-hidden">
      {/* ─── DESKTOP SIDEBAR (lg+) ─── */}
      <aside
        className={`
          hidden lg:flex flex-col fixed inset-y-0 left-0 z-40
          border-r border-slate-200 bg-white shadow-sm
          transition-all duration-300 ease-in-out
        `}
        style={{ width: sidebarWidth }}
      >
        <SidebarContent
          collapsed={isTablet && isTabletCollapsed}
          showToggle={isTablet}
          onToggle={toggleTabletSidebar}
        />
      </aside>

      {/* ─── MOBILE DRAWER WITH OVERLAY ─── */}
      <AnimatePresence mode="wait">
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobileSidebar}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              key="mobile-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 250,
                mass: 0.8,
              }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-[60] md:hidden shadow-2xl"
            >
              <SidebarContent onItemClick={closeMobileSidebar} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{
          paddingLeft: isDesktop || isTablet ? sidebarWidth : 0,
        }}
      >
        {/* ─── MOBILE NAVBAR ─── */}
        <header
          className={`
            md:hidden h-16
            bg-white/80 backdrop-blur-md
            border-b border-slate-200
            flex items-center justify-between px-4
            sticky top-0 z-30
          `}
        >
          <button
            onClick={toggleMobileSidebar}
            className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition active:scale-95"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <span className="font-bold text-slate-900 text-base">Dashboard</span>

          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
        </header>

        {/* ─── TABLET NAVBAR (md to lg) ─── */}
        <header
          className={`
            hidden md:flex lg:hidden h-16
            bg-white/80 backdrop-blur-md
            border-b border-slate-200
            items-center justify-between px-6
            sticky top-0 z-30
          `}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTabletSidebar}
              className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition active:scale-95"
              aria-label={isTabletCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu size={22} />
            </button>
            <h1 className="font-bold text-slate-900 text-lg">Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            {roleBadge}
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
          </div>
        </header>

        {/* ─── MAIN CONTENT ─── */}
        <main className="flex-1 w-full min-w-0">
          {/* Responsive container for all page content */}
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}