
import { createClient } from '@supabase/supabase-js';
import { UserProfile, Routine, WorkoutLog } from '../types';

// UPDATED CREDENTIALS
const SUPABASE_URL: string = 'https://esjttrxkelnbyphtaawc.supabase.co';
const SUPABASE_ANON_KEY: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzanR0cnhrZWxuYnlwaHRhYXdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDUyOTQsImV4cCI6MjA3OTIyMTI5NH0.FktSbHRbxHSTZj-V8qUaSzHuZpNZfHBipJYTfDExDWI';

export const isSupabaseConfigured = () => {
  return SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';
};

// Create client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * AUTHENTICATION
 */
export const signInWithGoogle = async () => {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured properly.");
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) throw error;
};

export const signOut = async () => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/**
 * DATA OPERATIONS
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('data')
    .eq('id', userId)
    .single();

  if (error) {
    // If error is code PGRST116 (JSON object empty/row not found), return null so app triggers setup
    if (error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }
    return null;
  }
  return data ? data.data : null;
};

export const upsertUserProfile = async (userId: string, profile: UserProfile) => {
  if (!isSupabaseConfigured()) return;
  
  // Create a record that matches the table schema (id, data)
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, data: profile });

  if (error) console.error('Error saving profile:', error);
};

export const fetchRoutines = async (userId: string): Promise<Routine[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('routines')
    .select('data')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching routines:', error);
    return [];
  }
  return data.map((row: any) => row.data);
};

export const saveRoutine = async (userId: string, routine: Routine) => {
  if (!isSupabaseConfigured()) return;
  
  const { error } = await supabase
    .from('routines')
    .upsert({ id: routine.id, user_id: userId, data: routine });

  if (error) console.error('Error saving routine:', error);
};

export const deleteRoutineFromDb = async (routineId: string) => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('routines')
    .delete()
    .eq('id', routineId);

  if (error) console.error('Error deleting routine:', error);
};

export const fetchLogs = async (userId: string): Promise<WorkoutLog[]> => {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from('logs')
    .select('data')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }); // Using created_at for sorting at DB level is safer

  if (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
  return data.map((row: any) => row.data);
};

export const saveLog = async (userId: string, log: WorkoutLog) => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from('logs')
    .insert({ id: log.id, user_id: userId, data: log });

  if (error) console.error('Error saving log:', error);
};
