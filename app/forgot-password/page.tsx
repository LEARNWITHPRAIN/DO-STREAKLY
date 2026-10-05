"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Check, AlertCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSubmitted(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F0D] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-2xl overflow-hidden border border-[#B6F34A]/50 shadow-glow-sm">
              <Image src="/logo.jpg" alt="DO STREAKLY" fill className="object-cover" priority />
            </div>
            <span className="font-display text-2xl font-black text-white">
              DO <span className="text-[#B6F34A]">STREAKLY</span>
            </span>
          </Link>
        </div>

        <Card className="border-[#202E24] bg-[#121814]">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter the email associated with your account to receive a reset link.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {submitted ? (
              <div className="rounded-xl border border-[#B6F34A]/30 bg-[#17211B] p-4 text-center space-y-2">
                <Check className="h-8 w-8 text-[#B6F34A] mx-auto" />
                <h4 className="font-display text-sm font-bold text-white">Check Your Inbox</h4>
                <p className="text-xs text-gray-400">
                  We've sent a password reset link to <strong>{email}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@domain.com"
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}

            <div className="text-center pt-2">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to login</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
