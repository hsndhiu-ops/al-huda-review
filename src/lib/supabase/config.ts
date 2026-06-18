// Supabase credentials were stored with swapped values in Replit Secrets.
// Read env vars at call-time (not module load time) so Next.js doesn't inline empty strings.
export function getSupabaseCredentials() {
  const a = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const b = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  // Detect swap: whichever starts with https:// is the URL
  if (b.startsWith("https://") && !a.startsWith("https://")) {
    return { url: b, anonKey: a };
  }
  return { url: a, anonKey: b };
}
