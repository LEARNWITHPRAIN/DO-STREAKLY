import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json(
        { error: "Server misconfigured: missing service role key" },
        { status: 500 }
      );
    }

    // Admin client (server-side only — service role key NEVER exposed to browser)
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Step 1: Find user and confirm email if needed
    const { data: usersData, error: listError } = await adminClient.auth.admin.listUsers();
    if (!listError && usersData) {
      const user = usersData.users.find(
        (u) => u.email?.toLowerCase() === email.trim().toLowerCase()
      );
      if (user && !user.email_confirmed_at) {
        // Confirm email via admin API
        await adminClient.auth.admin.updateUserById(user.id, { email_confirm: true });
      }
    }

    // Step 2: Sign in with anon client (normal flow, now email is confirmed)
    const anonClient = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    );

    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      return NextResponse.json({ error: signInError.message }, { status: 401 });
    }

    return NextResponse.json({ session: signInData.session, user: signInData.user });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}
