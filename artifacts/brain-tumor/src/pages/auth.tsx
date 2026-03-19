import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, ChevronLeft, CheckCircle2, Circle, Brain, Shield, Activity, Users } from "lucide-react";
import {
  useLogin, useRegister, useForgotPassword, useVerifyCode, useResetPassword,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

// ─── BrainIcon SVG ────────────────────────────────────────────────────────────
function BrainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" />
    </svg>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 mb-8">
      <div className="w-9 h-9 rounded-xl bg-[#2EC4A5] flex items-center justify-center flex-shrink-0">
        <BrainIcon className="w-5 h-5 text-white" />
      </div>
      <span className={`font-bold text-lg ${dark ? "text-white" : "text-slate-800"}`}>Brain Tumor</span>
    </div>
  );
}

// ─── Responsive Auth Shell ─────────────────────────────────────────────────────
// Desktop: left branding panel + right form panel
// Mobile: centered card
function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-[#1a9e84] via-[#2EC4A5] to-[#3dd9bb] flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <BrainIcon className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-white text-xl">Brain Tumor</span>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            AI-Powered<br />Brain Tumor<br />Detection
          </h1>
          <p className="text-white/80 text-base leading-relaxed mb-10">
            Advanced MRI analysis using deep learning models to detect and classify brain tumors with clinical-grade accuracy.
          </p>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: Activity, text: "Real-time AI Analysis" },
              { icon: Shield, text: "Secure & Private Data" },
              { icon: Users, text: "Multi-role Access Control" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 bg-white/15 backdrop-blur rounded-xl px-4 py-3">
                <f.icon className="w-5 h-5 text-white/90 flex-shrink-0" />
                <span className="text-white/90 text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Demo credentials */}
        <div className="relative z-10 bg-white/10 backdrop-blur rounded-2xl p-5">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-3">Demo Accounts</p>
          <div className="space-y-2">
            {[
              ["Admin", "admin@braintumor.com", "Admin123"],
              ["Doctor", "doctor@braintumor.com", "Doctor123"],
              ["Student", "student@braintumor.com", "Student123"],
            ].map(([role, email, pass]) => (
              <div key={role} className="flex items-center justify-between text-xs">
                <span className="text-white/60">{role}</span>
                <span className="text-white/80 font-mono">{email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-4 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl lg:shadow-2xl p-8 lg:p-10">
          <Logo />
          <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">{title}</h2>
          <p className="text-slate-400 text-sm mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Shared components ─────────────────────────────────────────────────────────
function GreenBtn({ children, disabled, onClick, type = "submit" }: {
  children: React.ReactNode; disabled?: boolean; onClick?: () => void; type?: "submit" | "button";
}) {
  return (
    <button type={type} disabled={disabled} onClick={onClick}
      className="w-full bg-[#2EC4A5] hover:bg-[#28b096] active:bg-[#22987e] text-white font-semibold py-4 rounded-2xl text-base transition-colors disabled:opacity-60 shadow-lg shadow-[#2EC4A5]/20">
      {children}
    </button>
  );
}

function TextInput({ type = "text", placeholder, rightIcon, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { rightIcon?: React.ReactNode; error?: string }) {
  return (
    <div>
      <div className="relative">
        <input type={type} placeholder={placeholder}
          className={`w-full px-4 py-3.5 bg-slate-50 border ${error ? "border-red-400" : "border-slate-200"} rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#2EC4A5] focus:ring-2 focus:ring-[#2EC4A5]/20 transition-all ${rightIcon ? "pr-12" : ""}`}
          {...props} />
        {rightIcon && <div className="absolute inset-y-0 right-0 pr-4 flex items-center">{rightIcon}</div>}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs text-slate-400 font-medium">OR</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function SocialBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button type="button" className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-2xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
      {icon} {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
export function Splash() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a9e84] via-[#2EC4A5] to-[#3dd9bb] flex flex-col lg:flex-row">
      {/* Left: branding */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 text-center lg:text-left relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-white/10 rounded-full" />
        </div>
        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-3 mb-10 justify-center lg:justify-start">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <BrainIcon className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-white text-2xl">Brain Tumor</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight mb-5">
            Smart<br />Diagnosis
          </h1>
          <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-sm mx-auto lg:mx-0">
            AI-powered analysis of brain MRI images using deep learning models for brain tumor detection.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { n: "99%", l: "Accuracy" },
              { n: "<1s", l: "Analysis" },
              { n: "3", l: "Roles" },
            ].map(s => (
              <div key={s.l} className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center">
                <p className="text-white font-bold text-2xl">{s.n}</p>
                <p className="text-white/70 text-xs mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: CTA */}
      <div className="lg:w-96 xl:w-[420px] flex flex-col items-center justify-center p-8 lg:p-12">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full bg-white rounded-3xl p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Get Started</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to access your personalized dashboard.</p>
          <div className="space-y-4">
            <button
              onClick={() => setLocation("/login")}
              className="w-full bg-[#2EC4A5] hover:bg-[#28b096] text-white font-semibold py-4 rounded-2xl text-base transition-colors shadow-lg shadow-[#2EC4A5]/25"
            >
              Sign In
            </button>
            <button
              onClick={() => setLocation("/register")}
              className="w-full border-2 border-slate-200 hover:border-[#2EC4A5] text-slate-700 hover:text-[#2EC4A5] font-semibold py-4 rounded-2xl text-base transition-colors"
            >
              Create Account
            </button>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-3">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {(["admin", "doctor", "student"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setLocation(`/login?role=${r}`)}
                  className="py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 capitalize"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPw, setShowPw] = useState(false);
  const [, setLocation] = useLocation();
  const [search] = useState(() => typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null);
  const roleHint = search?.get("role");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: roleHint ? `${roleHint}@braintumor.com` : "",
      password: roleHint ? `${roleHint.charAt(0).toUpperCase() + roleHint.slice(1)}123` : "",
    },
  });

  const mutation = useLogin({
    mutation: {
      onSuccess: (data) => { login(data.token, data.user); },
      onError: (err: any) => { toast({ title: err?.data?.message || "Invalid credentials", variant: "destructive" }); },
    },
  });

  const autofill = (role: string) => {
    form.setValue("email", `${role}@braintumor.com`);
    form.setValue("password", `${role.charAt(0).toUpperCase() + role.slice(1)}123`);
  };

  const e = form.formState.errors;

  return (
    <AuthShell title="Sign In" subtitle="Welcome back! Log in to check your results.">
      <form onSubmit={form.handleSubmit((d) => mutation.mutate({ data: d }))} className="space-y-4">
        <TextInput {...form.register("email")} type="email" placeholder="Email Address" error={e.email?.message} />
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-slate-400">Password</span>
            <Link href="/forgot-password" className="text-xs text-[#2EC4A5] font-medium hover:underline">Forgot Password?</Link>
          </div>
          <TextInput {...form.register("password")} type={showPw ? "text" : "password"} placeholder="Password" error={e.password?.message}
            rightIcon={
              <button type="button" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            }
          />
        </div>
        <div className="pt-1">
          <GreenBtn disabled={mutation.isPending}>{mutation.isPending ? "Signing in..." : "Sign In"}</GreenBtn>
        </div>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Don't have an account?{" "}
        <Link href="/register" className="text-[#2EC4A5] font-semibold hover:underline">Sign Up</Link>
      </p>

      <div className="mt-4">
        <p className="text-xs text-center text-slate-400 mb-2">Quick demo login</p>
        <div className="grid grid-cols-3 gap-2">
          {(["admin", "doctor", "student"] as const).map((r) => (
            <button key={r} type="button" onClick={() => autofill(r)}
              className="py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 capitalize hover:border-[#2EC4A5] hover:text-[#2EC4A5] transition-colors">
              {r}
            </button>
          ))}
        </div>
      </div>

      <OrDivider />
      <div className="space-y-3">
        <SocialBtn icon={<GoogleIcon />} label="Login Using Google" />
        <SocialBtn icon={<FacebookIcon />} label="Login Using Facebook" />
      </div>
    </AuthShell>
  );
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Min 6 characters"),
  confirmPassword: z.string(),
  organization: z.string().optional(),
  role: z.enum(["admin", "doctor", "student"]).default("student"),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] });

export function Register() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", password: "", confirmPassword: "", organization: "", role: "student" },
  });

  const mutation = useRegister({
    mutation: {
      onSuccess: (data) => { toast({ title: "Account created!" }); login(data.token, data.user); },
      onError: (err: any) => { toast({ title: err?.data?.message || "Registration failed", variant: "destructive" }); },
    },
  });

  const e = form.formState.errors;

  return (
    <AuthShell title="Sign UP" subtitle="Create your account to start analyzing MRI scans.">
      <form onSubmit={form.handleSubmit((d) => mutation.mutate({ data: d }))} className="space-y-3">
        <TextInput {...form.register("fullName")} placeholder="Full Name" error={e.fullName?.message} />
        <TextInput {...form.register("email")} type="email" placeholder="Email Address" error={e.email?.message} />
        <TextInput {...form.register("password")} type={showPw ? "text" : "password"} placeholder="Password" error={e.password?.message}
          rightIcon={<button type="button" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}</button>}
        />
        <TextInput {...form.register("confirmPassword")} type={showCpw ? "text" : "password"} placeholder="Confirm Password" error={e.confirmPassword?.message}
          rightIcon={<button type="button" onClick={() => setShowCpw(!showCpw)}>{showCpw ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}</button>}
        />
        <TextInput {...form.register("organization")} placeholder="Organization (optional)" />
        <div>
          <label className="text-xs text-slate-400 block mb-1.5">Account Type</label>
          <select {...form.register("role")} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#2EC4A5]">
            <option value="student">Student / Patient</option>
            <option value="doctor">Doctor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="pt-1">
          <GreenBtn disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Sign Up"}</GreenBtn>
        </div>
      </form>
      <p className="text-center text-sm text-slate-500 mt-5">
        Already have an account?{" "}
        <Link href="/login" className="text-[#2EC4A5] font-semibold hover:underline">Sign In</Link>
      </p>
      <OrDivider />
      <div className="space-y-3">
        <SocialBtn icon={<GoogleIcon />} label="Login Using Google" />
        <SocialBtn icon={<FacebookIcon />} label="Login Using Facebook" />
      </div>
    </AuthShell>
  );
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
export function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const form = useForm({ resolver: zodResolver(z.object({ email: z.string().email() })), defaultValues: { email: "" } });
  const mutation = useForgotPassword({
    mutation: {
      onSuccess: () => { setSubmitted(true); toast({ title: "Code sent!" }); sessionStorage.setItem("resetEmail", form.getValues("email")); setLocation("/verify-code"); },
      onError: (err: any) => { toast({ title: err?.data?.message || "Error", variant: "destructive" }); },
    },
  });

  return (
    <AuthShell title="Forget Password" subtitle="Enter your email to reset your password.">
      <button onClick={() => setLocation("/login")} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium">
        <ChevronLeft className="w-4 h-4" /> Back to Sign In
      </button>
      <form onSubmit={form.handleSubmit((d) => mutation.mutate({ data: d }))} className="space-y-4">
        <TextInput {...form.register("email")} type="email" placeholder="Email Address" error={form.formState.errors.email?.message} />
        <GreenBtn disabled={mutation.isPending || submitted}>{mutation.isPending ? "Sending..." : "Send Code"}</GreenBtn>
      </form>
      <p className="text-center text-sm text-slate-500 mt-5">
        Don't have an account?{" "}
        <Link href="/register" className="text-[#2EC4A5] font-semibold hover:underline">Sign Up</Link>
      </p>
      <OrDivider />
      <div className="space-y-3">
        <SocialBtn icon={<GoogleIcon />} label="Login Using Google" />
        <SocialBtn icon={<FacebookIcon />} label="Login Using Facebook" />
      </div>
    </AuthShell>
  );
}

// ─── VERIFY CODE ──────────────────────────────────────────────────────────────
export function VerifyCode() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [code, setCode] = useState(["", "", "", ""]);
  const [seconds, setSeconds] = useState(103);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const timeStr = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const mutation = useVerifyCode({
    mutation: {
      onSuccess: () => { sessionStorage.setItem("resetCode", code.join("")); setLocation("/reset-password"); },
      onError: (err: any) => { toast({ title: err?.data?.message || "Invalid code", variant: "destructive" }); },
    },
  });

  const handleInput = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const newCode = [...code]; newCode[i] = digit; setCode(newCode);
    if (digit && i < 3) inputRefs.current[i + 1]?.focus();
  };
  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };
  const handleVerify = () => {
    const email = sessionStorage.getItem("resetEmail") || "";
    const fullCode = code.join("");
    if (fullCode.length < 4) { toast({ title: "Enter 4-digit code", variant: "destructive" }); return; }
    mutation.mutate({ data: { email, code: fullCode } });
  };

  return (
    <AuthShell title="Verification" subtitle="Enter the verification code sent to your email.">
      <button onClick={() => setLocation("/forgot-password")} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <div className="flex gap-3 justify-center mb-6">
        {code.map((digit, i) => (
          <input key={i} ref={(el) => { inputRefs.current[i] = el; }} value={digit}
            onChange={(e) => handleInput(i, e.target.value)} onKeyDown={(e) => handleKey(i, e)} maxLength={1}
            className="w-16 h-16 text-center text-2xl font-bold border-2 border-slate-200 rounded-2xl focus:border-[#2EC4A5] focus:outline-none text-slate-800 bg-slate-50 transition-all" />
        ))}
      </div>
      <p className="text-center text-sm text-slate-500 mb-6">
        Code expires in <span className="text-[#2EC4A5] font-semibold">{timeStr}</span>
      </p>
      <GreenBtn type="button" disabled={mutation.isPending} onClick={handleVerify}>
        {mutation.isPending ? "Verifying..." : "Verify"}
      </GreenBtn>
      <button onClick={() => setSeconds(103)} className="mt-3 w-full py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50">
        Resend Code
      </button>
    </AuthShell>
  );
}

// ─── RESET PASSWORD ────────────────────────────────────────────────────────────
export function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPw, setShowPw] = useState(false);

  const form = useForm({
    resolver: zodResolver(z.object({ newPassword: z.string().min(6), confirmPassword: z.string() }).refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] })),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const pw = form.watch("newPassword");
  const hasMinLength = pw.length >= 6;
  const hasNumber = /\d/.test(pw);

  const mutation = useResetPassword({
    mutation: {
      onSuccess: () => { toast({ title: "Password reset!" }); sessionStorage.removeItem("resetEmail"); sessionStorage.removeItem("resetCode"); setLocation("/login"); },
      onError: (err: any) => { toast({ title: err?.data?.message || "Error", variant: "destructive" }); },
    },
  });

  const onSubmit = (data: any) => {
    const email = sessionStorage.getItem("resetEmail") || "";
    const code = sessionStorage.getItem("resetCode") || "";
    mutation.mutate({ data: { email, code, ...data } });
  };

  return (
    <AuthShell title="Reset Password" subtitle="Enter your new password below.">
      <button onClick={() => setLocation("/verify-code")} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TextInput {...form.register("newPassword")} type={showPw ? "text" : "password"} placeholder="New Password"
          error={form.formState.errors.newPassword?.message}
          rightIcon={<button type="button" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}</button>}
        />
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <p className="text-xs text-slate-500 font-medium">Your password must contain:</p>
          {[[hasMinLength, "At least 6 characters"], [hasNumber, "Contains a number"]].map(([ok, txt]) => (
            <div key={txt as string} className="flex items-center gap-2">
              {ok ? <CheckCircle2 className="w-4 h-4 text-[#2EC4A5]" /> : <Circle className="w-4 h-4 text-slate-300" />}
              <span className={`text-xs ${ok ? "text-[#2EC4A5]" : "text-slate-400"}`}>{txt as string}</span>
            </div>
          ))}
        </div>
        <TextInput {...form.register("confirmPassword")} type="password" placeholder="Confirm Password" error={form.formState.errors.confirmPassword?.message} />
        <GreenBtn disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Done"}</GreenBtn>
      </form>
    </AuthShell>
  );
}
