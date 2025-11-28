
import React, { useState, useEffect } from 'react';
import { fetchExercises, getMuscleImage } from './services/api';
import { Exercise, Routine, RoutineExercise, UserProfile, ViewState, WorkoutSession, WorkoutLog, LogStatus, UserStats } from './types';
import { Button, Card, Input, Badge, ProgressBar, SimpleChart, Select, RadarChart, FilterGroup, FilterModal, StatusBadge } from './components/Components';
import { 
  User, Dumbbell, Play, Search, Plus, Check, 
  Trash2, ChevronLeft, Settings, Activity, Save, 
  X, ChevronDown, ChevronUp, Image as ImageIcon,
  Database, Layers, BrainCircuit, AlertTriangle, FileText, Calendar, Copy, SlidersHorizontal, Info, RefreshCw
} from 'lucide-react';

// --- Helper Data & Functions ---

const calculateXP = (exercises: RoutineExercise[]): number => {
  let xp = 0;
  exercises.forEach(ex => {
    // Base XP per set based on difficulty
    const multiplier = ex.difficulty === 'expert' ? 3 : ex.difficulty === 'intermediate' ? 2 : 1;
    const completedSets = ex.setLogs.filter(s => s.completed).length;
    // 10 XP base per set
    xp += completedSets * 10 * multiplier;
  });
  return xp;
};

const calculateEstimatedXP = (routine: Routine): number => {
  let xp = 0;
  routine.exercises.forEach(ex => {
    const multiplier = ex.difficulty === 'expert' ? 3 : ex.difficulty === 'intermediate' ? 2 : 1;
    xp += ex.targetSets * 10 * multiplier;
  });
  return xp;
};

const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  return `${minutes} min`;
};

const PREMADE_ROUTINES: Routine[] = [
  {
    id: 'p1',
    name: 'Tactical Strength Alpha',
    description: 'Foundation strength protocol focusing on compound movements for maximum operative output.',
    isFavorite: false,
    exercises: [
      { id: 'p1_e1', name: 'Barbell Squat', muscle: 'quadriceps', type: 'strength', difficulty: 'expert', equipment: 'barbell', instructions: 'Squat deep.', targetSets: 5, targetReps: '5', targetWeight: '100', setLogs: [] },
      { id: 'p1_e2', name: 'Bench Press', muscle: 'chest', type: 'strength', difficulty: 'intermediate', equipment: 'barbell', instructions: 'Press.', targetSets: 5, targetReps: '5', targetWeight: '80', setLogs: [] },
      { id: 'p1_e3', name: 'Deadlift', muscle: 'lower_back', type: 'strength', difficulty: 'expert', equipment: 'barbell', instructions: 'Lift.', targetSets: 3, targetReps: '5', targetWeight: '120', setLogs: [] },
    ]
  },
  {
    id: 'p2',
    name: 'Hypertrophy Grid B',
    description: 'High volume muscle growth sequence for upper body dominance.',
    isFavorite: false,
    exercises: [
      { id: 'p2_e1', name: 'Dumbbell Incline Press', muscle: 'chest', type: 'hypertrophy', difficulty: 'intermediate', equipment: 'dumbbell', instructions: 'Incline press.', targetSets: 4, targetReps: '10-12', targetWeight: '25', setLogs: [] },
      { id: 'p2_e2', name: 'Lateral Raises', muscle: 'shoulders', type: 'hypertrophy', difficulty: 'beginner', equipment: 'dumbbell', instructions: 'Raise.', targetSets: 4, targetReps: '15', targetWeight: '10', setLogs: [] },
    ]
  }
];

const DUMMY_LOGS: WorkoutLog[] = [
  {
    id: 'log_dummy_1',
    routineName: 'Tactical Strength Alpha',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // Yesterday
    duration: 55,
    xpEarned: 450,
    exercisesCompleted: 3,
    totalVolume: 5200,
    status: 'COMPLETED',
    exercises: PREMADE_ROUTINES[0].exercises
  },
  {
    id: 'log_dummy_2',
    routineName: 'Hypertrophy Grid B',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    duration: 25,
    xpEarned: 120,
    exercisesCompleted: 1,
    totalVolume: 1200,
    status: 'ABORTED',
    exercises: PREMADE_ROUTINES[1].exercises
  },
  {
    id: 'log_dummy_3',
    routineName: 'Alpha Protocol',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(), // 6 days ago
    duration: 40,
    xpEarned: 380,
    exercisesCompleted: 2,
    totalVolume: 3800,
    status: 'COMPLETED',
    exercises: []
  }
];

// --- Sub-Components ---

// 1. LOGIN VIEW
const LoginView: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)] pointer-events-none"></div>

    <div className="z-10 w-full max-w-md space-y-12 text-center">
      <div className="space-y-2">
        <h1 className="text-6xl font-thin tracking-tighter text-white">SOLO<span className="text-primary font-normal">TRAIN</span></h1>
        <p className="text-gray-500 text-xs tracking-[0.3em] uppercase">Tactical Performance Tracker</p>
      </div>

      <div className="glass-panel p-8 space-y-6 relative border-t border-white/10">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black px-4 text-xs text-gray-500 uppercase tracking-widest">Identify</div>
        <p className="font-light text-gray-400 text-sm">Please authenticate to access mission protocols.</p>
        <Button onClick={onLogin} className="w-full flex items-center justify-center gap-3 group">
           Initialize Google Link
        </Button>
      </div>
    </div>
  </div>
);

// 2. EXERCISE MODAL
const ExerciseModal: React.FC<{ exercise: Exercise | null; onClose: () => void; onAddToRoutine?: (ex: Exercise) => void }> = ({ exercise, onClose, onAddToRoutine }) => {
  if (!exercise) return null;
  const image = getMuscleImage(exercise.muscle);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-surface border border-white/10 relative overflow-hidden flex flex-col max-h-[85vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]" onClick={(e) => e.stopPropagation()}>
        <div className="h-48 relative shrink-0">
          <img src={image} alt={exercise.muscle} className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
          <div className="absolute bottom-4 left-6">
            <Badge>{exercise.muscle}</Badge>
            <h2 className="text-3xl font-light text-white mt-2 uppercase tracking-wide">{exercise.name}</h2>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white hover:text-primary rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs text-gray-500 uppercase tracking-widest">Type</label>
               <p className="text-sm text-gray-200 capitalize">{exercise.type}</p>
             </div>
             <div>
               <label className="text-xs text-gray-500 uppercase tracking-widest">Difficulty</label>
               <p className="text-sm text-primary capitalize">{exercise.difficulty}</p>
             </div>
          </div>
          
          <div className="border-t border-white/10 pt-4">
            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">Directives</label>
            <p className="text-sm font-light leading-relaxed text-gray-300">{exercise.instructions}</p>
          </div>
        </div>

        {onAddToRoutine && (
          <div className="p-4 border-t border-white/10 bg-surfaceHighlight shrink-0">
            <Button onClick={() => { onAddToRoutine(exercise); onClose(); }} className="w-full shadow-lg shadow-primary/10">
              Add to Active Mission
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// 3. DASHBOARD VIEW (MISSIONS)
const DashboardView: React.FC<{ 
  user: UserProfile; 
  routines: Routine[]; 
  onSelectRoutine: (r: Routine) => void;
  onCreateRoutine: () => void;
  onForkRoutine: (r: Routine) => void;
}> = ({ user, routines, onSelectRoutine, onCreateRoutine, onForkRoutine }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const toggleFilter = (f: string) => {
    if (filters.includes(f)) setFilters(filters.filter(x => x !== f));
    else setFilters([...filters, f]);
  };

  const filteredRoutines = routines.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    const matchesActive = filters.includes('ACTIVE') ? r.isFavorite : true;
    const matchesRecent = filters.includes('RECENT') ? r.lastPerformed !== undefined : true;
    
    return matchesSearch && matchesActive && matchesRecent;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-28">
      <header className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h2 className="text-3xl font-light text-white">MISSIONS</h2>
          <p className="text-xs text-primary uppercase tracking-[0.2em]">Select Mission Protocol</p>
        </div>
        <Button variant="secondary" onClick={() => setShowCreateModal(true)} className="!py-2 !px-4 text-xs">
          <Plus className="w-4 h-4 mr-2 inline" /> Initialize
        </Button>
      </header>

      {/* Search & Filter Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Search missions..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
           onClick={() => setShowFilterModal(true)}
           className={`px-4 flex items-center gap-2 border ${filters.length > 0 ? 'bg-primary text-black border-primary' : 'bg-surfaceHighlight border-white/20 text-gray-400 hover:text-white'} transition-colors`}
        >
           <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      <FilterModal 
        isOpen={showFilterModal} 
        onClose={() => setShowFilterModal(false)}
        selectedFilters={filters}
        onToggleFilter={toggleFilter}
        sections={[
          { title: "Status", options: ["ACTIVE", "RECENT"] }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoutines.map(routine => {
          const estXP = calculateEstimatedXP(routine);
          return (
          <Card key={routine.id} onClick={() => onSelectRoutine(routine)} className={`group cursor-pointer relative overflow-hidden ${routine.isFavorite ? 'border-primary/40' : 'border-transparent'}`}>
             <div className="flex justify-between items-start mb-4">
               <div className={`p-2 transition-colors ${routine.isFavorite ? 'bg-primary text-black' : 'bg-white/5 text-gray-400 group-hover:text-white'}`}>
                 <Activity className="w-6 h-6" />
               </div>
               <div className="flex gap-2">
                  <Badge variant="outline">+{estXP} XP</Badge>
                  {routine.isFavorite && <Badge variant="primary">ACTIVE</Badge>}
               </div>
             </div>
             <h3 className="text-xl font-normal text-white mb-1 group-hover:text-primary transition-colors">{routine.name}</h3>
             <p className="text-sm text-gray-500 font-light line-clamp-2 mb-4">{routine.description || "No description provided."}</p>
             
             <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
               <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Dumbbell className="w-3 h-3" /> {routine.exercises.length} Exercises
               </div>
               {routine.lastPerformed && <span className="text-[10px] text-gray-600 uppercase">Last: {routine.lastPerformed}</span>}
             </div>
          </Card>
        )})}
        
        {filteredRoutines.length === 0 && (
           <div className="col-span-full py-12 text-center border border-dashed border-gray-800 text-gray-600 font-light rounded-lg">
             No missions found matching query.
           </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="w-full max-w-lg glass-panel p-6 space-y-6 relative border border-white/20">
              <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
              <div>
                <h3 className="text-xl font-light text-white mb-1">INITIALIZE PROTOCOL</h3>
                <p className="text-xs text-gray-500 uppercase">Select creation method</p>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => { setShowCreateModal(false); onCreateRoutine(); }}
                  className="p-4 border border-white/10 bg-white/5 hover:bg-primary/10 hover:border-primary/50 transition-all text-left flex items-center gap-4 group"
                >
                   <div className="bg-black p-3 rounded-full border border-white/10 group-hover:border-primary text-white group-hover:text-primary">
                     <Plus className="w-6 h-6" />
                   </div>
                   <div>
                     <h4 className="text-sm font-bold text-white uppercase group-hover:text-primary">Blank Protocol</h4>
                     <p className="text-xs text-gray-500">Create new mission from scratch. Requires manual exercise selection.</p>
                   </div>
                </button>

                <div className="border-t border-white/10 pt-4">
                  <p className="text-[10px] text-gray-500 uppercase mb-3">Or Fork Existing Protocol</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                     {routines.map(r => (
                       <button 
                         key={r.id}
                         onClick={() => { setShowCreateModal(false); onForkRoutine(r); }}
                         className="w-full p-3 border border-white/10 hover:bg-white/5 text-left flex justify-between items-center text-xs group"
                       >
                         <span className="text-gray-300 group-hover:text-white uppercase">{r.name}</span>
                         <Copy className="w-3 h-3 text-gray-600 group-hover:text-primary" />
                       </button>
                     ))}
                  </div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

// 4. ROUTINE DETAIL & EDIT VIEW
const RoutineDetailView: React.FC<{
  routine: Routine;
  onBack: () => void;
  onStart: (r: Routine) => void;
  onSave: (r: Routine) => void;
  onDelete: (id: string) => void;
  onAddExercises: () => void;
  isNew?: boolean;
}> = ({ routine, onBack, onStart, onSave, onDelete, onAddExercises, isNew }) => {
  const [editedRoutine, setEditedRoutine] = useState<Routine>(JSON.parse(JSON.stringify(routine)));
  const [isEditing, setIsEditing] = useState(isNew || false);

  // Sync routine prop changes to state (useful when exercises are added externally)
  useEffect(() => {
    setEditedRoutine(JSON.parse(JSON.stringify(routine)));
  }, [routine]);

  const updateExercise = (id: string, field: keyof RoutineExercise, value: any) => {
    setEditedRoutine(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex)
    }));
  };

  const removeExercise = (id: string) => {
    setEditedRoutine(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== id)
    }));
  };

  const toggleFavorite = () => {
    const updated = { ...editedRoutine, isFavorite: !editedRoutine.isFavorite };
    setEditedRoutine(updated);
    onSave(updated); // Immediate save triggers the "Active Exclusive" logic in App
  };

  const handleSaveChanges = () => {
    onSave(editedRoutine);
    setIsEditing(false);
  };

  // Pre-defined images for demo
  const sampleImages = [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=400',
  ];

  return (
    <div className="pb-28 space-y-6">
      <header className="flex items-center justify-between pb-4 border-b border-white/10">
        <button onClick={onBack} className="text-gray-400 hover:text-white flex items-center text-xs uppercase tracking-widest">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <div className="flex gap-2">
          {!isEditing && (
             <button onClick={toggleFavorite} className={`p-2 border transition-colors ${editedRoutine.isFavorite ? 'bg-primary text-black border-primary' : 'border-white/20 text-gray-400'}`}>
               <Check className="w-4 h-4" />
             </button>
          )}
          <button onClick={() => setIsEditing(!isEditing)} className={`p-2 border transition-colors ${isEditing ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400'}`}>
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="space-y-4">
        {isEditing ? (
           <div className="space-y-2">
             <Input value={editedRoutine.name} onChange={(e) => setEditedRoutine({...editedRoutine, name: e.target.value})} className="text-xl font-light" placeholder="Mission Name" />
             <textarea 
               value={editedRoutine.description} 
               onChange={(e) => setEditedRoutine({...editedRoutine, description: e.target.value})}
               className="w-full bg-surfaceHighlight border-b border-white/20 px-4 py-3 text-sm font-light text-white focus:outline-none focus:border-primary transition-all placeholder-gray-600 resize-none h-24"
               placeholder="Operational Description..."
             />
           </div>
        ) : (
           <>
             <h1 className="text-4xl font-light text-white uppercase">{editedRoutine.name}</h1>
             <p className="text-sm text-gray-400 font-light">{editedRoutine.description || "No specific briefing."}</p>
           </>
        )}
        <div className="flex items-center gap-4">
           <p className="text-gray-500 font-mono text-xs">{editedRoutine.exercises.length} EXERCISES // ESTIMATED: {editedRoutine.exercises.length * 5} MIN</p>
           <Badge variant="outline">+{calculateEstimatedXP(editedRoutine)} XP</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {isEditing && (
           <Button variant="secondary" onClick={onAddExercises} className="w-full border-dashed border-white/30 text-gray-400 hover:text-primary hover:border-primary">
             <Plus className="w-4 h-4 mr-2" /> Add Exercise Data
           </Button>
        )}

        {editedRoutine.exercises.map((ex, index) => (
          <div key={ex.id} className="glass-panel p-4 border border-white/5 flex gap-4 items-start relative group">
            <div className="w-20 h-20 bg-gray-900 shrink-0 relative overflow-hidden border border-white/10">
              <img src={ex.imageOverride || getMuscleImage(ex.muscle)} className="w-full h-full object-cover" alt="" />
              {isEditing && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer hover:bg-black/40">
                   <ImageIcon className="w-5 h-5 text-white" />
                   <select 
                     className="absolute inset-0 opacity-0 cursor-pointer"
                     onChange={(e) => updateExercise(ex.id, 'imageOverride', e.target.value)}
                   >
                      <option value="">Default</option>
                      {sampleImages.map((src, i) => <option key={i} value={src}>Image {i+1}</option>)}
                   </select>
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 space-y-2">
              <h4 className="text-sm font-medium text-white uppercase truncate">{ex.name}</h4>
              <div className="flex gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase">Sets</label>
                  {isEditing ? (
                    <input type="number" value={ex.targetSets} onChange={(e) => updateExercise(ex.id, 'targetSets', parseInt(e.target.value))} className="w-12 bg-black/30 border border-white/10 text-white text-xs p-1 text-center" />
                  ) : (
                    <p className="text-lg font-light text-primary">{ex.targetSets}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase">Reps</label>
                  {isEditing ? (
                    <input type="text" value={ex.targetReps} onChange={(e) => updateExercise(ex.id, 'targetReps', e.target.value)} className="w-16 bg-black/30 border border-white/10 text-white text-xs p-1 text-center" />
                  ) : (
                    <p className="text-lg font-light text-white">{ex.targetReps}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase">Kg</label>
                  {isEditing ? (
                    <input type="text" value={ex.targetWeight} onChange={(e) => updateExercise(ex.id, 'targetWeight', e.target.value)} className="w-16 bg-black/30 border border-white/10 text-white text-xs p-1 text-center" />
                  ) : (
                    <p className="text-lg font-light text-gray-400">{ex.targetWeight || '-'}</p>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <button onClick={() => removeExercise(ex.id)} className="absolute top-2 right-2 p-2 text-red-500 hover:text-white">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
      
      {isEditing ? (
        <div className="space-y-2 sticky bottom-24 z-10">
          <Button onClick={handleSaveChanges} className="w-full shadow-lg">Save Configuration</Button>
          {!isNew && <Button onClick={() => onDelete(routine.id)} variant="danger" className="w-full">Delete Mission</Button>}
        </div>
      ) : (
        <Button onClick={() => onStart(editedRoutine)} className="w-full sticky bottom-24 z-10 shadow-lg shadow-primary/20">
          <Play className="w-4 h-4 mr-2 fill-current" /> START MISSION
        </Button>
      )}
    </div>
  );
};

// 5. WORKOUT TRACKER VIEW
const WorkoutView: React.FC<{ 
  session: WorkoutSession; 
  onUpdateSession: (s: WorkoutSession) => void;
  onFinish: () => void;
  onAbort: () => void;
  onMinimize: () => void;
}> = ({ session, onUpdateSession, onFinish, onAbort, onMinimize }) => {
  const [expandedExId, setExpandedExId] = useState<string | null>(session.exercises[0]?.id || null);

  const toggleSet = (exId: string, setIndex: number) => {
    const updatedExercises = session.exercises.map(ex => {
      if (ex.id !== exId) return ex;
      const newLogs = [...ex.setLogs];
      newLogs[setIndex].completed = !newLogs[setIndex].completed;
      return { ...ex, setLogs: newLogs };
    });
    onUpdateSession({ ...session, exercises: updatedExercises });
  };

  const updateSetData = (exId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    const updatedExercises = session.exercises.map(ex => {
      if (ex.id !== exId) return ex;
      const newLogs = [...ex.setLogs];
      newLogs[setIndex] = { ...newLogs[setIndex], [field]: value };
      return { ...ex, setLogs: newLogs };
    });
    onUpdateSession({ ...session, exercises: updatedExercises });
  };

  const completeAllSets = (exId: string) => {
     const updatedExercises = session.exercises.map(ex => {
      if (ex.id !== exId) return ex;
      const newLogs = ex.setLogs.map(log => ({ ...log, completed: true }));
      return { ...ex, setLogs: newLogs };
    });
    onUpdateSession({ ...session, exercises: updatedExercises });
    const idx = session.exercises.findIndex(e => e.id === exId);
    if (idx < session.exercises.length - 1) {
        setExpandedExId(session.exercises[idx+1].id);
    }
  };

  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.setLogs.length, 0);
  const completedSets = session.exercises.reduce((acc, ex) => acc + ex.setLogs.filter(s => s.completed).length, 0);
  const progress = totalSets === 0 ? 0 : (completedSets / totalSets) * 100;
  
  // Calculate potential XP
  const potentialXP = calculateXP(session.exercises);

  return (
    <div className="flex flex-col h-full pb-20">
      <div className="flex items-center justify-between mb-4 pt-2">
        <button onClick={onMinimize} className="text-gray-400 hover:text-white flex items-center text-xs uppercase tracking-widest">
          <ChevronDown className="w-4 h-4 mr-1" /> Minimize
        </button>
        <span className="text-primary font-mono text-xs animate-pulse">LIVE TRACKING</span>
      </div>

      <div className="mb-6 sticky top-0 bg-background z-20 pb-4 border-b border-white/10">
        <h2 className="text-xl font-light text-white mb-2 uppercase">{session.routineName}</h2>
        <ProgressBar progress={progress} />
        <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
          <span>{completedSets} / {totalSets} SETS</span>
          <span className="text-primary">+{potentialXP} XP Est.</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar pb-32">
        {session.exercises.map((ex) => {
          const isExpanded = expandedExId === ex.id;
          const isFullyComplete = ex.setLogs.every(s => s.completed);

          return (
            <div key={ex.id} className={`border transition-all duration-300 ${isExpanded ? 'border-primary/30 bg-white/5' : 'border-white/10 bg-surfaceHighlight'}`}>
              
              <div 
                className="p-4 flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedExId(isExpanded ? null : ex.id)}
              >
                <div className={`w-10 h-10 flex items-center justify-center border transition-colors ${isFullyComplete ? 'bg-primary border-primary text-black' : 'border-white/20 text-gray-500'}`}>
                  {isFullyComplete ? <Check className="w-6 h-6" /> : <Dumbbell className="w-5 h-5" />}
                </div>
                
                <div className="flex-1">
                  <h4 className={`text-sm font-medium uppercase tracking-wide ${isFullyComplete ? 'text-primary' : 'text-white'}`}>{ex.name}</h4>
                  {!isExpanded && (
                    <div className="text-xs text-gray-500 mt-1">
                       {ex.setLogs.filter(s => s.completed).length}/{ex.setLogs.length} Sets
                    </div>
                  )}
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 animate-fade-in border-t border-white/5 bg-black/20">
                   <div className="flex justify-between items-center py-2 mb-2 border-b border-white/10">
                      <span className="text-[10px] uppercase text-gray-500">Log Weights</span>
                      <button onClick={(e) => { e.stopPropagation(); completeAllSets(ex.id); }} className="text-[10px] text-primary uppercase hover:underline">Mark All Done</button>
                   </div>
                   
                   <div className="space-y-2">
                     <div className="grid grid-cols-10 gap-2 text-[10px] text-gray-500 text-center uppercase mb-1">
                        <div className="col-span-2">Set</div>
                        <div className="col-span-3">kg</div>
                        <div className="col-span-3">Reps</div>
                        <div className="col-span-2">Done</div>
                     </div>
                     {ex.setLogs.map((set, idx) => (
                       <div key={set.id} className={`grid grid-cols-10 gap-2 items-center transition-colors ${set.completed ? 'opacity-50' : 'opacity-100'}`}>
                          <div className="col-span-2 flex justify-center">
                             <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-mono">{idx + 1}</div>
                          </div>
                          <div className="col-span-3">
                             <input 
                               type="text" 
                               value={set.weight} 
                               onChange={(e) => updateSetData(ex.id, idx, 'weight', e.target.value)}
                               className="w-full bg-transparent border-b border-white/20 text-center text-sm focus:border-primary focus:outline-none"
                             />
                          </div>
                          <div className="col-span-3">
                             <input 
                               type="text" 
                               value={set.reps} 
                               onChange={(e) => updateSetData(ex.id, idx, 'reps', e.target.value)}
                               className="w-full bg-transparent border-b border-white/20 text-center text-sm focus:border-primary focus:outline-none"
                             />
                          </div>
                          <div className="col-span-2 flex justify-center">
                             <button 
                               onClick={() => toggleSet(ex.id, idx)}
                               className={`w-6 h-6 border flex items-center justify-center transition-all ${set.completed ? 'bg-primary border-primary text-black' : 'border-gray-600 hover:border-white'}`}
                             >
                               {set.completed && <Check className="w-3 h-3" />}
                             </button>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-24 left-0 right-0 p-4 bg-background/90 backdrop-blur-md border-t border-white/10 z-30 flex flex-col gap-2 max-w-md mx-auto">
        <Button onClick={onFinish} className="w-full shadow-lg shadow-primary/20" disabled={progress === 0}>
          COMPLETE MISSION
        </Button>
        <Button onClick={onAbort} variant="danger" className="w-full">
          ABORT
        </Button>
      </div>
    </div>
  );
};

// 6. EXPLORE VIEW (INTEL)
const ExploreView: React.FC<{ 
  onAddToRoutine?: (ex: Exercise) => void; 
  onImportRoutine: (r: Routine) => void;
  isPickerMode?: boolean; 
  onClosePicker?: () => void;
}> = ({ onAddToRoutine, onImportRoutine, isPickerMode, onClosePicker }) => {
  const [activeTab, setActiveTab] = useState<'DATABASE' | 'PROTOCOLS'>('DATABASE');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  
  // Filter Logic: We need to split the selectedFilters into muscles and difficulties
  const muscles = ['abdominals', 'biceps', 'calves', 'chest', 'glutes', 'hamstrings', 'lats', 'quadriceps', 'shoulders', 'triceps'];
  const difficulties = ['beginner', 'intermediate', 'expert'];

  const muscleFilters = selectedFilters.filter(f => muscles.includes(f));
  const difficultyFilters = selectedFilters.filter(f => difficulties.includes(f));
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEx, setSelectedEx] = useState<Exercise | null>(null);

  const toggleFilter = (f: string) => {
    if (selectedFilters.includes(f)) setSelectedFilters(selectedFilters.filter(x => x !== f));
    else setSelectedFilters([...selectedFilters, f]);
  };

  useEffect(() => {
    if (activeTab === 'DATABASE') {
      const load = async () => {
        setLoading(true);
        const primaryMuscle = muscleFilters.length > 0 ? muscleFilters[0] : undefined;
        const data = await fetchExercises(primaryMuscle, searchTerm);
        let filtered = data;
        
        if (difficultyFilters.length > 0) {
          filtered = filtered.filter(e => difficultyFilters.includes(e.difficulty));
        }
        
        setExercises(filtered);
        setLoading(false);
      };
      const timer = setTimeout(load, 500);
      return () => clearTimeout(timer);
    }
  }, [searchTerm, selectedFilters, activeTab]);

  return (
    <div className={`space-y-6 pb-28 h-full flex flex-col ${isPickerMode ? 'pt-4' : ''}`}>
      <div className="space-y-4 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             {isPickerMode && (
               <button onClick={onClosePicker} className="text-gray-400"><ChevronLeft className="w-5 h-5"/></button>
             )}
             <h2 className="text-3xl font-light text-white">{isPickerMode ? 'SELECT DATA' : 'INTEL'}</h2>
          </div>
          <div className="flex bg-white/5 rounded p-1">
            <button onClick={() => setActiveTab('DATABASE')} className={`p-2 rounded ${activeTab === 'DATABASE' ? 'bg-primary text-black' : 'text-gray-400'}`}><Database className="w-4 h-4"/></button>
            {!isPickerMode && <button onClick={() => setActiveTab('PROTOCOLS')} className={`p-2 rounded ${activeTab === 'PROTOCOLS' ? 'bg-primary text-black' : 'text-gray-400'}`}><Layers className="w-4 h-4"/></button>}
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            <Input 
              placeholder={activeTab === 'DATABASE' ? "Search exercises..." : "Search protocols..."} 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
             onClick={() => setShowFilterModal(true)}
             className={`px-4 flex items-center gap-2 border ${selectedFilters.length > 0 ? 'bg-primary text-black border-primary' : 'bg-surfaceHighlight border-white/20 text-gray-400 hover:text-white'} transition-colors`}
        >
             <SlidersHorizontal className="w-4 h-4" />
             <span className="hidden sm:inline text-xs font-mono">CONFIG</span>
          </button>
        </div>
      </div>

      <FilterModal 
         isOpen={showFilterModal}
         onClose={() => setShowFilterModal(false)}
         selectedFilters={selectedFilters}
         onToggleFilter={toggleFilter}
         sections={[
           { title: "Target Muscle", options: muscles },
           { title: "Difficulty Level", options: difficulties }
         ]}
      />

      <div className="flex-1 overflow-y-auto pr-1">
        {activeTab === 'DATABASE' ? (
          loading ? (
            <div className="flex justify-center py-20 text-primary animate-pulse font-mono text-xs">ACCESSING MAINFRAME...</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {exercises.map((ex, idx) => (
                <div key={idx} onClick={() => setSelectedEx(ex)} className="group flex items-center gap-4 p-3 border border-transparent hover:border-white/10 bg-surfaceHighlight hover:bg-white/5 cursor-pointer transition-all">
                  <div className="w-16 h-16 shrink-0 bg-gray-900 overflow-hidden">
                    <img src={getMuscleImage(ex.muscle)} className="w-full h-full object-cover grayscale opacity-70 group-hover:opacity-100 transition-opacity" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors uppercase">{ex.name}</h4>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline">{ex.muscle}</Badge>
                      <span className={`text-[10px] uppercase border px-1 ${ex.difficulty === 'expert' ? 'text-red-400 border-red-900' : 'text-gray-500 border-transparent'}`}>{ex.difficulty}</span>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-700 rotate-180" />
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 gap-4">
             {PREMADE_ROUTINES.filter(r => {
                // Filter logic for protocols
                const matchesName = r.name.toLowerCase().includes(searchTerm.toLowerCase());
                
                // Difficulty Filter (any exercise matches)
                const matchesDiff = difficultyFilters.length > 0 ? r.exercises.some(e => difficultyFilters.includes(e.difficulty)) : true;
                
                // Muscle Filter (any exercise matches)
                const matchesMuscle = muscleFilters.length > 0 ? r.exercises.some(e => muscleFilters.includes(e.muscle)) : true;

                return matchesName && matchesDiff && matchesMuscle;
             }).map(routine => (
               <Card key={routine.id} className="cursor-pointer group">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg text-white group-hover:text-primary transition-colors">{routine.name}</h3>
                    <Button variant="ghost" className="!p-1 !h-auto" onClick={() => onImportRoutine(routine)}>
                       <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 mb-4">{routine.description}</p>
                  <div className="flex gap-2">
                     {routine.exercises.slice(0, 3).map(ex => (
                        <Badge key={ex.id} variant="outline">{ex.muscle}</Badge>
                     ))}
                     {routine.exercises.length > 3 && <span className="text-xs text-gray-600">+{routine.exercises.length - 3}</span>}
                  </div>
               </Card>
             ))}
          </div>
        )}
      </div>

      <ExerciseModal 
        exercise={selectedEx} 
        onClose={() => setSelectedEx(null)} 
        onAddToRoutine={onAddToRoutine ? (ex) => { onAddToRoutine(ex); onClosePicker && onClosePicker(); } : undefined} 
      />
    </div>
  );
};

// 7. LOGS VIEW (HISTORY)
const LogsView: React.FC<{ history: WorkoutLog[] }> = ({ history }) => {
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | 'LAST_14'>('LAST_14');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);

  // Generate last 14 days for calendar
  const last14Days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  const getStatusForDay = (date: Date) => {
    // Find logs for this day
    const logs = history.filter(h => {
        const hDate = new Date(h.date);
        return hDate.getDate() === date.getDate() && hDate.getMonth() === date.getMonth();
    });
    if (logs.length === 0) return 'EMPTY';
    if (logs.some(l => l.status === 'COMPLETED')) return 'COMPLETED';
    if (logs.some(l => l.status === 'INCOMPLETE')) return 'INCOMPLETE';
    return 'ABORTED';
  };

  const getDayLabel = (date: Date) => {
    return date.getDate().toString();
  };
  
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'narrow' });
  };

  const filteredHistory = history.filter(log => {
      const logDate = new Date(log.date);
      
      // Date Filter
      let dateMatch = true;
      if (selectedDate !== 'LAST_14') {
          dateMatch = logDate.getDate() === selectedDate.getDate() && logDate.getMonth() === selectedDate.getMonth();
      } else {
           const fourteenDaysAgo = new Date();
           fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
           dateMatch = logDate >= fourteenDaysAgo;
      }

      // Search Filter
      const searchMatch = log.routineName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status Filter
      const statusMatch = statusFilters.length > 0 ? statusFilters.includes(log.status) : true;

      return dateMatch && searchMatch && statusMatch;
  });

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
       <header className="border-b border-white/10 pb-4">
          <h2 className="text-3xl font-light text-white">LOGS</h2>
          <p className="text-xs text-primary uppercase tracking-[0.2em]">Mission Records</p>
       </header>

       {/* Search Bar */}
       <div className="flex gap-2">
         <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Search logs..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <button 
             onClick={() => setShowFilterModal(true)}
             className={`px-4 flex items-center gap-2 border ${statusFilters.length > 0 ? 'bg-primary text-black border-primary' : 'bg-surfaceHighlight border-white/20 text-gray-400 hover:text-white'} transition-colors`}
        >
             <SlidersHorizontal className="w-4 h-4" />
          </button>
       </div>
       
       <FilterModal 
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          selectedFilters={statusFilters}
          onToggleFilter={(f) => statusFilters.includes(f) ? setStatusFilters(statusFilters.filter(s => s !== f)) : setStatusFilters([...statusFilters, f])}
          sections={[{ title: "Mission Status", options: ["COMPLETED", "INCOMPLETE", "ABORTED"] }]}
       />

       {/* Last 14 Days Calendar */}
       <div className="glass-panel p-4 border border-white/5">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-xs text-gray-500 uppercase tracking-widest">Activity Monitor</h3>
             <button 
                onClick={() => setSelectedDate('LAST_14')}
                className={`text-[10px] uppercase border px-2 py-1 transition-colors ${selectedDate === 'LAST_14' ? 'bg-primary text-black border-primary' : 'border-white/20 text-gray-400 hover:text-white'}`}
             >
                Last 14 Days
             </button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {last14Days.map((day, i) => {
              const status = getStatusForDay(day);
              const isSelected = selectedDate !== 'LAST_14' && selectedDate.getDate() === day.getDate();

              let bgClass = 'bg-white/5 border-white/10 text-gray-600';
              if (status === 'COMPLETED') bgClass = 'bg-primary/20 border-primary text-primary';
              else if (status === 'INCOMPLETE') bgClass = 'bg-yellow-500/20 border-yellow-500 text-yellow-500';
              else if (status === 'ABORTED') bgClass = 'bg-red-500/20 border-red-500 text-red-500';
              
              if (isSelected) {
                 bgClass = 'bg-white text-black border-white shadow-[0_0_10px_white]';
              }
              
              return (
                <button 
                  key={i} 
                  onClick={() => setSelectedDate(day)}
                  className="flex flex-col items-center gap-1 group relative outline-none"
                >
                  <div className={`w-8 h-8 rounded border flex flex-col items-center justify-center text-[10px] transition-all ${bgClass}`}>
                     <span className="font-mono">{getDayLabel(day)}</span>
                  </div>
                  <span className="text-[9px] text-gray-700 uppercase">{getDayName(day)}</span>
                </button>
              );
            })}
          </div>
       </div>

       {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600 gap-4">
            <FileText className="w-12 h-12 opacity-20" />
            <p className="font-light text-sm">No mission records found for criteria.</p>
          </div>
       ) : (
         <div className="space-y-4">
            {filteredHistory.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
              <Card key={log.id} onClick={() => setSelectedLog(log)} className={`relative overflow-hidden group cursor-pointer border-l-4 ${log.status === 'COMPLETED' ? 'border-l-primary' : log.status === 'INCOMPLETE' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
                 <div className="flex justify-between items-start mb-2">
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                        <StatusBadge status={log.status} />
                     </div>
                     <h3 className="text-lg font-medium text-white group-hover:text-primary transition-colors">{log.routineName}</h3>
                     <p className="text-xs text-gray-500 font-mono">{new Date(log.date).toLocaleString()}</p>
                   </div>
                   <Badge variant={log.status === 'COMPLETED' ? 'primary' : 'outline'}>+{log.xpEarned} XP</Badge>
                 </div>
                 
                 <div className="grid grid-cols-3 gap-2 mt-4 border-t border-white/10 pt-3">
                   <div className="text-center">
                      <div className="text-[10px] text-gray-500 uppercase">Duration</div>
                      <div className="text-sm font-mono text-white">{log.duration}m</div>
                   </div>
                   <div className="text-center border-l border-white/10">
                      <div className="text-[10px] text-gray-500 uppercase">Volume</div>
                      <div className="text-sm font-mono text-white">{log.totalVolume}kg</div>
                   </div>
                   <div className="text-center border-l border-white/10">
                      <div className="text-[10px] text-gray-500 uppercase">Done</div>
                      <div className="text-sm font-mono text-white">{log.exercisesCompleted}/{log.exercises.length}</div>
                   </div>
                 </div>
              </Card>
            ))}
         </div>
       )}

       {/* Log Detail Modal */}
       {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
           <div className="w-full max-w-lg glass-panel p-0 relative border border-white/20 flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-white/10 flex justify-between items-start bg-white/5">
                 <div>
                    <h3 className="text-xl font-light text-white uppercase">{selectedLog.routineName}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <StatusBadge status={selectedLog.status} />
                      <span className="text-xs text-gray-400 font-mono">{new Date(selectedLog.date).toLocaleString()}</span>
                    </div>
                 </div>
                 <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 {selectedLog.exercises.map((ex, i) => {
                    const setsDone = ex.setLogs.filter(s => s.completed).length;
                    const allDone = setsDone === ex.setLogs.length;
                    return (
                      <div key={i} className="border-b border-white/5 pb-4 last:border-0">
                         <div className="flex justify-between items-center mb-2">
                            <h4 className={`text-sm uppercase ${allDone ? 'text-primary' : 'text-white'}`}>{ex.name}</h4>
                            <span className="text-xs font-mono text-gray-500">{setsDone}/{ex.setLogs.length} Sets</span>
                         </div>
                         <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-600 uppercase mb-1">
                            <span>Set</span>
                            <span>Kg</span>
                            <span>Reps</span>
                            <span>Stat</span>
                         </div>
                         {ex.setLogs.map((set, si) => (
                            <div key={si} className={`grid grid-cols-4 gap-2 text-xs items-center ${set.completed ? 'text-gray-300' : 'text-gray-600'}`}>
                               <span>{si + 1}</span>
                               <span>{set.weight}</span>
                               <span>{set.reps}</span>
                               <span>{set.completed ? <Check className="w-3 h-3 text-primary" /> : '-'}</span>
                            </div>
                         ))}
                      </div>
                    )
                 })}
              </div>
              
              <div className="p-4 bg-black/40 border-t border-white/10 text-center">
                 <div className="flex justify-around text-xs font-mono">
                    <div>
                      <span className="block text-gray-500">TOTAL VOL</span>
                      <span className="text-white">{selectedLog.totalVolume} kg</span>
                    </div>
                    <div>
                      <span className="block text-gray-500">XP GAINED</span>
                      <span className="text-primary">+{selectedLog.xpEarned}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
       )}
    </div>
  );
};

// 8. AGENT VIEW (PROFILE + STATS)
const AgentView: React.FC<{ 
  user: UserProfile; 
  onUpdateUser: (u: UserProfile) => void;
}> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localUser, setLocalUser] = useState(user);

  const saveProfile = () => {
    onUpdateUser(localUser);
    setIsEditing(false);
  };

  const xpProgress = (user.currentXp / user.xpRequired) * 100;

  // Mock data for line charts (could be real in future)
  const chartLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const chestData = [60, 62.5, 62.5, 65, 65, 67.5, 70];
  const legsData = [80, 80, 85, 85, 90, 95, 100];
  const backData = [50, 55, 55, 60, 60, 60, 65];

  const updateStat = (label: string, value: string) => {
    let numValue = parseInt(value) || 0;
    if (numValue > 120) numValue = 120;
    if (numValue < 0) numValue = 0;
    
    setLocalUser(prev => ({
      ...prev,
      stats: prev.stats.map(s => s.label === label ? { ...s, value: numValue } : s)
    }));
  };

  return (
    <div className="space-y-8 pb-28">
      {/* Header / Biometrics */}
      <div className="relative">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-800 border border-primary flex items-center justify-center relative shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                <span className="text-2xl font-thin text-white">{localUser.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-xl font-light text-white uppercase">{localUser.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-xs text-primary font-mono bg-primary/10 px-1 border border-primary/20">LVL {user.level}</span>
                   <span className="text-[10px] text-gray-500 uppercase tracking-widest">Operative</span>
                </div>
              </div>
           </div>
           <button onClick={() => isEditing ? saveProfile() : setIsEditing(true)} className="text-gray-400 hover:text-white">
             {isEditing ? <Save className="w-5 h-5 text-primary" /> : <Settings className="w-5 h-5" />}
           </button>
        </div>
        
        {/* Level Progress */}
        <div className="mt-4">
           <div className="flex justify-between text-[10px] text-gray-500 uppercase mb-1 font-mono">
              <span>XP Progress</span>
              <span>{user.currentXp} / {user.xpRequired}</span>
           </div>
           <ProgressBar progress={xpProgress} className="h-2" />
        </div>
        
        {isEditing && (
          <div className="grid grid-cols-2 gap-4 mt-6 bg-white/5 p-4 animate-fade-in border border-white/10">
             <div>
                <label className="text-[10px] text-gray-500 uppercase">Height (cm)</label>
                <Input value={localUser.height} onChange={(e) => setLocalUser({...localUser, height: e.target.value})} className="!bg-black/30 text-center" />
             </div>
             <div>
                <label className="text-[10px] text-gray-500 uppercase">Weight (kg)</label>
                <Input value={localUser.weight} onChange={(e) => setLocalUser({...localUser, weight: e.target.value})} className="!bg-black/30 text-center" />
             </div>
          </div>
        )}
      </div>

      {/* PES (Radar) Chart */}
      <div>
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-primary" />
              <h3 className="text-xs text-gray-500 uppercase tracking-widest">Biometric Balance (PES)</h3>
           </div>
           {isEditing && <span className="text-[9px] text-primary uppercase">Max 120kg</span>}
         </div>
         
         <Card className="flex flex-col items-center py-4 gap-4">
           <RadarChart data={localUser.stats} />
           
           {isEditing && (
              <div className="grid grid-cols-1 gap-4 w-full mt-4 border-t border-white/10 pt-4 px-2">
                 {localUser.stats.map(stat => (
                    <div key={stat.label} className="flex items-center gap-3">
                       <label className="text-[10px] text-gray-500 uppercase w-12">{stat.label}</label>
                       <div className="flex-1 flex items-center gap-3">
                         <input 
                           type="range" 
                           min="0" 
                           max="120" 
                           value={stat.value} 
                           onChange={(e) => updateStat(stat.label, e.target.value)}
                           className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                         />
                         <input 
                           type="number"
                           min="0"
                           max="120"
                           value={stat.value} 
                           onChange={(e) => updateStat(stat.label, e.target.value)}
                           className="w-12 bg-black/30 border border-white/10 text-white text-xs text-center py-1 rounded"
                         />
                       </div>
                    </div>
                 ))}
              </div>
           )}
         </Card>
      </div>

      {/* Progress Charts */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Chest / Bench Press</h3>
          <Card className="p-4">
             <SimpleChart data={chestData} labels={chartLabels} color="#00ffff" />
          </Card>
        </div>
        <div>
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Legs / Squat</h3>
          <Card className="p-4">
             <SimpleChart data={legsData} labels={chartLabels} color="#ff00ff" />
          </Card>
        </div>
        <div>
          <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4">Back / Deadlift</h3>
          <Card className="p-4">
             <SimpleChart data={backData} labels={chartLabels} color="#ffff00" />
          </Card>
        </div>
      </div>
    </div>
  );
};


// --- Main App Component ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [user, setUser] = useState<UserProfile>({
    name: 'Solo Runner',
    email: 'user@solotrain.dev',
    weight: '75',
    height: '180',
    level: 1,
    currentXp: 120,
    xpRequired: 500,
    stats: [
      { label: 'Chest', value: 70, fullMark: 120 },
      { label: 'Back', value: 65, fullMark: 120 },
      { label: 'Legs', value: 90, fullMark: 120 },
      { label: 'Arms', value: 60, fullMark: 120 },
      { label: 'Core', value: 75, fullMark: 120 },
    ]
  });
  
  // Data State
  const [routines, setRoutines] = useState<Routine[]>([
    {
      id: 'r1',
      name: 'Alpha Protocol',
      description: 'High intensity upper body tactical conditioning.',
      isFavorite: true,
      exercises: [
        { 
          id: 'e1', 
          name: 'Barbell Bench Press', 
          muscle: 'chest', 
          targetSets: 4, 
          targetReps: '8-10', 
          targetWeight: '60',
          setLogs: [],
          type: 'strength', 
          difficulty: 'intermediate', 
          equipment: 'barbell', 
          instructions: 'Press.' 
        },
      ],
      lastPerformed: '2 DAYS AGO'
    }
  ]);
  
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>(DUMMY_LOGS);

  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);

  // New State for handling the multi-step views (picker)
  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);

  // Handlers
  const handleLogin = () => setTimeout(() => setView('DASHBOARD'), 800);

  const handleSelectRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    setView('ROUTINE_DETAIL');
  };

  const handleCreateRoutine = () => {
    const newRoutine: Routine = {
      id: Date.now().toString(),
      name: 'New Protocol',
      description: '',
      exercises: []
    };
    setRoutines([newRoutine, ...routines]);
    setSelectedRoutine(newRoutine);
    setView('ROUTINE_DETAIL');
    setIsExercisePickerOpen(true);
  };

  const handleForkRoutine = (routine: Routine) => {
    const forked: Routine = {
      ...routine,
      id: Date.now().toString(),
      name: `${routine.name} (Copy)`,
      isFavorite: false,
      lastPerformed: undefined,
      exercises: routine.exercises.map(ex => ({...ex, id: Date.now() + Math.random().toString()})) // Clean IDs
    };
    setRoutines([forked, ...routines]);
    setSelectedRoutine(forked);
    setView('ROUTINE_DETAIL');
  };

  const handleImportRoutine = (routine: Routine) => {
    const imported: Routine = {
      ...routine,
      id: `imported_${Date.now()}`,
      isFavorite: false,
    };
    setRoutines([imported, ...routines]);
    alert("Protocol imported successfully.");
  };

  const handleSaveRoutine = (updatedRoutine: Routine) => {
    if (updatedRoutine.isFavorite) {
       // Deactivate others
       setRoutines(prev => prev.map(r => ({
          ...r,
          isFavorite: r.id === updatedRoutine.id ? true : false
       })).map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
    } else {
       setRoutines(prev => prev.map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
    }
    setSelectedRoutine(updatedRoutine);
  };

  const handleStartWorkout = (routine: Routine) => {
    const sessionExercises = routine.exercises.map(ex => ({
      ...ex,
      setLogs: Array.from({ length: ex.targetSets }).map((_, i) => ({
        id: `${ex.id}_s${i}`,
        weight: ex.targetWeight || '',
        reps: ex.targetReps || '',
        completed: false
      }))
    }));

    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      routineId: routine.id,
      routineName: routine.name,
      startTime: Date.now(),
      exercises: sessionExercises
    };

    setActiveSession(newSession);
    setView('WORKOUT');
  };

  const handleFinishWorkout = () => {
    if (!activeSession) return;

    const xpEarned = calculateXP(activeSession.exercises);
    const endTime = Date.now();
    const duration = Math.round((endTime - activeSession.startTime) / 60000); // Minutes
    const totalVolume = activeSession.exercises.reduce((vol, ex) => {
      return vol + ex.setLogs.reduce((sVol, s) => s.completed ? sVol + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0) : sVol, 0);
    }, 0);
    const exercisesCompleted = activeSession.exercises.filter(ex => ex.setLogs.some(s => s.completed)).length;
    
    const allExercisesFullyDone = activeSession.exercises.every(ex => ex.setLogs.every(s => s.completed));
    const status: LogStatus = allExercisesFullyDone ? 'COMPLETED' : 'INCOMPLETE';

    const updatedRoutines = routines.map(r => 
      r.id === activeSession.routineId ? { ...r, lastPerformed: 'JUST NOW' } : r
    );
    setRoutines(updatedRoutines);

    const log: WorkoutLog = {
      id: activeSession.id,
      routineName: activeSession.routineName,
      date: new Date().toISOString(),
      duration,
      xpEarned,
      exercisesCompleted,
      totalVolume,
      status,
      exercises: activeSession.exercises 
    };
    setWorkoutHistory([...workoutHistory, log]);

    let newXp = user.currentXp + xpEarned;
    let newLevel = user.level;
    let newReq = user.xpRequired;

    if (newXp >= newReq) {
      newXp = newXp - newReq;
      newLevel += 1;
      newReq = newReq + 500; 
      alert(`LEVEL UP! \nPromoted to Level ${newLevel}`);
    }

    setUser({ ...user, level: newLevel, currentXp: newXp, xpRequired: newReq });
    setActiveSession(null);
    setView('LOGS');
  };

  const handleAbortWorkout = () => {
    if (!activeSession) return;
    if (confirm("Abort mission? Status will be logged as FAILURE.")) {
      const endTime = Date.now();
      const duration = Math.round((endTime - activeSession.startTime) / 60000);
      const xpEarned = Math.floor(calculateXP(activeSession.exercises) * 0.5); 
      const totalVolume = activeSession.exercises.reduce((vol, ex) => {
        return vol + ex.setLogs.reduce((sVol, s) => s.completed ? sVol + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0) : sVol, 0);
      }, 0);
      const exercisesCompleted = activeSession.exercises.filter(ex => ex.setLogs.some(s => s.completed)).length;

      const log: WorkoutLog = {
        id: activeSession.id,
        routineName: activeSession.routineName,
        date: new Date().toISOString(),
        duration,
        xpEarned, 
        exercisesCompleted,
        totalVolume,
        status: 'ABORTED',
        exercises: activeSession.exercises
      };
      
      setWorkoutHistory([...workoutHistory, log]);
      setActiveSession(null);
      setView('LOGS');
    }
  };

  // Adds to specific (currently selected) routine - used in Edit Mode
  const handleAddExerciseToRoutine = (ex: Exercise) => {
    if (!selectedRoutine) return;

    const newRoutineExercise: RoutineExercise = {
      ...ex,
      id: Date.now().toString(),
      targetSets: 3,
      targetReps: '10',
      targetWeight: '',
      setLogs: []
    };

    const updatedRoutine = {
      ...selectedRoutine,
      exercises: [...selectedRoutine.exercises, newRoutineExercise]
    };

    setSelectedRoutine(updatedRoutine);
    setRoutines(prev => prev.map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
  };

  // Adds to the globally "Active" (Favorite) routine - used in Intel/Explore Mode
  const handleAddExerciseToActiveMission = (ex: Exercise) => {
     const activeMission = routines.find(r => r.isFavorite);
     if (!activeMission) {
        alert("No Active Mission found. Please set a Mission as Active (Favorite) first in the Dashboard.");
        return;
     }

     const newRoutineExercise: RoutineExercise = {
      ...ex,
      id: Date.now().toString(),
      targetSets: 3,
      targetReps: '10',
      targetWeight: '',
      setLogs: []
    };

    const updatedRoutine = {
      ...activeMission,
      exercises: [...activeMission.exercises, newRoutineExercise]
    };

    setRoutines(prev => prev.map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
    // If we happen to be viewing it, update that too
    if (selectedRoutine && selectedRoutine.id === updatedRoutine.id) {
       setSelectedRoutine(updatedRoutine);
    }

    alert(`Exercise successfully added to Active Mission: ${activeMission.name}`);
  };

  const Navigation = () => (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 flex justify-between items-center px-2 pb-2">
      <div className="flex-1 flex justify-around">
        <button onClick={() => setView('DASHBOARD')} className={`flex flex-col items-center gap-1 p-2 ${view === 'DASHBOARD' ? 'text-primary' : 'text-gray-600'}`}>
          <Activity className="w-5 h-5" />
          <span className="text-[9px] uppercase">Missions</span>
        </button>
        <button onClick={() => setView('EXPLORE')} className={`flex flex-col items-center gap-1 p-2 ${view === 'EXPLORE' ? 'text-primary' : 'text-gray-600'}`}>
          <Search className="w-5 h-5" />
          <span className="text-[9px] uppercase">Intel</span>
        </button>
      </div>

      <div className="relative -top-6">
         <button 
           onClick={() => activeSession && setView('WORKOUT')}
           disabled={!activeSession}
           className={`
             w-14 h-14 rounded-full flex items-center justify-center border-4 border-background transition-all duration-300
             ${activeSession 
               ? 'bg-primary text-black shadow-[0_0_20px_rgba(0,255,255,0.4)]' 
               : 'bg-white/10 text-gray-500 cursor-not-allowed'}
           `}
         >
           <Dumbbell className="w-6 h-6" />
         </button>
      </div>

      <div className="flex-1 flex justify-around">
        <button onClick={() => setView('LOGS')} className={`flex flex-col items-center gap-1 p-2 ${view === 'LOGS' ? 'text-primary' : 'text-gray-600'}`}>
          <FileText className="w-5 h-5" />
          <span className="text-[9px] uppercase">Logs</span>
        </button>
        <button onClick={() => setView('PROFILE')} className={`flex flex-col items-center gap-1 p-2 ${view === 'PROFILE' ? 'text-primary' : 'text-gray-600'}`}>
          <User className="w-5 h-5" />
          <span className="text-[9px] uppercase">Agent</span>
        </button>
      </div>
    </nav>
  );

  if (view === 'LOGIN') return <LoginView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary selection:text-black font-sans">
      <div className="max-w-md mx-auto min-h-screen relative bg-surface shadow-2xl overflow-hidden flex flex-col">
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 shrink-0"></div>
        
        <main className="p-6 flex-1 overflow-hidden h-full relative">
          
          {isExercisePickerOpen && (
             <div className="absolute inset-0 z-40 bg-surface animate-fade-in p-6">
                <ExploreView 
                   onImportRoutine={handleImportRoutine}
                   onAddToRoutine={handleAddExerciseToRoutine}
                   isPickerMode={true}
                   onClosePicker={() => setIsExercisePickerOpen(false)}
                />
             </div>
          )}

          {view === 'DASHBOARD' && (
            <DashboardView 
              user={user} 
              routines={routines} 
              onSelectRoutine={handleSelectRoutine}
              onCreateRoutine={handleCreateRoutine}
              onForkRoutine={handleForkRoutine}
            />
          )}

          {view === 'ROUTINE_DETAIL' && selectedRoutine && (
            <RoutineDetailView 
              routine={selectedRoutine}
              onBack={() => setView('DASHBOARD')}
              onStart={handleStartWorkout}
              onSave={handleSaveRoutine}
              onDelete={(id) => {
                 setRoutines(routines.filter(r => r.id !== id));
                 setView('DASHBOARD');
              }}
              onAddExercises={() => setIsExercisePickerOpen(true)}
              isNew={selectedRoutine.exercises.length === 0}
            />
          )}

          {view === 'EXPLORE' && (
            <ExploreView 
              onImportRoutine={handleImportRoutine}
              onAddToRoutine={handleAddExerciseToActiveMission} 
            />
          )}

          {view === 'LOGS' && <LogsView history={workoutHistory} />}

          {view === 'PROFILE' && <AgentView user={user} onUpdateUser={setUser} />}

          {view === 'WORKOUT' && activeSession && (
            <WorkoutView 
              session={activeSession}
              onUpdateSession={setActiveSession}
              onFinish={handleFinishWorkout}
              onAbort={handleAbortWorkout}
              onMinimize={() => setView('DASHBOARD')}
            />
          )}
        </main>

        <Navigation />
      </div>
    </div>
  );
};

export default App;
