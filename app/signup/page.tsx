"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            username: username.trim().toLowerCase(),
          },
          // Skip email confirmation
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        // Sign in immediately after signup (bypasses email confirmation)
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError && !signInError.message.includes("Email not confirmed")) {
          setErrorMsg(signInError.message);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred during signup");
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="min-h-screen bg-[#0B0F0D] flex flex-col justify-center items-center p-4 relative overflow-hidden">
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
            Better habits. Together. Join the streak revolution.
          </p>
        </div>

        {/* Signup Card */}
        <Card className="border-[#202E24] bg-[#121814] shadow-2xl shadow-black/80">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Create Your Account</CardTitle>
            <CardDescription>
              Start tracking daily habits and challenging your friends.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Full Name
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Vance"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Username
                </label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alex_streaker"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@domain.com"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
              </div>

            <Button
                type="submit"
                className="w-full h-11 font-bold shadow-glow mt-2"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account & Start"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Link */}
        <p className="text-center text-xs text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-[#B6F34A] font-bold hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  );
}
