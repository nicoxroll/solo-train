
export interface SetLog {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
}

export interface Exercise {
  name: string;
  type: string;
  muscle: string;
  equipment: string;
  difficulty: string;
  instructions: string;
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
}

export type ViewState = 'LOGIN' | 'DASHBOARD' | 'ROUTINE_DETAIL' | 'EXPLORE' | 'WORKOUT' | 'PROFILE' | 'LOGS';
