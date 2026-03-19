import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, RoleGuard } from "@/lib/auth";

// Import pages
import { Splash, Login, Register, ForgotPassword, VerifyCode, ResetPassword } from "@/pages/auth";
import { StudentLayout, StudentDashboard, StudentUpload, StudentHistory, StudentResult, StudentProfile, StudentNotifications, StudentDataPrivacy } from "@/pages/student";
import { DoctorLayout, DoctorDashboard, DoctorScans, DoctorScanDetail, DoctorAnalysis, DoctorProfile } from "@/pages/doctor";
import { AdminLayout, AdminDashboard, AdminUsers, AdminScans, AdminAnalysis } from "@/pages/admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Routers for different roles to wrap layouts
function StudentApp() {
  return (
    <RoleGuard allowedRoles={["student"]}>
      <StudentLayout>
        <Switch>
          <Route path="/student/dashboard" component={StudentDashboard} />
          <Route path="/student/upload" component={StudentUpload} />
          <Route path="/student/history" component={StudentHistory} />
          <Route path="/student/result/:id" component={StudentResult} />
          <Route path="/student/profile" component={StudentProfile} />
          <Route path="/student/notifications" component={StudentNotifications} />
          <Route path="/student/data-privacy" component={StudentDataPrivacy} />
          <Route component={NotFound} />
        </Switch>
      </StudentLayout>
    </RoleGuard>
  );
}

function DoctorApp() {
  return (
    <RoleGuard allowedRoles={["doctor"]}>
      <DoctorLayout>
        <Switch>
          <Route path="/doctor/dashboard" component={DoctorDashboard} />
          <Route path="/doctor/scans" component={DoctorScans} />
          <Route path="/doctor/scan/:id" component={DoctorScanDetail} />
          <Route path="/doctor/analysis" component={DoctorAnalysis} />
          <Route path="/doctor/profile" component={DoctorProfile} />
          <Route component={NotFound} />
        </Switch>
      </DoctorLayout>
    </RoleGuard>
  );
}

function AdminApp() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AdminLayout>
        <Switch>
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/users" component={AdminUsers} />
          <Route path="/admin/scans" component={AdminScans} />
          <Route path="/admin/analysis" component={AdminAnalysis} />
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    </RoleGuard>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Auth Routes */}
      <Route path="/" component={Splash} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/verify-code" component={VerifyCode} />
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* Protected Routes nested by role */}
      <Route path="/student/*" component={StudentApp} />
      <Route path="/doctor/*" component={DoctorApp} />
      <Route path="/admin/*" component={AdminApp} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
