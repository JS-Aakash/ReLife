import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl !== 'https://your-project.supabase.co'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

/**
 * Upload a document or image to Supabase Storage bucket 'documents'
 * Path is prefixed with user ID for strict RLS access isolation.
 */
export async function uploadToSupabaseStorage(
  file: File | Blob,
  path: string,
  userId?: string
): Promise<{ url: string; error?: string }> {
  if (!supabase) {
    return { url: '', error: 'Supabase client not initialized' };
  }

  try {
    const finalPath = userId ? `${userId}/${path}` : path;
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(finalPath, file, {
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      return { url: '', error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl };
  } catch (err: any) {
    return { url: '', error: err?.message || 'Storage upload failed' };
  }
}

/**
 * Sign up a new user with Supabase Auth
 */
export async function supabaseSignUp(email: string, password: string, fullName: string, role = 'consumer') {
  if (!supabase) return { data: { user: null, session: null }, error: { message: 'Supabase is not configured' } };
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role,
      },
    },
  });
}

/**
 * Sign in existing user with email and password
 */
export async function supabaseSignIn(email: string, password: string) {
  if (!supabase) return { data: { user: null, session: null }, error: { message: 'Supabase is not configured' } };
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Sign out current session
 */
export async function supabaseSignOut() {
  if (!supabase) return;
  return await supabase.auth.signOut();
}
