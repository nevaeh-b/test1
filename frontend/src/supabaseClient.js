import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yycvdscwfhynzficvtro.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5Y3Zkc2N3Zmh5bnpmaWN2dHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2MDEzNTMsImV4cCI6MjA5OTE3NzM1M30.AKUqBjvtZHsUGDpmEM-8hPMowxqtZX1yDFSx5ORM-NQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
// 해당 키로 잘 불러와지는 것 확인 완료!