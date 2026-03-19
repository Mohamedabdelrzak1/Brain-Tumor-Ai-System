import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Home, FileImage, Activity, User, ChevronRight, CheckCircle, AlertTriangle, FileText, Send, Key, Bell, Lock, Info, HelpCircle, MessageCircle, LogOut, Edit2, Eye, EyeOff, ArrowLeft } from "lucide-react";
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
import { AppLayout } from "@/components/AppLayout";

const doctorNav = [
  { path: "/doctor/dashboard", icon: Home, label: "Home" },
  { path: "/doctor/scans", icon: FileImage, label: "My Scans" },
  { path: "/doctor/analysis", icon: Activity, label: "Analysis" },
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
  const { data: scansData, isLoading } = useGetScans({ query: { limit: 5 } });
  const scans = scansData?.scans || [];
  const pending = scans.filter(s => s.status === "pending" || s.status === "analyzed").length;
  const reviewed = scans.filter(s => s.status === "reviewed").length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
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
    <div className="space-y-5">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">My Scans</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {isLoading
          ? [1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)
          : scans.length === 0
          ? (
            <div className="col-span-2 text-center p-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <FileImage className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500">No scans assigned yet</p>
            </div>
          )
          : scans.map(scan => (
            <Link key={scan.id} href={`/doctor/scan/${scan.id}`} className="flex items-center gap-3 bg-white border border-slate-100 shadow-sm rounded-2xl p-4 hover:shadow-md transition-shadow">
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
    <div className="space-y-5">
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
function DoctorChangePwSheet({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ current: "", newPw: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!form.current || !form.newPw || !form.confirm) { toast({ title: "Fill all fields", variant: "destructive" }); return; }
    if (form.newPw !== form.confirm) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    toast({ title: "Password updated successfully!" });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 400 }}
        className="relative w-full max-w-lg bg-white rounded-t-3xl px-6 pt-4 pb-10" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-5" />
        <h3 className="font-bold text-slate-900 text-xl mb-6">Change your Password</h3>
        <div className="space-y-4">
          {[
            { label: "Current Password", key: "current", show: show.current, toggle: () => setShow(p => ({ ...p, current: !p.current })) },
            { label: "New Password", key: "newPw", show: show.newPw, toggle: () => setShow(p => ({ ...p, newPw: !p.newPw })) },
            { label: "Confirm New Password", key: "confirm", show: show.confirm, toggle: () => setShow(p => ({ ...p, confirm: !p.confirm })) },
          ].map(f => (
            <div key={f.key} className="relative">
              <input type={f.show ? "text" : "password"} placeholder={f.label} value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#2EC4A5] pr-12" />
              <button type="button" onClick={f.toggle} className="absolute right-4 top-4">
                {f.show ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
              </button>
            </div>
          ))}
          <button onClick={handleUpdate} disabled={loading}
            className="w-full bg-[#2EC4A5] hover:bg-[#28b096] text-white font-bold py-4 rounded-2xl mt-2 disabled:opacity-60 shadow-lg shadow-[#2EC4A5]/20 transition-colors">
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function DoctorProfile() {
  const { user, logout } = useAuth();
  const [showPwSheet, setShowPwSheet] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  return (
    <div className="space-y-5 pb-8">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>

      {/* User card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.fullName?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 text-lg truncate">Dr. {user?.fullName}</h2>
            <p className="text-slate-400 text-sm truncate">{user?.email}</p>
            {user?.organization && <p className="text-xs text-slate-300 mt-0.5 truncate">{user.organization}</p>}
          </div>
          <button className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            <Edit2 className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Account */}
      <div>
        <p className="text-sm font-bold text-slate-900 mb-0.5 px-1">Account</p>
        <p className="text-xs text-slate-400 mb-3 px-1">Update info for better care</p>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <button onClick={() => setShowPwSheet(true)}
            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-colors">
            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0"><Key className="w-4 h-4 text-slate-500" /></div>
            <span className="flex-1 text-left text-slate-800 font-medium text-sm">Change Password</span>
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </button>
          <div className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-colors">
            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0"><Bell className="w-4 h-4 text-slate-500" /></div>
            <span className="flex-1 text-left text-slate-800 font-medium text-sm">Notifications Settings</span>
            <button onClick={() => setNotifEnabled(!notifEnabled)}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifEnabled ? "bg-[#2EC4A5]" : "bg-slate-300"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifEnabled ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* App */}
      <div>
        <p className="text-sm font-bold text-slate-900 mb-0.5 px-1">App</p>
        <p className="text-xs text-slate-400 mb-3 px-1">Protecting your data with care</p>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          {[{ icon: Lock, label: "Data & Privacy" }, { icon: Info, label: "About Brain Tumor" }].map(item => (
            <button key={item.label} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0"><item.icon className="w-4 h-4 text-slate-500" /></div>
              <span className="flex-1 text-left text-slate-800 font-medium text-sm">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Support */}
      <div>
        <p className="text-sm font-bold text-slate-900 mb-0.5 px-1">Support</p>
        <p className="text-xs text-slate-400 mb-3 px-1">We answer about your needs</p>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          {[{ icon: HelpCircle, label: "FAQ" }, { icon: MessageCircle, label: "Contact Support" }].map(item => (
            <button key={item.label} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-colors">
              <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0"><item.icon className="w-4 h-4 text-slate-500" /></div>
              <span className="flex-1 text-left text-slate-800 font-medium text-sm">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </button>
          ))}
        </div>
      </div>

      <button onClick={logout}
        className="w-full flex items-center justify-center gap-2 border-2 border-red-100 text-red-500 hover:bg-red-50 font-semibold py-4 rounded-2xl transition-colors">
        <LogOut className="w-5 h-5" /> Log Out
      </button>

      <AnimatePresence>
        {showPwSheet && <DoctorChangePwSheet onClose={() => setShowPwSheet(false)} />}
      </AnimatePresence>
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
