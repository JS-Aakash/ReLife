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
 * Falls back gracefully to data URL if storage bucket is not yet created.
 */
export async function uploadToSupabaseStorage(
  file: File | Blob,
  path: string
): Promise<{ url: string; error?: string }> {
  if (!supabase) {
    return { url: '', error: 'Supabase client not initialized' };
  }

  try {
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file, {
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
