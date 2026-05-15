import { useState, useRef,useEffect,useMemo  } from "react";
import { Link, useLocation, useRoute  ,useParams} from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Home, FileImage, Activity, User, ChevronRight, FileText,CheckCircle, AlertTriangle, 
   Hash, CalendarDays , Key, Bell, Lock, Info,BarChart3 , 
  HelpCircle, MessageCircle, LogOut, Edit2, Eye, EyeOff, ArrowLeft,AlertCircle 
  ,Clock, ChevronDown, ChevronUp,Trash2, Settings ,StickyNote, Plus,UploadCloud, Layers
,Brain, Sparkles  ,ScanSearch,
Microscope,
FlaskConical,
ShieldCheck,
Icon,
Send,
ArrowRight,
Upload,
Check} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import {
  createDoctorNote7138,
  deleteDoctorNote7138,
  getAllAnalysis7138,
  getAnalysis7138,
  getDoctorNotes7138,
  getMyScans7138,
  getScanById7138,
  uploadScan7138,
  getDoctorDashboard,
  Scan7138, ScansResponse,
  deleteScan7138,
  runAnalysis7138,
  getMyAnalysis7138,
  getAnalysisDetails7138,
  getNotificationSettings,
  updateNotificationSettings,
  changePassword,
  logout as logoutApi,
  NotificationSettings,
  updateProfile,
  getAllTumorTypes,
  getOtherAnalysis7138,
  markNotificationAsRead,
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  
} from "@/lib/api7138";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";




import { navigate } from "wouter/use-browser-location";

const doctorNav = [
  { path: "/doctor/dashboard", icon: Home, label: "Home" },
  { path: "/doctor/scans", icon: FileImage, label: "My Scans" },
  { path: "/doctor/analysis", icon: Activity, label: "Analysis" },
   { path: "/doctor/tumor-types", icon: Brain , label: "Tumor Types" },
  { path: "/doctor/profile", icon: User, label: "Profile" },
];

export function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout
      navItems={doctorNav}
      roleBadge={
        <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full">
          Doctor
        </span>
      }
    >
      {children}
    </AppLayout>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function DoctorDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["doctor-dashboard"],
    queryFn: getDoctorDashboard,
  });

  // ================= CARDS =================
  type CardColor = "blue" | "purple" | "green" | "yellow";

  const cards = [
    {
      label: "Total Scans",
      value: data?.totalScans ?? 0,
      icon: FileImage,
      color: "purple",
    },
    {
      label: "Analyzed",
      value: data?.total ?? 0,
      icon: CheckCircle,
      color: "green",
    },
    {
      label: "Pending",
      value: data?.pending ?? 0,
      icon: AlertCircle,
      color: "yellow",
    },
    {
      label: "Reviewed",
      value: data?.reviewed ?? 0,
      icon: Activity,
      color: "blue",
    },
  ];

  const styles = {
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

  // ================= CHART DATA =================
  const tumorData = Object.entries(data?.tumorDistribution || {}).map(
    ([type, count]) => ({
      type,
      count,
    })
  );

  const pieData = [
  { name: "High", value: data?.highRisk ?? 0, color: "#ef4444" },   // 🔴
  { name: "Medium", value: data?.mediumRisk ?? 0, color: "#f59e0b" }, // 🟠
  { name: "Low", value: data?.lowRisk ?? 0, color: "#22c55e" },      // 🟢
];
  const COLORS = ["#ef4444", "#f59e0b", "#22c55e"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Welcome back, Dr. {user?.fullName?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-500 mt-1">
          Real-time insights & patient analytics
        </p>
      </div>

      {/* ================= CARDS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((s) => {
          const style = styles[s.color as CardColor];

          return (
            <div
              key={s.label}
              className="relative overflow-hidden rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${style.bg} opacity-70`} />
              <div className={`absolute -top-10 -right-10 w-28 h-28 ${style.glow} blur-3xl rounded-full`} />

              <div className={`relative z-10 w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-inner ${style.text}`}>
                <s.icon className="w-6 h-6" />
              </div>

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

    {/* ================= CHARTS ================= */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

  {/* ================= BAR CHART ================= */}
  <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition">

    <h3 className="font-semibold text-slate-800 mb-5">
      Tumor Type Distribution
    </h3>

    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={tumorData} barCategoryGap="30%">

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis dataKey="type" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            }}
          />

          <Bar
            dataKey="count"
            fill="#2EC4A5"
            radius={[10, 10, 0, 0]}
            barSize={50}
            activeBar={false}   // 🔥 يشيل أي وميض
          />

        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>

  {/* ================= PIE CHART ================= */}
  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition">

    {/* HEADER */}
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-slate-800">
        Risk Distribution
      </h3>

      <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600">
        {pieData.reduce((a, b) => a + b.value, 0)} cases
      </span>
    </div>

    {/* CHART */}
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>

          <Pie
            data={pieData}
            dataKey="value"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            stroke="none"
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>

          {/* CENTER TEXT */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            <tspan
              x="50%"
              dy="-4"
              className="fill-slate-900 text-xl font-bold"
            >
              {pieData.reduce((a, b) => a + b.value, 0)}
            </tspan>

            <tspan
              x="50%"
              dy="16"
              className="fill-slate-400 text-xs"
            >
              Cases
            </tspan>
          </text>

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
            }}
          />

        </PieChart>
      </ResponsiveContainer>
    </div>

    {/* LEGEND */}
    <div className="flex justify-center gap-5 mt-4">
      {pieData.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">

          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />

          <span className="text-slate-600">
            {item.name} ({item.value})
          </span>

        </div>
      ))}
    </div>

  </div>

</div>

      {/* ================= CTA ================= */}
     <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ scale: 1.01 }}
  transition={{ duration: 0.4 }}
  className="
    relative overflow-hidden
    rounded-3xl p-8
    bg-gradient-to-br from-[#1f9d8b] via-[#2EC4A5] to-[#5fd1bd]
    text-white
    shadow-xl
    flex justify-between items-center
  "
>
  {/* 🔥 Glow Effect */}
  <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 blur-3xl rounded-full" />

  {/* 🧠 Floating Icon (يمين) */}
  {/* 🧠 Animated Brain */}
<motion.div
  className="
    hidden md:block
    absolute right-6 top-6
    text-[120px]   // 🔥 كبرنا الحجم
    opacity-40      // 🔥 وضحناه
    pointer-events-none
  "
  animate={{
    y: [0, -25, 0],        // 🔥 حركة أوضح
    rotate: [0, 8, -8, 0], // 🔥 لف أقوى
    scale: [1, 1.1, 1],    // 🔥 breathing واضح
  }}
  transition={{
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  }}
>
  🧠
</motion.div>

  {/* TEXT */}
  <div className="relative z-10 max-w-md">
    <p className="text-sm opacity-80 mb-2">
      AI-powered analysis
    </p>

    <h2 className="text-3xl font-bold mb-3">
      Review Patient Scans
    </h2>

    <p className="text-white/80 text-sm mb-6">
      Focus on high-risk cases first and provide clinical notes instantly.
    </p>

    {/* BUTTON */}
    <Link
      href="/doctor/analysis"
      className="
        inline-flex items-center gap-2
        bg-white text-[#2EC4A5]
        px-6 py-3
        rounded-xl
        font-semibold
        shadow-md
        hover:shadow-lg
        hover:scale-105
        transition-all
      "
    >
      Start Reviewing →
    </Link>
  </div>
</motion.div>

      {/* ================= RECENT CASES ================= */}
     <div>
        <div className="flex items-center justify-between mb-5">

  {/* LEFT */}
  <div className="flex items-center gap-3">

    {/* ICON */}
    <div className="w-10 h-10 rounded-xl bg-[#2EC4A5]/10 flex items-center justify-center">
      <Activity className="w-5 h-5 text-[#2EC4A5]" />
    </div>

    <div>
      <h3 className="font-bold text-slate-800 text-lg">
        Recent Cases
      </h3>
      <p className="text-xs text-slate-400">
        Latest AI analyzed scans
      </p>
    </div>

  </div>

  {/* RIGHT */}
  <Link
    to="/doctor/analysis"
    className="
      group flex items-center gap-2 text-sm font-medium
      text-[#2EC4A5]
      hover:underline
      transition
    "
  >
    See all

    <ArrowRight className="
      w-4 h-4
      transition-all duration-300
      group-hover:translate-x-1
    " />
  </Link>

</div>


<div className="grid md:grid-cols-2 gap-5">
  {data?.recentCases?.map((scan: any, i: number) => (
    <motion.div
      key={scan.analysisId}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}

      onClick={() => navigate(`/doctor/analysis/${scan.analysisId}`)}

      className="
        group relative cursor-pointer
        bg-white border border-slate-100 rounded-3xl p-4
        flex items-center gap-4
        shadow-sm
        transition-all duration-300
        hover:shadow-xl hover:-translate-y-1
      "
    >

      {/* 🔥 IMAGE */}
      <div className="relative">
        <img
          src={scan.image}
          className="w-16 h-16 rounded-xl object-cover"
        />

        {/* 👁 Overlay */}
        <div className="
          absolute inset-0 rounded-xl
          bg-black/40 flex items-center justify-center
          opacity-0 group-hover:opacity-100
          transition duration-300
        ">
          <Eye className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* 📊 CONTENT */}
      <div className="flex-1">
        <h4 className="font-semibold text-slate-800">
          {scan.prediction}
        </h4>

        <p className="text-xs text-slate-400 mt-1">
          Confidence: {scan.confidence.toFixed(1)}%
        </p>

        {/* 🔥 Progress bar */}
        <div className="h-1 bg-slate-100 rounded-full mt-2">
          <div
            className="h-full bg-[#2EC4A5] rounded-full"
            style={{ width: `${scan.confidence}%` }}
          />
        </div>
      </div>

      {/* 🚨 RISK */}
      <span
        className={`px-3 py-1 text-xs rounded-full font-semibold ${
          scan.riskLevel === "High"
            ? "bg-red-100 text-red-600"
            : scan.riskLevel === "Medium"
            ? "bg-yellow-100 text-yellow-600"
            : "bg-green-100 text-green-600"
        }`}
      >
        {scan.riskLevel}
      </span>

      {/* 🔥 Hover Glow */}
      <div className="
        pointer-events-none
        absolute inset-0 rounded-3xl
        opacity-0 group-hover:opacity-100
        bg-[#2EC4A5]/5
        transition duration-300
      " />

    </motion.div>
  ))}
</div>
      </div>

    </motion.div>
  );
}


export function UploadScanModal({
  onUpload,
}: {
  onUpload: (file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white w-full max-w-xl rounded-3xl p-6 space-y-6 shadow-2xl animate-fadeIn">

        {/* HEADER */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">Upload MRI Scan</h2>
          <p className="text-sm text-gray-400">
            AI-powered analysis for brain tumor detection
          </p>
        </div>

        {/* DROP AREA */}
        <div
          className="border-2 border-dashed border-green-300 rounded-2xl p-10 text-center cursor-pointer hover:bg-green-50 transition"
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <div className="text-green-500 text-4xl mb-3">⬆</div>

          {file ? (
            <img
              src={URL.createObjectURL(file)}
              className="mx-auto h-40 object-cover rounded-xl"
            />
          ) : (
            <>
              <p className="font-semibold">Click or drag image</p>
              <p className="text-sm text-gray-400">
                JPG, PNG - MRI scans only
              </p>
            </>
          )}
        </div>

        {/* INPUT */}
        <input
          id="fileInput"
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) setFile(f);
          }}
        />

        {/* REQUIREMENTS */}
        <div className="bg-gray-50 p-4 rounded-xl text-sm space-y-1">
          <p>✔ MRI image (axial / sagittal / coronal)</p>
          <p>✔ Clear without noise</p>
          <p>✔ Centered scan preferred</p>
        </div>

        {/* ACTION */}
        <button
          disabled={!file}
          onClick={() => file && onUpload(file)}
          className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          Upload & Analyze
        </button>
      </div>
    </div>
  );
}
export function DoctorScans() {
  const fileRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const [, setLocation] = useLocation();
  const deleteMutation = useMutation({
  mutationFn: deleteScan7138,
  onSuccess: async () => {
    await qc.invalidateQueries({ queryKey: ["scans"] });
  },
});

  const [showUpload, setShowUpload] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Pending" | "Completed">("all");
const [deleteId, setDeleteId] = useState<number | null>(null);
const [analyzingId, setAnalyzingId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<ScansResponse>({
    queryKey: ["scans"],
    queryFn: getMyScans7138,
  });

  const scans = data?.scans ?? [];
const { toast } = useToast();
  // 🔍 FILTER
  const filteredScans = scans.filter((scan) => {
    const matchSearch = scan.id.toString().includes(search);
    const matchFilter =
      filter === "all" ? true : scan.status === filter;

    return matchSearch && matchFilter;
  });
  const stats = [
  {
    title: "Total Scans",
    value: data?.stats?.total || 0,
    gradient: "from-blue-50",
    glow: "bg-blue-200/40",
    icon: Brain,
  },
  {
    title: "Pending",
    value: data?.stats?.pending || 0,
    gradient: "from-yellow-50",
    glow: "bg-yellow-200/40",
    icon: Clock,
  },
  {
    title: "Completed",
    value: data?.stats?.completed || 0,
    gradient: "from-green-50",
    glow: "bg-green-200/40",
    icon: CheckCircle,
  },
];
 const analyzeMutation = useMutation({
  mutationFn: runAnalysis7138,

  onSuccess: (data, scanId) => {
    toast({
      title: "✔ Analysis Completed",
      description: "Result is ready",
      className:
        "bg-white border border-green-200 shadow-xl rounded-2xl",
    });

    // 💣 افتح النتيجة الجديدة
    if (data?.id) {
      setLocation(`/doctor/analysis/${data.id}`);
    }
  },

  onError: () => {
    toast({
      title: "Error",
      description: "Failed to analyze",
      variant: "destructive",
    });
  },
});
const { data: analysisData } = useQuery({
  queryKey: ["my-analysis"],
  queryFn: getMyAnalysis7138, // هنكتبها دلوقتي
});
const analysisMap = new Map(
  (analysisData || []).map((a: any) => [a.scanId, a])
);

  // 📤 UPLOAD
 const uploadMutation = useMutation({
  mutationFn: uploadScan7138,

  onSuccess: async (scan) => {
    await qc.invalidateQueries({ queryKey: ["scans"] });

    // 🔥 ده السطر المهم
    if (scan?.scanId) {
      setLocation(`/doctor/scan/${scan.scanId}`);
    }
  },
});

  return (
   <div className="space-y-8">

   {/* 🔥 HEADER */}
{!showUpload && (
  <div className="flex flex-col md:flex-row justify-between gap-6 md:items-center">

    {/* LEFT */}
    <div className="flex items-center gap-4">

      {/* ICON */}
      <div className="w-14 h-14 flex items-center justify-center rounded-2xl 
      bg-[#2EC4A5]/10 text-[#2EC4A5] shadow-sm">
        <Activity className="w-6 h-6" />
      </div>

      {/* TEXT */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          My Scans
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Upload and manage brain scans
        </p>
      </div>

    </div>

    {/* BUTTON */}
    <button
      onClick={() => setShowUpload(true)}
      className="flex items-center justify-center gap-2 
      bg-gradient-to-r from-[#2EC4A5] to-[#1fa88c] 
      text-white px-6 py-3 rounded-xl font-semibold shadow-sm
      hover:scale-105 active:scale-95 
      transition-all duration-300"
    >
      <UploadCloud className="w-5 h-5" />
      Upload Scan
    </button>

  </div>
)}
    {/* STATS */}
   {/* STATS */}
{!showUpload && (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

    {stats.map((item, i) => {
      const Icon = item.icon;

      return (
        <div
          key={i}
          className="relative overflow-hidden rounded-3xl p-5 border border-slate-100 shadow-sm 
          flex justify-between items-center bg-white hover:shadow-md transition"
        >

          {/* GRADIENT BACK */}
          <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} via-white to-transparent opacity-70`} />

          {/* GLOW */}
          <div className={`absolute -top-10 -right-10 w-32 h-32 ${item.glow} blur-3xl rounded-full`} />

          {/* TEXT */}
          <div className="relative z-10">
            <p className="text-sm text-slate-500">{item.title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">
              {item.value}
            </p>
          </div>

          {/* ICON */}
          <div className="relative z-10 w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-inner">
            <Icon className="w-5 h-5 text-slate-700" />
          </div>

        </div>
      );
    })}

  </div>
)}
    {/* SEARCH */}
    {!showUpload && (
      <div className="flex flex-col sm:flex-row gap-4">

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by scan number..."
          className="flex-1 px-4 py-3 border rounded-xl"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-3 border rounded-xl"
        >
          <option value="all">All</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>

      </div>
    )}

    {/* ========================= */}
    {/* 🚀 UPLOAD */}
    {/* ========================= */}
    {showUpload && (
      <div className="space-y-6 animate-fadeUp">

        {/* UPLOAD CARD */}
        <div className="relative rounded-[32px] p-[1px] bg-gradient-to-br from-[#2EC4A5]/40 via-[#34d399]/30 to-[#1fa88c]/40 shadow-2xl animate-floatCard">

          <div className="relative bg-gradient-to-r from-[#2EC4A5] via-[#34d399] to-[#1fa88c] animate-gradient rounded-[32px] p-12 text-center text-white overflow-hidden">

            <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 blur-3xl rounded-full" />
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 blur-3xl rounded-full" />

            <button
              onClick={() => setShowUpload(false)}
              className="absolute top-6 right-6 text-white/80 hover:text-white hover:scale-110 transition"
            >
              ✕
            </button>

            <div className="relative z-10">

              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/15 flex items-center justify-center animate-bounceSoft">
                <span className="text-4xl">⬆</span>
              </div>

              <h2 className="text-3xl font-bold mb-2">
                Upload MRI Scan
              </h2>

              <p className="text-sm mb-8">
                AI-powered analysis using deep learning models
              </p>

              <button
                onClick={() => fileRef.current?.click()}
                className="px-8 py-3 rounded-2xl bg-white text-[#1fa88c] font-semibold shadow-lg"
              >
                Choose Image
              </button>

              <input
                ref={fileRef}
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  uploadMutation.mutate(file);
                }}
              />

            </div>
          </div>
        </div>

        {/* REQUIREMENTS PRO */}
<div className="relative group">

  {/* Glow Border */}
  <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-br from-[#2EC4A5]/40 via-[#34d399]/30 to-[#1fa88c]/40 blur opacity-70 group-hover:opacity-100 transition" />

  <div className="relative bg-white/70 backdrop-blur-2xl rounded-3xl p-6 shadow-xl border border-white/40">

    {/* HEADER */}
    <div className="flex items-center gap-3 mb-5">

      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#2EC4A5] to-[#1fa88c] text-white text-lg shadow-md animate-pulse">
        🧠
      </div>

      <div>
        <h4 className="font-bold text-slate-800 text-lg">
          Image Requirements
        </h4>
        <p className="text-xs text-slate-400">
          Ensure best accuracy for AI detection
        </p>
      </div>

    </div>

    {/* LIST */}
    <div className="space-y-4">

      {[
        "MRI axial / sagittal / coronal",
        "Clear visibility without noise",
        "Centered alignment preferred",
      ].map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-3 group/item hover:translate-x-1 transition"
        >

          {/* ICON */}
          <div className="w-7 h-7 flex items-center justify-center rounded-full bg-green-100 text-green-600 text-sm shadow-sm group-hover/item:scale-110 transition">
            ✔
          </div>

          {/* TEXT */}
          <p className="text-sm text-slate-600 group-hover/item:text-slate-800 transition">
            {item}
          </p>

        </div>
      ))}

    </div>

    {/* DECORATION ICON */}
    <div className="absolute right-6 bottom-4 opacity-10 text-6xl pointer-events-none animate-floatSlow">
      ☁
    </div>

  </div>
</div>

      </div>
    )}


    {/* LOADING */}
    {!showUpload && isLoading && <p>Loading...</p>}

    {/* EMPTY */}
    {!showUpload && !isLoading && filteredScans.length === 0 && (
      <p>No scans found</p>
    )}

   {/* LIST */}
{!showUpload && (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
    {filteredScans.map((scan) => (
      <div
        key={scan.id}
        className="relative bg-white rounded-3xl shadow-md hover:shadow-xl transition overflow-hidden group cursor-pointer"
      >
        
        {/* 🗑 DELETE فوق الصورة */}
<button
  onClick={(e) => {
    e.stopPropagation();
    setDeleteId(scan.id);
  }}
  className="
    absolute top-3 right-3 z-20
    w-10 h-10
    rounded-full
    bg-white/80 backdrop-blur-md
    text-red-500
    flex items-center justify-center
    shadow-md
    hover:bg-red-500 hover:text-white
    hover:scale-110
    transition
  "
>
  <Trash2 size={18} />
</button>
        {/* IMAGE */}
        <div
          onClick={() => setLocation(`/doctor/scan/${scan.id}`)}
          className="overflow-hidden h-44"
        >
          <img
            src={scan.imagePath}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
        </div>

        {/* CONTENT */}
        <div
          onClick={() => setLocation(`/doctor/scan/${scan.id}`)}
          className="p-5 space-y-3"
        >
          <h3 className="text-lg font-semibold text-slate-800">
            Scan {scan.id}
          </h3>

          <p className="text-sm text-slate-400">
            {new Date(scan.uploadDate).toLocaleDateString()}
          </p>

          <StatusBadge status={scan.status} />
        </div>

      {/* 🔥 ACTION BUTTONS */}
<div className="px-5 pb-5 space-y-2">

  {/* 🎯 MAIN BUTTON */}
  <button
    onClick={(e) => {
      e.stopPropagation();

      const analysis = analysisMap.get(scan.id);

      if (analysis) {
        setLocation(`/doctor/analysis/${analysis.id}`);
      } else {
        analyzeMutation.mutate(scan.id);
      }
    }}
    disabled={analyzingId === scan.id}
    className={`
      w-full py-3 rounded-xl text-sm font-semibold shadow-md transition
      flex items-center justify-center gap-2

      ${
        analysisMap.get(scan.id)
          ? "bg-green-500 text-white hover:bg-green-600"
          : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:scale-[1.03] hover:shadow-lg"
      }

      disabled:opacity-50 disabled:cursor-not-allowed
    `}
  >
    {analyzingId === scan.id ? (
      <>
        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        Analyzing...
      </>
    ) : analysisMap.get(scan.id) ? (
      "View Result"
    ) : (
      "Analyze"
    )}
  </button>

  {/* 💣 RE-ANALYZE BUTTON */}
  {analysisMap.get(scan.id) && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        analyzeMutation.mutate(scan.id);
      }}
      disabled={analyzingId === scan.id}
      className="
        w-full py-2.5 rounded-xl text-sm font-semibold
        border border-[#2EC4A5] text-[#2EC4A5]
        hover:bg-[#2EC4A5] hover:text-white
        transition-all duration-300
        hover:scale-[1.02] active:scale-95
      "
    >
      🔄 Re-Analyze
    </button>
  )}

</div>

      </div>
    ))}
  </div>
)}

{/* 🔥 MODAL */}
{deleteId && !showUpload && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm text-center space-y-4 animate-fadeIn">

      <h2 className="text-lg font-bold text-slate-800">
        Delete Scan?
      </h2>

      <p className="text-sm text-slate-400">
        Are you sure you want to delete this scan? This action cannot be undone.
      </p>

      <div className="flex gap-3 justify-center pt-2">

        <button
          onClick={() => setDeleteId(null)}
          className="px-4 py-2 rounded-xl border text-slate-500 hover:bg-slate-100"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            if (deleteId !== null) {
              deleteMutation.mutate(deleteId);
            }
            setDeleteId(null);
          }}
          className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
        >
          Delete
        </button>

      </div>

    </div>
  </div>
)}
  </div>
  );
  }

function StatusBadge({ status }: { status: string }) {
  const style =
    status === "Completed"
      ? "bg-green-100 text-green-700"
      : status === "Pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${style}`}>
      {status}
    </span>
  );
}


export function DoctorScanDetail() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const qc = useQueryClient();

  const id = Number(params.id);

  const { data: scan, isLoading } = useQuery<Scan7138>({
    queryKey: ["scan", id],
    queryFn: () => getScanById7138(id),
    enabled: !!id,
  });

  const [zoom, setZoom] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 🗑 DELETE
  const deleteMutation = useMutation({
    mutationFn: deleteScan7138,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["scans"] });
      setLocation("/doctor/scans");
    },
  });
  const analyzeMutation = useMutation({
  mutationFn: runAnalysis7138,

  onSuccess: () => {
    setLocation(`/doctor/analysis?scanId=${id}`);
  },
});

  if (isLoading) return <p className="p-6 text-lg">Loading...</p>;
  if (!scan) return <p className="p-6 text-lg">Not found</p>;


 
  return (
    <>
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 min-h-[calc(100vh-4rem)] p-4 sm:p-6 md:p-8 space-y-6 lg:space-y-10">

        {/* 🔝 HEADER */}
        <div className="flex justify-between items-center">

<button
  onClick={() => setLocation("/doctor/scans")}
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
          {/* RIGHT */}
          <div className="flex items-center gap-4">

            <span
              className={`px-5 py-2 rounded-full text-sm font-semibold shadow ${
                scan.status === "Completed"
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {scan.status}
            </span>

            <button
              onClick={() => setDeleteId(scan.id)}
              className="px-5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition flex items-center gap-2 text-sm font-semibold"
            >
              🗑 Delete
            </button>

          </div>
        </div>

     {/* 🧠 TITLE */}
<div className="flex items-center gap-4">

  {/* ICON */}
  <div className="w-14 h-14 flex items-center justify-center rounded-2xl 
  bg-[#2EC4A5]/10 text-[#2EC4A5] shadow-sm">
    <Microscope className="w-6 h-6" />
  </div>

  {/* TEXT */}
  <div>
    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
      Scan Details

      {/* BADGE */}
      
    </h2>

    <p className="text-slate-400 text-sm mt-1">
      MRI Brain Analysis Overview
    </p>
  </div>

</div>
        {/* 🖼️ IMAGE */}
        <div className="relative bg-white rounded-3xl shadow-lg p-6 flex justify-center items-center overflow-hidden">

          <img
            src={scan.imagePath}
            onClick={() => setZoom(true)}
            className="max-h-[450px] object-contain rounded-xl cursor-zoom-in hover:scale-105 transition duration-500"
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
              src={scan.imagePath}
              className="max-h-[90%] max-w-[90%] object-contain rounded-xl"
            />
          </div>
        )}

      {/* 📊 INFO */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

  {/* Scan Number */}
  <div className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-md flex items-center justify-between hover:shadow-lg transition">

    {/* glow */}
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200/30 blur-3xl rounded-full" />

    <div className="relative z-10">
      <p className="text-xs tracking-widest text-slate-400 uppercase">
        Scan Number
      </p>

      <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
        {scan.id}
      </h2>
    </div>

    {/* icon */}
    <div className="relative z-10 w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shadow-inner">
      <Hash size={20} className="text-blue-600" />
    </div>
  </div>

  {/* Upload Date */}
  <div className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-md flex items-center justify-between hover:shadow-lg transition">

    {/* glow */}
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200/30 blur-3xl rounded-full" />

    <div className="relative z-10">
      <p className="text-xs tracking-widest text-slate-400 uppercase">
        Upload Date
      </p>

      <h2 className="text-lg font-semibold text-slate-900 mt-2">
        {new Date(scan.uploadDate).toLocaleString()}
      </h2>
    </div>

    {/* icon */}
    <div className="relative z-10 w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center shadow-inner">
      <CalendarDays size={20} className="text-purple-600" />
    </div>
  </div>

</div>



        {/* 🔥 ANALYZE */}
      <div className="flex justify-center pt-6">
  <button
    onClick={() => analyzeMutation.mutate(scan.id)}
    disabled={analyzeMutation.isPending}
    className="
      px-12 py-4
      rounded-2xl
      bg-gradient-to-r from-purple-500 to-indigo-500
      text-white text-lg font-semibold
      shadow-lg
      hover:scale-105 hover:shadow-xl
      transition
      disabled:opacity-50
    "
  >
    {analyzeMutation.isPending ? "Analyzing..." : "Analyze Now"}
  </button>
</div>
      </div>

      {/* 🗑 MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm text-center space-y-4 animate-fadeIn">

            <h2 className="text-xl font-bold text-slate-800">
              Delete Scan?
            </h2>

            <p className="text-sm text-slate-400">
              This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-center pt-2">

              <button
                onClick={() => setDeleteId(null)}
                className="px-5 py-2 rounded-xl border text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  if (deleteId !== null) {
                    deleteMutation.mutate(deleteId);
                  }
                  setDeleteId(null);
                }}
                className="px-5 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
// ─── Analysis List ─────────────────────────────────────────────────────────────
export function DoctorAnalysis() {
  const [tab, setTab] = useState<"my" | "other">("my");
const { user } = useAuth(); // أو من context بتاعك
  // 🔥 MAIN QUERY
 const query = useQuery({
  queryKey: ["doctor", "analysis", user?.id, tab],
  queryFn: tab === "my" ? getMyAnalysis7138 : getOtherAnalysis7138,
});
  const queryClient = useQueryClient();

  // 🔥 PREFETCH
  useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ["doctor", "analysis", tab === "my" ? "other" : "my"],
      queryFn: tab === "my" ? getOtherAnalysis7138 : getMyAnalysis7138,
    });
  }, [tab]);

  // ✅ DATA
  const analyses: any[] = query.data ?? [];
  const isLoading = query.isLoading;

  // 🔢 COUNTS
 const myQuery = useQuery({
  queryKey: ["doctor", "analysis", user?.id, "my"],
  queryFn: getMyAnalysis7138,
});

const otherQuery = useQuery({
  queryKey: ["doctor", "analysis", user?.id, "other"],
  queryFn: getOtherAnalysis7138,
});
  // 🔍 SEARCH
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  // 🎯 FILTER
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(() => {
    return analyses.filter((a: any) => {
      const matchSearch = search
        ? a.scanId?.toString().includes(search)
        : true;

      const matchFilter =
        filter === "All" ||
        a.tumorInfo?.tumorType === filter;

      return matchSearch && matchFilter;
    });
  }, [analyses, search, filter]);

  // 🎨 STYLES
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
const getStyles = (type: string, confidence: number) => {
  // 🟢 Healthy (أولوية أولى)
  if (type === "Healthy" || type === "No Tumor") {
    return {
      badge: "bg-green-100 text-green-700",
      progress: "bg-green-500",
      icon: ShieldCheck,
      glow: "from-transparent",
      text: "text-green-600",
    };
  }

  // 🔴 High Risk
  if (confidence >= 85) {
    return {
      badge: "bg-red-100 text-red-600",
      progress: "bg-red-500",
      icon: AlertTriangle,
      glow: "from-transparent",
      text: "text-red-500",
    };
  }

  // 🟡 Medium Risk
  if (confidence >= 70) {
    return {
      badge: "bg-yellow-100 text-yellow-600",
      progress: "bg-yellow-400",
      icon: AlertCircle,
      glow: "from-transparent",
      text: "text-yellow-500",
    };
  }

  // 🔴 Low confidence = خطر برضو
  return {
    badge: "bg-red-100 text-red-500",
    progress: "bg-red-500",
    icon: AlertTriangle,
    glow: "from-transparent",
    text: "text-red-500",
  };
};

  const tumorCounts: Record<string, number> = {};
  analyses.forEach((a: any) => {
    const t = a.tumorInfo?.tumorType || "Unknown";
    tumorCounts[t] = (tumorCounts[t] || 0) + 1;
  });

  return (
    <div className="space-y-6">
{/* 🔥 HEADER */}
<div className="flex items-center gap-4">

  {/* ICON */}
  <div className="w-12 h-12 flex items-center justify-center rounded-2xl 
  bg-[#2EC4A5]/10 text-[#2EC4A5] shadow-sm">
    <Brain className="w-6 h-6" />
  </div>

  {/* TEXT */}
  <div>
    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-2">
      AI Analysis

      
    </h1>

    <p className="text-sm text-slate-400 mt-1">
      Smart insights powered by AI detection
    </p>
  </div>

</div>

      {/* 🔥 STATS */}
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


        {/* ICON */}
       <div className="w-11 h-11 rounded-xl bg-white/70 flex items-center justify-center text-xl">
  {style.icon}
</div>

      </div>
    );
  })}

</div>

     

 <div className="space-y-4 w-full">

  {/* 🔍 SEARCH + FILTER (soft container) */}
  <div
    className="
      flex flex-col md:flex-row items-center gap-4
      bg-slate-50
      rounded-2xl
      p-3
      border border-slate-200
    "
  >

    {/* SEARCH */}
    <div className="relative flex-1">
      <input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search by scan number..."
        className="
          w-full px-5 py-3
          rounded-xl
          bg-white
          border border-slate-200
          shadow-sm
          focus:outline-none
          focus:ring-2 focus:ring-[#2EC4A5]/40
        "
      />
    </div>

    {/* FILTER */}
    <select
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
      className="
        px-5 py-3
        rounded-xl
        bg-white
        border border-slate-200
        shadow-sm
        text-sm
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
    </div>

  {/* 🔥 TABS (floating soft) */}
  <div className="flex justify-center">

    <div
      className="
        flex bg-slate-100
        rounded-full
        p-1
        shadow-inner
      "
    >

      <button
        onClick={() => setTab("my")}
        className={`
          px-6 py-2 rounded-full text-sm font-semibold transition
          ${tab === "my"
            ? "bg-white shadow text-slate-900"
            : "text-slate-500"}
        `}
      >
        My Analysis ({myQuery.data?.length ?? 0})
      </button>

      <button
        onClick={() => setTab("other")}
        className={`
          px-6 py-2 rounded-full text-sm font-semibold transition
          ${tab === "other"
            ? "bg-white shadow text-slate-900"
            : "text-slate-500"}
        `}
      >
        Other Analysis ({otherQuery.data?.length ?? 0})
      </button>

    </div>

  </div>


      {/* 🔥 GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />
          ))}

        {!isLoading && filtered.length === 0 && (
          <div className="col-span-full text-center p-12 text-slate-400">
            No results found
          </div>
        )}

        {!isLoading &&
          filtered.map((a: any) => {
            const confidence = Math.round(a.confidence || 0);

         return (

  <Link
    key={a.id}
    to={`/doctor/analysis/${a.id}`}
    className="
      group relative block overflow-hidden
      rounded-3xl bg-white border border-slate-100
      shadow-sm transition-all duration-300
      hover:shadow-xl hover:-translate-y-1
    "
  >
    {(() => {
      const confidence = Math.round(a.confidence);
      const type = a.tumorInfo?.tumorType || "Unknown";
      const style = getStyles(type, confidence);
      const Icon = style.icon;

      return (
        <>
          {/* IMAGE */}
          <div className="relative h-44 overflow-hidden">
            <img
              src={a.imageUrl}
              className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            />

         {/* Overlay */}
<div className="
  pointer-events-none
  absolute inset-0
  flex items-center justify-center
">

  {/* ✨ Shine Animation */}
  <div className="
    absolute top-0 left-[-100%] w-[50%] h-full
    bg-white/20 blur-xl
    skew-x-[-20deg]
    transition-all duration-700
    group-hover:left-[120%]
  " />

  {/* 👁 View Button */}
  <div className="
    opacity-0 group-hover:opacity-100
    transition duration-300
    flex items-center gap-2 px-3 py-1.5 rounded-xl
    bg-white/90 text-slate-800 text-xs font-semibold
  ">
    <Eye className="w-4 h-4" />
    View
  </div>

</div>

            {/* 🔥 Badge */}
            <span className={`
              absolute top-3 left-3 text-[10px] font-semibold px-2 py-1 rounded-full
              ${style.badge}
            `}>
              {type}
            </span>
          </div>

          {/* CONTENT */}
          <div className="p-5 space-y-4">

            {/* TITLE */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Scan #{a.scanId}
              </h3>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Icon className="w-3 h-3" />
                {confidence}%
              </div>
            </div>

            {/* 🔥 Progress */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${style.progress}`}
                style={{ width: `${confidence}%` }}
              />
            </div>

            {/* SUMMARY */}
            <p className="text-xs text-slate-500 line-clamp-2">
              {typeof a.summary === "string"
                ? a.summary
                : "No summary available"}
            </p>

          </div>

          {/* 🔥 Glow حسب الحالة */}
          <div className={`
            pointer-events-none absolute inset-0 rounded-3xl opacity-0
            group-hover:opacity-100 transition duration-300
            bg-gradient-to-br ${style.glow} to-transparent
          `} />
        </>
      );
    })()}
  </Link>
);
            })} 
            

      </div>
    </div>
  );
}
export function useGetAnalysisDetails(id: number) {
  return useQuery({
    queryKey: ["analysis-details", id],
    queryFn: async () => getAnalysisDetails7138(id),
    enabled: !!id, // مهم علشان ميشتغلش قبل ما id ييجي
  });
}
export default function AnalysisDetailsDoctor() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useGetAnalysisDetails(Number(id));

  const analysis = data?.current;
  const history = data?.history || [];
  const notes = analysis?.doctorNotes || [];

  const [zoom, setZoom] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);

  //////////////////////////////////////////////////////////
// ➕ ADD NOTE (REAL TIME)
//////////////////////////////////////////////////////////
const handleAddNote = async () => {
  if (!noteText.trim() || !analysis?.id) return;

  const tempNote = {
    id: Date.now(), // temporary id
    doctorName: "You", // أو user.name
    note: noteText,
    createdAt: new Date().toISOString(),
  };

  try {
    setSaving(true);

    // 🔥 1. update UI فورًا
    queryClient.setQueryData(
      ["analysis-details", analysis.id],
      (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          doctorNotes: [tempNote, ...(oldData.doctorNotes || [])],
        };
      }
    );

    setNoteText("");

    // 🔥 2. call API
    await createDoctorNote7138(analysis.id, tempNote.note);

    // 🔥 3. sync مع السيرفر
    queryClient.invalidateQueries({
      queryKey: ["analysis-details", analysis.id],
    });

    toast({
      title: "✔ Note Added",
      description: "Saved successfully",
    });

  } catch {
    // ❌ rollback لو فشل
    queryClient.invalidateQueries({
      queryKey: ["analysis-details", analysis.id],
    });

    toast({
      title: "Error",
      description: "Failed to add note",
      variant: "destructive",
    });
  } finally {
    setSaving(false);
  }
};
  //////////////////////////////////////////////////////////
  // 🗑 DELETE NOTE
  //////////////////////////////////////////////////////////
 const handleDeleteNote = async (noteId: number) => {
  if (!analysis?.id) return;

  try {
    // ⚡ remove instantly
    queryClient.setQueryData(
      ["analysis-details", analysis.id],
      (old: any) => {
        if (!old) return old;

        return {
          ...old,
          current: {
            ...old.current,
            doctorNotes: old.current.doctorNotes.filter(
              (n: any) => n.id !== noteId
            ),
          },
        };
      }
    );

    await deleteDoctorNote7138(noteId);

    toast({
      title: "Deleted",
      description: "Note removed",
      className:
        "bg-white border border-red-200 shadow-xl rounded-2xl",
    });

  } catch {
    toast({
      title: "Error",
      description: "Failed to delete note",
      variant: "destructive",
    });
  }
};
  //////////////////////////////////////////////////////////
  // LOADING
  //////////////////////////////////////////////////////////
  if (isLoading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!analysis) {
    return <div className="p-10 text-center text-red-500">No data</div>;
  }

  //////////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////////
return (
  <div className="bg-[#F4F7FB] min-h-screen py-6 px-3">
<div className="max-w-6xl mx-auto space-y-8">

  {/* 🔙 BACK */}
  <button
    onClick={() => navigate("/doctor/analysis")}
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

    {/* LEFT */}
    <div className="flex items-center gap-4">

      {/* ICON */}
  <div className="w-12 h-12 flex items-center justify-center rounded-2xl 
bg-[#2EC4A5]/10 text-[#2EC4A5] shadow-sm">
  <BarChart3 className="w-6 h-6" />
</div>

      {/* TEXT */}
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
            className="bg-white rounded-3xl overflow-hidden shadow cursor-pointer group"
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
    bg-indigo-50 text-indigo-600 group-hover:scale-105 transition">
      <FileText className="w-5 h-5" />
    </div>

    {/* CONTENT */}
    <div className="flex-1">

      <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">
        Summary
      </p>

      <p className="text-slate-700 leading-relaxed text-sm">
        {analysis.summary || "No summary available for this analysis."}
      </p>

    </div>
  </div>

</div>
         {/* 📝 NOTES */}
<div
  id="notes-section"
  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 
  hover:shadow-lg transition-all duration-300"
>

  {/* HEADER */}
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
      {notes.length}
    </span>
  </div>

  {/* ADD */}
  <div className="flex gap-3 mb-6">
    <input
      value={noteText}
      onChange={(e) => setNoteText(e.target.value)}
      placeholder="Write a note..."
      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl 
      focus:outline-none focus:ring-2 focus:ring-[#2EC4A5] focus:border-transparent
      text-sm"
    />

    <button
      onClick={handleAddNote}
      className="flex items-center gap-2 px-5 py-3 
      bg-gradient-to-r from-[#2EC4A5] to-green-400 
      text-white rounded-xl shadow-sm
      hover:scale-105 active:scale-95 
      transition-all duration-300"
    >
      <Plus className="w-4 h-4" />
      Add
    </button>
  </div>

  {/* LIST */}
  <div className="space-y-3">

    {notes.length === 0 && (
      <div className="text-center py-6 text-slate-400 text-sm">
        No notes yet. Start adding one ✍️
      </div>
    )} 

    {notes.map((note: any) => (
      <div
        key={note.id}
        className="group p-4 bg-slate-50 rounded-xl flex justify-between items-start
        hover:bg-white hover:shadow-md transition-all duration-300"
      >

        {/* TEXT */}
        <div>
          <p className="font-semibold text-slate-800 text-sm">
            {note.doctorName}
          </p>

          <p className="text-sm text-slate-600 mt-1 leading-relaxed">
            {note.note}
          </p>
        </div>

        {/* DELETE */}
        <button
          onClick={() => handleDeleteNote(note.id)}
          className="flex items-center gap-1 text-red-500 text-xs
          opacity-0 group-hover:opacity-100 
          transition-all duration-300 hover:scale-110"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    ))}

  </div>
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



      
       
{/* 📜 HISTORY */}
<div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-5">

  {/* HEADER */}
  <div className="flex items-center justify-between">

    {/* LEFT */}
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 flex items-center justify-center rounded-2xl 
      bg-[#2EC4A5]/10 text-[#2EC4A5] shadow-sm">
        <Clock className="w-5 h-5" />
      </div>

      <div>
        <h2 className="font-bold text-slate-800 text-lg">History</h2>
        <p className="text-xs text-slate-400">
          View previous scans & analyses
        </p>
      </div>
    </div>

    {/* BUTTON */}
    <button
      onClick={() => setShowHistory(!showHistory)}
      className="group flex items-center gap-2 px-4 py-2 text-sm rounded-xl 
      bg-[#2EC4A5]/10 text-[#2EC4A5]
      hover:bg-[#2EC4A5] hover:text-white 
      transition-all duration-300 hover:scale-105"
    >
      {showHistory ? "Hide" : "View"}

      <ChevronDown
        className={`w-4 h-4 transition-all duration-300 
        ${showHistory ? "rotate-180" : "group-hover:translate-y-0.5"}`}
      />
    </button>
  </div>

  {/* LIST */}
  {showHistory && (
    history.length === 0 ? (
      <p className="text-slate-400 text-center py-6">
        No history yet
      </p>
    ) : (
      <div className="space-y-3">

        {history.slice(0, 3).map((h: any) => (
          <div
            key={h.id}
            className="group relative p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-white 
            border border-slate-100 flex justify-between items-center
            hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >

            {/* LEFT */}
            <div>
              <p className="font-semibold text-slate-800">
                {h.prediction}
              </p>

              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                {h.summary || "No summary"}
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">

              {/* CONFIDENCE */}
              <span className="text-[#2EC4A5] font-bold text-sm">
                {Math.round(h.confidence)}%
              </span>

              {/* VIEW BUTTON */}
            <button
  onClick={() => navigate(`/doctor/analysis/${h.id}`)}
  className="
    relative z-10 group
    w-10 h-10 rounded-xl
    bg-gradient-to-br from-[#2EC4A5]/10 to-green-100
    text-[#2EC4A5]
    flex items-center justify-center
    shadow-sm
    transition-all duration-300
    hover:scale-110 hover:-translate-y-0.5
    hover:shadow-[0_8px_20px_rgba(46,196,165,0.3)]
  "
>
  {/* ICON */}
  <Eye className="
    w-5 h-5
    transition-all duration-300
    group-hover:scale-125 group-hover:text-[#2EC4A5]
  " />

  {/* 🔥 Soft Glow (مش هيكسر الكليك) */}
  <div className="
    pointer-events-none
    absolute inset-0 rounded-xl
    opacity-0 group-hover:opacity-100
    bg-[#2EC4A5]/10
    transition duration-300
  " />
</button>
            </div>

            {/* 🔥 Hover Glow */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
            bg-[#2EC4A5]/5 transition duration-300" />

          </div>
        ))}

      </div>
    )
  )}

</div>
      

    </div>

    {/* ZOOM */}
    {zoom && (
      <div
        onClick={() => setZoom(false)}
        className="fixed inset-0 bg-black/80 flex items-center justify-center"
      >
        <img
          src={analysis.imageUrl}
          className="max-w-[90%] rounded-xl shadow-lg animate-fadeIn"
        />
      </div>
    )}

  </div>
);
}

// ─── Notifications ─────────────────────────────────────────────────────────────



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

export function TumorTypes() {
  const { toast } = useToast();

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [createModal, setCreateModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  // ================= FETCH =================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAllTumorTypes();
      setData(res || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load tumor types",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-10">

      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Tumor Types
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage all tumor categories in the system
          </p>
        </div>

       
      </div>

      {/* ✅ MOBILE CARDS (Visible on Mobile only) */}
      <div className="grid grid-cols-1 gap-4 sm:hidden px-1">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm animate-pulse">
              <div className="h-5 w-24 bg-gray-200 rounded-full mb-3" />
              <div className="h-4 w-full bg-gray-100 rounded-md" />
            </div>
          ))
        ) : data.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="text-4xl mb-3">🧠</div>
            <p className="text-gray-400 font-medium">No tumor types found</p>
          </div>
        ) : (
          data.map((t) => (
            <div key={t.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#2EC4A5]" />
                <h3 className="font-bold text-slate-800">{t.name}</h3>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                {t.description || "No description available for this category."}
              </p>
            </div>
          ))
        )}
      </div>

      {/* ✅ DESKTOP TABLE (Hidden on Mobile) */}
      <div className="hidden sm:block bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-6 py-4 text-left font-semibold whitespace-nowrap">Name</th>
                <th className="px-6 py-4 text-left font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
                    </td>
                  </tr>
                ))}
              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-20 text-center text-gray-400">
                    No tumor types found
                  </td>
                </tr>
              )}
              {!loading &&
                data.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition duration-200">
                    <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                      {t.name}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <p className="">{t.description || "-"}</p>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODALS ================= */}
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

export function DoctorNotifications() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<any | null>(null);
  const [tab, setTab] = useState<"unread" | "read">("unread");

  // 🔊 SOUND
  const audioRef = useRef<HTMLAudioElement | null>(null);
const [page, setPage] = useState(1);
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  const { data, isLoading } = useQuery({
  queryKey: ["notifications", page],
  queryFn: () => getNotifications(page),
});

const notifications = Array.isArray(data) ? data : [];
  // 🔔 play sound on new notification
  const prevCount = useRef(0);
  useEffect(() => {
    if (notifications.length > prevCount.current) {
      audioRef.current?.play().catch(() => {});
    }
    prevCount.current = notifications.length;
  }, [notifications]);

  // ✅ MUTATIONS
  const markRead = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  const markAll = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  // 🎯 ICONS
  const notifIcons: Record<string, any> = {
    Analysis: { icon: CheckCircle },
    Scan: { icon: Upload },
    malfunction: { icon: AlertTriangle },
  };
 
const totalPages = Math.ceil((data?.totalCount || 0) / 10);

  // 🔥 FILTER
  const unread = notifications.filter((n: any) => !n.isRead);
  const read = notifications.filter((n: any) => n.isRead);
  const filtered = tab === "unread" ? unread : read;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/doctor/dashboard")}
          className="p-2 rounded-xl bg-slate-100 hover:bg-[#2EC4A5]/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>

      {/* CARD */}
      <div className="bg-white rounded-3xl shadow-xl border border-[#e6f4f1] overflow-hidden">

        {/* HEADER ACTIONS */}
        <div className="flex justify-end gap-2 p-3 border-b bg-[#f8fdfc]">
          <button
            onClick={() => markAll.mutateAsync()}
            className="text-xs px-3 py-1.5 rounded-lg bg-[#2EC4A5]/10 text-[#2EC4A5] hover:bg-[#2EC4A5]/20"
          >
            Mark all as read
          </button>
        </div>

        {/* TABS */}
        <div className="grid grid-cols-2 bg-[#f4fbf9]">

          <button
            onClick={() => setTab("unread")}
            className={`relative py-3 text-sm font-medium ${
              tab === "unread" ? "text-[#2EC4A5]" : "text-slate-500"
            }`}
          >
            Unread
            {tab === "unread" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#2EC4A5]" />
            )}
          </button>

          <button
            onClick={() => setTab("read")}
            className={`relative py-3 text-sm font-medium ${
              tab === "read" ? "text-[#2EC4A5]" : "text-slate-500"
            }`}
          >
            Read
            {tab === "read" && (
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#2EC4A5]" />
            )}
          </button>

        </div>

        {/* LIST */}
        <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">

          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No notifications</p>
            </div>
          )}

          {filtered.map((n: any) => {
            const meta = notifIcons[n.type] || notifIcons.Analysis;
            const Icon = meta.icon;

            return (
              <div
                key={n.id}
              className={`
  group flex items-center gap-4 p-4 rounded-2xl border
  transition-all duration-300
  ${n.isRead
    ? "bg-white border-slate-100"
    : "bg-gradient-to-r from-[#f8fdfc] to-[#eefaf7] border-[#d7efe9]"}
  hover:shadow-lg hover:-translate-y-1 hover:scale-[1.01]
`}
              >

                {/* CLICK */}
                <div
                  onClick={() => {
                    markRead.mutate(n.id);
                    setSelected(n);
                  }}
                  className="flex items-center gap-4 flex-1 cursor-pointer"
                >

                  <div className="w-11 h-11 rounded-xl bg-[#2EC4A5]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#2EC4A5]" />
                  </div>

                  <div className="flex-1">
                    <p className="font-semibold text-sm">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.message}</p>
                  </div>


                </div>
<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">

  {/* READ */}
  {!n.isRead && (
    <button
      onClick={() => markRead.mutate(n.id)}
      className="
        w-9 h-9 rounded-xl flex items-center justify-center
        bg-green-50 text-green-600
        hover:bg-green-100 hover:scale-110
        transition-all duration-200
        shadow-sm hover:shadow-md
      "
    >
      <Check className="w-4 h-4" />
    </button>
  )}

  {/* DELETE */}
  <button
    onClick={() => deleteMutation.mutate(n.id)}
    className="
      w-9 h-9 rounded-xl flex items-center justify-center
      bg-red-50 text-red-500
      hover:bg-red-100 hover:scale-110
      transition-all duration-200
      shadow-sm hover:shadow-md
    "
  >
    <Trash2 className="w-4 h-4" />
  </button>

</div>
              </div>
            );
          })}

        </div>
        <div className="flex flex-col items-center gap-3 mt-6">

  {/* 🔢 Info */}
  <div className="text-xs text-slate-500">
    Showing page <span className="font-semibold text-[#2EC4A5]">{page}</span> of{" "}
    <span className="font-semibold">{totalPages}</span>
    {" • "}
    Total: <span className="font-semibold">{data?.totalCount}</span> notifications
  </div>

  {/* 🎮 Controls */}
  <div className="flex items-center gap-2">

    {/* ⬅️ Prev */}
    <button
      disabled={page === 1}
      onClick={() => setPage((p) => p - 1)}
      className="
        flex items-center gap-1 px-4 py-2 rounded-xl
        bg-white border border-slate-200
        text-sm font-medium
        hover:bg-slate-50 hover:shadow
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all
      "
    >
      ← Prev
    </button>

    {/* 🔢 Page Numbers */}
    <div className="flex items-center gap-1">

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .slice(Math.max(0, page - 2), page + 1) // smart window
        .map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`
              w-9 h-9 rounded-xl text-sm font-semibold
              transition-all
              ${
                p === page
                  ? "bg-[#2EC4A5] text-white shadow-md scale-110"
                  : "bg-slate-100 hover:bg-slate-200"
              }
            `}
          >
            {p}
          </button>
        ))}

    </div>

    {/* ➡️ Next */}
    <button
      disabled={page === totalPages}
      onClick={() => setPage((p) => p + 1)}
      className="
        flex items-center gap-1 px-4 py-2 rounded-xl
        bg-white border border-slate-200
        text-sm font-medium
        hover:bg-slate-50 hover:shadow
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all
      "
    >
      Next →
    </button>

  </div>
</div>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

          <div
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div className="relative z-10 bg-white rounded-3xl p-6 w-[90%] max-w-md shadow-xl">

            <div className="w-12 h-12 bg-[#2EC4A5]/10 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-[#2EC4A5]" />
            </div>

            <h3 className="font-bold text-lg">{selected.title}</h3>
            <p className="text-sm text-slate-600 mt-2">{selected.message}</p>

            <p className="text-xs text-slate-400 mt-4">
              {new Date(selected.createdAt).toLocaleString()}
            </p>

            <div className="flex gap-3 mt-6">

              {selected.analysisId && (
                <button
                  onClick={() => {
                    navigate(`/doctor/analysis/${selected.analysisId}`);
                    setSelected(null);
                  }}
                  className="flex-1 bg-[#2EC4A5] text-white py-2 rounded-xl"
                >
                  View Result
                </button>
              )}

              <button
                onClick={() => setSelected(null)}
                className="flex-1 bg-slate-100 py-2 rounded-xl"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ─── Profile ───────────────────────────────────────────────────────────────────
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

export function DoctorProfile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showPwSheet, setShowPwSheet] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
const queryClient = useQueryClient();


const { data: settings } = useQuery({
  queryKey: ["notification-settings"],
  queryFn: getNotificationSettings,
});

const updateMutation = useMutation({
  mutationFn: updateNotificationSettings,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["notification-settings"] });
  },
});
const handleLogout = async () => {
  try {
    await logoutApi();
  } catch {}

  logout();
};
const notifEnabled = settings?.scanResultNotifications ?? true;
  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      </div>

      {/* User card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2EC4A5] to-[#1a9e84] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
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
              Doctor
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
        
      
{/* Account section */}
<div>
  <p className="text-sm font-bold text-slate-900 mb-1 px-1">Account</p>
  <p className="text-xs text-slate-400 mb-4 px-1">
    Update info for better care
  </p>

  <div className="bg-white/80 backdrop-blur rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">

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

    {/* Notifications */}
    <div className="flex items-center gap-4 px-5 py-5">

      {/* ICON */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-md">
        <Bell className="w-5 h-5 text-white" />
      </div>

      {/* TEXT */}
      <span className="flex-1 text-sm font-semibold text-slate-800">
        Notifications Settings
      </span>

      {/* TOGGLE */}
      <button
        onClick={() => {
          const newValue = !notifEnabled;

          updateMutation.mutate({
            scanResultNotifications: newValue,
            chatNotifications: settings?.chatNotifications ?? true,
            systemNotifications: settings?.systemNotifications ?? true,
          });
        }}
        className={`w-12 h-6 rounded-full relative transition ${
          notifEnabled ? "bg-[#2EC4A5]" : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition ${
            notifEnabled ? "translate-x-7" : "translate-x-1"
          }`}
        />
      </button>
    </div>

  </div>
</div>
<div>
  <p className="text-sm font-bold text-slate-900 mb-1 px-1">App</p>
  <p className="text-xs text-slate-400 mb-4 px-1">
    Protecting your data with care
  </p>

  <div className="bg-white/80 backdrop-blur rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">

    {[
      { icon: Lock, label: "Data & Privacy", path: "/doctor/privacy", color: "from-green-400 to-emerald-500" },
      { icon: Info, label: "About Brain Tumor", path: "/doctor/about", color: "from-blue-400 to-indigo-500" },
    ].map((item, i) => (
      <div
        key={i}
        onClick={() => setLocation(item.path)}
        className="group flex items-center gap-4 px-5 py-5 cursor-pointer transition-all duration-300 hover:bg-slate-50 active:scale-[0.97]"
      >

        {/* ICON */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
          <item.icon className="w-5 h-5 text-white" />
        </div>

        {/* TEXT */}
        <span className="flex-1 text-sm font-semibold text-slate-800 group-hover:text-black transition">
          {item.label}
        </span>

        {/* ARROW */}
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition" />
      </div>
    ))}

  </div>
</div>

  
{/* Support section */}
<div>
  <p className="text-sm font-bold text-slate-900 mb-1 px-1">Support</p>
  <p className="text-xs text-slate-400 mb-4 px-1">
    We answer about your needs
  </p>

  <div className="bg-white/80 backdrop-blur rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.05)] overflow-hidden">

    {[
      { icon: HelpCircle, label: "FAQ", path: "/doctor/faq", color: "from-purple-400 to-pink-500" },
     
    ].map((item, i) => (
      <div
        key={i}
        onClick={() => setLocation(item.path)}
        className="group flex items-center gap-4 px-5 py-5 cursor-pointer transition-all duration-300 hover:bg-slate-50 active:scale-[0.97]"
      >

        {/* ICON */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
          <item.icon className="w-5 h-5 text-white" />
        </div>

        {/* TEXT */}
        <span className="flex-1 text-sm font-semibold text-slate-800 group-hover:text-black transition">
          {item.label}
        </span>

        {/* ARROW */}
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:translate-x-1 transition" />
      </div>
    ))}

  </div>
</div>
  

      {/* Logout */}
    <button
  onClick={handleLogout}
  className="
    group relative w-full flex items-center justify-center gap-2
    py-4 rounded-2xl
    border border-red-100
    text-red-500 font-semibold
    bg-white overflow-hidden
    transition-all duration-500 ease-out
    hover:-translate-y-0.5 hover:shadow-md
    active:scale-95
  "
>

  {/* 🔥 Smooth Slide Background */}
  <div className="
    pointer-events-none
    absolute inset-0
    bg-gradient-to-r from-red-50 via-red-100/40 to-red-50
    translate-x-[-100%] group-hover:translate-x-0
    transition-transform duration-700 ease-out
  " />

  {/* ICON */}
  <LogOut className="
    w-5 h-5 relative z-10
    transition-all duration-300 ease-out
    group-hover:-translate-x-1 group-hover:scale-105
  " />

  {/* TEXT */}
  <span className="
    relative z-10
    transition-all duration-300 ease-out
    group-hover:tracking-wide
  ">
    Log Out
  </span>

</button>

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


export function BackToProfile() {
  return (
    <Link
      to="/doctor/profile"
      className="
        group relative inline-flex items-center gap-2
        px-6 py-3 rounded-2xl
        bg-white/70 backdrop-blur-md
        border border-white/40
        shadow-lg
        overflow-hidden
        transition-all duration-300
        hover:scale-105 hover:shadow-xl
      "
    >

      {/* 🔥 Animated Gradient Glow */}
      <div className="
        absolute inset-0 opacity-0 group-hover:opacity-100
        bg-gradient-to-r from-[#2EC4A5]/20 via-green-200/20 to-[#2EC4A5]/20
        transition duration-500
      " />

      {/* ICON */}
      <ArrowLeft className="
        w-5 h-5 relative z-10
        transition-all duration-300
        group-hover:-translate-x-2
        group-hover:text-[#2EC4A5]
      " />

      {/* TEXT */}
      <span className="
        relative z-10 font-semibold text-slate-700
        transition group-hover:text-[#2EC4A5]
      ">
        Back to Profile
      </span>

      {/* 🔥 Shine Effect */}
      <span className="
        absolute left-[-75%] top-0 h-full w-1/2
        bg-white/40 blur-xl
        rotate-12
        transition-all duration-700
        group-hover:left-[120%]
      " />

    </Link>
  );
}
export function PrivacyPage() {
  const rules = [
    "End-to-end encryption for all scans",
    "No third-party data sharing",
    "Secure cloud storage",
    "Role-based access control",
    "HIPAA compliance standards",
    "Daily security audits",
    "AI data anonymization",
    "Encrypted backups",
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
<BackToProfile />
      {/* HERO */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#2EC4A5]/10 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-[#2EC4A5]" />
        </div>
 

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Data & Privacy
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Medical-grade protection for your data
          </p>
        </div>
      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-5">
        {rules.map((rule, i) => (
          <div
            key={i}
            className="group bg-white border border-slate-100 rounded-2xl p-5 shadow-sm 
            hover:shadow-md transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">

              {/* ICON */}
              <div className="w-11 h-11 rounded-xl bg-[#2EC4A5]/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#2EC4A5]" />
              </div>

              <p className="text-sm font-medium text-slate-700">
                {rule}
              </p>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export function AboutPage() {
  const features = [
    "AI-powered tumor detection",
    "High accuracy MRI analysis",
    "Real-time scan processing",
    "Advanced deep learning models",
    "Doctor-friendly dashboard",
    "Secure patient data handling",
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
<BackToProfile />
      {/* HERO */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[#2EC4A5]/10 flex items-center justify-center">
          <Brain className="w-6 h-6 text-[#2EC4A5]" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Brain Tumor AI
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Intelligent MRI analysis powered by AI
          </p>
        </div>
      </div>

      {/* FEATURES */}
      <div className="grid md:grid-cols-2 gap-5">
        {features.map((f, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition"
          >
            <p className="font-semibold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#2EC4A5]" />
              Feature #{i + 1}
            </p>

            <p className="text-sm text-slate-500 mt-2">{f}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FaqPage() {
  const [open, setOpen] = useState<number | null>(null);

  const faqs = Array.from({ length: 6 }, (_, i) => ({
    q: `How does the system work?`,
    a: "The AI analyzes MRI scans and detects tumor patterns using deep learning.",
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
<BackToProfile />
      <h1 className="text-3xl font-bold text-slate-900">FAQ</h1>

      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div
            key={i}
            className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex justify-between items-center p-4"
            >
              <span className="font-medium text-slate-800">{f.q}</span>

              <ChevronDown
                className={`w-5 h-5 transition ${
                  open === i ? "rotate-180 text-[#2EC4A5]" : ""
                }`}
              />
            </button>

            {open === i && (
              <div className="px-4 pb-4 text-sm text-slate-500">
                {f.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}



export function SupportPage() {
  const [message, setMessage] = useState("");

  const messages = [
    { text: "Hello doctor 👋", from: "support" },
    { text: "I need help with a scan", from: "user" },
    { text: "Sure, send the scan details", from: "support" },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col h-[85vh]">
<BackToProfile />
      <h1 className="text-2xl font-bold mb-4">Support Chat</h1>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-slate-50 rounded-2xl">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`px-4 py-2 rounded-2xl text-sm max-w-[70%] ${
              msg.from === "user"
                ? "bg-[#2EC4A5] text-white ml-auto"
                : "bg-white border"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="flex gap-2 mt-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#2EC4A5]/40"
        />

        <button className="px-5 rounded-xl bg-[#2EC4A5] text-white flex items-center gap-2">
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ScanBadge({ status }: { status: string }) {
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
