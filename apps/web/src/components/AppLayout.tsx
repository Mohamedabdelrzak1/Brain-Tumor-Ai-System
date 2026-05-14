import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Brain } from "lucide-react";

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

export function AppLayout({ children, navItems, roleBadge }: AppLayoutProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => setIsMobileOpen(!isMobileOpen);

  const SidebarContent = ({ onItemClick }: { onItemClick?: () => void }) => (
    <div className="flex flex-col h-full py-6 px-4 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-[#2EC4A5] rounded-xl flex items-center justify-center shadow-lg shadow-[#2EC4A5]/30 text-white">
          <Brain size={24} />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900">BrainAI</span>
      </div>

      {/* Role Badge Area */}
      <div className="px-2 mb-8">
        {roleBadge}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          return (
            <Link key={item.path} href={item.path}>
              <a
                onClick={onItemClick}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300
                  ${isActive 
                    ? "bg-gradient-to-r from-[#2EC4A5] to-[#1fa88c] text-white shadow-md shadow-[#2EC4A5]/20" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}
                `}
              >
                <Icon size={20} className={isActive ? "animate-pulse" : ""} />
                {item.label}
              </a>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-slate-200 bg-white fixed inset-y-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[70] lg:hidden shadow-2xl"
            >
              <SidebarContent onItemClick={() => setIsMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72">
        {/* Mobile Navbar Header */}
        <header className="lg:hidden h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-50">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition"
          >
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-900">Dashboard</span>
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200" />
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}