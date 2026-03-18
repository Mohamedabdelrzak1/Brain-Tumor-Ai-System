import { Link, useLocation, useRoute } from "wouter";
import { useAuth } from "@/lib/auth";
import { useGetScans, useGetScanById, useAddScanNote } from "@workspace/api-client-react";
import { HeartPulse, LayoutDashboard, Users, FileText, Search, User, LogOut, CheckCircle, AlertTriangle, FileImage } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function DoctorLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { path: "/doctor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/doctor/patients", icon: Users, label: "Patients" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-slate-900 leading-tight">NeuroScan</h1>
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Clinical Portal</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navLinks.map(link => (
            <Link key={link.path} href={link.path} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${location.startsWith(link.path) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <link.icon className={`w-5 h-5 ${location.startsWith(link.path) ? 'text-blue-600' : 'text-slate-400'}`} />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">
              {user?.fullName?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Dr. {user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-600 hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Mobile */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center">
           <div className="flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-blue-600" />
            <span className="font-display font-bold text-lg">NeuroScan</span>
          </div>
          <button onClick={logout} className="text-slate-500 p-2"><LogOut className="w-5 h-5"/></button>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export function DoctorDashboard() {
  const { data: scans, isLoading } = useGetScans({ query: { limit: 10 } }); // Realistically would filter by assigned doctor
  
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Welcome, Dr.</h1>
        <p className="text-slate-500">Here's your clinical overview for today.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-600"><AlertTriangle className="w-7 h-7" /></div>
          <div><p className="text-3xl font-bold text-slate-900">4</p><p className="text-sm font-medium text-slate-500">Pending Reviews</p></div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center text-destructive"><Activity className="w-7 h-7" /></div>
          <div><p className="text-3xl font-bold text-slate-900">2</p><p className="text-sm font-medium text-slate-500">Critical Cases</p></div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-600"><CheckCircle className="w-7 h-7" /></div>
          <div><p className="text-3xl font-bold text-slate-900">12</p><p className="text-sm font-medium text-slate-500">Completed This Week</p></div>
        </div>
      </div>

      {/* Patient Queue */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">Recent AI Analyses Queue</h2>
          <Link href="/doctor/patients" className="text-sm text-blue-600 font-semibold hover:underline">View all</Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 font-semibold">Patient</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">AI Finding</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading queue...</td></tr>
              ) : scans?.scans?.map(scan => (
                <tr key={scan.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">P</div>
                      <span className="font-semibold text-slate-900">Patient #{scan.patientId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{format(new Date(scan.createdAt), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4">
                    {/* Placeholder logic: assuming status indicates AI ran. In real app, scan.analysis.tumorType is here */}
                    {scan.status === 'analyzed' ? <span className="text-destructive font-semibold text-sm">Potential Mass</span> : <span className="text-slate-400 text-sm">Pending</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${scan.status === 'reviewed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {scan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/doctor/scans/${scan.id}`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors">Review</Link>
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

export function DoctorScanDetail() {
  const [match] = useRoute("/doctor/scans/:id");
  const id = parseInt(match?.id || "0");
  const { data: scan, isLoading } = useGetScanById(id);
  const [note, setNote] = useState("");
  const { toast } = useToast();
  
  const addNoteMutation = useAddScanNote({
    mutation: {
      onSuccess: () => {
        toast({ title: "Evaluation saved successfully" });
        setNote("");
        // In real app, invalidate query here
      }
    }
  });

  if (isLoading) return <div className="p-12 text-center text-slate-500">Loading scan data...</div>;
  if (!scan) return <div className="p-12 text-center text-slate-500">Scan not found</div>;

  const a = scan.analysis;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/doctor/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors">← Back to Dashboard</Link>
        <h1 className="text-2xl font-bold text-slate-900">Clinical Review: Scan #{scan.id}</h1>
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase ml-auto">Needs Review</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Image & Tools */}
        <div className="space-y-6">
          <div className="bg-black rounded-3xl p-2 relative shadow-xl overflow-hidden aspect-square border-4 border-slate-800">
            <img src={scan.imageUrl || `${import.meta.env.BASE_URL}images/brain-scan-placeholder.png`} className="w-full h-full object-contain" />
            {/* Mock scanning overlay tools */}
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-mono border border-slate-700">
              AXIAL T1
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-500 block mb-1">ID Number</span><span className="font-semibold text-slate-900">{scan.patientId}</span></div>
              <div><span className="text-slate-500 block mb-1">Scan Date</span><span className="font-semibold text-slate-900">{format(new Date(scan.createdAt), 'MMM dd, yyyy')}</span></div>
            </div>
          </div>
        </div>

        {/* Right Column - Analysis & Notes */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600"><Settings className="w-4 h-4 animate-spin-slow" /></div>
              <h2 className="text-lg font-bold text-slate-900">AI Pre-Analysis</h2>
            </div>
            
            {a ? (
              <>
                <div className="flex items-end justify-between mb-6 pb-6 border-b border-slate-100">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Primary Finding</p>
                    <p className={`text-2xl font-bold capitalize ${a.tumorType !== 'no_tumor' ? 'text-destructive' : 'text-green-600'}`}>{a.tumorType.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-slate-900">{Math.round(a.confidence * 100)}%</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-900 mb-2">Detailed Summary</p>
                  <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl">{a.summary}</p>
                </div>
              </>
            ) : (
               <div className="py-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                 No AI analysis data available yet.
               </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
             <h2 className="text-lg font-bold text-slate-900 mb-4">Clinical Evaluation</h2>
             
             {scan.doctorNotes?.length > 0 && (
               <div className="mb-6 space-y-3">
                 {scan.doctorNotes.map(n => (
                   <div key={n.id} className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                     <p className="text-sm text-slate-700">{n.note}</p>
                     <p className="text-xs text-slate-400 mt-2">Added on {format(new Date(n.createdAt), 'MMM dd')}</p>
                   </div>
                 ))}
               </div>
             )}

             <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Add Official Note / Diagnosis</label>
               <textarea 
                 value={note}
                 onChange={e => setNote(e.target.value)}
                 className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors resize-none h-32 text-sm text-slate-900"
                 placeholder="Enter clinical findings, treatment recommendations..."
               />
               <button 
                 onClick={() => addNoteMutation.mutate({ id, data: { note } })}
                 disabled={!note.trim() || addNoteMutation.isPending}
                 className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 disabled:shadow-none transition-all"
               >
                 {addNoteMutation.isPending ? "Saving..." : "Sign & Save Evaluation"}
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick mock component for icon missing above
function Activity(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
}
