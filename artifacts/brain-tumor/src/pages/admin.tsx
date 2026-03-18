import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Home, Users, FileImage, Activity, ChevronRight, Bell, Shield, TrendingUp, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  useGetStats,
  useGetUsers,
  useGetScans,
  useGetAllAnalysis,
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// ─── Layout ───────────────────────────────────────────────────────────────────
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { path: "/admin/dashboard", icon: Home, label: "Home" },
    { path: "/admin/users", icon: Users, label: "Users" },
    { path: "/admin/scans", icon: FileImage, label: "Scans" },
    { path: "/admin/analysis", icon: Activity, label: "Analysis" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative pb-24 overflow-x-hidden flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#2EC4A5] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" />
              </svg>
            </div>
            <span className="font-bold text-slate-800 text-base">Brain Tumor</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#2EC4A5]/10 text-[#2EC4A5] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Shield className="w-3 h-3" /> Admin
            </span>
            <div className="relative p-2 bg-slate-50 rounded-full">
              <Bell className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>

        {/* Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-6 py-3 max-w-md mx-auto">
          <ul className="flex justify-between items-center">
            {navItems.map((item) => {
              const isActive = location.startsWith(item.path);
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link href={item.path} className="flex flex-col items-center gap-1 p-2 w-16">
                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${isActive ? "bg-[#2EC4A5]/10 text-[#2EC4A5]" : "text-slate-400"}`}>
                      {isActive && <motion.div layoutId="admin-nav-pill" className="absolute inset-0 bg-[#2EC4A5]/10 rounded-xl" />}
                      <Icon className="w-5 h-5 relative z-10" />
                    </div>
                    <span className={`text-[10px] font-medium ${isActive ? "text-[#2EC4A5]" : "text-slate-400"}`}>{item.label}</span>
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

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useGetStats();

  const pieData = [
    { name: "Malignant", value: stats?.malignantCases || 0 },
    { name: "Benign/Normal", value: stats?.benignCases || 0 },
  ];
  const PIE_COLORS = ["#f43f5e", "#2EC4A5"];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hi, {user?.fullName?.split(" ")[0]} 👋</h1>
        <p className="text-slate-500 mt-1">System overview at a glance.</p>
      </div>

      {/* Hero stats */}
      <div className="bg-gradient-to-br from-[#2EC4A5] to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-[#2EC4A5]/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 grid grid-cols-2 gap-5">
          {[
            { label: "Total Users", value: stats?.totalUsers || 0 },
            { label: "Total Scans", value: stats?.totalScans || 0 },
            { label: "Analyzed", value: stats?.analyzedScans || 0 },
            { label: "Pending", value: stats?.pendingScans || 0 },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl font-bold">{isLoading ? "…" : s.value}</p>
              <p className="text-teal-100 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">Diagnostic Outcomes</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5} dataKey="value" stroke="none">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500" /><span className="text-xs text-slate-500">Malignant</span></div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#2EC4A5]" /><span className="text-xs text-slate-500">Benign / Normal</span></div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Manage Users", icon: Users, path: "/admin/users", color: "bg-blue-50 text-blue-600 border-blue-100" },
          { label: "View All Scans", icon: FileImage, path: "/admin/scans", color: "bg-purple-50 text-purple-600 border-purple-100" },
          { label: "AI Analysis", icon: Activity, path: "/admin/analysis", color: "bg-[#2EC4A5]/10 text-[#2EC4A5] border-[#2EC4A5]/20" },
          { label: "Statistics", icon: TrendingUp, path: "/admin/dashboard", color: "bg-amber-50 text-amber-600 border-amber-100" },
        ].map(item => (
          <Link key={item.path} href={item.path} className={`flex items-center gap-3 p-4 rounded-2xl border ${item.color} active:scale-95 transition-transform`}>
            <item.icon className="w-5 h-5" />
            <span className="font-semibold text-sm">{item.label}</span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

// ─── All Users ─────────────────────────────────────────────────────────────────
export function AdminUsers() {
  const { data, isLoading } = useGetUsers();
  const [filter, setFilter] = useState<"all" | "admin" | "doctor" | "student">("all");

  const users = (data?.users || []).filter(u => filter === "all" || u.role === filter);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-5">All Users</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {(["all", "admin", "doctor", "student"] as const).map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap capitalize transition-all ${filter === r ? "bg-[#2EC4A5] text-white shadow-md" : "bg-slate-100 text-slate-600"}`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading
          ? [1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)
          : users.map(u => (
            <div key={u.id} className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm rounded-2xl p-4">
              <div className="w-12 h-12 rounded-full bg-[#2EC4A5]/10 flex items-center justify-center text-[#2EC4A5] font-bold text-lg flex-shrink-0">
                {u.fullName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 truncate">{u.fullName}</h4>
                <p className="text-xs text-slate-400 truncate">{u.email}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <RoleBadge role={u.role} />
                <span className={`text-[10px] ${u.isActive ? "text-green-500" : "text-slate-400"}`}>
                  {u.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── All Scans ──────────────────────────────────────────────────────────────────
export function AdminScans() {
  const { data, isLoading } = useGetScans({ query: { limit: 100 } });
  const scans = data?.scans || [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-2xl font-bold text-slate-900">All Scans</h1>
        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full">{scans.length} total</span>
      </div>

      <div className="space-y-3">
        {isLoading
          ? [1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)
          : scans.length === 0
          ? (
            <div className="text-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileImage className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No scans uploaded yet</p>
            </div>
          )
          : scans.map(scan => (
            <div key={scan.id} className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm rounded-2xl p-4">
              <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                <img src={scan.imageUrl || `${import.meta.env.BASE_URL}images/brain-scan-placeholder.png`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-slate-900">Scan #{scan.id.toString().padStart(4, "0")}</h4>
                  <ScanStatusBadge status={scan.status} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Patient #{scan.patientId} · {format(new Date(scan.createdAt), "MMM dd, yyyy")}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── All Analysis ───────────────────────────────────────────────────────────────
export function AdminAnalysis() {
  const { data, isLoading } = useGetAllAnalysis({ query: { limit: 100 } });
  const analyses = (data as any)?.analyses || [];

  const tumorCounts: Record<string, number> = {};
  analyses.forEach((a: any) => {
    const t = a.tumorType || "unknown";
    tumorCounts[t] = (tumorCounts[t] || 0) + 1;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">AI Analysis</h1>
        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full">{analyses.length} records</span>
      </div>

      {/* Summary pills */}
      {Object.keys(tumorCounts).length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {Object.entries(tumorCounts).map(([type, count]) => (
            <div key={type} className="bg-[#2EC4A5]/10 text-[#2EC4A5] text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
              {type.replace("_", " ")}: {count}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {isLoading
          ? [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)
          : analyses.length === 0
          ? (
            <div className="text-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No analysis records</p>
            </div>
          )
          : analyses.map((a: any) => (
            <div key={a.id} className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">Scan #{a.scanId?.toString().padStart(4, "0")}</span>
                <RiskBadge risk={a.riskLevel} />
              </div>
              <div className="flex gap-3 text-sm mb-2">
                <span className="text-slate-500">Type: <span className="font-medium text-slate-800 capitalize">{a.tumorType?.replace("_", " ")}</span></span>
                <span className="text-slate-500">Conf: <span className="font-medium text-slate-800">{Math.round((a.confidence || 0) * 100)}%</span></span>
              </div>
              <p className="text-xs text-slate-400 truncate">{a.summary}</p>
              <div className="flex items-center gap-1 mt-2">
                {a.doctorReviewed ? (
                  <><CheckCircle className="w-3.5 h-3.5 text-green-500" /><span className="text-xs text-green-600">Doctor reviewed</span></>
                ) : (
                  <span className="text-xs text-amber-500">Awaiting doctor review</span>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    admin: "bg-purple-100 text-purple-700",
    doctor: "bg-blue-100 text-blue-700",
    student: "bg-slate-100 text-slate-600",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${map[role] || "bg-slate-100 text-slate-600"}`}>{role}</span>;
}

function ScanStatusBadge({ status }: { status: string }) {
  if (status === "reviewed") return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">Reviewed</span>;
  if (status === "analyzed") return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">Analyzed</span>;
  return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase">Pending</span>;
}

function RiskBadge({ risk }: { risk?: string }) {
  if (!risk) return null;
  const map: Record<string, string> = {
    low: "bg-green-100 text-green-700",
    medium: "bg-amber-100 text-amber-700",
    high: "bg-red-100 text-red-700",
    critical: "bg-red-200 text-red-800",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${map[risk] || "bg-slate-100 text-slate-600"}`}>{risk}</span>;
}
