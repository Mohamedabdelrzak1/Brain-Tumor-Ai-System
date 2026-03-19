import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, FileImage, Activity, ChevronRight, Shield, TrendingUp, CheckCircle, Plus, Edit2, Trash2, X, Eye, EyeOff, Search, UserCheck, UserX, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useGetStats, useGetUsers, useGetScans, useGetAllAnalysis } from "@workspace/api-client-react";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";

const adminNav = [
  { path: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/scans", icon: FileImage, label: "All Scans" },
  { path: "/admin/analysis", icon: Activity, label: "Analysis" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout
      navItems={adminNav}
      roleBadge={
        <span className="bg-purple-50 text-purple-600 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
          <Shield className="w-3 h-3" /> Admin
        </span>
      }
    >
      {children}
    </AppLayout>
  );
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useGetStats();
  const { data: usersData } = useGetUsers();
  const users = usersData?.users || [];

  const pieData = [
    { name: "Malignant", value: stats?.malignantCases || 0 },
    { name: "Benign/Normal", value: stats?.benignCases || 0 },
  ];
  const PIE_COLORS = ["#f43f5e", "#2EC4A5"];

  const roleDistribution = [
    { name: "Admins", value: users.filter(u => u.role === "admin").length, fill: "#8b5cf6" },
    { name: "Doctors", value: users.filter(u => u.role === "doctor").length, fill: "#3b82f6" },
    { name: "Students", value: users.filter(u => u.role === "student").length, fill: "#2EC4A5" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">System Overview</h1>
        <p className="text-slate-500 mt-1">Real-time platform statistics and analytics.</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-600 bg-blue-50 border-blue-100" },
          { label: "Total Scans", value: stats?.totalScans || 0, icon: FileImage, color: "text-purple-600 bg-purple-50 border-purple-100" },
          { label: "Analyzed", value: stats?.analyzedScans || 0, icon: CheckCircle, color: "text-[#2EC4A5] bg-[#2EC4A5]/10 border-[#2EC4A5]/20" },
          { label: "Pending", value: stats?.pendingScans || 0, icon: AlertCircle, color: "text-amber-600 bg-amber-50 border-amber-100" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-5 border ${s.color} flex items-center gap-4`}>
            <s.icon className="w-8 h-8 opacity-80 flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold">{isLoading ? "…" : s.value}</p>
              <p className="text-xs font-medium opacity-70 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tumor types bar chart */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-5">Tumor Type Distribution</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.tumorTypeDistribution || []} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgba(0,0,0,.1)" }} />
                <Bar dataKey="count" fill="#2EC4A5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-2">Outcomes</h3>
          <div className="flex-1 min-h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f1f5f9" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500" /><span className="text-xs text-slate-500">Malignant</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#2EC4A5]" /><span className="text-xs text-slate-500">Benign</span></div>
          </div>
        </div>
      </div>

      {/* User role distribution */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">User Distribution by Role</h3>
        <div className="grid grid-cols-3 gap-4">
          {roleDistribution.map(r => (
            <div key={r.name} className="text-center p-4 rounded-xl" style={{ backgroundColor: r.fill + "15", borderColor: r.fill + "30" }}>
              <p className="text-3xl font-bold" style={{ color: r.fill }}>{r.value}</p>
              <p className="text-sm text-slate-500 mt-1">{r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Users Management (Full CRUD) ─────────────────────────────────────────────
function UserModal({ user: editUser, onClose, onSaved }: { user?: any; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    fullName: editUser?.fullName || "",
    email: editUser?.email || "",
    password: "",
    role: editUser?.role || "student",
    organization: editUser?.organization || "",
    isActive: editUser?.isActive ?? true,
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const isEdit = !!editUser;

  const handleSave = async () => {
    if (!form.fullName || !form.email || (!isEdit && !form.password)) {
      toast({ title: "Please fill all required fields", variant: "destructive" }); return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
      let resp: Response;
      if (isEdit) {
        resp = await fetch(`${baseUrl}/api/users/${editUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fullName: form.fullName, email: form.email, role: form.role, organization: form.organization, isActive: form.isActive }),
        });
      } else {
        resp = await fetch(`${baseUrl}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ fullName: form.fullName, email: form.email, password: form.password, confirmPassword: form.password, role: form.role, organization: form.organization }),
        });
      }
      if (!resp.ok) { const d = await resp.json(); throw new Error(d.message || "Error"); }
      toast({ title: isEdit ? "User updated!" : "User created!" });
      onSaved();
      onClose();
    } catch (e: any) {
      toast({ title: e.message || "Error", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg">{isEdit ? "Edit User" : "Create New User"}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Full Name *", key: "fullName", type: "text", placeholder: "Enter full name" },
            { label: "Email *", key: "email", type: "email", placeholder: "Enter email" },
            { label: "Organization", key: "organization", type: "text", placeholder: "Enter organization" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">{f.label}</label>
              <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2EC4A5] focus:ring-2 focus:ring-[#2EC4A5]/20" />
            </div>
          ))}

          {!isEdit && (
            <div>
              <label className="text-xs text-slate-500 font-medium block mb-1.5">Password *</label>
              <div className="relative">
                <input type={showPw ? "text" : "password"} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter password" className="w-full px-4 py-3 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2EC4A5]" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-3.5">{showPw ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}</button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1.5">Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2EC4A5]">
              <option value="student">Student / Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <span className="text-sm font-medium text-slate-700">Account Active</span>
              <button onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.isActive ? "bg-[#2EC4A5]" : "bg-slate-300"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-7" : "translate-x-1"}`} />
              </button>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-3 bg-[#2EC4A5] hover:bg-[#28b096] text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors">
            {loading ? "Saving..." : (isEdit ? "Save Changes" : "Create User")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DeleteConfirm({ user, onClose, onDeleted }: { user: any; onClose: () => void; onDeleted: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");
      const resp = await fetch(`${baseUrl}/api/users/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error("Failed to delete");
      toast({ title: `${user.fullName} deleted` });
      onDeleted();
      onClose();
    } catch {
      toast({ title: "Failed to delete user", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="font-bold text-slate-900 text-lg text-center mb-2">Delete User</h3>
        <p className="text-slate-500 text-sm text-center mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-700">{user.fullName}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold disabled:opacity-60">
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function AdminUsers() {
  const { data, isLoading, refetch } = useGetUsers();
  const [filter, setFilter] = useState<"all" | "admin" | "doctor" | "student">("all");
  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteUser, setDeleteUser] = useState<any>(null);

  const users = (data?.users || [])
    .filter(u => filter === "all" || u.role === filter)
    .filter(u => !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500 text-sm mt-1">Create, edit and manage all system users.</p>
        </div>
        <button onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 bg-[#2EC4A5] hover:bg-[#28b096] text-white font-semibold px-5 py-3 rounded-xl transition-colors shadow-lg shadow-[#2EC4A5]/20 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2EC4A5]" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "admin", "doctor", "student"] as const).map(r => (
            <button key={r} onClick={() => setFilter(r)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${filter === r ? "bg-[#2EC4A5] text-white shadow-md" : "bg-white border border-slate-200 text-slate-600 hover:border-[#2EC4A5]"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Organization</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading
                ? [1, 2, 3].map(i => (
                  <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-10 bg-slate-100 animate-pulse rounded-lg" /></td></tr>
                ))
                : users.length === 0
                ? <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">No users found</td></tr>
                : users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#2EC4A5]/10 flex items-center justify-center text-[#2EC4A5] font-bold flex-shrink-0">
                          {u.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{u.fullName}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">{u.organization || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {u.isActive
                          ? <><UserCheck className="w-4 h-4 text-green-500" /><span className="text-xs text-green-600 font-medium">Active</span></>
                          : <><UserX className="w-4 h-4 text-slate-400" /><span className="text-xs text-slate-400 font-medium">Inactive</span></>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditUser(u)}
                          className="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteUser(u)}
                          className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {createModal && <UserModal onClose={() => setCreateModal(false)} onSaved={refetch} />}
        {editUser && <UserModal user={editUser} onClose={() => setEditUser(null)} onSaved={refetch} />}
        {deleteUser && <DeleteConfirm user={deleteUser} onClose={() => setDeleteUser(null)} onDeleted={refetch} />}
      </AnimatePresence>
    </div>
  );
}

// ─── All Scans (read-only) ──────────────────────────────────────────────────────
export function AdminScans() {
  const { data, isLoading } = useGetScans({ query: { limit: 100 } });
  const [search, setSearch] = useState("");
  const scans = (data?.scans || []).filter(s => !search || String(s.patientId).includes(search) || String(s.id).includes(search));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">All Scans</h1>
          <p className="text-slate-500 text-sm mt-1">View all MRI scans uploaded by patients.</p>
        </div>
        <span className="bg-slate-100 text-slate-600 text-sm font-bold px-4 py-2 rounded-xl self-start sm:self-auto">{data?.scans?.length || 0} total</span>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by scan ID or patient ID..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2EC4A5]" />
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Scan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Patient ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading
                ? [1, 2, 3].map(i => <tr key={i}><td colSpan={4} className="px-6 py-4"><div className="h-10 bg-slate-100 animate-pulse rounded-lg" /></td></tr>)
                : scans.length === 0
                ? <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">No scans found</td></tr>
                : scans.map(scan => (
                  <tr key={scan.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                          <img src={scan.imageUrl || `${import.meta.env.BASE_URL}images/brain-scan-placeholder.png`} className="w-full h-full object-cover" />
                        </div>
                        <span className="font-semibold text-slate-900 text-sm">Scan #{scan.id.toString().padStart(4, "0")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">#{scan.patientId}</td>
                    <td className="px-6 py-4"><ScanStatusBadge status={scan.status} /></td>
                    <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">{format(new Date(scan.createdAt), "MMM dd, yyyy")}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── All Analysis (read-only) ───────────────────────────────────────────────────
export function AdminAnalysis() {
  const { data, isLoading } = useGetAllAnalysis({ query: { limit: 100 } });
  const analyses = (data as any)?.analyses || [];
  const tumorCounts: Record<string, number> = {};
  analyses.forEach((a: any) => { const t = a.tumorType || "unknown"; tumorCounts[t] = (tumorCounts[t] || 0) + 1; });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">AI Analysis Records</h1>
        <p className="text-slate-500 text-sm mt-1">All AI-generated analysis results from the system.</p>
      </div>

      {Object.keys(tumorCounts).length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {Object.entries(tumorCounts).map(([type, count]) => (
            <div key={type} className="bg-[#2EC4A5]/10 text-[#2EC4A5] text-xs font-semibold px-3 py-2 rounded-xl capitalize">
              {type.replace("_", " ")}: <span className="font-bold">{count}</span>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Scan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tumor Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Risk</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Confidence</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading
                ? [1, 2, 3].map(i => <tr key={i}><td colSpan={5} className="px-6 py-4"><div className="h-10 bg-slate-100 animate-pulse rounded-lg" /></td></tr>)
                : analyses.length === 0
                ? <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">No analysis records</td></tr>
                : analyses.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 text-sm">#{a.scanId?.toString().padStart(4, "0")}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 capitalize font-medium">{a.tumorType?.replace("_", " ")}</td>
                    <td className="px-6 py-4 hidden sm:table-cell"><RiskBadge risk={a.riskLevel} /></td>
                    <td className="px-6 py-4 text-sm text-slate-600 hidden md:table-cell">{Math.round((a.confidence || 0) * 100)}%</td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {a.doctorReviewed
                        ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="w-3.5 h-3.5" /> Reviewed</span>
                        : <span className="text-xs text-amber-500">Pending</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = { admin: "bg-purple-100 text-purple-700", doctor: "bg-blue-100 text-blue-700", student: "bg-slate-100 text-slate-600" };
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${map[role] || "bg-slate-100 text-slate-600"}`}>{role}</span>;
}
function ScanStatusBadge({ status }: { status: string }) {
  if (status === "reviewed") return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">Reviewed</span>;
  if (status === "analyzed") return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">Analyzed</span>;
  return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">Pending</span>;
}
function RiskBadge({ risk }: { risk?: string }) {
  if (!risk) return null;
  const map: Record<string, string> = { low: "bg-green-100 text-green-700", medium: "bg-amber-100 text-amber-700", high: "bg-red-100 text-red-700", critical: "bg-red-200 text-red-800" };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${map[risk] || "bg-slate-100 text-slate-600"}`}>{risk}</span>;
}
