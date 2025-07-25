"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(prevState, formData) {
  const supabase = await createClient();

  const email = formData.get("email");
  const password = formData.get("password");
  const next = formData.get("next") || "/";

  const { data: sessionData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !sessionData?.session) {
    return { error: "❌ Invalid credentials" };
  }

  // If authentication succeeded, user has access
  redirect(next);
}
