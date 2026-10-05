"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Flame, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // If Supabase auth fails (e.g. invalid credentials), inform user
        setErrorMsg(error.message);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = () => {
    document.cookie = "streakly_demo=true; path=/; max-age=604800";
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#0B0F0D] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#B6F34A]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-[#B6F34A]/50 shadow-glow-sm transition-transform group-hover:scale-105">
              <Image
                src="/logo.jpg"
                alt="DO STREAKLY"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span className="font-display text-2xl font-black tracking-tight text-white flex items-center">
              DO <span className="text-[#B6F34A] ml-1.5">STREAKLY</span>
            </span>
          </Link>
          <p className="text-sm text-gray-400">
            Better habits. Together. Log in to keep your streak blazing.
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-[#202E24] bg-[#121814] shadow-2xl shadow-black/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in with your email and password to access your dashboard.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@streakly.app"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#B6F34A] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-bold shadow-glow"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#202E24]" />
              </div>
              <span className="relative bg-[#121814] px-3 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                Or Instant Preview
              </span>
            </div>

            {/* Quick Demo Access */}
            <Button
              type="button"
              variant="secondary"
              onClick={handleQuickDemoLogin}
              className="w-full h-11 border-[#2C3F32] hover:border-[#B6F34A]/50 gap-2"
            >
              <Sparkles className="h-4 w-4 text-[#B6F34A]" />
              <span>Explore Demo Workspace (No sign-in)</span>
            </Button>
          </CardContent>
        </Card>

        {/* Signup Link */}
        <p className="text-center text-xs text-gray-400">
          Don't have an account yet?{" "}
          <Link href="/signup" className="text-[#B6F34A] font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
