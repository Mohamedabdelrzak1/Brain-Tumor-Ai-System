
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, FileImage, Activity, ChevronRight, Shield, TrendingUp, CheckCircle, Plus, Edit2, Trash2, ArrowLeft , Eye, EyeOff, Search, UserCheck, UserX, AlertCircle, Database, AlertTriangle, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useGetStats, useGetUsers, useGetScans } from "@workspace/api-client-react";
import { format } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect ,useMemo  } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams ,Route } from "wouter";
import { getDashboardStats, getAllAnalysis7138 ,getAllUsers,createUser, updateUser, deleteUser, getAllScansAdmin7138 ,getScanById7138,getAnalysisDetails7138 ,
  getAllTumorTypes,
  createTumorType,
  updateTumorType,
  deleteTumorType,changePassword ,updateProfile } from "@/lib/api7138";
// Icons
import {
  
  Key,
  FileText ,
  LogOut,
  Hash, Calendar,
   Brain, 
  StickyNote, 
  Clock ,
  BarChart3 
   
} from "lucide-react";


const adminNav = [
  { path: "/admin/dashboard", icon: Home, label: "Dashboard" },
  { path: "/admin/scans", icon: FileImage, label: "All Scans" },
  { path: "/admin/analysis", icon: Activity, label: "Analysis" },
  { path: "/admin/tumor-types", icon: Brain, label: "Tumor Types" },
   { path: "/admin/users", icon: Users, label: "Users" },
   { path: "/admin/profile", icon: User, label: "Profile" },
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

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // =========================
  // 🔥 TYPES
  // =========================
  type CardColor = "blue" | "purple" | "green" | "yellow";

  const cards: {
    label: string;
    value: number;
    icon: any;
    color: CardColor;
  }[] = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "blue" },
    { label: "Total Scans", value: stats?.totalScans || 0, icon: FileImage, color: "purple" },
    { label: "Analyzed", value: stats?.totalAnalysis || 0, icon: CheckCircle, color: "green" },
    { label: "Pending", value: stats?.pending || 0, icon: AlertCircle, color: "yellow" },
  ];

  const styles: Record<
    CardColor,
    {
      bg: string;
      glow: string;
      text: string;
    }
  > = {
    blue: {
      bg: "from-blue-50 via-white to-transparent",
      glow: "bg-blue-200/40",
      text: "text-blue-600",
    },
    purple: {
      bg: "from-purple-50 via-white to-transparent",
      glow: "bg-purple-200/40",
      text: "text-purple-600",
    },
    green: {
      bg: "from-green-50 via-white to-transparent",
      glow: "bg-green-200/40",
      text: "text-green-600",
    },
    yellow: {
      bg: "from-yellow-50 via-white to-transparent",
      glow: "bg-yellow-200/40",
      text: "text-yellow-600",
    },
  };

  // =========================
  // 🔥 PIE DATA
  // =========================
  const pieData = [
    { name: "Malignant", value: stats?.outcomes?.malignant || 0 },
    { name: "Benign", value: stats?.outcomes?.benign || 0 },
  ];

  const PIE_COLORS = ["#f43f5e", "#2EC4A5"];

  // =========================
  // 🔥 TUMOR DATA
  // =========================
  const tumorData = Object.entries(stats?.tumorStatistics || {}).map(
    ([type, count]) => ({
      type,
      count,
    })
  );

  // =========================
  // 🔥 USERS ROLE
  // =========================
  const roleDistribution = [
    { name: "Admins", value: stats?.usersByRole?.admins || 0, fill: "#8b5cf6" },
    { name: "Doctors", value: stats?.usersByRole?.doctors || 0, fill: "#3b82f6" },
    { name: "Students", value: stats?.usersByRole?.students || 0, fill: "#2EC4A5" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          System Overview
        </h1>
        <p className="text-slate-500 mt-1">
          Real-time platform statistics and analytics.
        </p>
      </div>

      {/* ========================= */}
      {/* 🔥 CARDS */}
      {/* ========================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {cards.map((s) => {
          const style = styles[s.color];

          return (
            <div
              key={s.label}
              className="
                relative overflow-hidden
                rounded-2xl p-5
                border border-slate-100
                shadow-sm
                flex items-center gap-4
                hover:shadow-md hover:-translate-y-0.5
                transition-all duration-300
              "
            >
              {/* 🔥 Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${style.bg} opacity-70`} />

              {/* 🔥 Glow */}
              <div className={`absolute -top-10 -right-10 w-28 h-28 ${style.glow} blur-3xl rounded-full`} />

              {/* 🔥 Icon */}
              <div className={`relative z-10 w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-inner ${style.text}`}>
                <s.icon className="w-6 h-6" />
              </div>

              {/* 🔥 Text */}
              <div className="relative z-10">
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? "…" : s.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {s.label}
                </p>
              </div>
            </div>
          );
        })}

      </div>

      {/* ========================= */}
      {/* 🔥 CHARTS */}
      {/* ========================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-5">
            Tumor Type Distribution
          </h3>

          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tumorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2EC4A5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 mb-2">Outcomes</h3>

          <div className="flex-1 min-h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" outerRadius={70}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* ========================= */}
      {/* 🔥 USERS ROLE */}
      {/* ========================= */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-4">
          User Distribution by Role
        </h3>

        <div className="grid grid-cols-3 gap-4">
          {roleDistribution.map((r) => (
            <div
              key={r.name}
              className="text-center p-4 rounded-xl"
              style={{ backgroundColor: r.fill + "15" }}
            >
              <p className="text-3xl font-bold" style={{ color: r.fill }}>
                {r.value}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {r.name}
              </p>
            </div>
          ))}
        </div>
      </div>

    </motion.div>
  );
}

// ─── AdminProfile ─────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────
// 👤 ADMIN PROFILE
// ─────────────────────────────────────────
export function AdminProfile() {
  const { user, logout } = useAuth();

  const [showPwSheet, setShowPwSheet] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  return (
    <div className="space-y-5 pb-8">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>

      {/* User Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-4">

          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2EC4A5] to-[#1fa88c] flex items-center justify-center text-white text-2xl font-bold">
            {user?.fullName?.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 text-lg truncate">
              {user?.fullName}
            </h2>
            <p className="text-slate-400 text-sm truncate">
              {user?.email}
            </p>
            <span className="text-xs text-[#2EC4A5] font-semibold">
              Admin
            </span>
          </div>

          {/* Edit */}
          <button
            onClick={() => setShowEdit(true)}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <Edit2 className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Account */}
      <div>
        <p className="text-sm font-bold text-slate-900 px-1">Account</p>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y">

        {/* Change Password */}
    <div
      onClick={() => setShowPwSheet(true)}
      className="group flex items-center gap-4 px-5 py-5 cursor-pointer transition-all duration-300 hover:bg-slate-50 active:scale-[0.97]"
    >
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
        <Key className="w-5 h-5 text-white" />
      </div>

      <span className="flex-1 text-sm font-semibold text-slate-800 group-hover:text-black transition">
        Change Password
      </span>

      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition" />
    </div>
        </div>
      </div>

      {/* Logout */}
    <button
  onClick={logout}
  className="
    group relative w-full flex items-center justify-center gap-2
    py-4 rounded-2xl
    bg-white border border-red-100
    text-red-500 font-semibold
    overflow-hidden
    transition-all duration-300
    hover:bg-red-50 hover:shadow-md hover:-translate-y-0.5
  "
>

  {/* 🔥 Glow Effect */}
  <div className="
    pointer-events-none
    absolute inset-0 opacity-0
    group-hover:opacity-100
    bg-gradient-to-r from-red-100/40 via-red-50/40 to-red-100/40
    transition duration-500
  " />

  {/* ICON */}
  <LogOut className="
    w-5 h-5 relative z-10
    transition-all duration-300
    group-hover:-translate-x-1 group-hover:scale-110
  " />

  {/* TEXT */}
  <span className="relative z-10">
    Log Out
  </span>

</button>

      {/* Modals */}
      <AnimatePresence>
        {showPwSheet && (
          <AdminChangePwSheet onClose={() => setShowPwSheet(false)} />
        )}
      </AnimatePresence>

      {showEdit && (
        <EditProfileModal
          user={user}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}

//////////////////////////////////////////////////////////
// ✏️ EDIT PROFILE MODAL
//////////////////////////////////////////////////////////

function EditProfileModal({
  user,
  onClose,
}: {
  user: any;
  onClose: () => void;
}) {
  const { toast } = useToast(); // ✅ fix

  const [form, setForm] = useState({
    displayName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
  });

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    // ✅ Required
    if (!form.displayName || !form.email) {
      toast({
        title: "Name and Email are required",
        variant: "destructive",
      });
      return;
    }

    // ✅ الفون اختياري (مش required)
    if (form.phoneNumber && !/^01[0-9]{9}$/.test(form.phoneNumber)) {
      toast({
        title: "Enter a valid Egyptian phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // 🔥 نبني payload صح
      const payload: any = {
        displayName: form.displayName,
        email: form.email,
      };

      // 👇 ابعته بس لو فيه قيمة
      if (form.phoneNumber?.trim()) {
        payload.phoneNumber = form.phoneNumber;
      }

      await updateProfile(payload);

      // 🔥 تحديث localStorage
      const updatedUser = {
        ...user,
        fullName: form.displayName,
        email: form.email,
        phoneNumber: form.phoneNumber,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast({ title: "Profile updated successfully 🔥" });

      onClose();
      window.location.reload();

    } catch (err: any) {
      toast({
        title: err?.message || "Update failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-3xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-lg font-bold">Edit Profile</h2>

        <input
          value={form.displayName}
          onChange={(e) =>
            setForm({ ...form, displayName: e.target.value })
          }
          placeholder="Full Name"
          className="w-full p-3 border rounded-xl"
        />

        <input
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
          placeholder="Email"
          className="w-full p-3 border rounded-xl"
        />

        <input
          value={form.phoneNumber}
          onChange={(e) =>
            setForm({ ...form, phoneNumber: e.target.value })
          }
          placeholder="Phone Number (optional)"
          className="w-full p-3 border rounded-xl"
        />

        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-[#2EC4A5] hover:bg-[#28b096] text-white py-3 rounded-xl font-bold transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

//////////////////////////////////////////////////////////
// 🔐 CHANGE PASSWORD
//////////////////////////////////////////////////////////
export function AdminChangePwSheet({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();

  const [form, setForm] = useState({
    current: "",
    newPw: "",
    confirm: "",
  });

  const [show, setShow] = useState({
    current: false,
    newPw: false,
    confirm: false,
  });

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    // ✅ validation
    if (!form.current || !form.newPw || !form.confirm) {
      toast({
        title: "Fill all fields",
        variant: "destructive",
      });
      return;
    }

    if (form.newPw !== form.confirm) {
      toast({
        title: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      await changePassword({
        currentPassword: form.current,
        newPassword: form.newPw,
        confirmPassword: form.confirm,
      });

      toast({ title: "Password updated successfully 🔥" });

      setForm({ current: "", newPw: "", confirm: "" });
      onClose();

    } catch (err: any) {
      toast({
        title: err?.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* 🔥 BLUR + DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />

      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl px-6 pt-4 pb-10 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* drag bar */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-5" />

        <h3 className="font-bold text-xl mb-6">
          Change Password
        </h3>

        <div className="space-y-4">

          {[
            { key: "current", label: "Current Password" },
            { key: "newPw", label: "New Password" },
            { key: "confirm", label: "Confirm Password" },
          ].map((f) => {
            const key = f.key as keyof typeof form;

            return (
              <div key={f.key} className="relative">
                <input
                  type={show[key] ? "text" : "password"}
                  placeholder={f.label}
                  value={form[key]}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      [key]: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-4 border border-slate-200 rounded-2xl pr-12 focus:outline-none focus:border-[#2EC4A5]"
                />

                {/* 👁️ Eye Button */}
                <button
                  type="button"
                  onClick={() =>
                    setShow((s) => ({
                      ...s,
                      [key]: !s[key],
                    }))
                  }
                  className="absolute right-4 top-4"
                >
                  {show[key] ? (
                    <EyeOff className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
            );
          })}

          {/* Button */}
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full bg-[#2EC4A5] hover:bg-[#28b096] text-white py-4 rounded-2xl font-bold transition disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
}
// ─── Users Management (Full CRUD) ─────────────────────────────────────────────
///////////////////////////////////////////////////////////
// 🔥 USER MODAL
///////////////////////////////////////////////////////////
function UserModal({ user: editUser, onClose, onSaved }: any) {
  const { toast } = useToast();
  const isEdit = !!editUser;

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "Student",
    isActive: true,
  });

  useEffect(() => {
    if (editUser) {
      setForm({
        displayName: editUser.displayName || "",
        email: editUser.email || "",
        phoneNumber: editUser.phoneNumber || "",
        password: "",
        role: editUser.roleName || editUser.role?.[0] || "Student",
        isActive: editUser.isActive ?? true,
      });
    }
  }, [editUser]);

  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSave = async () => {
    if (!form.displayName || !form.email) {
      toast({ title: "Fill required fields", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        displayName: form.displayName,
        email: form.email,
        phoneNumber: form.phoneNumber || undefined,
        role: form.role,
        isActive: form.isActive,
      };

      if (isEdit) {
        await updateUser(editUser.numericId, payload);
      } else {
        await createUser({ ...payload, password: form.password });
      }
toast({
  title: "Success",
  description: "User updated successfully",
  duration: 1800,
  className:
    "flex items-center gap-3 bg-white text-slate-800 border rounded-2xl shadow-xl px-5 py-4",
  action: (
    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600">
      ✓
    </div>
  ),
});
      onClose();
      onSaved();

    } catch (e: any) {
      toast({
        title: "Error ❌",
        description:
          e?.response?.data?.errors?.[0]?.errors?.[0] ||
          "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
      >

        {/* 🔥 HEADER */}
        <div className="bg-gradient-to-r from-[#2EC4A5] to-indigo-500 text-white px-6 py-5 flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {isEdit ? "Edit User" : "Create User"}
          </h2>
          <button onClick={onClose} className="opacity-80 hover:opacity-100">
            ✖
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">

          {/* NAME */}
          <input
            placeholder="Full Name"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2EC4A5]"
            value={form.displayName}
            onChange={(e)=>setForm({...form, displayName:e.target.value})}
          />

          {/* EMAIL */}
          <input
            placeholder="Email"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2EC4A5]"
            value={form.email}
            onChange={(e)=>setForm({...form, email:e.target.value})}
          />

          {/* PHONE */}
          <input
            placeholder="Phone"
            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#2EC4A5]"
            value={form.phoneNumber}
            onChange={(e)=>setForm({...form, phoneNumber:e.target.value})}
          />

          {/* PASSWORD */}
          {!isEdit && (
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="Password"
                className="w-full px-4 py-3 border rounded-xl pr-12"
                value={form.password}
                onChange={(e)=>setForm({...form, password:e.target.value})}
              />
              <button
                onClick={()=>setShowPw(!showPw)}
                className="absolute right-3 top-3 text-gray-400"
              >
                👁
              </button>
            </div>
          )}

          {/* ROLE */}
          <select
            className="w-full px-4 py-3 border rounded-xl"
            value={form.role}
            onChange={(e)=>setForm({...form, role:e.target.value})}
          >
            <option value="Student">Student</option>
            <option value="Doctor">Doctor</option>
            <option value="Admin">Admin</option>
          </select>

          {/* STATUS */}
          {isEdit && (
            <div className="flex justify-between items-center">
              <span className="text-sm">Active</span>
              <button
                onClick={()=>setForm({...form, isActive: !form.isActive})}
                className={`w-12 h-6 rounded-full p-1 transition
                  ${form.isActive ? "bg-[#2EC4A5]" : "bg-gray-300"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full transform transition
                    ${form.isActive ? "translate-x-6" : ""}`}
                />
              </button>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border rounded-xl py-3"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-[#2EC4A5] to-indigo-500 text-white py-3 rounded-xl flex justify-center items-center gap-2"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
///////////////////////////////////////////////////////////
// 🔥 VIEW MODAL
///////////////////////////////////////////////////////////
function ViewUserModal({ user, onClose }: any) {

  const formatLastSeen = (date: string) => {
    if (!date) return "—";

    const diff = (Date.now() - new Date(date).getTime()) / 1000;

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;

    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
      >

        {/* 🔥 HEADER */}
        <div className="bg-gradient-to-r from-[#2EC4A5] to-indigo-500 p-6 text-white flex flex-col items-center relative">

          {/* 🟢 Online Indicator */}
          <div className="absolute top-5 right-5">
            <span
              className={`w-3 h-3 rounded-full block
                ${user.isOnline ? "bg-green-400 animate-pulse" : "bg-gray-300"}`}
            />
          </div>

          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-white text-[#2EC4A5] flex items-center justify-center text-3xl font-bold shadow-md">
            {user.displayName?.charAt(0)}
          </div>

          <h2 className="mt-3 text-lg font-bold">{user.displayName}</h2>
          <p className="text-sm opacity-80">{user.email}</p>

        </div>

        {/* 🔥 BODY */}
        <div className="p-6 space-y-4">

          {/* PHONE */}
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500 text-sm">Phone</span>
            <span>{user.phoneNumber || "—"}</span>
          </div>

          {/* ROLE */}
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500 text-sm">Role</span>
            <span className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-600 font-semibold">
              {user.roleName}
            </span>
          </div>

          {/* STATUS */}
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500 text-sm">Status</span>
            <span
              className={`px-3 py-1 text-xs rounded-full font-semibold
              ${user.isActive
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-500"}`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* 🔥 LAST SEEN */}
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Last Seen</span>

            {user.isOnline ? (
              <span className="text-green-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online
              </span>
            ) : (
              <span className="text-gray-600 text-sm">
                {formatLastSeen(user.lastSeen)}
              </span>
            )}
          </div>

        </div>

        {/* 🔥 FOOTER */}
        <div className="p-5">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2EC4A5] to-indigo-500 text-white font-semibold"
          >
            Close
          </button>
        </div>

      </motion.div>
    </div>
  );
}


///////////////////////////////////////////////////////////
// 🔥 DELETE MODAL
///////////////////////////////////////////////////////////
function DeleteConfirm({ user, onClose, onDeleted }: any) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteUser(user.numericId);

      toast({ title: "Deleted successfully" });
      onDeleted();
      onClose();
    } catch (e: any) {
      toast({ title: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
  <div className="bg-white rounded-3xl p-6 w-[360px] text-center space-y-4 shadow-xl">

    <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
      <Trash2 className="text-red-500"/>
    </div>

    <h3 className="font-bold text-lg">Delete User</h3>

    <p className="text-gray-500 text-sm">
      Are you sure you want to delete <b>{user.displayName}</b>?
    </p>

    <div className="flex gap-2">
      <button onClick={onClose} className="flex-1 py-2 border rounded-xl">
        Cancel
      </button>

      <button onClick={handleDelete} className="flex-1 py-2 bg-red-500 text-white rounded-xl">
        Delete
      </button>
    </div>

  </div>
</div>
  );
}
const formatLastSeen = (date: string) => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;

  return new Date(date).toLocaleDateString();
};


///////////////////////////////////////////////////////////
// 🔥 MAIN COMPONENT
///////////////////////////////////////////////////////////
export function AdminUsers() {

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [filter, setFilter] = useState<"all" | "admin" | "doctor" | "student">("all");
  const [search, setSearch] = useState("");

  const [viewUser, setViewUser] = useState<any>(null);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteUserState, setDeleteUserState] = useState<any>(null);
  const [createModal, setCreateModal] = useState(false);

  // 🔥 FETCH
  const fetchUsers = async () => {
    const data = await getAllUsers();

    // mock lastSeen لو مش موجود
    const withPresence = data.map((u: any) => ({
      ...u,
      isOnline: u.isOnline ?? Math.random() > 0.5,
      lastSeen: u.lastSeen ?? new Date().toISOString(),
    }));

    setUsers(withPresence || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔥 COUNTERS
  const stats = {
    all: users.length,
    admin: users.filter(u => u.roleName === "Admin").length,
    doctor: users.filter(u => u.roleName === "Doctor").length,
    student: users.filter(u => u.roleName === "Student").length,
  };

  // 🔥 FILTER
  const filteredUsers = users.filter(u => {
    const matchSearch =
      !search ||
      u.displayName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all" ||
      u.roleName?.toLowerCase() === filter;

    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">User Management</h1>

        <button
          onClick={() => setCreateModal(true)}
          className="flex items-center gap-2 bg-[#2EC4A5] hover:bg-[#28b096] text-white px-5 py-3 rounded-xl font-semibold"
        >
          <Plus size={16}/> Add User
        </button>
      </div>

      {/* 🔥 COUNTERS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {[
          { key: "all", label: "All Users", value: stats.all },
          { key: "admin", label: "Admins", value: stats.admin },
          { key: "doctor", label: "Doctors", value: stats.doctor },
          { key: "student", label: "Students", value: stats.student },
        ].map(item => (
          <div
            key={item.key}
            onClick={() => setFilter(item.key as any)}
            className={`p-4 rounded-xl cursor-pointer bg-white shadow-sm border transition
              ${filter === item.key ? "ring-2 ring-[#2EC4A5]" : ""}`}
          >
            <p className="text-sm text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold text-slate-800">{item.value}</p>
          </div>
        ))}

      </div>

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={16}/>
        <input
          value={search}
          onChange={(e)=>setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-11 pr-4 py-3 bg-white border rounded-xl"
        />
      </div>

      {/* 🔥 TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">

          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-8 py-5 text-left">User</th>
              <th className="px-6 py-5">Role</th>
              <th className="px-6 py-5">Phone</th>
              <th className="px-6 py-5">Presence</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y">

            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-20 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : filteredUsers.map(u => (

              <tr key={u.id} className="hover:bg-slate-50">

                {/* USER */}
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#2EC4A5] to-indigo-500 text-white flex items-center justify-center font-bold">
                      {u.displayName?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{u.displayName}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>

                {/* ROLE */}
                <td className="px-6 py-5">
                  <span className="px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-600">
                    {u.roleName}
                  </span>
                </td>

                {/* PHONE */}
                <td className="px-6 py-5">
                  {u.phoneNumber || "—"}
                </td>

                {/* PRESENCE */}
                <td className="px-6 py-5">
                  {u.isOnline ? (
                    <span className="flex items-center gap-2 text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Online
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">
                      Last seen {formatLastSeen(u.lastSeen)}
                    </span>
                  )}
                </td>

                {/* STATUS */}
                <td className="px-6 py-5">
                  <span className="px-3 py-1 text-xs rounded-full bg-green-50 text-green-600">
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">

                    <button onClick={()=>setViewUser(u)}>👁️</button>
                    <button onClick={()=>setEditUser(u)}>✏️</button>
                    <button onClick={()=>setDeleteUserState(u)}>🗑️</button>

                  </div>
                </td>

              </tr>
            ))}

          </tbody>

        </table>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {createModal && <UserModal onClose={()=>setCreateModal(false)} onSaved={fetchUsers}/>}
        {editUser && <UserModal user={editUser} onClose={()=>setEditUser(null)} onSaved={fetchUsers}/>}
        {deleteUserState && <DeleteConfirm user={deleteUserState} onClose={()=>setDeleteUserState(null)} onDeleted={fetchUsers}/>}
        {viewUser && <ViewUserModal user={viewUser} onClose={()=>setViewUser(null)} />}
      </AnimatePresence>

    </div>
  );
}

// ─── All Tumor Types (read-only) ──────────────────────────────────────────────────────

export function AdminTumorTypes() {
  const { toast } = useToast();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [createModal, setCreateModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // 🔥 FETCH
 const fetchData = async () => {
  const res = await getAllTumorTypes();

  console.log("🔥 TumorTypes:", res);

  setData(res || []); // لو انت already راجع data
  setLoading(false);
};

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-10">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-800">
          Tumor Types
        </h1>

        <button
          onClick={() => setCreateModal(true)}
          className="w-full sm:w-auto bg-[#2EC4A5] hover:bg-[#28b096] text-white px-5 py-3 rounded-xl font-semibold shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus size={18} /> Add Tumor
        </button>
      </div>

      {/* ✅ MOBILE CARDS (Visible on Mobile only) */}
      <div className="grid grid-cols-1 gap-4 sm:hidden">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 animate-pulse">
              <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
              <div className="h-4 w-full bg-gray-100 rounded mb-4" />
              <div className="flex justify-end gap-2">
                <div className="h-9 w-9 bg-gray-200 rounded-xl" />
                <div className="h-9 w-9 bg-gray-200 rounded-xl" />
              </div>
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-100">
            <div className="text-4xl mb-3">🧠</div>
            <p className="text-gray-400">No tumor types found</p>
          </div>
        ) : (
          data.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="font-bold text-slate-800 text-lg leading-tight">{t.name}</h3>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => setEditItem(t)}
                    className="p-2.5 text-blue-500 bg-blue-50 rounded-xl"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={async () => {
                      if (window.confirm("Are you sure?")) {
                        await deleteTumorType(t.id);
                        toast({ title: "Deleted successfully" });
                        fetchData();
                      }
                    }}
                    className="p-2.5 text-red-500 bg-red-50 rounded-xl"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t.description || "No description provided."}
              </p>
            </div>
          ))
        )}
      </div>

      {/* ✅ DESKTOP TABLE (Hidden on Mobile) */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Name</th>
                <th className="px-6 py-4 text-left font-semibold">Description</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-64 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-20 bg-gray-200 rounded animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : data.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">{t.name}</td>
                  <td className="px-6 py-4 text-gray-500">{t.description}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditItem(t)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm("Are you sure?")) {
                            await deleteTumorType(t.id);
                            toast({ title: "Deleted successfully" });
                            fetchData();
                          }
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {createModal && (
          <TumorModal
            onClose={() => setCreateModal(false)}
            onSaved={fetchData}
          />
        )}

        {editItem && (
          <TumorModal
            tumor={editItem}
            onClose={() => setEditItem(null)}
            onSaved={fetchData}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
function TumorModal({ tumor, onClose, onSaved }: any) {
  const { toast } = useToast();
  const isEdit = !!tumor;

  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tumor) {
      setForm({
        name: tumor.name || "",
        description: tumor.description || "",
      });
    }
  }, [tumor]);

  const handleSave = async () => {
    if (!form.name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        await updateTumorType(tumor.id, form);
      } else {
        await createTumorType(form);
      }

      toast({
        title: "Success",
        description: isEdit ? "Updated" : "Created",
      });

      onClose();
      onSaved();

    } catch (e) {
      toast({
        title: "Error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#2EC4A5] to-indigo-500 text-white px-6 py-5 flex justify-between">
          <h2 className="font-bold">
            {isEdit ? "Edit Tumor" : "Create Tumor"}
          </h2>
          <button onClick={onClose}>✖</button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">

          <input
            placeholder="Name"
            className="w-full px-4 py-3 border rounded-xl"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <textarea
            placeholder="Description"
            className="w-full px-4 py-3 border rounded-xl"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

        </div>

        {/* FOOTER */}
        <div className="p-5 flex gap-3">
          <button onClick={onClose} className="flex-1 border rounded-xl py-3">
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex-1 bg-[#2EC4A5] text-white py-3 rounded-xl"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}
// ─── All Scans (read-only) ──────────────────────────────────────────────────────
function useScanDetails(id: number) {
  return useQuery({
    queryKey: ["scan-details", id],
    queryFn: () => getScanById7138(id),
    enabled: !!id,
  });
}


function useAdminScans() {
  return useQuery({
    queryKey: ["admin-scans"],
    queryFn: getAllScansAdmin7138,
  });
}

type Scan = {
  id: number;
  imagePath: string;
  status: "Pending" | "Completed";
  uploadDate: string;
};

export function AdminScans() {
  const { data, isLoading } = useAdminScans() as any;
  const [, navigate] = useLocation();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Pending" | "Completed">("all");

  const scans: Scan[] = useMemo(() => {
    return (data?.scans || []).filter((s: Scan) => {
      const matchSearch = !search || String(s.id).includes(search);
      const matchFilter = filter === "all" || s.status === filter;
      return matchSearch && matchFilter;
    });
  }, [data, search, filter]);

return (
  <div className="space-y-6">

  {/* 🔥 HEADER */}
<div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">

  {/* LEFT */}
  <div className="flex items-center gap-4">

    {/* ICON */}
    <div className="w-14 h-14 flex items-center justify-center rounded-2xl 
    bg-[#2EC4A5]/10 text-[#2EC4A5] shadow-sm">
      <Activity className="w-6 h-6" />
    </div>

    {/* TEXT */}
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
        MRI Scans Dashboard

       
      </h1>

      <p className="text-slate-500 text-sm mt-1">
        Monitor all MRI scans in the system
      </p>
    </div>

  </div>

  {/* RIGHT */}
  <div className="flex items-center gap-3">

    <div className="flex items-center gap-2 bg-white border border-slate-200 
    text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-2xl shadow-sm">
      
      <Database className="w-4 h-4 text-[#2EC4A5]" />
      
      {data?.stats?.total || 0} total
    </div>

  </div>

</div>

  {/* 🔥 STATS */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

    {/* Total */}
    <div className="relative overflow-hidden rounded-3xl p-5 border border-slate-100 shadow-sm flex justify-between items-center bg-white">
      
      {/* 🔥 Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-transparent opacity-70" />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/40 blur-3xl rounded-full" />

      {/* Content */}
      <div className="relative z-10">
        <p className="text-sm text-slate-500">Total Scans</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">
          {data?.stats?.total || 0}
        </p>
      </div>

      <div className="relative z-10 w-12 h-12 rounded-xl bg-white flex items-center justify-center text-lg shadow-inner">
        🧠
      </div>
    </div>

    {/* Pending */}
    <div className="relative overflow-hidden rounded-3xl p-5 border border-slate-100 shadow-sm flex justify-between items-center bg-white">
      
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 via-white to-transparent opacity-70" />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-200/40 blur-3xl rounded-full" />

      <div className="relative z-10">
        <p className="text-sm text-slate-500">Pending</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">
          {data?.stats?.pending || 0}
        </p>
      </div>

      <div className="relative z-10 w-12 h-12 rounded-xl bg-white flex items-center justify-center text-lg shadow-inner">
        ⏳
      </div>
    </div>

    {/* Completed */}
    <div className="relative overflow-hidden rounded-3xl p-5 border border-slate-100 shadow-sm flex justify-between items-center bg-white">
      
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-transparent opacity-70" />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-200/40 blur-3xl rounded-full" />

      <div className="relative z-10">
        <p className="text-sm text-slate-500">Completed</p>
        <p className="text-3xl font-bold text-slate-900 mt-1">
          {data?.stats?.completed || 0}
        </p>
      </div>

      <div className="relative z-10 w-12 h-12 rounded-xl bg-white flex items-center justify-center text-lg shadow-inner">
        ✅
      </div>
    </div>

  </div>

  

    {/* 🔍 SEARCH + FILTER */}
    <div className="flex flex-col sm:flex-row gap-4">

      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by scan ID..."
          className="
            w-full pl-11 pr-4 py-3
            bg-white/70 backdrop-blur
            border border-slate-200
            rounded-2xl text-sm
            shadow-sm
            placeholder:text-slate-400
            focus:outline-none
            focus:ring-2 focus:ring-[#2EC4A5]/40
            focus:border-[#2EC4A5]
            transition-all duration-200
          "
        />
      </div>

      {/* Filter */}
      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as any)}
        className="
          px-5 py-3
          bg-white/70 backdrop-blur
          border border-slate-200
          rounded-2xl
          text-sm
          shadow-sm
          focus:outline-none
          focus:ring-2 focus:ring-[#2EC4A5]/40
        "
      >
        <option value="all">All</option>
        <option value="Pending">Pending</option>
        <option value="Completed">Completed</option>
      </select>

    </div>
  
      {/* 🧾 TABLE */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Scan</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-6 py-4">
                      <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : scans.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No scans found
                  </td>
                </tr>
              ) : (
                scans.map((scan) => (
                  <tr
                    key={scan.id}
                    className="group hover:bg-slate-50 transition cursor-pointer"
                    onClick={() => navigate(`/admin/scans/${scan.id}`)}
                  >

                    {/* IMAGE */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">

                        <div className="w-14 h-14 rounded-xl overflow-hidden border">
                          <img
                            src={scan.imagePath}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            Scan  {scan.id}
                          </p>
                          <p className="text-xs text-slate-400">
                            MRI Brain Scan
                          </p>
                        </div>

                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          scan.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {scan.status}
                      </span>
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {format(new Date(scan.uploadDate), "MMM dd, yyyy")}
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-[#2EC4A5] font-semibold opacity-0 group-hover:opacity-100 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/admin/scans/${scan.id}`);
                        }}
                      >
                        View →
                      </button>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


export function ScanDetails() {
  const params = useParams();
  const [, navigate] = useLocation();

  const id = Number(params.id);
  const { data, isLoading } = useScanDetails(id);

  const [zoom, setZoom] = useState(false);

  if (isLoading) return <p className="p-6">Loading...</p>;
  if (!data) return <p className="p-6">Not found</p>;

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen p-6 md:p-10 space-y-10">
   <button
 onClick={() => navigate("/admin/scans")}
   className="
    relative overflow-hidden
    flex items-center gap-2
    px-5 py-2.5
    rounded-xl
    bg-white border shadow-sm
    text-sm font-semibold text-slate-600
    transition-all duration-300
    hover:bg-[#2EC4A5]/10 hover:text-[#2EC4A5]
    hover:shadow-md
    active:scale-95
    group
  "
>

  {/* ripple effect */}
  <span className="absolute inset-0 bg-[#2EC4A5]/10 scale-0 group-hover:scale-100 transition duration-500 rounded-xl" />

  {/* icon */}
  <ArrowLeft
    size={18}
    className="relative z-10 transition-transform duration-300 group-hover:-translate-x-1"
  />

  {/* text */}
  <span className="relative z-10">Back</span>

</button>

      {/* 🧠 HEADER */}
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">

        <div>
          <h2 className="text-3xl font-extrabold text-[#2EC4A5] tracking-wide">
            Scan Details
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            MRI Brain Analysis Overview
          </p>
        </div>

        {/* STATUS */}
        <span
          className={`px-5 py-2 rounded-full text-xs font-semibold shadow ${
            data.status === "Completed"
              ? "bg-green-100 text-green-600"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {data.status}
        </span>
      </div>

      {/* 🖼️ IMAGE */}
      <div className="relative bg-white rounded-3xl shadow-lg p-6 flex justify-center items-center overflow-hidden">

        <img
          src={data.imagePath}
          onClick={() => setZoom(true)}
          className="max-h-[420px] object-contain rounded-xl cursor-zoom-in hover:scale-105 transition duration-500"
        />

        {/* glow */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-green-200/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-300/30 blur-3xl rounded-full" />
      </div>

      {/* 🔍 ZOOM */}
      {zoom && (
        <div
          onClick={() => setZoom(false)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <img
            src={data.imagePath}
            className="max-h-[90%] max-w-[90%] object-contain rounded-xl"
          />
        </div>
      )}

     {/* 📊 INFO */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

  {/* Scan Number */}
  <div className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-md flex items-center justify-between">

    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/30 blur-3xl rounded-full" />

    <div className="relative z-10">
      <p className="text-xs tracking-widest text-slate-400 uppercase">
        Scan Number
      </p>

      <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
        {data.id}
      </h2>
    </div>

    <div className="relative z-10 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shadow-inner">
      <Hash size={20} className="text-blue-600" />
    </div>
  </div>

  {/* Upload Date */}
  <div className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-md flex items-center justify-between">

    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200/30 blur-3xl rounded-full" />

    <div className="relative z-10">
      <p className="text-xs tracking-widest text-slate-400 uppercase">
        Upload Date
      </p>

      <h2 className="text-lg font-semibold text-slate-900 mt-2">
        {new Date(data.uploadDate).toLocaleString()}
      </h2>
    </div>

    <div className="relative z-10 w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shadow-inner">
      <Calendar size={20} className="text-purple-600" />
    </div>
  </div>

</div>
      

    </div>
  );
}
export function AdminRoutes() {
  return (
    <>
      <Route path="/admin/scans" component={AdminScans} />
      <Route path="/admin/scans/:id" component={ScanDetails} />
    </>
  );
}


///////////////////////////////////////////////////////////
// 💎 STAT CARD
///////////////////////////////////////////////////////////
type Props = {
  title: string;
  value: number;
  color?: "green" | "yellow" | "blue";
  icon?: string;
};

export function StatCard({ title, value, color = "blue", icon = "🧠" }: Props) {
  const colors = {
    green: "from-green-50 to-green-100 text-green-700",
    yellow: "from-yellow-50 to-yellow-100 text-yellow-700",
    blue: "from-blue-50 to-blue-100 text-blue-700",
  };

  return (
    <div
      className={`
        relative overflow-hidden
        bg-gradient-to-br ${colors[color]}
        rounded-3xl p-5
        shadow-md hover:shadow-xl
        transition-all duration-300
        hover:-translate-y-1
        flex justify-between items-center
      `}
    >
      {/* Glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/30 blur-3xl rounded-full"></div>

      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>

      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6EE7B7] via-[#3B82F6] to-[#6366F1] flex items-center justify-center text-white shadow-lg">
        {icon}
      </div>
    </div>
  );
}

// ─── All Analysis (read-only) ───────────────────────────────────────────────────
export function useGetAnalysisDetails(analysisId?: number) {
  return useQuery({
    queryKey: ["analysis-details", analysisId],
    queryFn: () => getAnalysisDetails7138(analysisId!),
    enabled: !!analysisId, // مهم جدًا
  });
}
export function useGetAllAnalysis(params?: { limit?: number }) {
  return useQuery({
    queryKey: ["analysis", params],
    queryFn: async () => {
      const data = await getAllAnalysis7138();

      // ✅ لو عايز limit
      if (params?.limit) {
        return {
          data: data.slice(0, params.limit),
        };
      }

      return { data };
    },
  });
}
export default function AnalysisDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [zoom, setZoom] = useState(false);
  const { data, isLoading } = useGetAnalysisDetails(Number(id));

  const analysis = data?.current;
  const history = data?.history || [];

  const [showHistory, setShowHistory] = useState(false);

  // 🎨 Risk Color
  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-600";
      case "Medium":
        return "bg-yellow-100 text-yellow-600";
      case "Low":
        return "bg-green-100 text-green-600";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  if (isLoading || !analysis) {
    return (
      <div className="p-10 text-center text-slate-400">
        Loading analysis...
      </div>
    );
  }

 
 return (
  <div className="bg-[#F4F7FB] min-h-screen py-6 px-3">

    <div className="max-w-6xl mx-auto space-y-8">

      {/* 🔙 BACK */}
      <button
        onClick={() => navigate("/admin/analysis")}
        className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl 
        bg-white border border-slate-100 shadow-sm
        hover:bg-[#2EC4A5]/10 hover:text-[#2EC4A5] 
        transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <ArrowLeft 
          size={18} 
          className="transition-transform duration-300 group-hover:-translate-x-1" 
        />
        Back
      </button>

      {/* 🔥 HEADER */}
      <div className="flex justify-between items-center flex-wrap gap-6">

        <div className="flex items-center gap-4">

         <div className="w-12 h-12 flex items-center justify-center rounded-2xl 
bg-[#2EC4A5]/10 text-[#2EC4A5] shadow-sm">
  <BarChart3 className="w-6 h-6" />
</div>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              Analysis Details
            </h2>

            <p className="text-slate-400 text-sm mt-1">
              AI-powered prediction overview & insights
            </p>
          </div>

        </div>

        <span className="px-4 py-2 rounded-full text-sm bg-indigo-50 text-indigo-600 font-semibold">
          {analysis.prediction}
        </span>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* IMAGE */}
          <div
            onClick={() => setZoom(true)}
            className="bg-white rounded-3xl shadow-sm overflow-hidden group cursor-pointer"
          >
            <img
              src={analysis.imageUrl}
              className="w-full h-[350px] object-cover transition duration-500 group-hover:scale-105"
            />
          </div>

       {/* 📊 SUMMARY */}
<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 
hover:shadow-lg transition-all duration-300 group">

  <div className="flex items-start gap-4">

    {/* ICON */}
    <div className="w-11 h-11 flex items-center justify-center rounded-2xl 
    bg-indigo-50 text-indigo-600">
      <FileText className="w-5 h-5" />
    </div>

    {/* CONTENT */}
    <div className="flex-1">

      <p className="text-xs text-slate-400 uppercase tracking-wide">
        Summary
      </p>

      <p className="text-slate-700 text-sm leading-relaxed mt-1">
        {analysis.summary || "No summary available for this analysis."}
      </p>

    </div>

  </div>

</div>
          {/* NOTES */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition">

            <div className="flex items-center justify-between mb-5">

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2EC4A5]/10">
                  <StickyNote className="w-5 h-5 text-[#2EC4A5]" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">Doctor Notes</p>
                  <p className="text-xs text-slate-400">Add and manage notes</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-[#2EC4A5]/10 text-[#2EC4A5] font-semibold text-sm">
                {analysis.doctorNotes?.length || 0}
              </span>
            </div>

            {analysis.doctorNotes?.length === 0 ? (
              <p className="text-slate-400 text-sm">No notes</p>
            ) : (
              <div className="space-y-3">
                {analysis.doctorNotes.map((note: any) => (
                  <div
                    key={note.id}
                    className="p-4 bg-slate-50 rounded-xl hover:shadow-md transition"
                  >
                    <p className="font-semibold text-slate-800 text-sm">
                      {note.doctorName}
                    </p>

                    <p className="text-sm text-slate-600 mt-1">
                      {note.note}
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

              {/* RIGHT */}
<div className="space-y-4">

  {[
    {
      title: "Tumor",
      value: analysis.tumorInfo?.tumorType || "Unknown",
      icon: Brain,
      bg: "from-blue-50 to-white",
      color: "text-blue-600",
    },
    {
      title: "Confidence",
      value: `${Math.round(analysis.confidence)}%`,
      icon: BarChart3,
      bg: "from-[#2EC4A5]/10 to-white",
      color: "text-[#2EC4A5]",
    },
    {
      title: "Risk",
      value: analysis.riskAssessment?.riskLevel || "N/A",
      icon: AlertTriangle,
      bg: "from-red-50 to-white",
      color: "text-red-500",
    },
  ].map((item, i) => {
    const Icon = item.icon;

    return (
      <div
        key={i}
        className={`
          group relative overflow-hidden
          bg-gradient-to-br ${item.bg}
          p-5 rounded-3xl border border-slate-100
          shadow-sm
          flex justify-between items-center
          transition-all duration-300
          hover:shadow-xl hover:-translate-y-1
        `}
      >

        {/* TEXT */}
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide">
            {item.title}
          </p>

          <p className="font-bold text-slate-800 text-lg mt-1">
            {item.value}
          </p>
        </div>

        {/* ICON */}
        <div className="w-12 h-12 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
          <Icon className={`w-5 h-5 ${item.color}`} />
        </div>

        {/* 🔥 Glow */}
        <div className="
          pointer-events-none
          absolute -top-10 -right-10 w-32 h-32
          bg-[#2EC4A5]/10 blur-3xl rounded-full
          opacity-0 group-hover:opacity-100
          transition duration-300
        " />

      </div>
    );
  })}

</div>
</div>



      {/* HISTORY */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#2EC4A5]/10">
              <Clock className="w-5 h-5 text-[#2EC4A5]" />
            </div>

            <div>
              <h2 className="font-bold text-slate-800 text-lg">History</h2>
              <p className="text-xs text-slate-400">
                View previous scans & analyses
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl 
            bg-[#2EC4A5]/10 text-[#2EC4A5] 
            hover:bg-[#2EC4A5] hover:text-white transition"
          >
            {showHistory ? "Hide" : "View"}
          </button>
        </div>

        {showHistory && (
          <div className="space-y-3">
            {history.map((h: any) => (
              <div
                key={h.id}
                className="p-4 bg-slate-50 rounded-xl flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <p className="font-semibold">{h.prediction}</p>
                  <p className="text-xs text-gray-400">{h.summary}</p>
                </div>

                <span className="text-[#2EC4A5] font-bold">
                  {Math.round(h.confidence)}%
                </span>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>

    {/* ZOOM */}
    {zoom && (
      <div
        onClick={() => setZoom(false)}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      >
        <img
          src={analysis.imageUrl}
          className="max-w-[90%] rounded-xl shadow-lg"
        />
      </div>
    )}

  </div>
);
}
export function AdminAnalysis() {
  const { data, isLoading } = useGetAllAnalysis({ limit: 100 });
  const analyses = (data as any)?.data || [];
const [, navigate] = useLocation(); // ✅ مهم
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
const tumorStyles: Record<string, any> = {
  Healthy: {
    bg: "from-green-50 to-green-100",
    text: "text-green-700",
    glow: "bg-green-300/30",
    icon: "🧠",
  },
  "No Tumor": {
    bg: "from-teal-50 to-teal-100",
    text: "text-teal-700",
    glow: "bg-teal-300/30",
    icon: "💊",
  },
  Pituitary: {
    bg: "from-blue-50 to-blue-100",
    text: "text-blue-700",
    glow: "bg-blue-300/30",
    icon: "🧬",
  },
  Glioma: {
    bg: "from-red-50 to-red-100",
    text: "text-red-700",
    glow: "bg-red-300/30",
    icon: "⚠️",
  },
  Meningioma: {
    bg: "from-purple-50 to-purple-100",
    text: "text-purple-700",
    glow: "bg-purple-300/30",
    icon: "🧪",
  },
};
  // 🔢 Count
  const tumorCounts: Record<string, number> = {};
  analyses.forEach((a: any) => {
    const t = a.tumorInfo?.tumorType || "unknown";
    tumorCounts[t] = (tumorCounts[t] || 0) + 1;
  });

  // 🎯 Filter + Search
  const filtered = analyses.filter((a: any) => {
    const matchesSearch = a.scanId.toString().includes(search);
    const matchesFilter =
      filter === "All" || a.tumorInfo?.tumorType === filter;
    return matchesSearch && matchesFilter;
  });

  // 🎨 Risk Colors
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "High":
        return "bg-red-100 text-red-600";
      case "Medium":
        return "bg-yellow-100 text-yellow-600";
      case "Low":
        return "bg-green-100 text-green-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };
  const { data: details, isLoading: detailsLoading } =
  useGetAnalysisDetails(selectedId || undefined);

 return (
  <div className="space-y-6">

  
{/* 🔥 HEADER */}
<div className="flex items-center justify-between flex-wrap gap-6">

  {/* LEFT */}
  <div className="flex items-center gap-4">

    {/* ICON */}
    <div className="w-14 h-14 flex items-center justify-center rounded-2xl 
    bg-[#2EC4A5]/10 text-[#2EC4A5] shadow-sm">
      <Brain className="w-6 h-6" />
    </div>

    {/* TEXT */}
    <div>
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-2">
        AI Analysis Dashboard

        
       
      </h1>

      <p className="text-slate-500 text-sm mt-1">
        Monitor brain tumor predictions with intelligent insights
      </p>
    </div>

  </div>

 

</div>

 


    {/* 🔥 CARDS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
      {Object.entries(tumorCounts).map(([type, count]) => {
        const style = tumorStyles[type] || {
          bg: "from-slate-50 to-slate-100",
          text: "text-slate-700",
          glow: "bg-slate-300/30",
          icon: "❓",
        };

        return (
          <div
            key={type}
            className="
              relative overflow-hidden
              bg-gradient-to-br
              rounded-3xl p-5
              shadow-md hover:shadow-xl
              transition-all duration-300
              hover:-translate-y-1
              flex justify-between items-center
            "
            style={{
              background: `linear-gradient(to bottom right, ${style.bg})`
            }}
          >
            {/* Glow */}
            <div className={`absolute -top-10 -right-10 w-32 h-32 ${style.glow} blur-3xl rounded-full`} />

            {/* Text */}
            <div>
              <p className={`text-sm font-medium ${style.text}`}>
                {type}
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {count}
              </p>
            </div>

            
        
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-white/70 backdrop-blur flex items-center justify-center text-xl shadow-inner">
          {style.icon}
        </div>
      </div>
    );
  })}
</div>
     <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">

  <input
    placeholder="Search scan id..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="
      w-full md:w-80
      px-5 py-3
      rounded-2xl
      bg-white/60 backdrop-blur
      border border-white/40
      focus:outline-none
      focus:ring-2 focus:ring-[#2EC4A5]/40
      shadow-sm
    "
  />

  <select
    value={filter}
    onChange={(e) => setFilter(e.target.value)}
    className="
      px-5 py-3
      rounded-2xl
      bg-white/60 backdrop-blur
      border border-white/40
      shadow-sm
    "
  >
    <option>All</option>
    <option>Healthy</option>
    <option>No Tumor</option>
    <option>Pituitary</option>
    <option>Glioma</option>
    <option>Meningioma</option>
  </select>

</div>
      {/* Table */}
      <div className="bg-white/80 backdrop-blur border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">

            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs text-slate-500 uppercase">Scan</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase">Tumor</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase hidden sm:table-cell">Risk</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase hidden md:table-cell">Confidence</th>
                <th className="px-6 py-4 text-xs text-slate-500 uppercase text-center">View</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-slate-400">
                    No Data
                  </td>
                </tr>
              ) : (
                filtered.map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">

                    {/* Scan */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={a.imageUrl}
                          className="w-12 h-12 rounded-xl object-cover border shadow-sm"
                        />
                        <div>
                          <p className="font-semibold text-sm">
                            Scan {a.scanId}
                          </p>
                          <p className="text-xs text-slate-400">
                            MRI Brain
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tumor */}
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {a.tumorInfo?.tumorType}
                    </td>

                    {/* Risk */}
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className={`text-xs px-3 py-1 rounded-full ${getRiskColor(a.riskAssessment?.riskLevel)}`}>
                        {a.riskAssessment?.riskLevel}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="px-6 py-4 hidden md:table-cell text-sm text-slate-600">
                      {Math.round(a.confidence)}%
                    </td>

                    {/* View */}
                    <td className="px-6 py-4 text-center">
                     <button
 onClick={() => navigate(`/admin/analysis/${a.id}`)} // ✅ analysisId مش scanId
  className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-[#2EC4A5]/10 hover:text-[#2EC4A5] transition hover:scale-110"
>
  <Eye className="w-4 h-4" />
</button>

                    </td>

                  </tr>
                ))
              )}
              
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
