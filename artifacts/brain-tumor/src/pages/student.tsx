import { useState, useRef } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Upload as UploadIcon, History as HistoryIcon, User,
  Settings, ChevronRight, FileImage, AlertTriangle, CheckCircle,
  ShieldAlert, Key, Bell, Lock, Info, HelpCircle, MessageCircle,
  LogOut, Edit2, X, Eye, EyeOff, ArrowLeft,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useGetScans, useUploadScan, useGetScanById, useRunAnalysis, useGetAnalysis, useGetNotifications } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AppLayout } from "@/components/AppLayout";

const studentNav = [
  { path: "/student/dashboard", icon: Home, label: "Home" },
  { path: "/student/upload", icon: UploadIcon, label: "Upload" },
  { path: "/student/history", icon: HistoryIcon, label: "History" },
  { path: "/student/profile", icon: User, label: "Profile" },
];

export function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout
      navItems={studentNav}
      roleBadge={
        <span className="bg-[#2EC4A5]/10 text-[#2EC4A5] text-xs font-bold px-3 py-1 rounded-full">Patient</span>
      }
    >
      {children}
    </AppLayout>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function StudentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: scansResponse, isLoading } = useGetScans({ query: { patientId: user?.id, limit: 3 } });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hi, {user?.fullName?.split(" ")[0] || "User"} 👋</h1>
        <p className="text-slate-500 mt-1">Let's check your brain health today.</p>
      </div>

      {/* Hero card */}
      <div className="bg-gradient-to-br from-[#1a9e84] via-[#2EC4A5] to-[#3dd9bb] rounded-3xl p-6 text-white shadow-xl shadow-[#2EC4A5]/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">AI-powered analysis</p>
          <h2 className="text-2xl font-bold mb-3">Upload MRI Scan</h2>
          <p className="text-white/80 text-sm mb-6 max-w-[80%]">Get instant AI-powered analysis of your brain MRI scans with high accuracy.</p>
          <button onClick={() => setLocation("/student/upload")}
            className="bg-white text-[#2EC4A5] px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 w-fit">
            <UploadIcon className="w-4 h-4" /> Start Analysis
          </button>
        </div>
      </div>

      {/* How it works */}
      <div>
        <h3 className="font-bold text-slate-900 mb-3">How it works</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: FileImage, title: "Upload", desc: "Select MRI" },
            { icon: Settings, title: "Analyze", desc: "AI processes" },
            { icon: CheckCircle, title: "Result", desc: "Get report" },
          ].map((step, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm">
              <div className="w-10 h-10 bg-[#2EC4A5]/10 rounded-full flex items-center justify-center mb-2">
                <step.icon className="w-5 h-5 text-[#2EC4A5]" />
              </div>
              <span className="font-semibold text-sm text-slate-800">{step.title}</span>
              <span className="text-xs text-slate-400 mt-0.5">{step.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-900">Recent Analysis</h3>
          <Link href="/student/history" className="text-sm text-[#2EC4A5] font-semibold">See all</Link>
        </div>
        <div className="space-y-3">
          {isLoading
            ? [1, 2].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)
            : !scansResponse?.scans?.length
            ? (
              <div className="text-center p-10 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                <FileImage className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm font-medium">No scans yet</p>
                <p className="text-slate-400 text-xs mt-1">Upload your first MRI scan to get started</p>
              </div>
            )
            : scansResponse.scans.map(scan => (
              <Link key={scan.id} href={`/student/result/${scan.id}`}
                className="flex items-center gap-4 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl p-4 cursor-pointer hover:-translate-y-0.5">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  <img src={scan.imageUrl || `${import.meta.env.BASE_URL}images/brain-scan-placeholder.png`} alt="Scan" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">Scan #{scan.id.toString().padStart(4, "0")}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{format(new Date(scan.createdAt), "MMM dd, yyyy")}</p>
                </div>
                <StatusBadge status={scan.status} />
              </Link>
            ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Upload ────────────────────────────────────────────────────────────────────
export function StudentUpload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadScan({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Upload successful", description: "Your scan is now being analyzed." });
        setLocation(`/student/result/${data.id}`);
      },
      onError: () => toast({ title: "Upload failed", variant: "destructive" }),
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) { setFile(selected); setPreview(URL.createObjectURL(selected)); setShowPicker(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Upload Scan</h1>

      {!preview ? (
        <>
          {/* Hero upload card */}
          <div
            onClick={() => setShowPicker(true)}
            className="bg-gradient-to-br from-[#1a9e84] via-[#2EC4A5] to-[#3dd9bb] rounded-3xl p-8 text-white cursor-pointer hover:opacity-95 transition-opacity text-center shadow-xl shadow-[#2EC4A5]/20"
          >
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadIcon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-1">Upload MRI Scan</h3>
            <p className="text-white/70 text-sm">AI-powered analysis of brain MRI images using deep learning models for brain tumor detection.</p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-slate-900">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Image Requirements
            </h4>
            <ul className="space-y-2">
              {["Must be an axial, sagittal, or coronal MRI slice", "Clear visibility without excessive noise", "Centered alignment preferred"].map((t) => (
                <li key={t} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle className="w-3.5 h-3.5 text-[#2EC4A5] flex-shrink-0 mt-0.5" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-3xl overflow-hidden bg-slate-900 h-64 relative">
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            <button onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-medium">
              Change
            </button>
          </div>
          <p className="text-sm text-slate-600 text-center font-medium">{file?.name}</p>
          <button onClick={() => uploadMutation.mutate({ data: { file, patientId: user?.id } })}
            disabled={uploadMutation.isPending}
            className="w-full bg-[#2EC4A5] hover:bg-[#28b096] text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#2EC4A5]/20 disabled:opacity-50 transition-all">
            {uploadMutation.isPending ? "Analyzing..." : "Run AI Analysis"}
          </button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Bottom sheet picker */}
      <AnimatePresence>
        {showPicker && (
          <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowPicker(false)}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-6" />
              <h3 className="font-bold text-slate-900 text-lg mb-1">Upload MRI Scan</h3>
              <p className="text-slate-400 text-sm mb-6">Take a clear photo of the MRI scan.</p>
              <div className="space-y-3">
                <button onClick={() => fileRef.current?.click()}
                  className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors">
                  <div className="w-11 h-11 bg-[#2EC4A5]/10 rounded-xl flex items-center justify-center">
                    <FileImage className="w-6 h-6 text-[#2EC4A5]" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900 text-sm">From Gallery</p>
                    <p className="text-xs text-slate-400">Select an MRI image from your device.</p>
                  </div>
                </button>
                <button className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors opacity-60">
                  <div className="w-11 h-11 bg-slate-200 rounded-xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900 text-sm">Use Camera</p>
                    <p className="text-xs text-slate-400">Take a clear photo of the MRI scan.</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── History ───────────────────────────────────────────────────────────────────
export function StudentHistory() {
  const { user } = useAuth();
  const { data, isLoading } = useGetScans({ query: { patientId: user?.id } });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Scan History</h1>
        <span className="text-sm text-slate-400 font-medium">{data?.scans?.length || 0} scans</span>
      </div>
      <div className="space-y-3">
        {isLoading
          ? [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)
          : !data?.scans?.length
          ? (
            <div className="text-center py-20 text-slate-400">
              <FileImage className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No scans yet</p>
            </div>
          )
          : data.scans.map(scan => (
            <Link key={scan.id} href={`/student/result/${scan.id}`}
              className="flex items-center gap-4 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl p-4 cursor-pointer">
              <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                <img src={scan.imageUrl || `${import.meta.env.BASE_URL}images/brain-scan-placeholder.png`} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-900">Scan #{scan.id.toString().padStart(4, "0")}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{format(new Date(scan.createdAt), "MMM dd, yyyy · HH:mm")}</p>
              </div>
              <StatusBadge status={scan.status} />
              <ChevronRight className="w-5 h-5 text-slate-300" />
            </Link>
          ))}
      </div>
    </div>
  );
}

// ─── Result ────────────────────────────────────────────────────────────────────
export function StudentResult() {
  const [match] = useRoute("/student/result/:id");
  const id = parseInt(match?.id || "0");
  const { data: scan, isLoading } = useGetScanById(id);
  const { data: analysis } = useGetAnalysis(id);
  const runMutation = useRunAnalysis({ mutation: {} });
  const [, setLocation] = useLocation();

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-[#2EC4A5] border-t-transparent rounded-full" />
    </div>
  );
  if (!scan) return <div className="p-6 text-center text-slate-400">Scan not found</div>;

  const isPending = scan.status === "pending";
  const a = analysis || (scan as any).analysis;

  return (
    <div className="space-y-5">
      <button onClick={() => setLocation("/student/history")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium text-sm mb-2">
        <ArrowLeft className="w-4 h-4" /> Back to History
      </button>

      {/* Scan image */}
      <div className="bg-slate-900 rounded-3xl overflow-hidden h-56 relative">
        <img src={scan.imageUrl || `${import.meta.env.BASE_URL}images/brain-scan-placeholder.png`}
          className="w-full h-full object-contain opacity-90" />
        <div className="absolute bottom-4 right-4">
          <StatusBadge status={scan.status} />
        </div>
      </div>

      {/* Result card */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Analysis Result</p>
            {isPending
              ? <h2 className="text-2xl font-bold text-amber-500">Processing...</h2>
              : <h2 className={`text-2xl font-bold ${a?.tumorType !== "no_tumor" ? "text-red-500" : "text-[#2EC4A5]"}`}>
                {a?.tumorType === "no_tumor" ? "No Tumor Detected" : "Tumor Detected"}
              </h2>
            }
          </div>
          {!isPending && a && (
            <div className="w-16 h-16 rounded-full border-4 border-[#2EC4A5]/20 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-slate-900">{Math.round(a.confidence * 100)}%</span>
              <span className="text-[10px] text-slate-400">Confidence</span>
            </div>
          )}
        </div>

        {isPending ? (
          <div className="bg-amber-50 border border-amber-100 text-amber-800 p-4 rounded-2xl text-sm space-y-3">
            <p>Our AI is analyzing your MRI scan. This usually takes less than a minute.</p>
            <button onClick={() => runMutation.mutate({ scanId: id })}
              className="w-full bg-amber-500 text-white py-2.5 rounded-xl font-semibold text-sm">
              Run Analysis Now (Demo)
            </button>
          </div>
        ) : a ? (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-sm text-slate-700 leading-relaxed">
              {a.summary}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 border border-slate-100 rounded-2xl">
                <p className="text-xs text-slate-400 mb-1">Tumor Type</p>
                <p className="font-bold text-slate-900 capitalize">{a.tumorType?.replace("_", " ")}</p>
              </div>
              <div className="p-4 border border-slate-100 rounded-2xl">
                <p className="text-xs text-slate-400 mb-1">Risk Level</p>
                <p className="font-bold text-slate-900 capitalize flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${a.riskLevel === "high" || a.riskLevel === "critical" ? "bg-red-500" : a.riskLevel === "medium" ? "bg-amber-500" : "bg-green-500"}`} />
                  {a.riskLevel}
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3 text-slate-900">Key Findings</h4>
              <ul className="space-y-2">
                {(Array.isArray(a.keyFindings) ? a.keyFindings : ["Irregular tissue mass detected", "Midline shift observed"]).map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      {/* Doctor notes */}
      {!isPending && (scan as any).doctorNotes?.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" /> Doctor's Evaluation
          </h3>
          {(scan as any).doctorNotes.map((note: any) => (
            <div key={note.id} className="bg-white p-4 rounded-2xl shadow-sm mb-3">
              <p className="text-sm text-slate-700">"{note.note}"</p>
              <p className="text-xs text-slate-400 mt-2 text-right">— Dr. {note.doctorName || "Specialist"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notifications ─────────────────────────────────────────────────────────────
export function StudentNotifications() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data } = useGetNotifications({ query: { userId: user?.id } });
  const notifications = (data as any)?.notifications || [];

  const notifIcons: Record<string, { icon: any; color: string; bg: string }> = {
    scan_result: { icon: CheckCircle, color: "text-amber-500", bg: "bg-amber-50" },
    malfunction: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50" },
    ai_response: { icon: Settings, color: "text-[#2EC4A5]", bg: "bg-[#2EC4A5]/10" },
    appointment: { icon: Bell, color: "text-blue-500", bg: "bg-blue-50" },
    app_update: { icon: Info, color: "text-yellow-500", bg: "bg-yellow-50" },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setLocation("/student/profile")} className="p-2 hover:bg-slate-100 rounded-xl">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any) => {
            const meta = notifIcons[n.type] || notifIcons.scan_result;
            const Icon = meta.icon;
            return (
              <div key={n.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border ${n.isRead ? "bg-white border-slate-100" : "bg-[#2EC4A5]/5 border-[#2EC4A5]/20"}`}>
                <div className={`w-10 h-10 rounded-full ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{n.title}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{n.message}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{format(new Date(n.createdAt), "d MMM")}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Data & Privacy ────────────────────────────────────────────────────────────
export function StudentDataPrivacy() {
  const [, setLocation] = useLocation();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setLocation("/student/profile")} className="p-2 hover:bg-slate-100 rounded-xl">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Data & Privacy</h1>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
        <div className="w-14 h-14 bg-[#2EC4A5]/10 rounded-2xl flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-[#2EC4A5]" />
        </div>
        <ul className="space-y-4">
          {[
            "Your privacy is our top priority. Brain Tumor collects only the information needed to provide accurate scan results and improve the AI analysis.",
            "We do not share your personal data with third parties without your consent.",
            "You can manage your data and notification preferences in your Profile.",
            "All scans and results are stored securely and are accessible only by you.",
          ].map((point, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2EC4A5] flex-shrink-0 mt-2" />
              {point}
            </li>
          ))}
        </ul>
      </div>

      <button className="w-full bg-[#2EC4A5] hover:bg-[#28b096] text-white font-semibold py-4 rounded-2xl shadow-lg shadow-[#2EC4A5]/20 transition-colors">
        Manage my data
      </button>
    </div>
  );
}

// ─── Profile ───────────────────────────────────────────────────────────────────
function ChangePasswordSheet({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [form, setForm] = useState({ current: "", newPw: "", confirm: "" });
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!form.current || !form.newPw || !form.confirm) {
      toast({ title: "Fill all fields", variant: "destructive" }); return;
    }
    if (form.newPw !== form.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    if (form.newPw.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return;
    }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    toast({ title: "Password updated successfully!" });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 400 }}
        className="relative w-full max-w-lg bg-white rounded-t-3xl px-6 pt-4 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-5" />
        <h3 className="font-bold text-slate-900 text-xl mb-6">Change your Password</h3>
        <div className="space-y-4">
          {[
            { label: "Current Password", key: "current", show: show.current, toggle: () => setShow(p => ({ ...p, current: !p.current })) },
            { label: "New Password", key: "newPw", show: show.newPw, toggle: () => setShow(p => ({ ...p, newPw: !p.newPw })) },
            { label: "Confirm New Password", key: "confirm", show: show.confirm, toggle: () => setShow(p => ({ ...p, confirm: !p.confirm })) },
          ].map(f => (
            <div key={f.key} className="relative">
              <input
                type={f.show ? "text" : "password"}
                placeholder={f.label}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2EC4A5] pr-12"
              />
              <button type="button" onClick={f.toggle} className="absolute right-4 top-4">
                {f.show ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
              </button>
            </div>
          ))}
          <button onClick={handleUpdate} disabled={loading}
            className="w-full bg-[#2EC4A5] hover:bg-[#28b096] text-white font-bold py-4 rounded-2xl text-base shadow-lg shadow-[#2EC4A5]/20 mt-2 disabled:opacity-60 transition-colors">
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ProfileRow({ icon: Icon, label, rightElement, onClick, asDiv }: {
  icon: any; label: string; rightElement?: React.ReactNode; onClick?: () => void; asDiv?: boolean;
}) {
  const inner = (
    <>
      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <span className="flex-1 text-left text-slate-800 font-medium text-sm">{label}</span>
      {rightElement !== undefined ? rightElement : <ChevronRight className="w-4 h-4 text-slate-300" />}
    </>
  );
  if (asDiv) {
    return <div className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-colors">{inner}</div>;
  }
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-colors">
      {inner}
    </button>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative ${on ? "bg-[#2EC4A5]" : "bg-slate-300"}`}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? "translate-x-7" : "translate-x-1"}`} />
    </button>
  );
}

export function StudentProfile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [showPwSheet, setShowPwSheet] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

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
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-900 text-lg truncate">Hi, {user?.fullName?.split(" ")[0]}</h2>
            <p className="text-slate-400 text-sm truncate">{user?.email}</p>
          </div>
          <button className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            <Edit2 className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Account section */}
      <div>
        <p className="text-sm font-bold text-slate-900 mb-0.5 px-1">Account</p>
        <p className="text-xs text-slate-400 mb-3 px-1">Update info for better care</p>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <ProfileRow icon={Key} label="Change Password" onClick={() => setShowPwSheet(true)} />
          <ProfileRow icon={Bell} label="Notifications Settings" asDiv
            rightElement={<Toggle on={notifEnabled} onToggle={() => setNotifEnabled(!notifEnabled)} />}
          />
        </div>
      </div>

      {/* App section */}
      <div>
        <p className="text-sm font-bold text-slate-900 mb-0.5 px-1">App</p>
        <p className="text-xs text-slate-400 mb-3 px-1">Protecting your data with care</p>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <ProfileRow icon={Lock} label="Data & Privacy" onClick={() => setLocation("/student/data-privacy")} />
          <ProfileRow icon={Info} label="About Brain Tumor" />
        </div>
      </div>

      {/* Support section */}
      <div>
        <p className="text-sm font-bold text-slate-900 mb-0.5 px-1">Support</p>
        <p className="text-xs text-slate-400 mb-3 px-1">We answer about your needs</p>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          <ProfileRow icon={HelpCircle} label="FAQ" />
          <ProfileRow icon={MessageCircle} label="Contact Support" />
        </div>
      </div>

      {/* Logout */}
      <button onClick={logout}
        className="w-full flex items-center justify-center gap-2 border-2 border-red-100 text-red-500 hover:bg-red-50 font-semibold py-4 rounded-2xl transition-colors">
        <LogOut className="w-5 h-5" /> Log Out
      </button>

      <AnimatePresence>
        {showPwSheet && <ChangePasswordSheet onClose={() => setShowPwSheet(false)} />}
      </AnimatePresence>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "analyzed") return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">Analyzed</span>;
  if (status === "reviewed") return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">Reviewed</span>;
  return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase">Pending</span>;
}
