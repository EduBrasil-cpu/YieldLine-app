import { createClient } from '@supabase/supabase-js'

// These two values are safe to be public — your data stays protected by the
// row-level security rules set up in schema.sql, not by hiding this key.
const supabaseUrl = 'https://bhkrnjeckpklbbrbpovh.supabase.co'
const supabaseAnonKey = 'sb_publishable_sIVbYD3393MmQhb3_qG6-g_sz_6xhp9'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
