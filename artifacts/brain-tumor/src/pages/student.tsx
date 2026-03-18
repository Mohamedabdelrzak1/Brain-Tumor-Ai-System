import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { motion } from "framer-motion";
import { Home, Upload as UploadIcon, History as HistoryIcon, User, Settings, Bell, ChevronRight, FileImage, AlertTriangle, CheckCircle, ShieldAlert, HeartPulse } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useGetScans, useUploadScan, useGetScanById, useRunAnalysis, useGetAnalysis } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// --- STUDENT LAYOUT (Mobile First) ---
export function StudentLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  const navItems = [
    { path: "/student/dashboard", icon: Home, label: "Home" },
    { path: "/student/upload", icon: UploadIcon, label: "Upload" },
    { path: "/student/history", icon: HistoryIcon, label: "History" },
    { path: "/student/profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative pb-24 overflow-x-hidden flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">NeuroScan</span>
          </div>
          <Link href="/student/notifications" className="relative p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5 text-slate-600" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border border-white"></span>
          </Link>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-6 py-3 pb-safe max-w-md mx-auto">
          <ul className="flex justify-between items-center">
            {navItems.map((item) => {
              const isActive = location.startsWith(item.path);
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link href={item.path} className="flex flex-col items-center gap-1 p-2 w-16">
                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
                      {isActive && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-primary/10 rounded-xl" />}
                      <Icon className={`w-5 h-5 relative z-10 ${isActive ? 'fill-primary/20' : ''}`} />
                    </div>
                    <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                      {item.label}
                    </span>
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

// --- STUDENT PAGES ---

export function StudentDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: scansResponse, isLoading } = useGetScans({ query: { patientId: user?.id, limit: 3 } });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Hi, {user?.fullName?.split(' ')[0] || 'User'} 👋</h1>
        <p className="text-slate-500 mt-1">Let's check your brain health today.</p>
      </div>

      {/* CTA Card */}
      <div className="bg-gradient-to-br from-primary to-teal-700 rounded-3xl p-6 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">Upload MRI Scan</h2>
          <p className="text-teal-50 text-sm mb-6 max-w-[80%]">Get instant AI-powered analysis of your brain MRI scans with high accuracy.</p>
          <button 
            onClick={() => setLocation('/student/upload')}
            className="bg-white text-primary px-6 py-3 rounded-xl font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2"
          >
            <UploadIcon className="w-4 h-4" /> Start Analysis
          </button>
        </div>
      </div>

      {/* How it works */}
      <div>
        <h3 className="font-bold text-slate-900 mb-3">How it works</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: FileImage, title: "Upload", desc: "Select MRI image" },
            { icon: Settings, title: "Analyze", desc: "AI processing" },
            { icon: CheckCircle, title: "Result", desc: "Instant report" }
          ].map((step, i) => (
            <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center">
              <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 text-primary">
                <step.icon className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm text-slate-800">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-900">Recent Analysis</h3>
          <Link href="/student/history" className="text-sm text-primary font-medium">See all</Link>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            [1,2].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl"></div>)
          ) : !scansResponse?.scans?.length ? (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              <FileImage className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No scans analyzed yet.</p>
            </div>
          ) : (
            scansResponse.scans.map(scan => (
              <Link key={scan.id} href={`/student/result/${scan.id}`} className="block bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-4 flex items-center gap-4 cursor-pointer">
                <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  <img src={scan.imageUrl || `${import.meta.env.BASE_URL}images/brain-scan-placeholder.png`} alt="Scan" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 truncate">Scan #{scan.id.toString().padStart(4, '0')}</h4>
                  <p className="text-xs text-slate-500">{format(new Date(scan.createdAt), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <StatusBadge status={scan.status} />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function StudentUpload() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const uploadMutation = useUploadScan({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Upload successful", description: "Your scan is now being analyzed." });
        setLocation(`/student/result/${data.id}`);
      },
      onError: () => toast({ title: "Upload failed", variant: "destructive" })
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const objectUrl = URL.createObjectURL(selected);
      setPreview(objectUrl);
    }
  };

  const handleUpload = () => {
    if (!file) return;
    // Call the generated hook which expects a Blob and creates FormData internally
    uploadMutation.mutate({ data: { file, patientId: user?.id } });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-display font-bold text-slate-900 mb-6">Upload Scan</h1>
      
      <div className="flex-1 flex flex-col">
        {!preview ? (
          <label className="flex-1 border-2 border-dashed border-primary/30 rounded-3xl bg-primary/5 hover:bg-primary/10 transition-colors flex flex-col items-center justify-center p-8 cursor-pointer relative overflow-hidden group">
            <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 mb-1">Tap to upload MRI</h3>
            <p className="text-slate-500 text-sm text-center">Support JPG, PNG, DICOM<br/>Max size: 10MB</p>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        ) : (
          <div className="flex-1 flex flex-col bg-slate-900 rounded-3xl overflow-hidden relative">
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
            <div className="absolute top-4 right-4">
              <button onClick={() => {setFile(null); setPreview(null);}} className="bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur-md text-sm font-medium hover:bg-black/70">
                Change Image
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-500" /> Image Requirements</h4>
          <ul className="text-xs text-slate-600 space-y-2">
            <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-primary" /> Must be an axial, sagittal, or coronal MRI slice</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-primary" /> Clear visibility without excessive noise</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-primary" /> Centered alignment preferred</li>
          </ul>
        </div>

        <button 
          onClick={handleUpload}
          disabled={!file || uploadMutation.isPending}
          className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 disabled:opacity-50 disabled:shadow-none hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2"
        >
          {uploadMutation.isPending ? "Uploading..." : (
            <><Settings className="w-5 h-5 animate-spin-slow" /> Analyze Image</>
          )}
        </button>
      </div>
    </motion.div>
  );
}

export function StudentHistory() {
  const { user } = useAuth();
  const { data, isLoading } = useGetScans({ query: { patientId: user?.id } });
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-display font-bold text-slate-900 mb-6">Scan History</h1>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)}</div>
        ) : data?.scans?.map(scan => (
          <Link key={scan.id} href={`/student/result/${scan.id}`} className="block bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-4 active:scale-95 transition-transform">
            <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden">
               <img src={scan.imageUrl || `${import.meta.env.BASE_URL}images/brain-scan-placeholder.png`} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">Scan #{scan.id}</h4>
              <p className="text-xs text-slate-500">{format(new Date(scan.createdAt), 'MMM dd, yyyy • HH:mm')}</p>
            </div>
            <StatusBadge status={scan.status} />
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}

export function StudentResult() {
  const [match] = useRoute("/student/result/:id");
  const id = parseInt(match?.id || "0");
  const { data: scan, isLoading: scanLoading } = useGetScanById(id);
  const { data: analysis, isLoading: analysisLoading } = useGetAnalysis(id);
  
  // Simulated auto-run if pending (in real app, backend triggers this via hook or event)
  const runMutation = useRunAnalysis({
    mutation: {
      onSuccess: () => {
        // Invalidate or refetch logic handled by react-query if configured, 
        // here we just rely on component remount or user refresh for simplicity in UI demo.
      }
    }
  });

  if (scanLoading) return <div className="p-6 flex justify-center items-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!scan) return <div className="p-6 text-center text-slate-500">Scan not found</div>;

  const isPending = scan.status === 'pending';
  const a = analysis || scan.analysis; // use directly embedded analysis if available

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Header Image Area */}
      <div className="bg-slate-900 h-64 relative">
        <img src={scan.imageUrl || `${import.meta.env.BASE_URL}images/brain-scan-placeholder.png`} className="w-full h-full object-contain opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent" />
        <Link href="/student/dashboard" className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-white/30">
          <ChevronRight className="w-6 h-6 rotate-180" />
        </Link>
      </div>

      <div className="px-6 -mt-10 relative z-10 space-y-6">
        {/* Main Result Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Analysis Result</p>
              {isPending ? (
                <h2 className="text-2xl font-bold text-amber-500 flex items-center gap-2">
                  <Settings className="w-6 h-6 animate-spin" /> Processing
                </h2>
              ) : (
                <h2 className={`text-2xl font-bold ${a?.tumorType !== 'no_tumor' ? 'text-destructive' : 'text-primary'}`}>
                  {a?.tumorType === 'no_tumor' ? 'Benign / Normal' : 'Tumor Detected'}
                </h2>
              )}
            </div>
            {!isPending && a && (
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-slate-900">{Math.round(a.confidence * 100)}%</span>
                <span className="text-[10px] text-slate-500">Conf.</span>
              </div>
            )}
          </div>
          
          {isPending ? (
            <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm">
              Our AI is currently analyzing your MRI scan. This usually takes less than a minute. Check back soon.
              <button onClick={() => runMutation.mutate({ scanId: id })} className="mt-3 w-full bg-amber-500 text-white py-2 rounded-lg font-medium shadow">Run Analysis Now (Demo)</button>
            </div>
          ) : a ? (
            <>
              <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-700 leading-relaxed mb-4 border border-slate-100">
                {a.summary || "The AI model has detected anomalies consistent with a glioma tumor structure in the frontal lobe region."}
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 border border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Tumor Type</p>
                  <p className="font-semibold text-slate-900 capitalize">{a.tumorType.replace('_', ' ')}</p>
                </div>
                <div className="p-3 border border-slate-100 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Risk Level</p>
                  <p className="font-semibold text-slate-900 capitalize flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${a.riskLevel === 'high' || a.riskLevel === 'critical' ? 'bg-destructive' : 'bg-amber-500'}`}></span>
                    {a.riskLevel}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 text-slate-900">Key Findings</h4>
                <ul className="space-y-2">
                  {(a.keyFindings || ["Irregular tissue mass detected", "Midline shift observed (~2mm)"]).map((finding, idx) => (
                     <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                       <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                       <span>{finding}</span>
                     </li>
                  ))}
                </ul>
              </div>
            </>
          ) : null}
        </div>

        {/* Doctor Notes */}
        {!isPending && scan.doctorNotes && scan.doctorNotes.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6">
            <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" /> Doctor's Evaluation
            </h3>
            {scan.doctorNotes.map(note => (
              <div key={note.id} className="bg-white p-4 rounded-xl shadow-sm mb-3">
                <p className="text-sm text-slate-700">"{note.note}"</p>
                <p className="text-xs text-slate-400 mt-2 text-right">- Dr. {note.doctorName || 'Assigned Specialist'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function StudentProfile() {
  const { user, logout } = useAuth();
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-display font-bold text-slate-900 mb-6">Profile</h1>
      
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center mb-6">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary text-3xl font-bold">
          {user?.fullName?.charAt(0) || 'U'}
        </div>
        <h2 className="text-xl font-bold text-slate-900">{user?.fullName}</h2>
        <p className="text-slate-500 text-sm">{user?.email}</p>
        <div className="mt-4 bg-slate-50 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Patient ID: #{user?.id.toString().padStart(6, '0')}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3"><Settings className="w-5 h-5 text-slate-400" /><span className="font-medium text-slate-700">Account Settings</span></div>
            <ChevronRight className="w-5 h-5 text-slate-300" />
          </div>
          <div className="p-4 border-b border-slate-50 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-slate-400" /><span className="font-medium text-slate-700">Notifications</span></div>
            <div className="w-10 h-6 bg-primary rounded-full relative">
               <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
            </div>
          </div>
        </div>

        <button onClick={logout} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-4 rounded-2xl transition-colors">
          Log Out
        </button>
      </div>
    </div>
  );
}

// Helpers
function StatusBadge({ status }: { status: string }) {
  if (status === 'analyzed') return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">Analyzed</span>;
  if (status === 'reviewed') return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">Reviewed</span>;
  return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">Pending</span>;
}

