
export interface SetLog {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string; // Replaces 'muscle' in API, but we map to this
  muscle: string; // Kept for compatibility, mapped from bodyPart
  equipment: string;
  target: string;
  secondaryMuscles: string[];
  gifUrl: string;
  imageUrl?: string; // New field for static PNGs
  instructions: string[]; // Array of strings in new API
  type?: string; // Inferred or defaulted
  difficulty?: string; // Inferred or defaulted
}

export interface RoutineExercise extends Exercise {
  id: string; // Unique ID for the instance in a routine
  targetSets: number;
  targetReps: string;
  targetWeight: string; // Default weight for this routine
  imageOverride?: string; // specific image for this routine exercise
  setLogs: SetLog[]; // Current tracking state
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  exercises: RoutineExercise[];
  lastPerformed?: string;
  isFavorite?: boolean; // "Active" or preferred routine
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  startTime: number;
  endTime?: number;
  exercises: RoutineExercise[]; // Snapshot of exercises at time of workout
}

export type LogStatus = 'COMPLETED' | 'INCOMPLETE' | 'ABORTED';

export interface WorkoutLog {
  id: string;
  routineName: string;
  date: string; // ISO String
  duration: number; // in minutes
  xpEarned: number;
  exercisesCompleted: number;
  totalVolume: number; // total weight lifted (rough calc)
  status: LogStatus;
  exercises: RoutineExercise[]; // Snapshot for detailed view
}

export interface UserStats {
  label: string;
  value: number;
  fullMark: number;
}

export interface UserProfile {
  name: string;
  email: string;
  weight: string;
  height: string;
  avatarUrl?: string;
  level: number;
  currentXp: number;
  xpRequired: number;
  stats: UserStats[];
  onboardingComplete: boolean;
  experience?: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
  goal?: 'STRENGTH' | 'HYPERTROPHY' | 'ENDURANCE';
}

export type ViewState = 'LOGIN' | 'SETUP' | 'DASHBOARD' | 'ROUTINE_DETAIL' | 'EXPLORE' | 'WORKOUT' | 'PROFILE' | 'LOGS';
