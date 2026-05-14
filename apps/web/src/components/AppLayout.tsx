import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Bell, Brain, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { LucideIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUnreadCount } from "@/lib/api7138";
import { getNotifications } from "../../../../lib/api-client-react/src/generated/api";
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
const [, navigate] = useLocation();
const queryClient = useQueryClient();

// 🔔 GET COUNT
const { data: unreadCount = 0 } = useQuery({
  queryKey: ["notifications-count"],
  queryFn: getUnreadCount,
});

// 📩 GET NOTIFICATIONS
const { data: notifications = [] } = useQuery({
  queryKey: ["notifications"],
  queryFn: getNotifications,
});
const roleStyle = {
  Admin: "bg-red-100 text-red-600",
  Doctor: "bg-blue-100 text-blue-600",
  Student: "bg-[#2EC4A5]/10 text-[#2EC4A5]",
};
  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* 🔥 Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 flex-col bg-white border-r border-slate-200 sticky top-0 h-screen z-40">
{/* Logo */}
<div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 bg-white">

 <motion.div
  className="flex items-center gap-3"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>

  {/* ICON */}
  <motion.div
    className="relative w-11 h-11 rounded-2xl flex items-center justify-center
               bg-gradient-to-br from-[#2EC4A5] to-[#1fa88c]
               shadow-lg overflow-hidden"
    whileHover={{ scale: 1.1, rotate: 6 }}
  >
    {/* Glow */}
    <div className="absolute inset-0 bg-white/20 blur-md" />

    <Brain className="w-5 h-5 text-white relative z-10" />
  </motion.div>

  {/* TEXT */}
  <div className="leading-tight">
    <p className="text-slate-800 font-bold text-base">
      Brain Tumor
    </p>
    <p className="text-slate-400 text-xs">
      AI Detection System
    </p>
  </div>

</motion.div>
</div>
<nav className="flex-1 px-4 py-5 space-y-2">
  {navItems.map((item) => {
    const isActive = location.startsWith(item.path);
    const Icon = item.icon;

    return (
      <Link
  key={item.path}
  href={item.path}
  className={`
    group relative flex items-center gap-3 px-4 py-3 rounded-2xl
    text-sm font-medium overflow-hidden
    transition-all duration-300
    ${
      isActive
        ? "text-[#2EC4A5]"
        : "text-slate-500 hover:text-slate-800"
    }
  `}
>

  {/* 🔥 Animated background */}
  <motion.div
    layoutId={isActive ? "active-bg" : undefined}
    className={`
      absolute inset-0 rounded-2xl
      ${
        isActive
          ? "bg-[#2EC4A5]/10"
          : "bg-transparent group-hover:bg-slate-50"
      }
    `}
    transition={{ type: "spring", stiffness: 300, damping: 25 }}
  />

  {/* ✨ Shine effect */}
  <div className="
    pointer-events-none absolute inset-0 opacity-0
    group-hover:opacity-100
    transition duration-500
  ">
    <div className="
      absolute left-[-100%] top-0 w-[60%] h-full
      bg-white/30 blur-xl skew-x-[-20deg]
      group-hover:left-[120%]
      transition-all duration-700
    " />
  </div>

  {/* 🔥 ICON */}
  <motion.div
    whileHover={{ scale: 1.12, rotate: isActive ? 0 : 2 }}
    whileTap={{ scale: 0.95 }}
    className={`
      relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center
      transition-all duration-300
      ${
        isActive
          ? "bg-[#2EC4A5]/20 text-[#2EC4A5] shadow-inner"
          : "bg-slate-100 group-hover:bg-slate-200"
      }
    `}
  >
    <Icon className="w-5 h-5" />
  </motion.div>

  {/* 🔥 TEXT */}
  <span className="relative z-10 tracking-tight font-semibold">
    {item.label}
  </span>

  {/* 🔥 ACTIVE INDICATOR (PRO) */}
  {isActive && (
    <>
      {/* Smooth bar */}
      <motion.div
        layoutId="sidebar-pill"
        className="absolute left-0 w-1 h-8 bg-[#2EC4A5] rounded-r-full"
      />

      {/* Pulse dot */}
      <motion.div
        className="absolute right-3 w-2 h-2 rounded-full bg-[#2EC4A5]"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      />
    </>
  )}
</Link>
    );
  })}
</nav>
{/* User */}
<div className="p-4 border-t border-slate-100">

  {/* 🔥 USER CARD */}
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="
      group relative flex items-center gap-3 p-3 rounded-2xl
      bg-slate-50 hover:bg-white
      transition-all duration-300 cursor-pointer
      shadow-sm hover:shadow-md
    "
  >

    {/* ✨ Glow */}
    <div className="
      pointer-events-none absolute inset-0 rounded-2xl opacity-0
      group-hover:opacity-100 transition duration-300
      bg-[#2EC4A5]/5
    " />

    {/* AVATAR */}
    <div className="
      relative w-10 h-10 rounded-full
      bg-gradient-to-br from-[#2EC4A5] to-[#1fa88c]
      flex items-center justify-center
      text-white font-bold
      shadow-sm
    ">
      {user?.fullName?.charAt(0) || "U"}

      {/* ✨ online dot */}
      <span className="
        absolute bottom-0 right-0 w-2.5 h-2.5
        bg-green-500 rounded-full border-2 border-white
      " />
    </div>

    {/* INFO */}
    <div className="flex-1 min-w-0 relative z-10">
      <p className="text-sm font-semibold text-slate-900 truncate">
        {user?.fullName}
      </p>
      <p className="text-xs text-slate-400 truncate">
        {user?.email}
      </p>
    </div>

  </motion.div>

  {/* ROLE */}
  

  {/* 🔥 LOGOUT BUTTON */}
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.95 }}
    onClick={logout}
    className="
      relative w-full flex items-center justify-center gap-2 mt-2 py-2.5
      text-sm font-medium rounded-xl
      text-slate-500 bg-white
      border border-slate-100
      transition-all duration-300
      hover:bg-red-50 hover:text-red-500 hover:border-red-100
      shadow-sm hover:shadow-md
      overflow-hidden
    "
  >

    {/* ✨ ripple light */}
    <div className="
      pointer-events-none absolute inset-0 opacity-0
      group-hover:opacity-100 transition duration-500
    ">
      <div className="
        absolute left-[-100%] top-0 w-[60%] h-full
        bg-white/40 blur-xl skew-x-[-20deg]
        group-hover:left-[120%]
        transition-all duration-700
      " />
    </div>

    <LogOut className="w-4 h-4" />
    Sign Out
  </motion.button>

</div>
      </aside>
      {/* 🔥 MAIN */}
    <div className="flex-1 flex flex-col">

      {/* HEADER */}
      <header className="
        sticky top-0 z-30
        bg-white/80 backdrop-blur-xl
        border-b border-slate-100
        px-4 md:px-8 py-3.5
        flex items-center justify-between
      ">

        {/* LEFT */}
        <div className="hidden md:flex flex-col">
         

         
         
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3">

         

          {/* 🔔 NOTIFICATION */}
          <div className="relative">
 <button
  onClick={() => {
    const role = user?.role?.toLowerCase();

    if (role === "doctor") {
      navigate("/doctor/notifications");
    } else if (role === "student") {
      navigate("/student/notifications");
    } else {
      navigate("/notifications"); // fallback
    }
  }}
  className="
    relative p-2.5 rounded-xl 
    bg-slate-50 hover:bg-slate-100 
    transition-all duration-300 
    hover:scale-110 active:scale-95
  "
>
  <Bell className="w-5 h-5 text-slate-600" />

  {unreadCount > 0 && (
    <span
      className="
        absolute -top-1 -right-1 
        min-w-[18px] h-[18px] px-1 
        bg-red-500 text-white text-[10px] 
        rounded-full flex items-center justify-center 
        border border-white
      "
    >
      {unreadCount}
    </span>
  )}
</button>
</div>



<motion.div
  whileHover={{ scale: 1.05, y: -2 }}
  transition={{ type: "spring", stiffness: 300 }}
  className="
    hidden md:flex items-center gap-3
    bg-white/70 backdrop-blur-xl
    border border-slate-200
    px-4 py-2 rounded-2xl
    shadow-sm hover:shadow-md
    transition-all cursor-pointer
  "
>

  {/* AVATAR */}
  <motion.div
    className="
      w-9 h-9 rounded-full
      bg-gradient-to-br from-[#2EC4A5] to-[#1fa88c]
      flex items-center justify-center
      text-white text-sm font-bold
    "
    animate={{ y: [0, -2, 0] }}
    transition={{ duration: 3, repeat: Infinity }}
  >
    {user?.role?.charAt(0).toUpperCase()}
  </motion.div>

  {/* ROLE */}
  <span
    className={`
      text-sm font-semibold px-3 py-1 rounded-xl
      ${roleStyle[user?.role as keyof typeof roleStyle] || "bg-gray-100 text-gray-600"}
    `}
  >
    {user?.role}
  </span>

</motion.div>
     

          {/* MOBILE LOGOUT */}
          <button
            onClick={logout}
            className="
              md:hidden p-2 rounded-xl bg-slate-50
              hover:bg-red-50 hover:text-red-500
              transition
            "
          >
            <LogOut className="w-5 h-5 text-slate-500" />
          </button>

        </div>
      </header>

      {/* 🔥 CONTENT */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
          {children}
        </div>
      </main>

    
      </div>
    </div>
  );
}
