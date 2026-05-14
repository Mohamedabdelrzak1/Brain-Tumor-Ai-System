import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, TooltipProvider } from "@/shared/ui";
import { AuthProvider, RoleGuard } from "@/shared/lib/auth";

// Auth pages
import {
  Splash,
  Login,
  Register,
  ForgotPassword,
  VerifyCode,
  ResetPassword,
} from "@/pages/auth";

// Student pages
import AnalysisDetailsStudent, {
  StudentLayout,
  StudentDashboard,
 
  StudentAnalysis,
 
  StudentProfile,
  StudentNotifications,
  
  StudentScanDetail,
  StudentScans,
  SupportPageStudent,
  FaqPageStudent,
  AboutPageStudent,
  PrivacyPageStudent,
} from "@/pages/student";

// Doctor pages
import AnalysisDetailsDoctor, {
  DoctorLayout,
  DoctorDashboard,
  DoctorScans,
  DoctorScanDetail,
  DoctorAnalysis,
  DoctorProfile,
  AboutPage,
  PrivacyPage,
  FaqPage,
  SupportPage,
  TumorTypes,
  DoctorNotifications,
} from "@/pages/doctor";

// Admin pages
import AnalysisDetails, {
  AdminLayout,
  AdminDashboard,
  AdminUsers,
  AdminScans,
  AdminAnalysis,
  AdminTumorTypes,
  AdminProfile,
} from "@/pages/admin";

// 🔥 مهم جدًا تضيف ده
import { ScanDetails } from "@/pages/admin";

import NotFound from "@/pages/not-found";


const queryClient = new QueryClient();

///////////////////////////////////////////////////////////
// 🧑‍🎓 STUDENT
///////////////////////////////////////////////////////////


function StudentApp() {
  return (
    <RoleGuard allowedRoles={["student"]}>
      
        <StudentLayout>

          <Switch>

           

            <Route path="/student/scans" component={StudentScans} />

            <Route path="/student/scan/:id" component={StudentScanDetail} />

            <Route path="/student/analysis" component={StudentAnalysis} />

            <Route path="/student/analysis/:id" component={AnalysisDetailsStudent} />

            <Route path="/student/profile" component={StudentProfile} />

            <Route path="/student/notifications" component={StudentNotifications} />

           
          {/* 👤 Profile */}
        
          <Route path="/student/tumor-types" component={TumorTypes} />


          {/* 🔐 Privacy */}
          <Route path="/student/privacy" component={PrivacyPageStudent} />

          {/* 🧠 About */}
          <Route path="/student/about" component={AboutPageStudent} />

          {/* ❓ FAQ */}
          <Route path="/student/faq" component={FaqPageStudent} />

          {/* 💬 Support */}
          <Route path="/student/support" component={SupportPageStudent} />

           <Route path="/student/dashboard" component={StudentDashboard} />

          {/* ❌ Not Found */}
          <Route component={NotFound} />

           

          </Switch>

        </StudentLayout>
      
    </RoleGuard>
  );
}
///////////////////////////////////////////////////////////
// 👨‍⚕️ DOCTOR
///////////////////////////////////////////////////////////

function DoctorApp() {
  return (
    <RoleGuard allowedRoles={["doctor"]}>
      <DoctorLayout>
        <Switch>

          {/* 🧠 Dashboard */}
          <Route path="/doctor/dashboard" component={DoctorDashboard} />

          {/* 📂 Scans */}
          <Route path="/doctor/scans" component={DoctorScans} />

          {/* 📄 Scan Details */}
          <Route path="/doctor/scan/:id" component={DoctorScanDetail} />

          {/* 🧠 All Analysis */}
          <Route path="/doctor/analysis" component={DoctorAnalysis} />

          {/* 🔥 Analysis Details */}
          <Route path="/doctor/analysis/:id" component={AnalysisDetailsDoctor} />

          {/* 👤 Profile */}
          <Route path="/doctor/profile" component={DoctorProfile} />
          <Route path="/doctor/tumor-types" component={TumorTypes} />

            <Route path="/doctor/notifications" component={DoctorNotifications} />

          {/* 🔐 Privacy */}
          <Route path="/doctor/privacy" component={PrivacyPage} />

          {/* 🧠 About */}
          <Route path="/doctor/about" component={AboutPage} />

          {/* ❓ FAQ */}
          <Route path="/doctor/faq" component={FaqPage} />

          {/* 💬 Support */}
          <Route path="/doctor/support" component={SupportPage} />

          {/* ❌ Not Found */}
          <Route component={NotFound} />

        </Switch>
      </DoctorLayout>
    </RoleGuard>
  );
}

///////////////////////////////////////////////////////////
// 🧑‍💼 ADMIN
///////////////////////////////////////////////////////////

function AdminApp() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AdminLayout>
        <Switch>

          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/users" component={AdminUsers} />

          {/* 🔥 المهم */}
          <Route path="/admin/scans" component={AdminScans} />
          <Route path="/admin/scans/:id" component={ScanDetails} />

          <Route path="/admin/analysis" component={AdminAnalysis} />
         <Route path="/admin/analysis/:id" component={AnalysisDetails} />
         <Route path="/admin/tumor-types" component={AdminTumorTypes} />
         <Route path="/admin/profile" component={AdminProfile} />
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    </RoleGuard>
  );
}

///////////////////////////////////////////////////////////
// 🌐 MAIN ROUTER
///////////////////////////////////////////////////////////

function Router() {
  return (
    <Switch>

      {/* Auth */}
      <Route path="/" component={Splash} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/verify-code" component={VerifyCode} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* Roles */}
      <Route path="/student/*" component={StudentApp} />
      <Route path="/doctor/*" component={DoctorApp} />
      <Route path="/admin/*" component={AdminApp} />

      <Route component={NotFound} />
    </Switch>
  );
}

///////////////////////////////////////////////////////////
// 🚀 APP
///////////////////////////////////////////////////////////

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