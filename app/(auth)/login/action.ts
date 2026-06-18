'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Alihkan kembali ke halaman login dengan membawa pesan error
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Jika berhasil, arahkan ke halaman dashboard utama
  redirect('/paid-media-report/meta')
}