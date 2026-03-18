import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useGetStats, useGetUsers, useGetScans, useGetAllAnalysis } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Shield, LayoutDashboard, Users, FileImage, ActivitySquare, Settings, LogOut, ChevronRight, Activity } from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Overview" },
    { path: "/admin/users", icon: Users, label: "User Management" },
    { path: "/admin/scans", icon: FileImage, label: "Scan Records" },
    { path: "/admin/analysis", icon: ActivitySquare, label: "AI Analytics" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 flex font-sans dark">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col relative z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 border border-primary/30 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white leading-tight">Admin Console</h1>
            <p className="text-[10px] text-primary font-mono tracking-widest uppercase">System v2.4</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map(link => (
            <Link key={link.path} href={link.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${location.startsWith(link.path) ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center text-white text-sm font-bold border border-slate-700">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Super Admin</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <div className="flex-1 overflow-auto p-8 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
          {children}
        </div>
      </main>
    </div>
  );
}

export function AdminDashboard() {
  const { data: stats, isLoading } = useGetStats();

  const PIE_COLORS = ['#f43f5e', '#10b981']; // Rose for Malignant, Emerald for Benign
  const pieData = [
    { name: 'Malignant', value: stats?.malignantCases || 0 },
    { name: 'Benign/Normal', value: stats?.benignCases || 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 relative z-10">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold text-white mb-2">System Overview</h1>
        <p className="text-slate-400">Real-time statistics and analytics for the Brain Tumor Detection platform.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
          { label: "Total Scans", value: stats?.totalScans || 0, icon: FileImage, color: "text-purple-400", bg: "bg-purple-400/10" },
          { label: "Analyzed Cases", value: stats?.analyzedScans || 0, icon: Activity, color: "text-primary", bg: "bg-primary/10" },
          { label: "Pending Review", value: stats?.pendingScans || 0, icon: Shield, color: "text-amber-400", bg: "bg-amber-400/10" }
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:bg-slate-900 transition-colors">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400 mb-0.5">{stat.label}</p>
              <p className="text-2xl font-bold text-white font-mono">{isLoading ? "..." : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">Tumor Type Distribution</h3>
          <div className="h-64">
            {isLoading ? <div className="w-full h-full flex justify-center items-center">Loading chart...</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.tumorTypeDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="type" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h3 className="font-semibold text-white mb-2">Diagnostic Outcomes</h3>
          <div className="flex-1 min-h-[200px]">
            {isLoading ? <div className="w-full h-full flex justify-center items-center">Loading chart...</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-rose-500"></span><span className="text-xs text-slate-400">Malignant</span></div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-xs text-slate-400">Benign</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const { data, isLoading } = useGetUsers();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">User Management</h1>
          <p className="text-slate-400">Manage system access across all roles.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-slate-950 font-bold py-2 px-4 rounded-xl transition-colors shadow-[0_0_15px_rgba(20,184,166,0.3)]">
          + Add User
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-4 font-semibold">User</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Organization</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {isLoading ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading users...</td></tr> : 
             data?.users?.map(u => (
              <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white border border-slate-700">{u.fullName.charAt(0)}</div>
                    <div>
                      <p className="font-semibold text-white">{u.fullName}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                    u.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                    u.role === 'doctor' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}>{u.role}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">{u.organization || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
                    <span className="text-sm text-slate-300">{u.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-primary hover:text-white transition-colors text-sm font-semibold">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
