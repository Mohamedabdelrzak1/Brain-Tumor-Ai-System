import React, { useState, useCallback, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Brain,
  ChevronLeft,
  Bell,
  Settings,
  Key,
  LogOut,
  User,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Upload,
  X,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from "@/lib/api7138";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  path: string;
  icon: any;
  label: string;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  analysisId?: number;
}

interface AppLayoutProps {
  children: React.ReactNode;
  navItems: NavItem[];
  roleBadge: React.ReactNode;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const SIDEBAR_WIDTH = 272;
const SIDEBAR_COLLAPSED_WIDTH = 72;

// ─── Hooks ─────────────────────────────────────────────────────────────────────
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

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

// ─── Notification Detail Modal ─────────────────────────────────────────────────
function NotificationDetailModal({
  notification,
  onClose,
  onNavigate,
}: {
  notification: Notification;
  onClose: () => void;
  onNavigate: (analysisId: number) => void;
}) {
  const notifIcons: Record<string, any> = {
    Analysis: CheckCircle,
    Scan: Upload,
    malfunction: AlertTriangle,
  };
  const Icon = notifIcons[notification.type] || CheckCircle;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.95, y: 10, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start gap-4 p-6 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2EC4A5]/10 flex items-center justify-center shrink-0">
            <Icon size={24} className="text-[#2EC4A5]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-800 text-lg">{notification.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(notification.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-sm text-slate-600 leading-relaxed">
            {notification.message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
            notification.isRead
              ? "bg-slate-200 text-slate-500"
              : "bg-[#2EC4A5]/10 text-[#2EC4A5]"
          }`}>
            {notification.isRead ? "Read" : "Unread"}
          </span>
          <div className="flex gap-2">
            {notification.analysisId && (
              <button
                onClick={() => {
                  onNavigate(notification.analysisId!);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-[#2EC4A5] text-white text-sm font-semibold hover:bg-[#1fa88c] transition"
              >
                View Details
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Notification Dropdown ─────────────────────────────────────────────────────
function NotificationDropdown({
  notifications: initialNotifications,
  onClose,
  onNavigateAnalysis,
  onMarkAsRead,
  onMarkAllRead,
  onDelete,
  onSelectNotification,
}: {
  notifications: Notification[];
  onClose: () => void;
  onNavigateAnalysis: (analysisId: number) => void;
  onMarkAsRead?: (id: number) => void;
  onMarkAllRead?: () => void;
  onDelete?: (id: number) => void;
  onSelectNotification: (n: Notification) => void;
}) {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [tab, setTab] = useState<"unread" | "read">("unread");
  const unread = initialNotifications.filter((n) => !n.isRead);
  const read = initialNotifications.filter((n) => n.isRead);
  const filtered = tab === "unread" ? unread : read;
  const unreadCount = unread.length;

  const notifIcons: Record<string, any> = {
    Analysis: CheckCircle,
    Scan: Upload,
    malfunction: AlertTriangle,
  };

  const handleClick = (n: Notification) => {
    if (!n.isRead) onMarkAsRead?.(n.id);
    onSelectNotification(n);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className={`
          ${isMobile 
            ? "fixed inset-x-4 top-20 w-auto" 
            : "absolute right-0 top-full mt-2 w-[400px]"}
          bg-white rounded-2xl shadow-2xl border border-slate-200/60 
          overflow-hidden z-[100]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-slate-600" />
            <span className="font-semibold text-slate-800 text-sm">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2EC4A5]/10 text-[#2EC4A5]">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="text-xs text-[#2EC4A5] hover:text-[#1fa88c] font-medium transition"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setTab("unread")}
            className={`flex-1 py-2.5 text-xs font-semibold transition relative ${
              tab === "unread"
                ? "text-[#2EC4A5]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Unread ({unread.length})
            {tab === "unread" && (
              <motion.div
                layoutId="notifTab"
                className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#2EC4A5] rounded-full"
              />
            )}
          </button>
          <button
            onClick={() => setTab("read")}
            className={`flex-1 py-2.5 text-xs font-semibold transition relative ${
              tab === "read"
                ? "text-[#2EC4A5]"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            Read ({read.length})
            {tab === "read" && (
              <motion.div
                layoutId="notifTab"
                className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#2EC4A5] rounded-full"
              />
            )}
          </button>
        </div>

        {/* List */}
        <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              {tab === "unread" ? "No unread notifications" : "No read notifications"}
            </div>
          ) : (
            filtered.map((n) => {
              const Icon = notifIcons[n.type] || CheckCircle;

              return (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className={`
                    group flex items-start gap-3 p-3 rounded-xl cursor-pointer
                    transition-all duration-200
                    ${n.isRead
                      ? "hover:bg-slate-50"
                      : "bg-[#2EC4A5]/5 hover:bg-[#2EC4A5]/10"
                    }
                  `}
                  onClick={() => handleClick(n)}
                >
                  {/* Icon */}
                  <div className={`
                    w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                    ${n.isRead ? "bg-slate-100" : "bg-[#2EC4A5]/10"}
                  `}>
                    <Icon
                      size={16}
                      className={n.isRead ? "text-slate-400" : "text-[#2EC4A5]"}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`
                        text-sm truncate
                        ${n.isRead ? "text-slate-600" : "text-slate-800 font-semibold"}
                      `}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#2EC4A5] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {n.message}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(n.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </>
  );
}

// ─── User Menu Dropdown ────────────────────────────────────────────────────────

function UserMenuDropdown({
  user,
  onClose,
  onNavigate,
  onLogout,
}: {
  user: any;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
}) {
  const [location] = useLocation();

 

  // ───────── Route Builder ─────────
  const buildProfileRoute = (tab: string) => {
    return `profile`;
  };

  // ───────── Menu Items ─────────
  const items = [
    {
      label: "My Profile",
      desc: "Manage your personal information",
      icon: User,
      tab: "profile",
      color: "emerald",
    },
  
   
   
  ];

  // ───────── Icon Colors ─────────
  const colorStyles: Record<string, string> = {
    emerald:
      "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100",

    blue:
      "bg-blue-50 text-blue-500 group-hover:bg-blue-100",

    amber:
      "bg-amber-50 text-amber-500 group-hover:bg-amber-100",

    purple:
      "bg-purple-50 text-purple-500 group-hover:bg-purple-100",
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -10,
        scale: 0.96,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -10,
        scale: 0.96,
      }}
      transition={{
        duration: 0.22,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="
        absolute right-0 top-full mt-3
        w-[310px]

        rounded-[28px]

        border border-slate-200/70

        bg-white/95
        backdrop-blur-2xl

        shadow-[0_25px_80px_rgba(15,23,42,0.14)]

        overflow-hidden
        z-[200]
      "
    >
      {/* ───────── Background Glow ───────── */}
      <div
        className="
          absolute top-0 right-0
          w-40 h-40

          bg-emerald-400/10

          blur-3xl
          rounded-full

          pointer-events-none
        "
      />

      {/* ───────── User Info ───────── */}
      <div
        className="
          relative px-5 py-5
          border-b border-slate-100
        "
      >
        <div className="flex items-center gap-4">

          {/* Avatar */}
          <div className="relative">

            {/* Online Dot */}
            <div
              className="
                absolute bottom-0 right-0

                w-3.5 h-3.5
                rounded-full

                bg-emerald-400

                border-2 border-white

                shadow-sm
              "
            />

            <div
              className="
                w-14 h-14
                rounded-2xl

                bg-gradient-to-br
                from-emerald-400
                via-teal-500
                to-emerald-600

                flex items-center justify-center

                text-white
                text-lg
                font-bold

                shadow-lg
                shadow-emerald-500/20
              "
            >
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>

          {/* User Details */}
          <div className="min-w-0 flex-1">

            <h3
              className="
                text-[15px]
                font-bold
                text-slate-900
                truncate
              "
            >
              {user?.fullName || "User"}
            </h3>

            <p
              className="
                text-sm
                text-slate-400
                truncate
                mt-1
              "
            >
              {user?.email || "user@email.com"}
            </p>

            {/* Secure Badge */}
            <div
              className="
                mt-2

                inline-flex items-center gap-1.5

                px-2 py-1
                rounded-full

                bg-emerald-50
                border border-emerald-100

                text-[11px]
                font-semibold

                text-emerald-600
              "
            >
              <ShieldCheck size={11} />
              Secure Account
            </div>
          </div>
        </div>
      </div>

      {/* ───────── Menu Items ───────── */}
      <div className="relative p-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              onClick={() => {
                onNavigate(
                  buildProfileRoute(item.tab)
                );

                onClose();
              }}
              className="
                group relative
                w-full

                flex items-center gap-4

                px-3 py-3.5
                rounded-2xl

                transition-all duration-300

                hover:bg-slate-50
                hover:translate-x-[2px]
              "
            >
              {/* Icon */}
              <div
                className={`
                  w-11 h-11
                  rounded-2xl

                  flex items-center justify-center

                  transition-all duration-300
                  shrink-0

                  ${colorStyles[item.color]}
                `}
              >
                <Icon size={18} />
              </div>

              {/* Text */}
              <div className="flex-1 text-left min-w-0">

                <p
                  className="
                    text-sm
                    font-semibold

                    text-slate-700

                    group-hover:text-slate-900

                    transition-colors
                  "
                >
                  {item.label}
                </p>

                <p
                  className="
                    text-[12px]
                    text-slate-400
                    truncate
                    mt-0.5
                  "
                >
                  {item.desc}
                </p>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={16}
                className="
                  text-slate-300

                  opacity-0
                  -translate-x-1

                  group-hover:opacity-100
                  group-hover:translate-x-0

                  transition-all duration-300
                "
              />
            </button>
          );
        })}
      </div>

      {/* ───────── Divider ───────── */}
      <div className="px-4">
        <div
          className="
            h-px

            bg-gradient-to-r
            from-transparent
            via-slate-200
            to-transparent
          "
        />
      </div>

      {/* ───────── Logout ───────── */}
      <div className="p-2">
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="
            group relative overflow-hidden
            w-full

            flex items-center gap-4

            px-3 py-3.5
            rounded-2xl

            transition-all duration-300

            bg-gradient-to-r
            from-red-50
            to-rose-50

            border border-red-100

            hover:shadow-[0_15px_35px_rgba(239,68,68,0.12)]

            hover:border-red-200
            hover:translate-y-[-1px]
          "
        >
          {/* Glow */}
          <div
            className="
              absolute inset-0

              bg-gradient-to-r
              from-red-100/0
              via-red-100/40
              to-rose-100/0

              opacity-0
              group-hover:opacity-100

              transition-opacity duration-500
            "
          />

          {/* Icon */}
          <div
            className="
              relative z-10

              w-11 h-11
              rounded-2xl

              bg-white/80
              border border-red-100

              flex items-center justify-center

              shadow-sm

              transition-all duration-300

              group-hover:rotate-6
            "
          >
            <LogOut
              size={18}
              className="
                text-red-500

                group-hover:scale-110

                transition-transform duration-300
              "
            />
          </div>

          {/* Text */}
          <div className="relative z-10 flex-1 text-left">

            <p
              className="
                text-sm
                font-bold
                text-red-500
              "
            >
              Logout
            </p>

            <p
              className="
                text-[12px]
                text-red-400
                mt-0.5
              "
            >
              End your current session
            </p>
          </div>

          {/* Arrow */}
          <ChevronRight
            size={16}
            className="
              relative z-10

              text-red-300

              transition-all duration-300

              group-hover:translate-x-1
            "
          />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Sidebar Navigation Item ──────────────────────────────────────────────────
// ─── Ultra Modern Sidebar Nav Item ───────────────────────────────────────────
function NavItem({
  item,
  collapsed,
  isActive,
  onClick,
}: {
  item: NavItem;
  collapsed?: boolean;
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link href={item.path}>
      <a
        onClick={onClick}
        className={`
          relative group flex items-center overflow-hidden

          transition-[transform,background-color,color,box-shadow]
          duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]

          ${
            collapsed
              ? `
                w-[58px] h-[58px]
                mx-auto
                justify-center
                rounded-[22px]
              `
              : `
                h-[60px]
                mx-3
                px-4
                rounded-[22px]
              `
          }

          ${
            isActive
              ? `
                bg-gradient-to-r
                from-emerald-400
                via-teal-500
                to-emerald-500

                text-white

                shadow-[0_12px_35px_rgba(16,185,129,0.32)]

                scale-[1.015]
              `
              : `
                text-slate-500
                hover:text-slate-900
                hover:bg-white
                hover:shadow-[0_10px_30px_rgba(15,23,42,0.05)]
                hover:translate-x-[3px]
              `
          }
        `}
        title={collapsed ? item.label : undefined}
      >
        {/* Hover Glow */}
        {!isActive && (
          <div
            className="
              absolute inset-0
              rounded-[22px]

              bg-gradient-to-r
              from-emerald-50
              via-teal-50
              to-emerald-50

              opacity-0
              group-hover:opacity-100

              transition-opacity
              duration-500
            "
          />
        )}

        {/* Active Animated Layer */}
        {isActive && (
          <>
            <motion.div
              layoutId="activeSidebarItem"
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 24,
              }}
              className="
                absolute inset-0
                rounded-[22px]

                bg-gradient-to-r
                from-emerald-400
                via-teal-500
                to-emerald-500
              "
            />

            {/* Animated Shine */}
            <motion.div
              animate={{
                x: ["-120%", "220%"],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "linear",
              }}
              className="
                absolute top-0 left-0
                h-full w-[40%]

                bg-white/20
                blur-xl
                rotate-12
              "
            />
          </>
        )}

        {/* Left Indicator */}
        {isActive && !collapsed && (
          <motion.div
            layoutId="activeIndicator"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="
              absolute left-0 top-1/2 -translate-y-1/2

              h-8 w-[4px]
              rounded-r-full

              bg-white/90
              shadow-[0_0_12px_rgba(255,255,255,0.8)]
            "
          />
        )}

        {/* Content */}
        <div
          className={`
            relative z-10 flex items-center w-full
            ${collapsed ? "justify-center" : ""}
          `}
        >
          {/* Icon Container */}
          <div
            className={`
              relative flex items-center justify-center shrink-0

              transition-all duration-500

              ${
                collapsed
                  ? `
                    w-11 h-11
                    rounded-2xl
                  `
                  : `
                    w-10 h-10
                    rounded-2xl
                  `
              }

              ${
                isActive
                  ? `
                    bg-white/15
                    backdrop-blur-md
                    border border-white/10
                  `
                  : `
                    group-hover:bg-white
                  `
              }
            `}
          >
            {/* Icon Glow */}
            {isActive && (
              <div
                className="
                  absolute inset-0
                  rounded-2xl
                  bg-white/20
                  blur-md
                "
              />
            )}

            <Icon
              size={20}
              strokeWidth={2.2}
              className={`
                relative z-10 transition-all duration-500

                ${
                  isActive
                    ? `
                      text-white
                      scale-105
                    `
                    : `
                      text-slate-500
                      group-hover:text-emerald-500
                      group-hover:scale-105
                    `
                }
              `}
            />
          </div>

          {/* Label */}
          {!collapsed && (
            <>
              <span
                className={`
                  ml-3.5

                  text-[15px]
                  font-semibold
                  tracking-[-0.015em]

                  transition-all duration-500

                  ${
                    isActive
                      ? "text-white"
                      : "text-slate-600 group-hover:text-slate-900"
                  }
                `}
              >
                {item.label}
              </span>

              {/* Hover Dot */}
              {!isActive && (
                <div
                  className="
                    ml-auto

                    w-2 h-2
                    rounded-full

                    bg-emerald-400

                    opacity-0
                    scale-50

                    group-hover:opacity-100
                    group-hover:scale-100

                    transition-all duration-500
                  "
                />
              )}
            </>
          )}
        </div>

        {/* Border Glow */}
        {isActive && (
          <div
            className="
              absolute inset-0
              rounded-[22px]

              border border-white/10
            "
          />
        )}
      </a>
    </Link>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────
function SidebarContent({
  collapsed,
  onItemClick,
  showToggle,
  onToggle,
  navItems,
  roleBadge,
  location,
  onLogout,
}: {
  collapsed?: boolean;
  onItemClick?: () => void;
  showToggle?: boolean;
  onToggle?: () => void;
  navItems: NavItem[];
  roleBadge: React.ReactNode;
  location: string;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-white/95 backdrop-blur-xl border-r border-slate-100">
      
      {/* ───────── Logo / Branding ───────── */}
      <div
        className={`
          relative flex items-center
          pt-7 pb-6 px-5
          ${collapsed ? "justify-center px-0" : "gap-3.5"}
        `}
      >
        {/* Glow Background */}
        <div className="absolute top-5 left-5 w-20 h-20 bg-emerald-400/10 blur-3xl rounded-full pointer-events-none" />

        {/* Animated Logo */}
        <div className="relative shrink-0 group cursor-pointer">
          
          {/* Outer Glow */}
          <div className="absolute inset-0 rounded-2xl bg-emerald-400/30 blur-xl scale-110 opacity-70 group-hover:opacity-100 transition-all duration-500" />

          {/* Logo Box */}
          <div
            className="
              relative w-12 h-12 rounded-2xl
              bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600
              flex items-center justify-center
              shadow-[0_10px_30px_rgba(16,185,129,0.35)]
              transition-all duration-500
              group-hover:scale-105
              group-hover:rotate-3
            "
          >
            <Brain
              size={24}
              className="text-white drop-shadow-sm"
            />
          </div>
        </div>

        {/* Branding */}
        {!collapsed && (
          <div className="flex flex-col leading-tight min-w-0">
            
            {/* Brand Name */}
            <div className="flex items-center">
              <h1
                className="
                  text-[28px] font-extrabold tracking-[-0.03em]
                  text-slate-900 truncate
                "
              >
                Brain
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  AI
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <span
              className="
                text-[11px]
                font-medium
                tracking-[0.22em]
                uppercase
                text-slate-400
                mt-1
              "
            >
              Intelligent Care
            </span>
          </div>
        )}
      </div>

    

      {/* ───────── Navigation ───────── */}
      <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            isActive={location === item.path}
            onClick={onItemClick}
          />
        ))}
      </nav>

      {/* ───────── Bottom Section ───────── */}
      <div className="px-4 pb-6 pt-4 border-t border-slate-100 bg-white/80 backdrop-blur-md">
        
        
        {/* ───────── Logout Button ───────── */}
<button
  onClick={onLogout}
  className={`
    group relative overflow-hidden
    mt-4 w-full

    flex items-center
    ${collapsed ? "justify-center px-0 h-[52px]" : "gap-3 px-4 h-[56px]"}

    rounded-2xl
    border border-red-100

    bg-gradient-to-r
    from-red-50
    to-rose-50

    text-red-500

    transition-all duration-500

    hover:scale-[1.02]
    hover:shadow-[0_15px_35px_rgba(239,68,68,0.15)]
    hover:border-red-200
  `}
>
  {/* Hover Glow */}
  <div
    className="
      absolute inset-0
      bg-gradient-to-r
      from-red-100/0
      via-red-100/50
      to-rose-100/0

      opacity-0
      group-hover:opacity-100

      transition-opacity duration-500
    "
  />

  {/* Icon */}
  <div
    className={`
      relative z-10
      flex items-center justify-center shrink-0

      ${
        collapsed
          ? "w-10 h-10 rounded-xl"
          : "w-11 h-11 rounded-2xl"
      }

      bg-white/80
      border border-red-100
      shadow-sm

      transition-all duration-500

      group-hover:bg-white
      group-hover:rotate-6
    `}
  >
    <LogOut
      size={19}
      className="
        text-red-500
        transition-transform duration-500
        group-hover:scale-110
      "
    />
  </div>

  {/* Text */}
  {!collapsed && (
    <div className="relative z-10 flex flex-col items-start">
      <span className="text-sm font-bold tracking-[-0.02em]">
        Logout
      </span>

     
    </div>
  )}

  {/* Arrow */}
  {!collapsed && (
    <ChevronRight
      size={16}
      className="
        relative z-10
        ml-auto

        text-red-300

        transition-all duration-500

        group-hover:translate-x-1
        group-hover:text-red-400
      "
    />
  )}
</button>

        {/* Collapse Button */}
        {showToggle && onToggle && (
          <button
            onClick={onToggle}
            className={`
              group mt-3
              w-full flex items-center justify-center gap-2
              py-2.5 rounded-2xl
              text-slate-400 hover:text-slate-700
              hover:bg-slate-100
              transition-all duration-300
              ${collapsed ? "px-0" : "px-3"}
            `}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft
              size={16}
              className={`
                transition-transform duration-300
                group-hover:-translate-x-0.5
                ${collapsed ? "rotate-180" : ""}
              `}
            />

            {!collapsed && (
              <span className="text-xs font-semibold tracking-wide">
                Collapse
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main AppLayout ───────────────────────────────────────────────────────────
export function AppLayout({ children, navItems, roleBadge }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isTabletCollapsed, setIsTabletCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");

  useClickOutside(notifRef, () => setShowNotifications(false));
  useClickOutside(userMenuRef, () => setShowUserMenu(false));


  // Auto-collapse sidebar on tablet
  useEffect(() => {
    if (isTablet) {
      setIsTabletCollapsed(true);
    }
  }, [isTablet]);

  const toggleMobile = useCallback(() => setIsMobileOpen((p) => !p), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);
  const toggleTablet = useCallback(() => setIsTabletCollapsed((p) => !p), []);

  const sidebarWidth = isTablet && isTabletCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_WIDTH;

  const handleNavigate = (path: string) => {
    // Get current role prefix from location
    const rolePrefix = location.split("/")[1];
    navigate(`/${rolePrefix}/${path}`);
  };

  // Isolation Logic: Every user sees only their notifications
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);

  const updateNotificationState = async (id: number, isRead: boolean) => {
    setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead } : n));
    if (isRead) {
      try {
        await markNotificationAsRead(id);
      } catch (err) {
        console.error("Failed to sync read status with server", err);
      }
    }
  };

  const deleteNotificationState = async (id: number) => {
    setAllNotifications(prev => prev.filter(n => n.id !== id));
    if (selectedNotification?.id === id) setSelectedNotification(null);
    try {
      await deleteNotification(id);
    } catch (err) {
      console.error("Failed to delete notification on server", err);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setAllNotifications([]);
      return;
    }

    const saved = localStorage.getItem(`notifications_${user.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setAllNotifications(parsed);
      } catch {}
    }
  }, [user?.id]);

  const unreadNotifCount = allNotifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(allNotifications));
    }
  }, [allNotifications, user?.id]);

  // Fetch real notifications from API for the logged-in user
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifs = async () => {
      try {
        const data = await getNotifications(1);
        // Handle different possible API structures
        const list = (data as any)?.data || (data as any)?.notifications || (Array.isArray(data) ? data : []);
        
        if (list.length > 0) {
          const transformed = list.map((n: any) => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type || "Analysis",
            isRead: n.isRead ?? false,
            createdAt: n.createdAt,
            analysisId: n.analysisId,
          }));
          setAllNotifications(transformed);
        }
      } catch {
        console.error("Failed to fetch notifications");
      }
    };
    fetchNotifs();
  }, [location, user?.id]);

  const handleNavigateAnalysis = (analysisId: number) => {
    const rolePrefix = location.split("/")[1];
    navigate(`/${rolePrefix}/analysis/${analysisId}`);
  };

  // ─── Render ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F8FAFC] relative">
      {/* ── DESKTOP/TABLET SIDEBAR ── */}
      <aside
        className={`
          hidden lg:flex flex-col fixed inset-y-0 left-0 z-40
          border-r border-slate-200/80 bg-white
          transition-all duration-300 ease-in-out
        `}
        style={{ width: sidebarWidth }}
      >
        <SidebarContent
          collapsed={isTablet && isTabletCollapsed}
          showToggle={isTablet}
          onToggle={toggleTablet}
          navItems={navItems}
          roleBadge={roleBadge}
          location={location}
          onLogout={logout}
        />
      </aside>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence mode="wait">
        {isMobileOpen && (
          <>
            <motion.div
              key="mb-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobile}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.aside
              key="mb-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 260, mass: 0.8 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-[60] md:hidden shadow-2xl"
            >
              <SidebarContent
                onItemClick={closeMobile}
                navItems={navItems}
                roleBadge={roleBadge}
                location={location}
                onLogout={logout}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ── */}
      <div
        className="flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ paddingLeft: isDesktop || isTablet ? sidebarWidth : 0 }}
      >
        {/* ── HEADER (all screen sizes) ── */}
        <header
          className="
            h-16 lg:h-[72px]
            bg-white/70 backdrop-blur-xl
            border-b border-slate-200/60
            sticky top-0 z-30
          "
        >
          <div className="h-full flex items-center justify-between px-4 md:px-6 lg:px-8 gap-4">
            {/* Left: Menu + Logo (mobile/tablet) */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={isTablet ? toggleTablet : toggleMobile}
                className="p-2.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition active:scale-95"
                aria-label="Toggle menu"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2 select-none">
                <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
                  <Brain size={16} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="font-bold text-lg tracking-tight text-slate-800 hidden xs:block">
                  Brain<span className="text-emerald-500">AI</span>
                </span>
              </div>
            </div>

            {/* Left: Spacer on desktop */}
            <div className="hidden lg:block flex-1" />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right: Notifications + User */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Notifications */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setShowNotifications((p) => !p)}
                  className="relative p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition active:scale-95"
                  aria-label="Notifications"
                >
                  <Bell size={20} />
                  {unreadNotifCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white"
                    >
                      {unreadNotifCount}
                    </motion.span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <NotificationDropdown
                      notifications={allNotifications}
                      onClose={() => setShowNotifications(false)}
                      onNavigateAnalysis={handleNavigateAnalysis}
                      onSelectNotification={(n) => setSelectedNotification(n)}
                      onMarkAsRead={(id) => updateNotificationState(id, true)}
                      onMarkAllRead={async () => {
                        setAllNotifications((prev) =>
                          prev.map((n) => ({ ...n, isRead: true }))
                        );
                        try {
                          await markAllNotificationsAsRead();
                        } catch (err) {
                          console.error("Failed to mark all as read on server", err);
                        }
                      }}
                      onDelete={(id) => deleteNotificationState(id)}
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setShowUserMenu((p) => !p)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition active:scale-95"
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2EC4A5] to-[#1fa88c] flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  {/* Info (hidden on very small screens) */}
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-700 leading-tight truncate max-w-[80px]">
                      {user?.fullName?.split(" ")[0] || "User"}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {roleBadge}
                    </p>
                  </div>

                  <ChevronDown
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${
                      showUserMenu ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <UserMenuDropdown
                      user={user}
                      onClose={() => setShowUserMenu(false)}
                      onNavigate={handleNavigate}
                      onLogout={logout}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>

        {/* ── PAGE CONTENT ── */}
        <main className="flex-1 w-full min-w-0">
          <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* 🔥 التفاصيل الآن في مستوى الجذر لضمان التمركز المطلق ف المنتصف */}
      <AnimatePresence>
        {selectedNotification && (
          <NotificationDetailModal
            notification={selectedNotification}
            onClose={() => setSelectedNotification(null)}
            onNavigate={handleNavigateAnalysis}
          />
        )}
      </AnimatePresence>
    </div>
  );
}