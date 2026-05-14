import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, ChevronLeft, CheckCircle2, Circle, Shield, Activity, Users, Brain, ShieldCheck, Upload, Cpu, CheckCircle } from "lucide-react";
import {
  useRegister, useForgotPassword, useVerifyCode, useResetPassword,
} from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import type { RegisterRequest } from "@workspace/api-client-react";
import { navigate } from "wouter/use-browser-location";
import { apiFetchJson } from "@/lib/api7138"; // أو مكانه عندك

// ─── BrainIcon SVG ────────────────────────────────────────────────────────────
function BrainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26C17.81 13.47 19 11.38 19 9c0-3.87-3.13-7-7-7z" />
    </svg>
  );
}

function AnimatedBrain({ className }: { className?: string }) {
  return (
    <div className={className}>
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full bg-white/10 blur-2xl"
        animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.svg
        viewBox="0 0 420 420"
        className="relative z-10 w-full h-full"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <defs>
          <radialGradient id="brainGlow" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.18)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
          </radialGradient>
          <linearGradient id="brainStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.92)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.55)" />
          </linearGradient>
        </defs>

        <circle cx="210" cy="210" r="170" fill="url(#brainGlow)" />

        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M210 95c-40 0-72 27-72 67 0 9 1 17 4 25-18 12-28 30-28 52 0 34 24 60 58 62 8 17 23 28 42 28 18 0 33-9 41-24 8 15 23 24 41 24 19 0 34-11 42-28 34-2 58-28 58-62 0-22-10-40-28-52 3-8 4-16 4-25 0-40-32-67-72-67-22 0-41 9-55 23-14-14-33-23-55-23z"
            fill="rgba(255,255,255,0.10)"
            stroke="url(#brainStroke)"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />

          {[
            "M210 118c-18 0-32 12-32 30 0 8 3 15 8 20-10 6-16 15-16 26 0 18 13 31 30 33",
            "M210 118c18 0 32 12 32 30 0 8-3 15-8 20 10 6 16 15 16 26 0 18-13 31-30 33",
            "M170 210c10-8 25-10 40-6",
            "M250 210c-10-8-25-10-40-6",
            "M190 254c8-6 18-8 28-6",
            "M230 254c-8-6-18-8-28-6",
          ].map((d, i) => (
            <motion.path
              key={i}
              d={d}
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0.2 }}
              animate={{ pathLength: [0, 1, 1], opacity: [0.2, 0.75, 0.55] }}
              transition={{ duration: 1.6, delay: 0.15 + i * 0.08, ease: "easeOut" }}
            />
          ))}
        </motion.g>

        <motion.g
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "210px 210px" }}
        >
          {[
            { r: 150, a: 25, s: 3.5 },
            { r: 150, a: 160, s: 4.25 },
            { r: 150, a: 265, s: 3.75 },
          ].map((p, idx) => {
            const rad = (p.a * Math.PI) / 180;
            const x = 210 + p.r * Math.cos(rad);
            const y = 210 + p.r * Math.sin(rad);
            return (
              <circle key={idx} cx={x} cy={y} r={p.s} fill="rgba(255,255,255,0.85)" opacity={0.9} />
            );
          })}
        </motion.g>
      </motion.svg>
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3 mb-8 group cursor-pointer">

      {/* ICON */}
      <div className="
        relative w-10 h-10 rounded-2xl
        bg-gradient-to-br from-[#2EC4A5] to-[#1fa88c]
        flex items-center justify-center
        shadow-md
        transition-all duration-300
        group-hover:scale-110 group-hover:shadow-lg
      ">

        {/* Glow */}
        <div className="
          pointer-events-none absolute inset-0 rounded-2xl
          opacity-0 group-hover:opacity-100
          bg-[#2EC4A5]/20 blur-xl
          transition duration-300
        " />

        <BrainIcon className="w-5 h-5 text-white relative z-10" />
      </div>

      {/* TEXT */}
      <div className="flex flex-col leading-tight">
        <span className={`font-bold text-lg tracking-tight ${dark ? "text-white" : "text-slate-800"}`}>
          Brain Tumor
        </span>

        <span className="text-[10px] text-slate-400 tracking-wide">
          AI Detection System
        </span>
      </div>

    </div>
  );
}

// ─── Responsive Auth Shell ─────────────────────────────────────────────────────
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
    <div className="min-h-screen lg:h-screen flex lg:overflow-hidden">

      {/* ================= LEFT SIDE ================= */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] bg-gradient-to-br from-[#1a9e84] via-[#2EC4A5] to-[#3dd9bb] flex-col justify-start p-12 relative overflow-hidden">
        
        {/* Background shapes */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full" />

        {/* ================= CONTENT ================= */}
        <div className="relative z-10 flex flex-col h-full">

          {/* 🔹 TOP (🔥 Animated Logo) */}
        <div className="mt-2 space-y-4">

            <div className="flex items-center gap-3">
<motion.div
 className="flex items-center gap-3 mb-4"
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
>

  {/* 🔥 ICON */}
  <motion.div
    className="relative w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden backdrop-blur-xl"
    
    initial={{ scale: 0.6, rotate: -20 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ duration: 0.6 }}

    whileHover={{ scale: 1.15, rotate: 8 }}
  >
    {/* 💫 Glow pulse */}
    <motion.div
      className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"
      animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
      transition={{ duration: 2.5, repeat: Infinity }}
    />

    {/* 🌊 Rotating light */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/5 to-transparent"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    />

    {/* ⚡ Shimmer */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{ duration: 2, repeat: Infinity }}
    />

    {/* 🧠 ICON */}
    <motion.div
      className="relative z-10"
      animate={{
        y: [0, -4, 0],
        rotate: [0, 6, -6, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Brain className="w-6 h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
    </motion.div>
  </motion.div>

  {/* 🔥 TEXT */}
  <motion.div
    className="flex flex-col leading-tight"
    initial="hidden"
    animate="show"
    variants={{
      hidden: {},
      show: { transition: { staggerChildren: 0.1 } },
    }}
  >
    <motion.span
      className="font-bold text-white text-lg tracking-wide"
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
      }}
    >
      Brain Tumor
    </motion.span>

    <motion.span
      className="text-white/70 text-sm"
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
      }}
    >
      AI Detection System
    </motion.span>
  </motion.div>

</motion.div>



            </div>

            {/* TITLE */}
            <motion.h1
              className="text-4xl font-bold text-white leading-tight"
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              AI-Powered<br />Brain Tumor<br />Detection
            </motion.h1>

            {/* DESCRIPTION */}
            <motion.p
              className="text-white/80 text-base leading-relaxed max-w-md"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              Advanced MRI analysis using deep learning models to detect and classify brain tumors with clinical-grade accuracy.
            </motion.p>
          </div>

          {/* 🔹 CENTER */}
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <AnimatedBrain className="w-44 h-44 opacity-80" />
            </motion.div>
          </div>

         <motion.div
  className="space-y-4 mb-6"
  initial="hidden"
  animate="show"
  variants={{
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }}
>
  {[
    { icon: Activity, text: "Instant AI-Powered Diagnosis" },
    { icon: Shield, text: "Enterprise-Grade Data Protection" },
    { icon: Users, text: "Medical-Grade Diagnostic Insights" },
  ].map((f, i) => (
    <motion.div
      key={f.text}
      className="
        relative flex items-center gap-4
        bg-white/10 backdrop-blur-xl
        rounded-2xl px-5 py-3
        border border-white/10
        overflow-hidden
        shadow-lg shadow-black/10
      "

      variants={{
        hidden: { opacity: 0, y: 50, scale: 0.85, rotateX: -20 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          transition: {
            duration: 0.6,
            ease: "easeOut",
          },
        },
      }}

      whileHover={{
        scale: 1.08,
        y: -6,
        rotateZ: 0.5,
      }}
    >
      {/* ✨ Glow خلفي */}
      <motion.div
        className="absolute inset-0 bg-white/10 blur-2xl opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      />

      {/* 💫 Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
        initial={{ x: "-120%" }}
        whileHover={{ x: "120%" }}
        transition={{ duration: 1 }}
      />

      {/* 🔥 ICON */}
      <motion.div
        className="relative z-10"
        animate={{ y: [0, -4, 0], rotate: [0, 3, -3, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: i * 0.2,
        }}
      >
        <f.icon className="w-5 h-5 text-white/90" />
      </motion.div>

      {/* TEXT */}
      <motion.span
        className="relative z-10 text-white/90 text-sm font-semibold tracking-wide"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 + i * 0.1 }}
      >
        {f.text}
      </motion.span>

    </motion.div>
  ))}
</motion.div>

        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-4 lg:p-12">
        <motion.div
          className="max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-md sm:shadow-xl lg:shadow-2xl p-6 sm:p-8 lg:p-10"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
         <motion.div
  className="flex items-center gap-3 mb-6"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>

  {/* ICON */}
  <motion.div
    className="
      relative w-11 h-11 rounded-xl
      bg-gradient-to-br from-[#2EC4A5] to-[#1fa88c]
      flex items-center justify-center
      shadow-md
    "
    whileHover={{ scale: 1.1, rotate: 6 }}
  >
    {/* glow */}
    <motion.div
      className="absolute inset-0 bg-white/20 blur-lg rounded-xl"
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 2, repeat: Infinity }}
    />

    <motion.div
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <Brain className="w-5 h-5 text-white relative z-10" />
    </motion.div>
  </motion.div>

  {/* TEXT */}
  <div className="leading-tight">
    <div className="text-slate-800 font-semibold">
      Brain Tumor
    </div>
    <div className="text-slate-400 text-xs">
      AI Detection System
    </div>
  </div>

</motion.div>


          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 mb-1">
            {title}
          </h2>

          <p className="text-slate-400 text-sm mb-8">
            {subtitle}
          </p>

          {children}
        </motion.div>
      </div>

    </div>
  );
}

// ─── Shared components ─────────────────────────────────────────────────────────
function GreenBtn({ children, disabled, onClick, type = "submit" }: {
  children: React.ReactNode; disabled?: boolean; onClick?: () => void; type?: "submit" | "button";
}) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? undefined : { y: -2, scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="
        w-full
        bg-[#2EC4A5] hover:bg-[#28b096] active:bg-[#22987e]
        text-white font-semibold
        py-2.5 text-sm
        rounded-xl
        transition-all
        disabled:opacity-60
        shadow-md shadow-[#2EC4A5]/20
        hover:shadow-lg
      "
    >
      {children}
    </motion.button>
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
          className={`
            w-full px-4 py-2.5
            bg-slate-50
            border ${error ? "border-red-400" : "border-slate-200"}
            rounded-xl
            text-slate-800 placeholder:text-slate-400 text-sm
            focus:outline-none
            focus:border-[#2EC4A5]
            focus:ring-2 focus:ring-[#2EC4A5]/20
            transition-all
            ${rightIcon ? "pr-12" : ""}
          `}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}
    </div>
  );
}

function OrDivider() {
  return (
    <div className="flex items-center gap-2 my-3">
      <div className="flex-1 h-px bg-slate-200" />
      <span className="text-[10px] text-slate-400 font-medium tracking-wide">
        OR
      </span>
      <div className="flex-1 h-px bg-slate-200" />
    </div>
  );
}

function SocialBtn({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="
        w-full flex items-center justify-center gap-2.5
        border border-slate-200
        rounded-xl
        py-2 text-sm
        font-medium text-slate-700
        hover:bg-slate-50
        transition-all
        shadow-sm hover:shadow-md
      "
    >
      <span className="flex items-center justify-center w-4 h-4">
        {icon}
      </span>

      <span>{label}</span>
    </motion.button>
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
  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">


    <section className="bg-gradient-to-br from-[#1a9e84] via-[#2EC4A5] to-[#3dd9bb] text-white px-6 lg:px-20 py-20 relative overflow-hidden">

      {/* 💫 Background glow */}
      <motion.div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-center relative z-10">

        {/* ================= LEFT ================= */}
        <div>
          
 <motion.div
  className="flex items-center gap-3 mb-10"
  initial={{ opacity: 0, y: -30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
>

  {/* 🔥 ICON */}
  <motion.div
    className="relative w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden backdrop-blur-xl"
    
    initial={{ scale: 0.6, rotate: -20 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ duration: 0.6 }}

    whileHover={{ scale: 1.15, rotate: 8 }}
  >
    {/* 💫 Glow pulse */}
    <motion.div
      className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"
      animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
      transition={{ duration: 2.5, repeat: Infinity }}
    />

    {/* 🌊 Rotating light */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/5 to-transparent"
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
    />

    {/* ⚡ Shimmer */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{ duration: 2, repeat: Infinity }}
    />

    {/* 🧠 ICON */}
    <motion.div
      className="relative z-10"
      animate={{
        y: [0, -4, 0],
        rotate: [0, 6, -6, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Brain className="w-6 h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
    </motion.div>
  </motion.div>

  {/* 🔥 TEXT */}
  <motion.div
    className="flex flex-col leading-tight"
    initial="hidden"
    animate="show"
    variants={{
      hidden: {},
      show: { transition: { staggerChildren: 0.1 } },
    }}
  >
    <motion.span
      className="font-bold text-white text-lg tracking-wide"
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
      }}
    >
      Brain Tumor
    </motion.span>

    <motion.span
      className="text-white/70 text-sm"
      variants={{
        hidden: { opacity: 0, y: 10 },
        show: { opacity: 1, y: 0 },
      }}
    >
      AI Detection System
    </motion.span>
  </motion.div>

</motion.div>
          {/* 🔥 TITLE */}
          <motion.h1
            className="text-4xl lg:text-6xl font-bold leading-tight mb-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="block"
            >
              AI-Powered
            </motion.span>

            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="block"
            >
              Brain Tumor
            </motion.span>

            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="block"
            >
              Detection
            </motion.span>
          </motion.h1>

          {/* 📝 DESCRIPTION */}
          <motion.p
            className="text-white/80 text-lg mb-8 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            Advanced MRI analysis using deep learning models to deliver accurate and fast tumor detection.
          </motion.p>

     <motion.div
  className="flex gap-4"
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 1.1 }}
>

  {/* 🔥 GET STARTED */}
  <motion.button
    onClick={() => navigate("/login")}
    className="
      group relative px-7 py-3 rounded-xl font-semibold
      bg-white text-[#2EC4A5]
      shadow-lg overflow-hidden
    "
    whileHover={{
      scale: 1.1,
      y: -4,
    }}
    whileTap={{ scale: 0.95 }}
  >

    {/* 💫 shimmer */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2EC4A5]/30 to-transparent"
      initial={{ x: "-100%" }}
      whileHover={{ x: "100%" }}
      transition={{ duration: 0.6 }}
    />

    {/* ✨ glow */}
    <div className="
      absolute inset-0 bg-white/20 blur-xl opacity-0
      group-hover:opacity-100 transition duration-300
    " />

    {/* TEXT */}
    <span className="relative z-10">
      Get Started
    </span>

  </motion.button>


<motion.button
  onClick={() => {
    document
      .getElementById("features")
      ?.scrollIntoView({ behavior: "smooth" });
  }}
  className="
    relative px-7 py-3 rounded-xl
    border border-white/30 text-white font-medium
    overflow-hidden group
  "
  whileHover={{ scale: 1.1, y: -4 }}
  whileTap={{ scale: 0.95 }}
>

  {/* 🔥 Animated border */}
  <motion.div
    className="absolute inset-0 rounded-xl"
    style={{
      background:
        "linear-gradient(120deg, transparent, rgba(255,255,255,0.6), transparent)",
    }}
    initial={{ x: "-100%" }}
    animate={{ x: "100%" }}
    transition={{
      duration: 2,
      repeat: Infinity,
      ease: "linear",
    }}
  />

  {/* ✨ Glow */}
  <motion.div
    className="absolute inset-0 bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition"
  />

  {/* TEXT */}
  <span className="relative z-10 flex items-center gap-2">
    Learn More
    <motion.span
      animate={{ x: [0, 6, 0] }}
      transition={{ repeat: Infinity, duration: 1 }}
    >
      →
    </motion.span>
  </span>
</motion.button>
 

</motion.div>

        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex justify-center relative">

          {/* 💫 Glow خلف brain */}
          <motion.div
            className="absolute w-80 h-80 bg-white/20 rounded-full blur-2xl"
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          {/* 🧠 BRAIN */}
          <motion.div
            animate={{
              y: [0, -15, 0],
              rotate: [0, 2, -2, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* لو عندك AnimatedBrain */}
            <AnimatedBrain className="w-72 h-72 relative z-10" />

            {/* أو لو عايز تستخدم أيقونة بدلها 👇 */}
            {/* <Brain className="w-40 h-40 text-white drop-shadow-lg" /> */}
          </motion.div>

        </div>

      </div>
    </section>

 <section
      id="features"
      className="relative py-32 px-6 lg:px-20 overflow-hidden bg-[#f8fbfa]"
    >

      {/* 🔥 Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f3fbf9] to-white" />

      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-[#2EC4A5]/10 blur-3xl rounded-full"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="relative max-w-6xl mx-auto">

        {/* ================= HEADER ================= */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-5xl font-extrabold text-slate-900 mb-5">
            Powerful AI Features
          </h2>

          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Built for real clinical workflows with precision, speed, and security.
          </p>
        </motion.div>

        {/* ================= GRID ================= */}
        <div className="grid md:grid-cols-3 gap-10">

          {[
            {
              title: "Instant AI Diagnosis",
              desc: "Upload MRI scans and receive accurate predictions in seconds using deep learning models.",
              icon: Brain,
            },
            {
              title: "Medical-Grade Accuracy",
              desc: "Trained on real clinical datasets to ensure high reliability in tumor detection.",
              icon: Activity,
            },
            {
              title: "Secure Patient Data",
              desc: "End-to-end encryption ensures full privacy and compliance with medical standards.",
              icon: ShieldCheck,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.2, duration: 0.6 }}

              whileHover={{
                y: -14,
                scale: 1.03,
              }}

              className="group relative rounded-3xl p-[1px] overflow-hidden"
            >

              {/* 🔥 Animated Border */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background:
                    "linear-gradient(120deg, transparent, rgba(46,196,165,0.6), transparent)",
                }}
                animate={{ x: ["-100%", "100%"] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />

              {/* ================= CARD ================= */}
              <div
                className="
                  relative h-full rounded-3xl p-8
                  bg-white/80 backdrop-blur-xl
                  border border-white/40
                  shadow-xl overflow-hidden
                "
              >

                {/* 🌌 Floating Particles */}
                <motion.div
                  className="absolute top-4 right-4 w-2 h-2 bg-[#2EC4A5] rounded-full opacity-40"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-6 left-6 w-1.5 h-1.5 bg-[#2EC4A5] rounded-full opacity-30"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />

                {/* ✨ Glow Hover */}
                <motion.div
                  className="absolute inset-0 bg-[#2EC4A5]/5 blur-2xl opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                {/* ⚡ Sweep Light */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  initial={{ x: "-120%" }}
                  whileHover={{ x: "120%" }}
                  transition={{ duration: 0.8 }}
                />

                {/* 🔥 ICON */}
                <motion.div
                  className="
                    w-14 h-14 mb-6 rounded-2xl
                    bg-gradient-to-br from-[#2EC4A5] to-[#1fa88c]
                    text-white flex items-center justify-center
                    shadow-lg relative z-10
                  "
                  whileHover={{ scale: 1.2, rotate: 8 }}
                >
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                    }}
                  >
                    <item.icon className="w-6 h-6" />
                  </motion.div>
                </motion.div>

                {/* ================= TEXT ================= */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 relative z-10">
                  {item.title}
                </h3>

                <p className="text-slate-500 leading-relaxed relative z-10">
                  {item.desc}
                </p>

                {/* 💥 Bottom Line */}
                <motion.div
                  className="absolute bottom-0 left-0 h-[3px] bg-[#2EC4A5]"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.4 }}
                />

              </div>
            </motion.div>
          ))}

        </div>
      </div>
    </section>

<section className="relative py-32 px-6 lg:px-20 bg-white overflow-hidden">

  {/* 💫 background subtle glow */}
  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#2EC4A5]/10 blur-3xl rounded-full" />

  <div className="relative max-w-6xl mx-auto">

    {/* HEADER */}
    <motion.div
      className="text-center mb-24"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      <h2 className="text-5xl font-extrabold text-slate-900">
        How It Works
      </h2>
    </motion.div>

    <div className="relative grid md:grid-cols-3 gap-16">

      {/* 🔥 animated line */}
      <motion.div
        className="hidden md:block absolute top-10 left-0 right-0 h-[3px] bg-gradient-to-r from-[#2EC4A5] to-transparent"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{ transformOrigin: "left" }}
      />

      {[
        {
          title: "Upload MRI Scan",
          desc: "Securely upload MRI images in seconds.",
          icon: Upload,
        },
        {
          title: "AI Processing",
          desc: "Deep learning models analyze the scan.",
          icon: Cpu,
        },
        {
          title: "Instant Results",
          desc: "Receive accurate predictions instantly.",
          icon: CheckCircle,
        },
      ].map((step, i) => (
        <motion.div
          key={i}
          className="relative text-center group"

          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.3 }}

          whileHover={{ y: -8 }}
        >

          {/* 🔢 STEP CIRCLE */}
          <motion.div
            className="
              w-16 h-16 mx-auto mb-6
              rounded-full bg-gradient-to-br from-[#2EC4A5] to-[#1fa88c]
              text-white flex items-center justify-center
              shadow-xl relative
            "

            whileHover={{ scale: 1.15 }}
          >

            {/* ✨ pulse */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white/30 blur-xl"
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* 🔥 ICON */}
            <motion.div
              animate={{
                y: [0, -3, 0],
                rotate: [0, 4, -4, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="relative z-10"
            >
              <step.icon className="w-6 h-6" />
            </motion.div>
          </motion.div>

          {/* TEXT */}
          <h3 className="font-bold text-lg mb-2 text-slate-900">
            {step.title}
          </h3>

          <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
            {step.desc}
          </p>

          {/* ⚡ bottom glow */}
          <motion.div
            className="h-[3px] bg-[#2EC4A5] mt-4 mx-auto rounded-full"
            initial={{ width: 0 }}
            whileHover={{ width: "60%" }}
            transition={{ duration: 0.3 }}
          />

        </motion.div>
      ))}

    </div>
  </div>
</section>

      {/* ================= STATS ================= */}
    <section className="relative py-32 px-6 lg:px-20 overflow-hidden bg-gradient-to-r from-[#2EC4A5] to-[#1fa88c] text-white">

  {/* 💫 Background wave (أنعم وأسرع) */}
  <motion.div
    className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/20 blur-3xl rounded-full"
    animate={{
      scale: [1, 1.15, 1],
      opacity: [0.5, 0.8, 0.5],
    }}
    transition={{
      duration: 4, // أسرع من 6
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />

  <div className="relative max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

    {[
      { num: "98%", label: "Accuracy" },
      { num: "10K+", label: "Scans Analyzed" },
      { num: "500+", label: "Doctors" },
      { num: "24/7", label: "Availability" },
    ].map((s, i) => (
      <motion.div
        key={i}
       className="
  relative group p-6 rounded-2xl
  bg-white/20 backdrop-blur-xl
  border border-white/30
  shadow-xl shadow-black/10
  overflow-hidden
"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          delay: i * 0.1, // أسرع ظهور
          duration: 0.4,
          ease: "easeOut",
        }}

        whileHover={{
          scale: 1.06,
          y: -5,
        }}
      >

        {/* ⚡ Wave shimmer (أنعم وأوضح) */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          initial={{ x: "-120%" }}
          whileHover={{ x: "120%" }}
          transition={{
            duration: 0.6, // أسرع
            ease: "easeOut",
          }}
        />

        {/* ✨ Hover glow (سريع) */}
        <motion.div
          className="absolute inset-0 bg-white/10 blur-xl opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />

        {/* 🔢 NUMBER */}
        <motion.div
          className="text-4xl font-extrabold mb-2 relative z-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {s.num}
        </motion.div>

        {/* 🏷 LABEL */}
        <div className="text-white/80 text-sm relative z-10">
          {s.label}
        </div>

      </motion.div>
    ))}

  </div>
</section>

     <section className="relative py-28 px-6 lg:px-20 text-center overflow-hidden bg-gradient-to-r from-[#2EC4A5] to-[#1fa88c] text-white">

  {/* 💫 Background glow */}
  <motion.div
    className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-white/20 blur-3xl rounded-full"
    animate={{
      scale: [1, 1.15, 1],
      opacity: [0.4, 0.7, 0.4],
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />

  <div className="relative max-w-2xl mx-auto">

    {/* 🔥 TITLE */}
    <motion.h2
      className="text-4xl font-extrabold mb-5"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      Start Detecting Smarter Today
    </motion.h2>

    {/* 📝 TEXT */}
    <motion.p
      className="text-white/80 text-lg mb-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
    >
      Join the future of AI-powered medical diagnosis.
    </motion.p>

    {/* 🔘 BUTTON */}
    <motion.button
      onClick={() => navigate("/login")}
      className="
        relative px-10 py-4 rounded-2xl
        bg-white text-[#2EC4A5]
        font-semibold text-lg
        shadow-xl overflow-hidden
      "

      whileHover={{
        scale: 1.08,
        y: -4,
      }}
      whileTap={{ scale: 0.95 }}
    >

      {/* ✨ shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#2EC4A5]/20 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.7 }}
      />

      {/* 💫 glow */}
      <motion.div
        className="absolute inset-0 bg-white/20 blur-xl opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />

      <span className="relative z-10 flex items-center gap-2 justify-center">
        Get Started
        <motion.span
          animate={{ x: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          →
        </motion.span>
      </span>

    </motion.button>

  </div>
</section>
 </div>
  );
}
// ─── LOGIN ─────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

function extractErrorText(error: any): string {
  const candidates = [
    error?.message,
    error?.data?.message,
    error?.error?.message,
    typeof error === "string" ? error : undefined,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  const nestedErrors = error?.data?.errors ?? error?.errors;
  if (nestedErrors && typeof nestedErrors === "object") {
    for (const value of Object.values(nestedErrors)) {
      if (Array.isArray(value) && value[0]) return String(value[0]);
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }

  return "";
}

function getAuthErrorMessage(error: any, fallback: string): string {
  const raw = extractErrorText(error).toLowerCase();

  if (!raw) return fallback;

  if (
    raw.includes("invalid credential") ||
    raw.includes("invalid email or password") ||
    raw.includes("invalid login") ||
    raw.includes("unauthorized") ||
    raw.includes("wrong password") ||
    raw.includes("invalid password")
  ) {
    return "Email or password is incorrect.";
  }

  if (raw.includes("email") && raw.includes("not found")) {
    return "This email is not registered.";
  }

  if (raw.includes("user") && raw.includes("not found")) {
    return "Account not found.";
  }

  if (raw.includes("exist") && raw.includes("email")) {
    return "This email is already in use.";
  }

  if (raw.includes("phone") && raw.includes("exist")) {
    return "This phone number is already in use.";
  }

  if (raw.includes("verify") && raw.includes("code")) {
    return "The verification code is invalid or expired.";
  }

  if (raw.includes("invalid code") || raw.includes("code is invalid")) {
    return "The verification code is invalid.";
  }

  if (raw.includes("expired")) {
    return "This code has expired. Please request a new one.";
  }

  if (raw.includes("password") && raw.includes("match")) {
    return "Passwords do not match.";
  }

  if (raw.includes("password") && raw.includes("weak")) {
    return "Password is too weak. Use a stronger password.";
  }

  if (raw.includes("network") || raw.includes("failed to fetch")) {
    return "Unable to connect right now. Please try again.";
  }

  return extractErrorText(error) || fallback;
}

export function Login() {
  const { login } = useAuth();
  const { toast } = useToast();
  const [showPw, setShowPw] = useState(false);
  const [, setLocation] = useLocation();
  const [search] = useState(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null
  );
  const roleHint = search?.get("role");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: roleHint ? `${roleHint}@braintumor.com` : "",
      password: roleHint
        ? `${roleHint.charAt(0).toUpperCase() + roleHint.slice(1)}123`
        : "",
    },
  });

  // =========================
  // 🔓 DECODE JWT
  // =========================
  const decodeJwt = (token: string): any | null => {
    try {
      const payload = token.split(".")[1];
      if (!payload) return null;

      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");

      const json = decodeURIComponent(
        atob(normalized)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      return JSON.parse(json);
    } catch {
      return null;
    }
  };

  // =========================
  // 🎯 NORMALIZE ROLE
  // =========================
  const normalizeRole = (
    raw: any
  ): "admin" | "doctor" | "student" => {
    const r = String(raw ?? "").toLowerCase();

    if (r.includes("admin")) return "admin";
    if (r.includes("doctor")) return "doctor";

    return "student";
  };

  // =========================
  // 🔥 LOGIN API FIXED
  // =========================
 
    
const loginDotNet = async (email: string, password: string) => {
  const res = await apiFetchJson<any>("/api/Auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return res.data;
};

   

  const e = form.formState.errors;

 return (
  <AuthShell
    title="Sign In"
    subtitle="Welcome back! Log in to check your results."
  >
    <form
      onSubmit={form.handleSubmit(async (d) => {
        try {
          setIsSubmitting(true);

          const res = await loginDotNet(d.email, d.password);

          const claims = decodeJwt(res.token);

          const role = normalizeRole(
            claims?.[
              "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            ] ?? claims?.role
          );

          const numericIdRaw = claims?.userNumericId;
          const numericId =
            typeof numericIdRaw === "number"
              ? numericIdRaw
              : typeof numericIdRaw === "string"
              ? parseInt(numericIdRaw, 10)
              : 0;

          login(res.token, {
            id: Number.isFinite(numericId) ? numericId : 0,
            fullName: res.displayName || "User",
            email: res.email || d.email,
            role,
            isActive: true,
            createdAt: new Date().toISOString(),
          } as any);

        } catch (err: any) {
          toast({
            title: getAuthErrorMessage(err, "Unable to sign in. Please try again."),
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
      })}
      className="space-y-4"
    >
      {/* EMAIL */}
      <TextInput
        {...form.register("email")}
        type="email"
        placeholder="Email Address"
        error={e.email?.message}
      />

      {/* PASSWORD */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-slate-400"></span>

          {/* 🔥 FORGOT PASSWORD */}
          <Link
            href="/forgot-password"
            className="text-xs text-[#2EC4A5] font-medium hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <TextInput
          {...form.register("password")}
          type={showPw ? "text" : "password"}
          placeholder="Password"
          error={e.password?.message}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? (
                <EyeOff className="w-4 h-4 text-slate-400" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400" />
              )}
            </button>
          }
        />
      </div>

      {/* LOGIN BUTTON */}
      <div className="pt-1">
        <GreenBtn disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign In"}
        </GreenBtn>
      </div>
    </form>

    <motion.p
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-center text-sm text-slate-500 mt-4"
>
  Don’t have an account?{" "}
  <span
    onClick={() => setLocation("/register")}
    className="text-[#2EC4A5] font-semibold cursor-pointer hover:underline"
  >
    Sign Up
  </span>
</motion.p>

    {/* 🔥 SOCIAL LOGIN */}
    
      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400">OR</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

     <div className="space-y-3">
 
      <div className="space-y-3">
        <SocialBtn icon={<GoogleIcon />} label="Login Using Google" />
        <SocialBtn icon={<FacebookIcon />} label="Login Using Facebook" />
      </div>
      </div>
  </AuthShell>
);
  
}
// ─── SCHEMA ─────────────────────────────────────────────────────────────────
const registerSchema = z
  .object({
    fullName: z.string().min(2, "Full name required"),
    email: z.string().email("Invalid email"),
    phoneNumber: z.string().min(11, "Invalid phone number"),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export function Register() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const mutation = useRegister({
    mutation: {
      onSuccess: () => {
        toast({ title: "Account created successfully 🎉" });

        // ✅ تحويل على صفحة اللوجن
        setLocation("/login");
      },

      onError: (err: any) => {
        const res = err?.data || err;

        if (res?.errors) {
          Object.values(res.errors).forEach((msg: any) => {
            toast({
              title: getAuthErrorMessage(
                Array.isArray(msg) ? msg[0] : msg,
                "Unable to create the account.",
              ),
              variant: "destructive",
            });
          });
        } else if (res?.message || err?.message) {
          toast({
            title: getAuthErrorMessage(err, "Unable to create the account."),
            variant: "destructive",
          });
        } else {
          toast({
            title: "Unable to create the account.",
            variant: "destructive",
          });
        }
      },
    },
  });

  const e = form.formState.errors;

  return (
    <AuthShell
      title="Sign UP"
      subtitle="Create your account to start analyzing MRI scans."
    >
      <form
        onSubmit={form.handleSubmit((d) => {
          const payload = {
            displayName: d.fullName,
            email: d.email,
            phoneNumber: d.phoneNumber,
            password: d.password,
            confirmPassword: d.confirmPassword,
          };

          mutation.mutate({ data: payload });
        })}
        
 className="space-y-2"

      >
        {/* Full Name */}
        <TextInput
          {...form.register("fullName")}
          placeholder="Full Name"
          error={e.fullName?.message}
        />

        {/* Email */}
        <TextInput
          {...form.register("email")}
          type="email"
          placeholder="Email Address"
          error={e.email?.message}
        />

        {/* Phone */}
        <TextInput
          {...form.register("phoneNumber")}
          placeholder="Phone Number"
          error={e.phoneNumber?.message}
        />

        {/* Password */}
        <TextInput
          {...form.register("password")}
          type={showPw ? "text" : "password"}
          placeholder="Password"
          error={e.password?.message}
          rightIcon={
            <motion.button type="button" onClick={() => setShowPw(!showPw)}>
              {showPw ? (
                <EyeOff className="w-4 h-4 text-slate-400" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400" />
              )}
            </motion.button>
          }
        />

        {/* Confirm Password */}
        <TextInput
          {...form.register("confirmPassword")}
          type={showCpw ? "text" : "password"}
          placeholder="Confirm Password"
          error={e.confirmPassword?.message}
          rightIcon={
            <motion.button type="button" onClick={() => setShowCpw(!showCpw)}>
              {showCpw ? (
                <EyeOff className="w-4 h-4 text-slate-400" />
              ) : (
                <Eye className="w-4 h-4 text-slate-400" />
              )}
            </motion.button>
          }
        />

        {/* Submit */}
        <div className="pt-1">
          <GreenBtn disabled={mutation.isPending}>
            {mutation.isPending ? "Creating..." : "Sign Up"}
          </GreenBtn>
        </div>
      </form>

      {/* Login */}
      <p className="text-center text-sm text-slate-500 mt-5">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[#2EC4A5] font-semibold hover:underline"
        >
          Sign In
        </Link>
      </p>

      <OrDivider />

      {/* Social */}
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
  const forgotPasswordSchema = z.object({ email: z.string().email() });
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });
  const mutation = useForgotPassword({
    mutation: {
      onSuccess: () => { setSubmitted(true); toast({ title: "Code sent!" }); sessionStorage.setItem("resetEmail", form.getValues("email")); setLocation("/verify-code"); },
      onError: (err: any) => { toast({ title: getAuthErrorMessage(err, "Unable to send the code."), variant: "destructive" }); },
    },
  });

  return (
    <AuthShell title="Forget Password" subtitle="Enter your email to reset your password.">
      <motion.button
        onClick={() => setLocation("/login")}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Sign In
      </motion.button>
      <form onSubmit={form.handleSubmit((d: z.infer<typeof forgotPasswordSchema>) => mutation.mutate({ data: d }))} className="space-y-4">
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
      onError: (err: any) => { toast({ title: getAuthErrorMessage(err, "Invalid verification code."), variant: "destructive" }); },
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
      <motion.button
        onClick={() => setLocation("/forgot-password")}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </motion.button>
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
      <motion.button
        onClick={() => setSeconds(103)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98, y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="mt-3 w-full py-3 rounded-2xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
      >
        Resend Code
      </motion.button>
    </AuthShell>
  );
}

// ─── RESET PASSWORD ────────────────────────────────────────────────────────────
export function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPw, setShowPw] = useState(false);
  const resetPasswordSchema = z
    .object({
      newPassword: z.string().min(6),
      confirmPassword: z.string(),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const pw = form.watch("newPassword");
  const hasMinLength = pw.length >= 6;
  const hasNumber = /\d/.test(pw);

  const mutation = useResetPassword({
    mutation: {
      onSuccess: () => { toast({ title: "Password reset!" }); sessionStorage.removeItem("resetEmail"); sessionStorage.removeItem("resetCode"); setLocation("/login"); },
      onError: (err: any) => { toast({ title: getAuthErrorMessage(err, "Unable to reset the password."), variant: "destructive" }); },
    },
  });

  const onSubmit = (data: z.infer<typeof resetPasswordSchema>) => {
    const email = sessionStorage.getItem("resetEmail") || "";
    const code = sessionStorage.getItem("resetCode") || "";
    mutation.mutate({ data: { email, code, ...data } });
  };

  return (
    <AuthShell title="Reset Password" subtitle="Enter your new password below.">
      <motion.button
        onClick={() => setLocation("/verify-code")}
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        className="flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-6 text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </motion.button>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TextInput {...form.register("newPassword")} type={showPw ? "text" : "password"} placeholder="New Password"
          error={form.formState.errors.newPassword?.message}
          rightIcon={
            <motion.button
              type="button"
              onClick={() => setShowPw(!showPw)}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 520, damping: 32 }}
            >
              {showPw ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
            </motion.button>
          }
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
