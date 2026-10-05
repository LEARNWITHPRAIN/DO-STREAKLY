"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }
    setErrorMsg("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F0D] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-[#B6F34A]/50">
              <Image src="/logo.jpg" alt="DO STREAKLY" fill className="object-cover" priority />
            </div>
            <span className="font-display text-2xl font-black text-white">
              DO <span className="text-[#B6F34A]">STREAKLY</span>
            </span>
          </Link>
        </div>

        <Card className="border-[#202E24] bg-[#121814]">
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>Enter and confirm your new secure password.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {success ? (
              <div className="rounded-xl border border-[#B6F34A]/30 bg-[#17211B] p-4 text-center space-y-2">
                <Check className="h-8 w-8 text-[#B6F34A] mx-auto" />
                <h4 className="font-display text-sm font-bold text-white">Password Updated!</h4>
                <p className="text-xs text-gray-400">Redirecting to login...</p>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                {errorMsg && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">New Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Confirm Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
