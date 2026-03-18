import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { Home, FileImage, Activity, User, Bell, ChevronRight, CheckCircle, AlertTriangle, Clock, FileText, Send } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  useGetScans,
  useGetScanById,
  useAddScanNote,
  useGetAnalysis,
  useGetAllAnalysis,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// ─── Layout ───────────────────────────────────────────────────────────────────
export function DoctorLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { path: "/doctor/dashboard", icon: Home, label: "Home" },
    { path: "/doctor/scans", icon: FileImage, label: "My Scans" },
    { path: "/doctor/analysis", icon: Activity, label: "Analysis" },
    { path: "/doctor/profile", icon: User, label: "Profile" },
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
          <div className="relative p-2 bg-slate-50 rounded-full">
            <Bell className="w-5 h-5 text-slate-600" />
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
                      {isActive && <motion.div layoutId="doc-nav-pill" className="absolute inset-0 bg-[#2EC4A5]/10 rounded-xl" />}
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

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function DoctorDashboard() {
  const { user } = useAuth();
  const { data: scansData, isLoading } = useGetScans({ query: { limit: 5 } });
  const scans = scansData?.scans || [];
  const pending = scans.filter(s => s.status === "pending" || s.status === "analyzed").length;
  const reviewed = scans.filter(s => s.status === "reviewed").length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hi, Dr. {user?.fullName?.split(" ")[0]} 👋</h1>
        <p className="text-slate-500 mt-1">Here's your patient queue for today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Pending", value: pending, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
          { label: "Reviewed", value: reviewed, color: "bg-green-50 text-green-600", border: "border-green-100" },
          { label: "Total", value: scans.length, color: "bg-[#2EC4A5]/10 text-[#2EC4A5]", border: "border-[#2EC4A5]/20" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 border ${s.border} ${s.color} flex flex-col items-center`}>
            <span className="text-2xl font-bold">{isLoading ? "…" : s.value}</span>
            <span className="text-[10px] font-medium mt-1 opacity-70">{s.label}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-[#2EC4A5] to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-[#2EC4A5]/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Review Patient Scans</h2>
          <p className="text-teal-50 text-sm mb-4">Add clinical notes that will be visible to your patients instantly.</p>
          <Link href="/doctor/scans" className="inline-flex items-center gap-2 bg-white text-[#2EC4A5] px-5 py-2.5 rounded-xl font-semibold text-sm shadow hover:shadow-md transition-all">
            <FileImage className="w-4 h-4" /> View Scans
          </Link>
        </div>
      </div>

      {/* Recent queue */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-900">Recent Scans</h3>
          <Link href="/doctor/scans" className="text-sm text-[#2EC4A5] font-medium">See all</Link>
        </div>
        <div className="space-y-3">
          {isLoading
            ? [1, 2].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)
            : scans.slice(0, 3).map(scan => (
              <Link key={scan.id} href={`/doctor/scan/${scan.id}`} className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm rounded-2xl p-4 active:scale-95 transition-transform">
                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  <img src={scan.imageUrl || `${import.meta.env.BASE_URL}images/brain-scan-placeholder.png`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900">Scan #{scan.id.toString().padStart(4, "0")}</h4>
                  <p className="text-xs text-slate-500">{format(new Date(scan.createdAt), "MMM dd, yyyy")}</p>
                </div>
                <ScanBadge status={scan.status} />
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </Link>
            ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── My Scans List ─────────────────────────────────────────────────────────────
export function DoctorScans() {
  const { data, isLoading } = useGetScans({ query: { limit: 50 } });
  const scans = data?.scans || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">My Scans</h1>
      <div className="space-y-3">
        {isLoading
          ? [1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)
          : scans.length === 0
          ? (
            <div className="text-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileImage className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No scans assigned yet</p>
            </div>
          )
          : scans.map(scan => (
            <Link key={scan.id} href={`/doctor/scan/${scan.id}`} className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm rounded-2xl p-4 active:scale-95 transition-transform">
              <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                <img src={scan.imageUrl || `${import.meta.env.BASE_URL}images/brain-scan-placeholder.png`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900">Scan #{scan.id.toString().padStart(4, "0")}</h4>
                <p className="text-xs text-slate-500">{format(new Date(scan.createdAt), "MMM dd, yyyy • HH:mm")}</p>
                <p className="text-xs text-slate-400">Patient #{scan.patientId}</p>
              </div>
              <ScanBadge status={scan.status} />
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </Link>
          ))}
      </div>
    </div>
  );
}

// ─── Analysis List ─────────────────────────────────────────────────────────────
export function DoctorAnalysis() {
  const { data, isLoading } = useGetAllAnalysis({ query: { limit: 50 } });
  const analyses = (data as any)?.analyses || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">AI Analysis</h1>
      <div className="space-y-3">
        {isLoading
          ? [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)
          : analyses.length === 0
          ? (
            <div className="text-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No analysis records yet</p>
            </div>
          )
          : analyses.map((a: any) => (
            <Link key={a.id} href={`/doctor/scan/${a.scanId}`} className="block bg-white border border-slate-100 shadow-sm rounded-2xl p-4 active:scale-95 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900">Scan #{a.scanId?.toString().padStart(4, "0")}</span>
                <RiskBadge risk={a.riskLevel} />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-500">Type: <span className="font-medium text-slate-800 capitalize">{a.tumorType?.replace("_", " ")}</span></span>
                <span className="text-slate-500">Conf: <span className="font-medium text-slate-800">{Math.round((a.confidence || 0) * 100)}%</span></span>
              </div>
              <p className="text-xs text-slate-400 mt-2 truncate">{a.summary}</p>
            </Link>
          ))}
      </div>
    </div>
  );
}

// ─── Scan Detail + Notes ────────────────────────────────────────────────────────
export function DoctorScanDetail() {
  const [match] = useRoute("/doctor/scan/:id");
  const id = parseInt((match as any)?.id || "0");
  const { data: scan, isLoading, refetch } = useGetScanById(id);
  const { data: analysis } = useGetAnalysis(id);
  const [note, setNote] = useState("");
  const { toast } = useToast();

  const addNote = useAddScanNote({
    mutation: {
      onSuccess: () => {
        toast({ title: "Note saved — patient can now see it" });
        setNote("");
        refetch();
      },
      onError: () => toast({ title: "Failed to save note", variant: "destructive" }),
    },
  });

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-[#2EC4A5] border-t-transparent rounded-full" />
    </div>
  );
  if (!scan) return <div className="p-6 text-center text-slate-500">Scan not found</div>;

  const a = analysis || (scan as any).analysis;

  return (
    <div className="pb-6">
      {/* MRI Image */}
      <div className="bg-slate-900 h-56 relative">
        <img
          src={scan.imageUrl || `${import.meta.env.BASE_URL}images/brain-scan-placeholder.png`}
          className="w-full h-full object-contain opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <Link href="/doctor/scans" className="absolute top-4 left-4 w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
          <ChevronRight className="w-5 h-5 rotate-180" />
        </Link>
        <div className="absolute bottom-3 left-4">
          <span className="font-bold text-white text-lg">Scan #{scan.id?.toString().padStart(4, "0")}</span>
          <p className="text-white/70 text-xs">Patient #{scan.patientId}</p>
        </div>
      </div>

      <div className="px-6 pt-5 space-y-5">
        {/* AI Analysis Card */}
        {a ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-[#2EC4A5]" />
              <h3 className="font-bold text-slate-900">AI Analysis Result</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Tumor Type</p>
                <p className="font-semibold text-slate-900 capitalize text-sm">{a.tumorType?.replace("_", " ")}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-400 mb-1">Confidence</p>
                <p className="font-semibold text-slate-900 text-sm">{Math.round((a.confidence || 0) * 100)}%</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-slate-400 mb-1">Risk Level</p>
                <div className="flex items-center gap-2">
                  <RiskBadge risk={a.riskLevel} />
                </div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">Summary</p>
              <p className="text-sm text-slate-700 leading-relaxed">{a.summary}</p>
            </div>
            {a.keyFindings?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-700 mb-2">Key Findings</p>
                <ul className="space-y-1.5">
                  {a.keyFindings.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 text-sm">
            No AI analysis available for this scan yet.
          </div>
        )}

        {/* Previous Notes */}
        {(scan as any).doctorNotes?.length > 0 && (
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#2EC4A5]" />
              <h3 className="font-bold text-slate-900">Clinical Notes</h3>
            </div>
            <div className="space-y-3">
              {(scan as any).doctorNotes.map((n: any) => (
                <div key={n.id} className="bg-teal-50 border border-teal-100 rounded-xl p-4">
                  <p className="text-sm text-slate-700">"{n.note}"</p>
                  <p className="text-xs text-slate-400 mt-2">{format(new Date(n.createdAt), "MMM dd, yyyy")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Note */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-[#2EC4A5]" />
            <h3 className="font-bold text-slate-900">Add Note for Patient</h3>
          </div>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Write your clinical evaluation, recommendations... (visible to patient)"
            rows={4}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2EC4A5] focus:ring-2 focus:ring-[#2EC4A5]/20 resize-none transition-all"
          />
          <button
            onClick={() => addNote.mutate({ id, data: { note } })}
            disabled={!note.trim() || addNote.isPending}
            className="mt-3 w-full bg-[#2EC4A5] hover:bg-[#28b096] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
            {addNote.isPending ? "Saving..." : "Send Note to Patient"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export function DoctorProfile() {
  const { user, logout } = useAuth();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Profile</h1>
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center mb-6">
        <div className="w-24 h-24 bg-[#2EC4A5]/10 rounded-full flex items-center justify-center mb-4 text-[#2EC4A5] text-3xl font-bold">
          {user?.fullName?.charAt(0) || "D"}
        </div>
        <h2 className="text-xl font-bold text-slate-900">Dr. {user?.fullName}</h2>
        <p className="text-slate-500 text-sm">{user?.email}</p>
        <div className="mt-3 bg-[#2EC4A5]/10 text-[#2EC4A5] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
          Doctor
        </div>
      </div>
      <button onClick={logout} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-4 rounded-2xl transition-colors">
        Log Out
      </button>
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
