'use server'

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation";

export const handleLogin = async (form:FormData) => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: form.get('email') as string,
      password: form.get('password') as string
    })

    if (error) {
        redirect('/login')
    } else {
      redirect('/databases')
    }
}

export const handleSignup = async (form:FormData) => {
    const supabase = await createClient();
    
    // Basic password confirmation check
    const password = form.get('password') as string
    const confirmPassword = form.get('confirm-password') as string
    
    if (password !== confirmPassword) {
        redirect('/login')
    }

    const { error } = await supabase.auth.signUp({
      email: form.get('email') as string,
      password: password,
      options: {
        emailRedirectTo: process.env.PUBLIC_URL,
        data: {
          full_name: form.get('name') as string
        }
      }
    })

    if (error) {
        redirect('/login')
    } else {
      redirect('/dashboard')
    }
}

export const handleGoogleSignIn = async () => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })

    if (error) {
      redirect('/login')
    }
  }