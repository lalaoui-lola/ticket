import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://easocayxqfydurlbyfbk.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhc29jYXl4cWZ5ZHVybGJ5ZmJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4MzUxNjYsImV4cCI6MjA4MDQxMTE2Nn0.X3ZVwOS1vyHjNPr-1Q2ZcXFyeL6kzOAVTl6pRd3GloI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
