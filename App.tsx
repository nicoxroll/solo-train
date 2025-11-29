
import React, { useState, useEffect } from 'react';
import { fetchExercises, getExerciseImage } from './services/api';
import { Exercise, Routine, RoutineExercise, UserProfile, ViewState, WorkoutSession, WorkoutLog, LogStatus, UserStats } from './types';
import { Button, Card, Input, Badge, ProgressBar, SimpleChart, Select, RadarChart, FilterGroup, FilterModal, StatusBadge, CalendarGrid } from './components/Components';
import { 
  User, Dumbbell, Play, Search, Plus, Check, 
  Trash2, ChevronLeft, Settings, Activity, Save, 
  X, ChevronDown, ChevronUp, Image as ImageIcon,
  Database, Layers, BrainCircuit, AlertTriangle, FileText, Calendar, Copy, SlidersHorizontal, Info, RefreshCw, Ban, BarChart3, List, Target, Zap
} from 'lucide-react';

// --- Helper Data & Functions ---

const calculateXP = (exercises: RoutineExercise[]): number => {
  let xp = 0;
  exercises.forEach(ex => {
    // Base XP per set based on difficulty (defaulting to intermediate if unknown)
    const diff = ex.difficulty || 'intermediate';
    const multiplier = diff === 'expert' ? 3 : diff === 'intermediate' ? 2 : 1;
    const completedSets = ex.setLogs.filter(s => s.completed).length;
    // 10 XP base per set
    xp += completedSets * 10 * multiplier;
  });
  return xp;
};

const calculateEstimatedXP = (routine: Routine): number => {
  let xp = 0;
  routine.exercises.forEach(ex => {
    const diff = ex.difficulty || 'intermediate';
    const multiplier = diff === 'expert' ? 3 : diff === 'intermediate' ? 2 : 1;
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
      { 
        id: 'p1_e1', name: 'Barbell Squat', bodyPart: 'upper legs', muscle: 'upper legs', type: 'strength', difficulty: 'expert', equipment: 'barbell', target: 'quads', secondaryMuscles: ['glutes'], gifUrl: 'https://images.unsplash.com/photo-1574680096141-1cddd32e2552?q=80&w=800&auto=format&fit=crop', instructions: ['Squat deep.'], targetSets: 5, targetReps: '5', targetWeight: '100', setLogs: [] 
      },
      { 
        id: 'p1_e2', name: 'Bench Press', bodyPart: 'chest', muscle: 'chest', type: 'strength', difficulty: 'intermediate', equipment: 'barbell', target: 'pecs', secondaryMuscles: ['triceps'], gifUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop', instructions: ['Press.'], targetSets: 5, targetReps: '5', targetWeight: '80', setLogs: [] 
      },
    ]
  },
  {
    id: 'p2',
    name: 'Operative Mobility B',
    description: 'High volume mobility and core sequence for field endurance.',
    isFavorite: false,
    exercises: [
       { 
        id: 'p2_e1', name: '45° side bend', bodyPart: 'waist', muscle: 'waist', type: 'strength', difficulty: 'beginner', equipment: 'body weight', target: 'abs', secondaryMuscles: ['obliques'], gifUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop', instructions: ['Bend.'], targetSets: 3, targetReps: '15', targetWeight: '0', setLogs: [] 
      },
      { 
        id: 'p2_e2', name: 'Barbell Deadlift', bodyPart: 'back', muscle: 'back', type: 'strength', difficulty: 'expert', equipment: 'barbell', target: 'spine', secondaryMuscles: ['glutes'], gifUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop', instructions: ['Lift.'], targetSets: 3, targetReps: '8', targetWeight: '120', setLogs: [] 
      }
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
const ExerciseModal: React.FC<{ 
  exercise: Exercise | null; 
  onClose: () => void; 
  onAddToRoutine?: (ex: Exercise) => void;
  actionLabel?: string;
}> = ({ exercise, onClose, onAddToRoutine, actionLabel = "Add to Active Mission" }) => {
  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-surface border border-white/10 relative overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header / GIF Area */}
        <div className="relative shrink-0 bg-white/5 border-b border-white/10 flex flex-col">
            <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white hover:text-primary rounded-full backdrop-blur-md">
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-full aspect-video md:aspect-[2/1] relative flex justify-center bg-black">
               <img src={getExerciseImage(exercise)} alt={exercise.name} className="h-full w-full object-cover opacity-80" />
            </div>

            <div className="p-6 pb-2">
               <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-light text-white uppercase tracking-wide break-words max-w-md">{exercise.name}</h2>
                    <div className="flex gap-2 mt-2">
                       <Badge variant="primary">{exercise.bodyPart}</Badge>
                       <Badge variant="outline">{exercise.equipment}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                     <span className="text-[10px] text-gray-500 uppercase block">Target</span>
                     <span className="text-primary font-mono text-sm uppercase">{exercise.target}</span>
                  </div>
               </div>
            </div>
        </div>
        
        {/* Content Scroll */}
        <div className="p-6 pt-2 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Detailed Info Grid */}
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 p-3 border border-white/5 rounded-sm">
                <div className="flex items-center gap-2 mb-2 text-gray-400">
                   <Target className="w-4 h-4" />
                   <span className="text-[10px] uppercase tracking-widest">Secondary Muscles</span>
                </div>
                <div className="flex flex-wrap gap-1">
                   {exercise.secondaryMuscles.map(m => (
                      <span key={m} className="text-xs text-gray-300 bg-black/40 px-2 py-0.5 rounded-sm capitalize">{m}</span>
                   ))}
                </div>
             </div>
             <div className="bg-white/5 p-3 border border-white/5 rounded-sm">
                <div className="flex items-center gap-2 mb-2 text-gray-400">
                   <Zap className="w-4 h-4" />
                   <span className="text-[10px] uppercase tracking-widest">Equipment</span>
                </div>
                <p className="text-sm text-gray-200 capitalize">{exercise.equipment}</p>
             </div>
          </div>
          
          {/* Instructions */}
          <div className="border-t border-white/10 pt-4">
            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-4 flex items-center gap-2">
               <FileText className="w-3 h-3" /> Operational Sequence
            </label>
            <div className="space-y-4">
               {exercise.instructions.map((step, idx) => (
                  <div key={idx} className="flex gap-4 group">
                     <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 text-primary border border-white/10 flex items-center justify-center text-xs font-mono group-hover:border-primary group-hover:bg-primary/10 transition-colors">
                        {idx + 1}
                     </div>
                     <p className="text-sm font-light text-gray-300 leading-relaxed pt-0.5">{step}</p>
                  </div>
               ))}
            </div>
          </div>
        </div>

        {onAddToRoutine && (
          <div className="p-4 border-t border-white/10 bg-surfaceHighlight shrink-0 z-20">
            <Button onClick={() => { onAddToRoutine(exercise); onClose(); }} className="w-full shadow-lg shadow-primary/10">
              {actionLabel}
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
    if (f === 'ALL') {
      setFilters([]);
      return;
    }
    if (filters.includes(f)) setFilters(filters.filter(x => x !== f));
    else setFilters([...filters, f]);
  };

  const filteredRoutines = routines.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    
    // Filter Logic
    let matchesActive = true;
    let matchesRecent = true;

    if (filters.length > 0) {
      if (filters.includes('ACTIVE')) matchesActive = r.isFavorite === true;
      if (filters.includes('RECENT')) matchesRecent = r.lastPerformed !== undefined;
    }
    
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
          { title: "Status", options: ["ALL", "ACTIVE", "RECENT"] }
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
    onSave(updated); 
  };

  const handleSaveChanges = () => {
    onSave(editedRoutine);
    setIsEditing(false);
  };

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
          <div key={ex.id} className="glass-panel p-4 border border-white/10 relative group">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white overflow-hidden rounded-sm shrink-0">
                  <img src={getExerciseImage(ex)} alt={ex.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                   <h4 className="text-white font-medium">{ex.name}</h4>
                   {isEditing && (
                     <button onClick={() => removeExercise(ex.id)} className="text-red-500/50 hover:text-red-500">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   )}
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase">Sets</label>
                    {isEditing ? (
                      <Input 
                         type="number" 
                         value={ex.targetSets} 
                         onChange={(e) => updateExercise(ex.id, 'targetSets', parseInt(e.target.value) || 0)}
                         className="!py-1 !text-xs"
                      />
                    ) : (
                      <p className="text-sm font-mono">{ex.targetSets}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase">Reps</label>
                    {isEditing ? (
                      <Input 
                         value={ex.targetReps} 
                         onChange={(e) => updateExercise(ex.id, 'targetReps', e.target.value)}
                         className="!py-1 !text-xs"
                      />
                    ) : (
                      <p className="text-sm font-mono">{ex.targetReps}</p>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase">Load (KG)</label>
                    {isEditing ? (
                      <Input 
                         value={ex.targetWeight} 
                         onChange={(e) => updateExercise(ex.id, 'targetWeight', e.target.value)}
                         className="!py-1 !text-xs"
                      />
                    ) : (
                      <p className="text-sm font-mono">{ex.targetWeight}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-24 left-6 right-6 flex gap-4">
         {isEditing ? (
           <Button onClick={handleSaveChanges} className="w-full">
             <Save className="w-4 h-4 mr-2" /> Save Protocol
           </Button>
         ) : (
           <Button onClick={() => onStart(editedRoutine)} className="w-full">
             <Play className="w-4 h-4 mr-2" /> Start Mission
           </Button>
         )}
      </div>
    </div>
  );
};

// 5. WORKOUT VIEW
const WorkoutView: React.FC<{
  session: WorkoutSession;
  onFinish: (s: WorkoutSession) => void;
  onAbort: (s: WorkoutSession) => void;
  onUpdateSession: (s: WorkoutSession) => void;
  onViewDetails: (ex: RoutineExercise) => void;
}> = ({ session, onFinish, onAbort, onUpdateSession, onViewDetails }) => {
  const [elapsed, setElapsed] = useState(0);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - session.startTime);
    }, 1000);
    return () => clearInterval(interval);
  }, [session.startTime]);

  const toggleSet = (exId: string, setIndex: number) => {
    const updatedExercises = session.exercises.map(ex => {
      if (ex.id === exId) {
        const newLogs = [...ex.setLogs];
        newLogs[setIndex].completed = !newLogs[setIndex].completed;
        return { ...ex, setLogs: newLogs };
      }
      return ex;
    });
    onUpdateSession({ ...session, exercises: updatedExercises });
  };

  const markExerciseComplete = (exId: string) => {
    const updatedExercises = session.exercises.map(ex => {
      if (ex.id === exId) {
        const allCompleted = ex.setLogs.every(s => s.completed);
        const newLogs = ex.setLogs.map(s => ({ ...s, completed: !allCompleted }));
        return { ...ex, setLogs: newLogs };
      }
      return ex;
    });
    onUpdateSession({ ...session, exercises: updatedExercises });
  };

  return (
    <div className="pb-28 space-y-6 relative h-full flex flex-col">
       <div className="sticky top-0 bg-background/80 backdrop-blur-md z-20 py-4 border-b border-white/10 flex justify-between items-center">
         <div>
           <h2 className="text-lg text-primary uppercase tracking-widest animate-pulse">Mission Active</h2>
           <p className="text-xs text-white">{session.routineName}</p>
         </div>
         <div className="font-mono text-2xl font-light text-white">
           {new Date(elapsed).toISOString().substr(11, 8)}
         </div>
       </div>

       <div className="space-y-4 flex-1 overflow-y-auto">
         {session.exercises.map(ex => {
           const completedSets = ex.setLogs.filter(s => s.completed).length;
           const isDone = completedSets === ex.targetSets;
           const isExpanded = expandedExercise === ex.id;
           
           return (
             <div key={ex.id} className={`glass-panel border transition-all duration-300 ${isDone ? 'border-primary/50 bg-primary/5' : 'border-white/10'} overflow-hidden`}>
               <div 
                 onClick={() => setExpandedExercise(isExpanded ? null : ex.id)}
                 className="p-4 flex items-center justify-between cursor-pointer"
               >
                 <div className="flex items-center gap-4">
                   <div className="relative w-12 h-12 bg-white rounded-sm overflow-hidden">
                     <img src={getExerciseImage(ex)} className="w-full h-full object-contain" alt="" />
                     {isDone && (
                       <div className="absolute inset-0 bg-primary/20 flex items-center justify-center border border-primary">
                         <Check className="w-6 h-6 text-primary" />
                       </div>
                     )}
                   </div>
                   <div>
                     <h3 className={`text-lg font-medium ${isDone ? 'text-primary' : 'text-white'}`}>{ex.name}</h3>
                     <p className="text-xs text-gray-500 font-mono">{completedSets}/{ex.targetSets} SETS COMPLETED</p>
                   </div>
                 </div>
                 {isExpanded ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
               </div>

               {isExpanded && (
                 <div className="border-t border-white/5 bg-black/20 p-4 space-y-4 animate-fade-in">
                   <div className="flex justify-end gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onViewDetails(ex); }} 
                        className="text-[10px] uppercase tracking-wider text-primary border border-primary/30 px-2 py-1 hover:bg-primary/10 flex items-center gap-1"
                      >
                         <Info className="w-3 h-3" /> View Guide
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); markExerciseComplete(ex.id); }} 
                        className="text-[10px] uppercase tracking-wider text-gray-400 border border-white/10 px-2 py-1 hover:bg-white/10"
                      >
                         Toggle All
                      </button>
                   </div>
                   
                   <div className="space-y-2">
                     {ex.setLogs.map((set, idx) => (
                       <div key={set.id} className="flex items-center gap-4 bg-white/5 p-2 rounded-sm">
                          <span className="w-6 text-xs text-gray-500 font-mono text-center">{idx + 1}</span>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                             <div className="bg-black/40 px-3 py-1 text-xs text-gray-300 font-mono flex justify-between">
                               <span>{set.weight} KG</span>
                             </div>
                             <div className="bg-black/40 px-3 py-1 text-xs text-gray-300 font-mono flex justify-between">
                               <span>{set.reps} REPS</span>
                             </div>
                          </div>
                          <button 
                            onClick={() => toggleSet(ex.id, idx)}
                            className={`w-8 h-8 flex items-center justify-center border transition-colors ${set.completed ? 'bg-primary border-primary text-black' : 'bg-transparent border-white/20 text-transparent hover:border-white/50'}`}
                          >
                            <Check className="w-4 h-4" />
                          </button>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               
               {/* Progress bar per exercise */}
               <div className="h-1 bg-gray-900 w-full">
                 <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(completedSets / ex.targetSets) * 100}%` }}></div>
               </div>
             </div>
           );
         })}
       </div>

       <div className="grid grid-cols-2 gap-4 pt-4">
         <Button variant="danger" onClick={() => onAbort(session)}>
            Abort Mission
         </Button>
         <Button onClick={() => onFinish(session)}>
            Complete Mission
         </Button>
       </div>
    </div>
  );
};

// 6. EXPLORE VIEW (INTEL)
const ExploreView: React.FC<{ 
  onAddExercise: (ex: Exercise) => void;
  onViewDetails: (ex: Exercise) => void;
  onForkRoutine: (r: Routine) => void;
  isPickerMode?: boolean; 
  hasActiveMission: boolean;
  activeMissionExerciseIds?: string[];
}> = ({ onAddExercise, onViewDetails, onForkRoutine, isPickerMode, hasActiveMission, activeMissionExerciseIds = [] }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [viewMode, setViewMode] = useState<'DATABASE' | 'PROTOCOLS'>('DATABASE');
  
  // Extract specific filter types
  const selectedBodyParts = filters.filter(f => 
    ['back', 'chest', 'cardio', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'].includes(f.toLowerCase())
  );
  
  useEffect(() => {
    if (viewMode === 'DATABASE') {
      const load = async () => {
        setLoading(true);
        // Fetch based on first selected muscle or default to all
        const muscleQuery = selectedBodyParts.length > 0 ? selectedBodyParts[0] : '';
        const data = await fetchExercises(muscleQuery);
        setExercises(data);
        setLoading(false);
      };
      load();
    }
  }, [viewMode, JSON.stringify(selectedBodyParts)]);

  const displayExercises = exercises;

  const displayRoutines = PREMADE_ROUTINES.filter(r => {
    // Basic muscle filter
    if (selectedBodyParts.length > 0) {
      const hasMuscle = r.exercises.some(ex => selectedBodyParts.includes(ex.bodyPart));
      if (!hasMuscle) return false;
    }
    return true;
  });

  const toggleFilter = (f: string) => {
     if (f === 'ALL') {
       setFilters([]);
       return;
     }
     if (filters.includes(f)) setFilters(filters.filter(x => x !== f));
     else setFilters([...filters, f]);
  };

  return (
    <div className="space-y-6 pb-28">
      <header className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h2 className="text-3xl font-light text-white">INTEL</h2>
          <p className="text-xs text-primary uppercase tracking-[0.2em]">Data Repository</p>
        </div>
      </header>

      {/* View Toggle Tabs */}
      {!isPickerMode && (
        <div className="flex bg-white/5 p-1 rounded-lg">
           <button 
             onClick={() => setViewMode('DATABASE')}
             className={`flex-1 py-2 text-xs uppercase tracking-wider rounded-md transition-all ${viewMode === 'DATABASE' ? 'bg-primary text-black font-bold' : 'text-gray-400 hover:text-white'}`}
           >
             Database
           </button>
           <button 
             onClick={() => setViewMode('PROTOCOLS')}
             className={`flex-1 py-2 text-xs uppercase tracking-wider rounded-md transition-all ${viewMode === 'PROTOCOLS' ? 'bg-primary text-black font-bold' : 'text-gray-400 hover:text-white'}`}
           >
             Protocols
           </button>
        </div>
      )}
      
      <div className="flex gap-2">
         <Button variant="glass" onClick={() => setShowFilterModal(true)} className="flex-1 flex justify-between items-center text-xs">
           <span>FILTER // CONFIG</span>
           <SlidersHorizontal className="w-4 h-4" />
         </Button>
      </div>

      <FilterModal 
         isOpen={showFilterModal}
         onClose={() => setShowFilterModal(false)}
         selectedFilters={filters}
         onToggleFilter={toggleFilter}
         sections={[
           { title: "Target Sector", options: ["ALL", "back", "cardio", "chest", "lower arms", "lower legs", "neck", "shoulders", "upper arms", "upper legs", "waist"] }
         ]}
      />

      <div className="grid grid-cols-1 gap-3">
        {viewMode === 'DATABASE' ? (
          loading ? (
            <div className="text-center py-20 text-primary animate-pulse uppercase tracking-widest">Accessing Mainframe...</div>
          ) : (
            displayExercises.map((ex, idx) => {
              const isAddedToActive = activeMissionExerciseIds.includes(ex.id);
              return (
                <div key={idx} className="glass-panel p-3 flex items-center gap-4 hover:bg-white/5 transition-colors group">
                  <div 
                     onClick={() => onViewDetails(ex)}
                     className="w-16 h-16 bg-white cursor-pointer overflow-hidden border border-white/10 group-hover:border-primary/50 transition-all rounded-sm shrink-0"
                  >
                    <img src={getExerciseImage(ex)} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1" onClick={() => onViewDetails(ex)}>
                    <h4 className="text-white font-medium text-sm group-hover:text-primary transition-colors capitalize">{ex.name}</h4>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] text-gray-500 uppercase border border-white/10 px-1">{ex.bodyPart}</span>
                    </div>
                  </div>
                  {/* Logic: If selecting for a specific routine (pickerMode) OR if an active mission exists */}
                  {(hasActiveMission || isPickerMode) && (
                    <div onClick={(e) => { e.stopPropagation(); if(!isAddedToActive) onAddExercise(ex); }}>
                       {isAddedToActive && !isPickerMode ? (
                          <div className="p-2 text-primary border border-primary/50 bg-primary/10 rounded">
                             <Check className="w-4 h-4" />
                          </div>
                       ) : (
                          <Button 
                            variant="secondary" 
                            className="!p-2 !h-auto border-white/20 hover:border-primary hover:text-primary"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                       )}
                    </div>
                  )}
                </div>
              );
            })
          )
        ) : (
          displayRoutines.length > 0 ? (
            displayRoutines.map((routine) => (
              <div key={routine.id} className="glass-panel p-4 border-l-2 border-l-primary/30 hover:border-l-primary transition-all">
                 <div className="flex justify-between items-start">
                    <div>
                       <h3 className="text-white font-light text-lg uppercase">{routine.name}</h3>
                       <p className="text-xs text-gray-500 mb-2">{routine.exercises.length} Exercises // {calculateEstimatedXP(routine)} XP</p>
                    </div>
                    <Button variant="secondary" onClick={() => onForkRoutine(routine)} className="!py-1 !px-2 text-[10px]">
                       <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                 </div>
                 <div className="flex flex-wrap gap-2 mt-3">
                    {routine.exercises.slice(0, 3).map(ex => (
                      <span key={ex.id} className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 text-gray-400">
                        {ex.name}
                      </span>
                    ))}
                    {routine.exercises.length > 3 && <span className="text-[10px] text-gray-500 self-center">...</span>}
                 </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 text-xs uppercase">No protocols found matching filters.</div>
          )
        )}
      </div>
    </div>
  );
};

// 7. AGENT PROFILE VIEW
const AgentView: React.FC<{ user: UserProfile; onUpdateUser: (u: UserProfile) => void }> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editStats, setEditStats] = useState(user.stats);
  const [statsViewMode, setStatsViewMode] = useState<'LIST' | 'GRAPH'>('LIST');

  const handleSave = () => {
    onUpdateUser({ ...user, stats: editStats });
    setIsEditing(false);
  };

  const updateStat = (label: string, val: number) => {
    setEditStats(prev => prev.map(s => s.label === label ? { ...s, value: Math.min(120, Math.max(0, val)) } : s));
  };

  return (
    <div className="space-y-8 pb-28">
      <header className="flex items-center gap-6 border-b border-white/10 pb-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary flex items-center justify-center relative overflow-hidden">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="Agent" className="w-full h-full object-cover" />
          ) : (
            <User className="w-8 h-8 text-primary" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-light text-white uppercase tracking-wider">{user.name}</h2>
          <div className="flex items-center gap-2 mt-1">
             <Badge variant="primary">LEVEL {user.level}</Badge>
             <span className="text-xs text-gray-500 font-mono">OPERATIVE CLASS A</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-gray-400 mb-1 uppercase tracking-widest">
              <span>XP Progress</span>
              <span>{user.currentXp} / {user.xpRequired}</span>
            </div>
            <ProgressBar progress={(user.currentXp / user.xpRequired) * 100} />
          </div>
        </div>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className="p-2 border border-white/20 text-gray-400 hover:text-white">
          {isEditing ? <Save className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex justify-end gap-2">
         <button 
           onClick={() => setStatsViewMode('LIST')}
           className={`p-2 rounded ${statsViewMode === 'LIST' ? 'bg-primary text-black' : 'bg-white/5 text-gray-400'}`}
         >
            <List className="w-4 h-4" />
         </button>
         <button 
           onClick={() => setStatsViewMode('GRAPH')}
           className={`p-2 rounded ${statsViewMode === 'GRAPH' ? 'bg-primary text-black' : 'bg-white/5 text-gray-400'}`}
         >
            <BarChart3 className="w-4 h-4" />
         </button>
      </div>

      <div className="glass-panel p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
           <Activity className="w-32 h-32" />
        </div>
        <h3 className="text-sm text-gray-400 uppercase tracking-[0.2em] mb-6">Biometric Balance</h3>
        
        {/* Render based on View Mode */}
        {statsViewMode === 'GRAPH' ? (
           <div className="animate-fade-in">
             <RadarChart data={isEditing ? editStats : user.stats} />
           </div>
        ) : (
           <div className="space-y-6 animate-fade-in">
              {(isEditing ? editStats : user.stats).map(stat => (
                <div key={stat.label} className="space-y-2">
                   <div className="flex justify-between text-xs uppercase text-gray-300">
                      <span>{stat.label}</span>
                      <span className="font-mono text-primary">{stat.value}</span>
                   </div>
                   {isEditing ? (
                      <div className="flex items-center gap-4">
                        <input 
                            type="range" 
                            min="0" 
                            max="120" 
                            value={stat.value} 
                            onChange={(e) => updateStat(stat.label, parseInt(e.target.value))}
                            className="flex-1 accent-primary h-1 bg-gray-800 appearance-none cursor-pointer"
                        />
                      </div>
                   ) : (
                      <div className="w-full h-1 bg-gray-800">
                        <div className="h-full bg-primary" style={{ width: `${(stat.value / stat.fullMark) * 100}%` }}></div>
                      </div>
                   )}
                </div>
              ))}
           </div>
        )}
      </div>

      {/* Performance Trends - Only in Graph Mode */}
      {!isEditing && statsViewMode === 'GRAPH' && (
        <div className="space-y-6 animate-fade-in">
           <h3 className="text-sm text-gray-400 uppercase tracking-[0.2em]">Performance Trends</h3>
           <div className="grid grid-cols-1 gap-6">
             {user.stats.map(stat => (
                <div key={stat.label} className="glass-panel p-4">
                    <div className="flex justify-between items-center mb-4">
                       <span className="text-xs uppercase text-white font-bold">{stat.label}</span>
                       <span className="text-[10px] text-gray-500 font-mono">CURRENT: <span className="text-primary text-sm font-bold">{stat.value}</span></span>
                    </div>
                    {/* Generating dummy trend data based on current value */}
                    <SimpleChart 
                        data={[...Array(10)].map((_, i) => {
                           if (i === 9) return stat.value; // Ensure last point is current
                           return Math.max(0, stat.value - (9-i)*2 + Math.random()*10 - 5)
                        })} 
                        labels={[]} 
                    />
                </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

// 8. LOGS VIEW
const LogsView: React.FC<{ logs: WorkoutLog[] }> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);
  const [filters, setFilters] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Generate last 14 days
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split('T')[0];
  });

  const calendarDays = last14Days.map(dateStr => {
     const dayLogs = logs.filter(l => l.date.startsWith(dateStr));
     return {
        day: dateStr.split('-')[2],
        fullDate: dateStr,
        active: dayLogs.some(l => l.status === 'COMPLETED'),
        hasLog: dayLogs.length > 0
     };
  });

  const toggleFilter = (f: string) => {
    if (f === 'ALL') {
      setFilters([]);
      return;
    }
    if (filters.includes(f)) setFilters(filters.filter(x => x !== f));
    else setFilters([...filters, f]);
  };

  const filteredLogs = logs.filter(log => {
     const matchesSearch = log.routineName.toLowerCase().includes(search.toLowerCase());
     const matchesStatus = filters.length > 0 ? filters.includes(log.status) : true;
     const matchesDate = selectedDate ? log.date.startsWith(selectedDate) : true;
     return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6 pb-28">
      <header className="flex justify-between items-end border-b border-white/10 pb-4">
        <div>
          <h2 className="text-3xl font-light text-white">LOGS</h2>
          <p className="text-xs text-primary uppercase tracking-[0.2em]">Mission History</p>
        </div>
      </header>

      {/* 14 Day Calendar */}
      <div className="glass-panel p-4">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs text-gray-400 uppercase tracking-widest">Cycle Activity</h3>
            {selectedDate && (
               <button onClick={() => setSelectedDate(null)} className="text-[10px] text-primary hover:underline">
                  Reset View
               </button>
            )}
         </div>
         <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((d, i) => (
              <button 
                 key={i} 
                 onClick={() => setSelectedDate(d.fullDate)}
                 className={`
                    flex flex-col items-center gap-1 p-1 rounded transition-all
                    ${selectedDate === d.fullDate ? 'bg-white/10 ring-1 ring-primary' : 'hover:bg-white/5'}
                 `}
              >
                <div className={`
                   w-8 h-8 rounded-full flex items-center justify-center text-xs border 
                   ${d.active 
                      ? 'bg-primary text-black border-primary font-bold shadow-[0_0_10px_rgba(0,255,255,0.4)]' 
                      : d.hasLog ? 'border-yellow-500 text-yellow-500' : 'border-white/10 text-gray-500'}
                `}>
                  {d.day}
                </div>
              </button>
            ))}
         </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
          <Input 
            placeholder="Search logs..." 
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
          { title: "Mission Status", options: ["ALL", "COMPLETED", "INCOMPLETE", "ABORTED"] }
        ]}
      />

      <div className="space-y-3">
        {filteredLogs.map(log => (
          <div 
             key={log.id} 
             onClick={() => setSelectedLog(log)}
             className="glass-panel p-4 flex items-center justify-between hover:border-primary/50 cursor-pointer transition-colors"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <h4 className="text-white font-medium">{log.routineName}</h4>
                 <StatusBadge status={log.status} />
              </div>
              <p className="text-xs text-gray-500 font-mono">
                 {new Date(log.date).toLocaleDateString()} // {formatDuration(log.duration * 60000)}
              </p>
            </div>
            <div className="text-right">
               <span className="block text-primary font-mono font-bold text-sm">+{log.xpEarned} XP</span>
               <span className="text-[10px] text-gray-600 uppercase">{log.totalVolume} KG VOL</span>
            </div>
          </div>
        ))}
        {filteredLogs.length === 0 && (
           <div className="text-center py-8 text-gray-600 text-xs uppercase tracking-widest border border-dashed border-white/10 rounded">
              No records found
           </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
         <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedLog(null)}>
            <div className="w-full max-w-lg glass-panel p-6 space-y-6 relative border border-primary/20" onClick={e => e.stopPropagation()}>
               <button onClick={() => setSelectedLog(null)} className="absolute top-4 right-4 text-gray-400"><X className="w-5 h-5"/></button>
               
               <div className="border-b border-white/10 pb-4">
                  <Badge variant="outline" className="mb-2">{new Date(selectedLog.date).toLocaleString()}</Badge>
                  <h3 className="text-2xl text-white uppercase">{selectedLog.routineName}</h3>
                  <div className="flex gap-2 mt-2">
                     <StatusBadge status={selectedLog.status} />
                     <Badge variant="primary">+{selectedLog.xpEarned} XP</Badge>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-3 rounded">
                     <p className="text-[10px] text-gray-500 uppercase">Duration</p>
                     <p className="text-xl font-mono text-white">{selectedLog.duration} min</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded">
                     <p className="text-[10px] text-gray-500 uppercase">Volume</p>
                     <p className="text-xl font-mono text-white">{selectedLog.totalVolume} kg</p>
                  </div>
               </div>

               <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                  <p className="text-xs text-primary uppercase border-b border-primary/20 pb-1">Exercise Report</p>
                  {selectedLog.exercises && selectedLog.exercises.length > 0 ? (
                     selectedLog.exercises.map((ex, i) => {
                        const completed = ex.setLogs.filter(s => s.completed).length;
                        return (
                           <div key={i} className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                              <span className="text-gray-300">{ex.name}</span>
                              <span className={`font-mono ${completed === ex.targetSets ? 'text-green-500' : 'text-yellow-500'}`}>
                                 {completed}/{ex.targetSets} Sets
                              </span>
                           </div>
                        )
                     })
                  ) : (
                     <p className="text-xs text-gray-600 italic">Detailed log data unavailable for this mission.</p>
                  )}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [user, setUser] = useState<UserProfile>({
    name: 'Operative',
    email: 'user@solotrain.com',
    height: '180cm',
    weight: '80kg',
    level: 1,
    currentXp: 0,
    xpRequired: 1000,
    stats: [
      { label: 'Chest', value: 70, fullMark: 120 },
      { label: 'Back', value: 65, fullMark: 120 },
      { label: 'Legs', value: 80, fullMark: 120 },
      { label: 'Arms', value: 60, fullMark: 120 },
      { label: 'Core', value: 50, fullMark: 120 },
    ]
  });

  const [routines, setRoutines] = useState<Routine[]>(PREMADE_ROUTINES);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>(DUMMY_LOGS);
  
  // Modal State for adding exercises
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState<Exercise | null>(null);
  const [pickerContext, setPickerContext] = useState<'ROUTINE' | 'ACTIVE_SESSION' | null>(null);

  // Derived state for Active Mission notification
  const activeMission = routines.find(r => r.isFavorite);
  const hasActiveMission = !!activeMission;
  const activeMissionExerciseIds = activeMission ? activeMission.exercises.map(ex => ex.id) : [];

  // --- Logic ---

  const handleLogin = () => setView('DASHBOARD');

  const startRoutine = (routine: Routine) => {
    // Initialize set logs for tracking
    const preparedExercises = routine.exercises.map(ex => ({
      ...ex,
      setLogs: Array.from({ length: ex.targetSets }).map((_, i) => ({
        id: `set_${Date.now()}_${i}`,
        weight: ex.targetWeight,
        reps: ex.targetReps,
        completed: false
      }))
    }));

    setActiveSession({
      id: `session_${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      startTime: Date.now(),
      exercises: preparedExercises
    });
    setView('WORKOUT');
  };

  const finishWorkout = (session: WorkoutSession) => {
    const endTime = Date.now();
    const duration = Math.round((endTime - session.startTime) / 60000); // mins
    const xp = calculateXP(session.exercises);
    
    // Check status
    const totalSets = session.exercises.reduce((acc, ex) => acc + ex.targetSets, 0);
    const completedSets = session.exercises.reduce((acc, ex) => acc + ex.setLogs.filter(s => s.completed).length, 0);
    const status: LogStatus = completedSets === totalSets ? 'COMPLETED' : 'INCOMPLETE';

    const log: WorkoutLog = {
      id: session.id,
      routineName: session.routineName,
      date: new Date().toISOString(),
      duration,
      xpEarned: xp,
      exercisesCompleted: session.exercises.filter(ex => ex.setLogs.every(s => s.completed)).length,
      totalVolume: session.exercises.reduce((acc, ex) => {
         return acc + ex.setLogs.reduce((sAcc, s) => s.completed ? sAcc + (parseInt(s.weight) || 0) * (parseInt(s.reps) || 0) : sAcc, 0);
      }, 0),
      status,
      exercises: session.exercises
    };

    setWorkoutHistory([log, ...workoutHistory]);
    
    // Level Up Logic
    let newXp = user.currentXp + xp;
    let newLevel = user.level;
    let newReq = user.xpRequired;

    while (newXp >= newReq) {
       newXp -= newReq;
       newLevel += 1;
       newReq = Math.floor(newReq * 1.2);
    }

    setUser({ ...user, level: newLevel, currentXp: newXp, xpRequired: newReq });

    // Update last performed
    setRoutines(prev => prev.map(r => r.id === session.routineId ? { ...r, lastPerformed: new Date().toLocaleDateString() } : r));

    setActiveSession(null);
    setView('LOGS');
  };

  const abortWorkout = (session: WorkoutSession) => {
     // Save as aborted log
     const duration = Math.round((Date.now() - session.startTime) / 60000);
     const log: WorkoutLog = {
        id: session.id,
        routineName: session.routineName,
        date: new Date().toISOString(),
        duration,
        xpEarned: 0,
        exercisesCompleted: 0,
        totalVolume: 0,
        status: 'ABORTED',
        exercises: session.exercises
     };
     setWorkoutHistory([log, ...workoutHistory]);
     setActiveSession(null);
     setView('DASHBOARD');
  };

  const saveRoutine = (updatedRoutine: Routine) => {
    // If setting as favorite (active), unset others
    if (updatedRoutine.isFavorite) {
       setRoutines(prev => prev.map(r => r.id === updatedRoutine.id ? updatedRoutine : { ...r, isFavorite: false }));
    } else {
       setRoutines(prev => prev.map(r => r.id === updatedRoutine.id ? updatedRoutine : r));
    }
    
    if (selectedRoutine && selectedRoutine.id === updatedRoutine.id) {
       setSelectedRoutine(updatedRoutine);
    }
  };

  const createRoutine = () => {
    const newRoutine: Routine = {
      id: `custom_${Date.now()}`,
      name: 'New Protocol',
      description: '',
      exercises: [],
      isFavorite: false
    };
    setRoutines([...routines, newRoutine]);
    setSelectedRoutine(newRoutine);
    setView('ROUTINE_DETAIL');
  };

  const forkRoutine = (source: Routine) => {
    const newRoutine: Routine = {
      ...source,
      id: `fork_${Date.now()}`,
      name: `${source.name} (Variant)`,
      isFavorite: false,
      lastPerformed: undefined
    };
    setRoutines([...routines, newRoutine]);
    setSelectedRoutine(newRoutine);
    setView('ROUTINE_DETAIL');
  };

  const handleAddExerciseToRoutine = (exercise: Exercise) => {
    if (!selectedRoutine) return;
    const newEx: RoutineExercise = {
      ...exercise,
      id: exercise.id, // Keep original ID to check duplications or map status easily
      targetSets: 3,
      targetReps: '10',
      targetWeight: '20',
      setLogs: []
    };
    const updated = { ...selectedRoutine, exercises: [...selectedRoutine.exercises, newEx] };
    saveRoutine(updated);
  };

  const handleAddExerciseToActiveMission = (exercise: Exercise) => {
     const activeRoutine = routines.find(r => r.isFavorite);
     if (activeRoutine) {
        // Prevent duplicate IDs if logic requires unique entries, but typically for routines we might want multiple. 
        // Here we just add it.
        const newEx: RoutineExercise = {
           ...exercise,
           id: exercise.id,
           targetSets: 3,
           targetReps: '10',
           targetWeight: '20',
           setLogs: []
        };
        const updated = { ...activeRoutine, exercises: [...activeRoutine.exercises, newEx] };
        saveRoutine(updated);
        // Alert removed for seamless UX, state update will toggle checkmark
     } else {
        alert("No Active Mission designated. Please select an 'Active' mission in dashboard.");
     }
  };

  // Render Content
  const renderView = () => {
    switch (view) {
      case 'LOGIN': return <LoginView onLogin={handleLogin} />;
      case 'DASHBOARD': 
        return <DashboardView 
                  user={user} 
                  routines={routines} 
                  onSelectRoutine={(r) => { setSelectedRoutine(r); setView('ROUTINE_DETAIL'); }} 
                  onCreateRoutine={createRoutine}
                  onForkRoutine={forkRoutine}
               />;
      case 'ROUTINE_DETAIL':
        return selectedRoutine ? (
          <RoutineDetailView 
            routine={selectedRoutine} 
            onBack={() => setView('DASHBOARD')}
            onStart={startRoutine}
            onSave={saveRoutine}
            onDelete={() => {}}
            onAddExercises={() => { setPickerContext('ROUTINE'); setView('EXPLORE'); }}
          />
        ) : null;
      case 'WORKOUT':
        return activeSession ? (
           <WorkoutView 
              session={activeSession} 
              onFinish={finishWorkout} 
              onAbort={abortWorkout}
              onUpdateSession={setActiveSession}
              onViewDetails={(ex) => setSelectedExerciseForDetail(ex)}
           />
        ) : null;
      case 'EXPLORE':
        return <ExploreView 
                  isPickerMode={!!pickerContext}
                  hasActiveMission={hasActiveMission}
                  activeMissionExerciseIds={activeMissionExerciseIds}
                  onViewDetails={(ex) => setSelectedExerciseForDetail(ex)}
                  onForkRoutine={(r) => {
                    forkRoutine(r);
                    alert(`Forked protocol: ${r.name}`);
                  }}
                  onAddExercise={(ex) => {
                     if (pickerContext === 'ROUTINE') {
                        handleAddExerciseToRoutine(ex);
                        setView('ROUTINE_DETAIL');
                        setPickerContext(null);
                     } else {
                        handleAddExerciseToActiveMission(ex);
                     }
                  }}
               />;
      case 'PROFILE':
        return <AgentView user={user} onUpdateUser={setUser} />;
      case 'LOGS':
        return <LogsView logs={workoutHistory} />;
      default: return null;
    }
  };

  // Nav Bar
  if (view === 'LOGIN') return <LoginView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-black">
      {/* Background Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none z-0"></div>
      
      <main className="relative z-10 p-6 pb-28 min-h-screen max-w-md mx-auto">
        {renderView()}
      </main>

      {/* Footer Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="max-w-md mx-auto flex justify-between items-center p-4 px-8 relative">
          
          <button onClick={() => setView('DASHBOARD')} className={`flex flex-col items-center gap-1 ${view === 'DASHBOARD' ? 'text-primary' : 'text-gray-500'}`}>
            <div className="relative">
              <Layers className="w-5 h-5" />
              {hasActiveMission && <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#00ffff]"></span>}
            </div>
            <span className="text-[10px] uppercase tracking-wider">Missions</span>
          </button>
          
          <button onClick={() => setView('EXPLORE')} className={`flex flex-col items-center gap-1 ${view === 'EXPLORE' ? 'text-primary' : 'text-gray-500'}`}>
            <Database className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider">Intel</span>
          </button>

          {/* CENTRAL FAB */}
          <button 
             onClick={() => activeSession ? setView('WORKOUT') : null}
             className={`
               absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_#00ffff40] text-black transition-all duration-300
               ${activeSession ? 'bg-primary scale-110' : 'bg-gray-700 opacity-50 cursor-not-allowed'}
             `}
          >
             <Dumbbell className="w-6 h-6" />
          </button>

          <button onClick={() => setView('LOGS')} className={`flex flex-col items-center gap-1 ${view === 'LOGS' ? 'text-primary' : 'text-gray-500'}`}>
            <FileText className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider">Logs</span>
          </button>

          <button onClick={() => setView('PROFILE')} className={`flex flex-col items-center gap-1 ${view === 'PROFILE' ? 'text-primary' : 'text-gray-500'}`}>
            <User className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider">Agent</span>
          </button>
        </div>
      </nav>

      {/* Global Exercise Detail Modal */}
      {selectedExerciseForDetail && (
         <ExerciseModal 
            exercise={selectedExerciseForDetail} 
            onClose={() => setSelectedExerciseForDetail(null)}
            onAddToRoutine={
               view === 'EXPLORE' && (hasActiveMission || pickerContext)
               ? (pickerContext ? handleAddExerciseToRoutine : handleAddExerciseToActiveMission)
               : undefined
            }
            actionLabel={view === 'EXPLORE' && !pickerContext ? "Add to Active Mission" : undefined}
         />
      )}
    </div>
  );
};

export default App;
