// Feature flags for gradual migration from static JSON to Supabase
export const features = {
  useSupabase: true,
  adminEnabled: true,
  publicSubmissions: true,
  newVoting: true,
} as const;
