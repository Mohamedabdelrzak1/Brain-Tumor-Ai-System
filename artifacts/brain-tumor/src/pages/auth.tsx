import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, ChevronLeft, CheckCircle2, Circle } from "lucide-react";
import {
  useLogin,
  useRegister,
  useForgotPassword,
  useVerifyCode,
  useResetPassword,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

// ─── Shared shell ────────────────────────────────────────────────────────────
function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[390px] min-h-[700px] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col">
        {children}
      </div>
    </div>
  );
}

// Logo row
function Logo() {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="w-8 h-8 rounded-lg bg-[#2EC4A5] flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" />
        </svg>
      </div>
      <span className="font-bold text-slate-800 text-base">Brain Tumor</span>
    </div>
  );
}

// Green button
function GreenBtn({
  children,
  disabled,
  onClick,
  type = "submit",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "submit" | "button";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full bg-[#2EC4A5] hover:bg-[#28b096] active:bg-[#22987e] text-white font-semibold py-4 rounded-2xl text-base transition-colors disabled:opacity-60"
    >
      {children}
    </button>
  );
}

// Input with optional left/right slot
function Field({
  label,
  rightSlot,
  children,
}: {
  label?: string;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-500">{label}</span>
          {rightSlot}
        </div>
      )}
      {children}
    </div>
  );
}

function TextInput({
  type = "text",
  placeholder,
  rightIcon,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  rightIcon?: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          className={`w-full px-4 py-3.5 bg-white border ${error ? "border-red-400" : "border-slate-200"} rounded-xl text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:border-[#2EC4A5] focus:ring-2 focus:ring-[#2EC4A5]/20 transition-all ${rightIcon ? "pr-12" : ""}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-xs text-slate-400 font-medium">OR</span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function SocialBtn({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-2xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
    >
      {icon}
      {label}
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
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4">
      <div className="bg-white w-full max-w-[390px] min-h-[700px] rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center justify-between py-16 px-8">
        <div />
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center gap-6 w-full"
        >
          <div className="w-56 h-56 rounded-3xl bg-slate-50 overflow-hidden flex items-center justify-center shadow-inner">
            <img
              src={`${import.meta.env.BASE_URL}images/splash-brain.png`}
              alt="Brain"
              className="w-48 h-48 object-contain"
            />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-800 mb-3">Smart Diagnosis</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              AI-powered analysis of brain MRI images using deep learning models for brain tumor detection.
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full"
        >
          <GreenBtn
            type="button"
            onClick={() => setLocation(user ? `/${user.role}/dashboard` : "/login")}
          >
            Continue
          </GreenBtn>
        </motion.div>
      </div>
    </div>
  );
}

// ─── SIGN UP ─────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string(),
    organization: z.string().optional(),
    role: z.enum(["admin", "doctor", "student"]).default("student"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

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
      onSuccess: (data) => {
        toast({ title: "Account created!" });
        login(data.token, data.user);
      },
      onError: (err: any) => {
        toast({ title: err?.data?.message || "Registration failed", variant: "destructive" });
      },
    },
  });

  const onSubmit = (data: z.infer<typeof registerSchema>) => mutation.mutate({ data });

  const e = form.formState.errors;

  return (
    <MobileShell>
      <div className="flex-1 overflow-y-auto px-7 py-8">
        <Logo />
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Sign UP</h2>
        <p className="text-slate-400 text-sm mb-7">
          Create your account to start analyzing MRI scans safely.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field>
            <TextInput
              {...form.register("fullName")}
              placeholder="Full Name"
              error={e.fullName?.message}
            />
          </Field>
          <Field>
            <TextInput
              {...form.register("email")}
              type="email"
              placeholder="Email Address"
              error={e.email?.message}
            />
          </Field>
          <Field>
            <TextInput
              {...form.register("password")}
              type={showPw ? "text" : "password"}
              placeholder="Password"
              error={e.password?.message}
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              }
            />
          </Field>
          <Field>
            <TextInput
              {...form.register("confirmPassword")}
              type={showCpw ? "text" : "password"}
              placeholder="Confirm Password"
              error={e.confirmPassword?.message}
              rightIcon={
                <button type="button" onClick={() => setShowCpw(!showCpw)}>
                  {showCpw ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              }
            />
          </Field>
          <Field>
            <TextInput
              {...form.register("organization")}
              placeholder="Organization"
            />
          </Field>
          <Field label="Account Type">
            <select
              {...form.register("role")}
              className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-[#2EC4A5]"
            >
              <option value="student">Student / Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </Field>

          <div className="pt-1">
            <GreenBtn disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Sign Up"}
            </GreenBtn>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{" "}
          <Link href="/login" className="text-[#2EC4A5] font-semibold">
            Sign In
          </Link>
        </p>

        <OrDivider />
        <div className="flex flex-col gap-3">
          <SocialBtn icon={<GoogleIcon />} label="Login Using Google" />
          <SocialBtn icon={<FacebookIcon />} label="Login Using Facebook" />
        </div>
      </div>
    </MobileShell>
  );
}

// ─── SIGN IN ─────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPw, setShowPw] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
      },
      onError: (err: any) => {
        toast({ title: err?.data?.message || "Invalid credentials", variant: "destructive" });
      },
    },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => mutation.mutate({ data });

  const autofill = (role: string) => {
    form.setValue("email", `${role}@braintumor.com`);
    form.setValue("password", `${role.charAt(0).toUpperCase() + role.slice(1)}123`);
  };

  const e = form.formState.errors;

  return (
    <MobileShell>
      <div className="flex-1 overflow-y-auto px-7 py-8 flex flex-col">
        <Logo />
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Sign In</h2>
        <p className="text-slate-400 text-sm mb-7">
          Welcome back! Log in to check your results.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Field>
            <TextInput
              {...form.register("email")}
              type="email"
              placeholder="Email Address"
              error={e.email?.message}
            />
          </Field>
          <Field
            rightSlot={
              <Link href="/forgot-password" className="text-xs text-[#2EC4A5] font-medium">
                Forgot Password?
              </Link>
            }
          >
            <TextInput
              {...form.register("password")}
              type={showPw ? "text" : "password"}
              placeholder="Password"
              error={e.password?.message}
              rightIcon={
                <button type="button" onClick={() => setShowPw(!showPw)}>
                  {showPw ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              }
            />
          </Field>

          <div className="pt-1">
            <GreenBtn disabled={mutation.isPending}>
              {mutation.isPending ? "Signing in..." : "Sign In"}
            </GreenBtn>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#2EC4A5] font-semibold">
            Sign Up
          </Link>
        </p>

        {/* Quick login */}
        <div className="mt-4">
          <p className="text-xs text-center text-slate-400 mb-2">Quick demo login</p>
          <div className="grid grid-cols-3 gap-2">
            {(["admin", "doctor", "student"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => autofill(r)}
                className="py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 capitalize"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <OrDivider />
        <div className="flex flex-col gap-3">
          <SocialBtn icon={<GoogleIcon />} label="Login Using Google" />
          <SocialBtn icon={<FacebookIcon />} label="Login Using Facebook" />
        </div>
      </div>
    </MobileShell>
  );
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
const forgotSchema = z.object({ email: z.string().email("Invalid email") });

export function ForgotPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const mutation = useForgotPassword({
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
        toast({ title: "Code sent!", description: "Check your email for the verification code." });
        // Store email for verify screen
        sessionStorage.setItem("resetEmail", form.getValues("email"));
        setLocation("/verify-code");
      },
      onError: (err: any) => {
        toast({ title: err?.data?.message || "Error sending code", variant: "destructive" });
      },
    },
  });

  const onSubmit = (data: z.infer<typeof forgotSchema>) => mutation.mutate({ data });

  return (
    <MobileShell>
      <div className="flex-1 px-7 py-8 flex flex-col">
        <button
          onClick={() => setLocation("/login")}
          className="flex items-center gap-1 text-slate-600 mb-6 hover:text-slate-800 w-fit"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <Logo />
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Forget Password</h2>
        <p className="text-slate-400 text-sm mb-7">
          Enter your email to reset your password.
        </p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <TextInput
            {...form.register("email")}
            type="email"
            placeholder="Email Address"
            error={form.formState.errors.email?.message}
          />
          <div className="pt-1">
            <GreenBtn disabled={mutation.isPending || submitted}>
              {mutation.isPending ? "Sending..." : "Send"}
            </GreenBtn>
          </div>
        </form>

        <button
          onClick={() => setLocation("/login")}
          className="text-sm text-slate-500 hover:text-slate-700 mt-5 text-center"
        >
          Back to sign in
        </button>

        <p className="text-center text-sm text-slate-500 mt-3">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#2EC4A5] font-semibold">
            Sign Up
          </Link>
        </p>

        <OrDivider />
        <div className="flex flex-col gap-3">
          <SocialBtn icon={<GoogleIcon />} label="Login Using Google" />
          <SocialBtn icon={<FacebookIcon />} label="Login Using Facebook" />
        </div>
      </div>
    </MobileShell>
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
      onSuccess: () => {
        sessionStorage.setItem("resetCode", code.join(""));
        setLocation("/reset-password");
      },
      onError: (err: any) => {
        toast({ title: err?.data?.message || "Invalid code", variant: "destructive" });
      },
    },
  });

  const handleInput = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[i] = digit;
    setCode(newCode);
    if (digit && i < 3) inputRefs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const email = sessionStorage.getItem("resetEmail") || "";
    const fullCode = code.join("");
    if (fullCode.length < 4) {
      toast({ title: "Enter 4-digit code", variant: "destructive" });
      return;
    }
    mutation.mutate({ data: { email, code: fullCode } });
  };

  return (
    <MobileShell>
      <div className="flex-1 px-7 py-8 flex flex-col">
        <button
          onClick={() => setLocation("/forgot-password")}
          className="flex items-center gap-1 text-slate-600 mb-6 hover:text-slate-800 w-fit"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <Logo />
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Verification</h2>
        <p className="text-slate-400 text-sm mb-10">Enter verification code</p>

        <div className="flex gap-4 justify-center mb-6">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKey(i, e)}
              maxLength={1}
              className="w-16 h-16 text-center text-2xl font-bold border-2 border-slate-200 rounded-2xl focus:border-[#2EC4A5] focus:outline-none focus:ring-2 focus:ring-[#2EC4A5]/20 text-slate-800 bg-slate-50 transition-all"
            />
          ))}
        </div>

        <p className="text-center text-sm text-slate-500 mb-8">
          Code expires in{" "}
          <span className="text-[#2EC4A5] font-semibold">{timeStr}</span>
        </p>

        <GreenBtn type="button" disabled={mutation.isPending} onClick={handleVerify}>
          {mutation.isPending ? "Verifying..." : "Verify"}
        </GreenBtn>

        <button
          onClick={() => setSeconds(103)}
          className="mt-4 w-full py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
        >
          Resend
        </button>
      </div>
    </MobileShell>
  );
}

// ─── RESET PASSWORD ────────────────────────────────────────────────────────────
const resetSchema = z
  .object({
    newPassword: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPw, setShowPw] = useState(false);

  const form = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const pw = form.watch("newPassword");
  const hasMinLength = pw.length >= 6;
  const hasNumber = /\d/.test(pw);

  const mutation = useResetPassword({
    mutation: {
      onSuccess: () => {
        toast({ title: "Password reset!" });
        sessionStorage.removeItem("resetEmail");
        sessionStorage.removeItem("resetCode");
        setLocation("/login");
      },
      onError: (err: any) => {
        toast({ title: err?.data?.message || "Error resetting password", variant: "destructive" });
      },
    },
  });

  const onSubmit = (data: z.infer<typeof resetSchema>) => {
    const email = sessionStorage.getItem("resetEmail") || "";
    const code = sessionStorage.getItem("resetCode") || "";
    mutation.mutate({ data: { email, code, newPassword: data.newPassword, confirmPassword: data.confirmPassword } });
  };

  return (
    <MobileShell>
      <div className="flex-1 px-7 py-8 flex flex-col">
        <button
          onClick={() => setLocation("/verify-code")}
          className="flex items-center gap-1 text-slate-600 mb-6 hover:text-slate-800 w-fit"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <Logo />
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Reset Password</h2>
        <p className="text-slate-400 text-sm mb-7">Enter your new password</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <TextInput
            {...form.register("newPassword")}
            type={showPw ? "text" : "password"}
            placeholder="••••••••••••"
            error={form.formState.errors.newPassword?.message}
            rightIcon={
              <button type="button" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            }
          />

          {/* Requirements checklist */}
          <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2">
            <p className="text-xs text-slate-500 font-medium">Your Password must contains:</p>
            <div className="flex items-center gap-2">
              {hasMinLength ? (
                <CheckCircle2 className="w-4 h-4 text-[#2EC4A5]" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300" />
              )}
              <span className={`text-xs ${hasMinLength ? "text-[#2EC4A5]" : "text-slate-400"}`}>
                At least 6 characters
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasNumber ? (
                <CheckCircle2 className="w-4 h-4 text-[#2EC4A5]" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300" />
              )}
              <span className={`text-xs ${hasNumber ? "text-[#2EC4A5]" : "text-slate-400"}`}>
                Contains a number
              </span>
            </div>
          </div>

          <TextInput
            {...form.register("confirmPassword")}
            type="password"
            placeholder="Confirm Password"
            error={form.formState.errors.confirmPassword?.message}
          />

          <div className="pt-1">
            <GreenBtn disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : "Done"}
            </GreenBtn>
          </div>
        </form>
      </div>
    </MobileShell>
  );
}
