
import { createClient } from '@supabase/supabase-js';
import { UserProfile, Routine, WorkoutLog } from '../types';

// REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

export const isSupabaseConfigured = () => {
  return SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co' && 
         SUPABASE_ANON_KEY !== 'YOUR_ANON_KEY' &&
         SUPABASE_URL !== '' && 
         SUPABASE_ANON_KEY !== '';
};

// Conditional export - if not configured, client operations will fail gracefully or we handle it in App.tsx
export const supabase = isSupabaseConfigured() 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : createClient('https://placeholder.supabase.co', 'placeholder'); // Dummy client to prevent crash on import

/**
 * AUTHENTICATION
 */
export const signInWithGoogle = async () => {
  if (!isSupabaseConfigured()) {
    console.warn("Supabase not configured. Using simulated login.");
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
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

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data ? data.data : null;
};

export const upsertUserProfile = async (userId: string, profile: UserProfile) => {
  if (!isSupabaseConfigured()) return;
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
    .order('data->>date', { ascending: false });

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
