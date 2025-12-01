
import React, { useState, useEffect } from 'react';
import { fetchExercises, fetchBodyParts, fetchEquipments, fetchTargetMuscles, fetchExerciseTypes, getExerciseThumbnail, getExerciseGif, getEquipmentImageUrl, getTargetImageUrl } from './services/api';
import { Exercise, Routine, RoutineExercise, UserProfile, ViewState, WorkoutSession, WorkoutLog, LogStatus, UserStats } from './types';
import { Button, Card, Input, Badge, ProgressBar, SimpleChart, Select, RadarChart, FilterGroup, FilterModal, StatusBadge, CalendarGrid, ScreenHeader, LogDetailModal } from './components/Components';
import { 
  User, Dumbbell, Play, Search, Plus, Check, 
  Trash2, ChevronLeft, ChevronRight, Settings, Activity, Save, 
  X, ChevronDown, ChevronUp, Image as ImageIcon,
  Database, Layers, BrainCircuit, AlertTriangle, FileText, Calendar, Copy, SlidersHorizontal, Info, RefreshCw, Ban, BarChart3, List, Target, Zap, ArrowLeft, ArrowRight, Eye, EyeOff, Radio, Cpu, FileBadge, Crosshair, MonitorPlay
} from 'lucide-react';

// --- Helper Data & Functions ---

const calculateXP = (exercises: RoutineExercise[]): number => {
  let xp = 0;
  exercises.forEach(ex => {
    const diff = ex.difficulty || 'intermediate';
    const multiplier = diff === 'expert' ? 3 : diff === 'intermediate' ? 2 : 1;
    const completedSets = ex.setLogs.filter(s => s.completed).length;
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

// Simplified base routines for fallback/initialization
const PREMADE_ROUTINES: Routine[] = []; 

const DUMMY_LOGS: WorkoutLog[] = [];

// --- Sub-Components ---

// 1. LOGIN VIEW
const LoginView: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)] pointer-events-none"></div>
    
    {/* Glitch effect container */}
    <div className="z-10 w-full max-w-md space-y-16 text-center">
      <div className="space-y-4 relative">
        <h1 className="text-7xl md:text-8xl font-mono font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 drop-shadow-[0_0_25px_rgba(0,255,255,0.3)] select-none">
          SOLO<span className="text-primary drop-shadow-[0_0_10px_#00ffff]">TRAIN</span>
        </h1>
        <div className="h-px w-24 bg-primary mx-auto shadow-[0_0_10px_#00ffff]"></div>
        <p className="text-primary/60 font-mono text-xs tracking-[0.5em] uppercase animate-pulse">Tactical Performance Interface</p>
      </div>

      <div className="glass-panel p-10 space-y-8 relative border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>

        <div className="space-y-2">
            <h2 className="text-white font-mono uppercase text-sm tracking-widest">Authentication Required</h2>
            <p className="font-light text-gray-500 text-xs">Establish neural link to access mission parameters.</p>
        </div>
        
        <Button onClick={onLogin} className="w-full flex items-center justify-center gap-3 group !text-sm !py-4">
           Initialize System
           <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
        </Button>
      </div>
    </div>
    
    <div className="absolute bottom-6 text-[10px] text-gray-700 font-mono uppercase tracking-widest">
        System V.2.0.4 // Connection Secure
    </div>
  </div>
);

// 1.5 ONBOARDING VIEW (SETUP)
interface SetupData {
  codename: string;
  experience: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
  goal: 'STRENGTH' | 'HYPERTROPHY' | 'ENDURANCE';
}

const OnboardingView: React.FC<{ onComplete: (data: SetupData) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [data, setData] = useState<SetupData>({
    codename: 'Agent',
    experience: 'INTERMEDIATE',
    goal: 'STRENGTH'
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleFinish();
  };

  const handleFinish = () => {
    setIsGenerating(true);
    // Slight delay is handled in the parent's async call, but visual feedback here
    onComplete(data); 
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-8 bg-black">
         <div className="relative">
            <div className="w-24 h-24 rounded-full border-t-2 border-l-2 border-primary animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-b-2 border-r-2 border-primary/30 animate-spin-slow"></div>
            <Cpu className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
         </div>
         <div className="space-y-2">
            <h2 className="text-2xl font-mono font-bold text-white tracking-[0.2em] animate-pulse">GENERATING PROTOCOLS</h2>
            <div className="h-0.5 w-full max-w-[200px] bg-gray-800 mx-auto overflow-hidden">
                <div className="h-full bg-primary animate-progress"></div>
            </div>
            <p className="text-xs text-primary font-mono mt-4">Accessing Tactical Database...</p>
            <p className="text-[10px] text-gray-500 font-mono">Compiling {data.goal} parameters for {data.experience} class agent.</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center p-6 max-w-md mx-auto bg-black font-mono">
      <div className="mb-12">
         <div className="flex justify-between items-center mb-4">
             <span className="text-primary text-xs font-mono uppercase tracking-widest">System Config // 00{step}</span>
            <span className="text-gray-500 text-xs font-mono">{step} / 3</span>
         </div>
         <ProgressBar progress={(step / 3) * 100} className="!h-0.5" />
      </div>

      <div className="glass-panel p-8 border border-white/10 space-y-10 animate-fade-in relative">
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-white/20"></div>
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-white/20"></div>

        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Identity</h2>
              <p className="text-xs text-gray-400 font-sans tracking-wide">Enter your operational designation.</p>
            </div>
            <div className="relative">
                <Input 
                autoFocus
                value={data.codename}
                onChange={(e) => setData({...data, codename: e.target.value})}
                placeholder="CODENAME"
                className="text-center text-3xl font-mono tracking-widest uppercase !border-primary/50 !bg-primary/5 focus:!bg-primary/10 py-6"
                />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Capacity</h2>
              <p className="text-xs text-gray-400 font-sans tracking-wide">Select current operating capability.</p>
            </div>
            <div className="grid gap-4">
               {['BEGINNER', 'INTERMEDIATE', 'EXPERT'].map((level) => (
                 <button 
                    key={level}
                    onClick={() => setData({...data, experience: level as any})}
                    className={`p-5 border text-left transition-all group relative overflow-hidden ${data.experience === level ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'}`}
                 >
                    {data.experience === level && <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>}
                    <div className="flex justify-between items-center relative z-10">
                       <span className="text-sm tracking-[0.2em] font-bold">{level}</span>
                       {data.experience === level && <Cpu className="w-4 h-4 text-primary" />}
                    </div>
                 </button>
               ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Directive</h2>
              <p className="text-xs text-gray-400 font-sans tracking-wide">Define primary mission parameter.</p>
            </div>
            <div className="grid gap-4">
               {[
                 { id: 'STRENGTH', label: 'STRENGTH', desc: 'Max Force Output' },
                 { id: 'HYPERTROPHY', label: 'HYPERTROPHY', desc: 'Muscular Volume' },
                 { id: 'ENDURANCE', label: 'ENDURANCE', desc: 'Sustained Output' }
               ].map((goal) => (
                 <button 
                    key={goal.id}
                    onClick={() => setData({...data, goal: goal.id as any})}
                    className={`p-5 border text-left transition-all ${data.goal === goal.id ? 'border-primary bg-primary/10 text-white' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'}`}
                 >
                    <div className="text-sm font-bold tracking-[0.2em] mb-1">{goal.label}</div>
                    <div className="text-[10px] text-gray-500 font-mono uppercase">{goal.desc}</div>
                 </button>
               ))}
            </div>
          </div>
        )}

        <div className="pt-6 flex justify-between items-center border-t border-white/5">
           {step > 1 ? (
             <button onClick={() => setStep(step - 1)} className="text-xs text-gray-500 hover:text-white uppercase tracking-wider font-mono px-2">
                // Back
             </button>
           ) : <div></div>}
           <Button onClick={handleNext} className="w-36">
              {step === 3 ? 'Initialize' : 'Next >>'}
           </Button>
        </div>

      </div>
    </div>
  );
};

// 2. EXERCISE MODAL
const ExerciseModal: React.FC<{ 
  exercise: Exercise | null; 
  onClose: () => void; 
  onAddToRoutine?: (ex: Exercise) => void;
  actionLabel?: string;
}> = ({ exercise, onClose, onAddToRoutine, actionLabel = "Add to Active Mission" }) => {
  if (!exercise) return null;

  // Fallback instructions if API returns empty
  const hasInstructions = Array.isArray(exercise.instructions) && exercise.instructions.length > 0;
  const displayInstructions = hasInstructions ? exercise.instructions : [
    `Prepare your equipment: ${exercise.equipment}.`,
    `Focus on the target muscle: ${exercise.target}.`,
    `Ensure proper form and perform the movement with control.`,
    `Maintain tension on the ${exercise.bodyPart} throughout the set.`
  ];

  const targetImg = getTargetImageUrl(exercise.bodyPart);
  const equipImg = getEquipmentImageUrl(exercise.equipment);
  
  // Use imageUrl (PNG) for header, fallback to gifUrl if imageUrl is missing
  const headerImage = exercise.imageUrl || exercise.gifUrl;
  
  // Use gifUrl for bottom section if available
  const bottomGif = exercise.gifUrl;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-surface border border-white/10 relative overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="relative shrink-0 bg-white/5 border-b border-white/10 flex flex-col">
            <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white hover:text-primary rounded-full backdrop-blur-md">
              <X className="w-5 h-5" />
            </button>
            
            {/* Visual Display (Header Image) */}
            <div className="w-full h-48 bg-white/5 flex items-center justify-center relative overflow-hidden">
                {headerImage ? (
                   <img 
                      src={headerImage} 
                      alt={exercise.name} 
                      className="h-full object-contain opacity-90 mix-blend-lighten" 
                   />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-600">
                        <ImageIcon className="w-12 h-12" />
                        <span className="text-[10px] font-mono uppercase">Visual Unavailable</span>
                    </div>
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
            </div>

            <div className="p-6 pb-2 -mt-12 relative z-10">
               <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-light text-white uppercase tracking-wide break-words max-w-md font-mono drop-shadow-md">{exercise.name}</h2>
                    <div className="flex gap-2 mt-2">
                       <Badge variant="primary">{exercise.bodyPart}</Badge>
                       <Badge variant="outline">{exercise.equipment}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                     <span className="text-[10px] text-gray-400 uppercase block font-mono">Target</span>
                     <span className="text-primary font-mono text-sm uppercase">{exercise.target}</span>
                  </div>
               </div>
            </div>
        </div>
        
        {/* Content Scroll */}
        <div className="p-6 pt-2 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          {/* Detailed Info Grid */}
          <div className="grid grid-cols-2 gap-4">
             {/* Target Muscle Visual */}
             <div 
               className="bg-white/5 border border-white/5 rounded-sm overflow-hidden relative group h-24 bg-cover bg-center"
               style={{ backgroundImage: `url(${targetImg})` }}
             >
                <div className="absolute inset-0 bg-black/60"></div> 
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <div className="flex items-center gap-2 mb-1 text-primary relative z-10">
                    <Target className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest font-mono">Target</span>
                  </div>
                  <span className="text-sm font-bold text-white capitalize font-mono relative z-10">{exercise.bodyPart}</span>
                </div>
             </div>

             {/* Equipment Visual */}
             <div 
                className="bg-white/5 border border-white/5 rounded-sm overflow-hidden relative group h-24 bg-cover bg-center"
                style={{ backgroundImage: `url(${equipImg})` }}
             >
                 <div className="absolute inset-0 bg-black/60"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <div className="flex items-center gap-2 mb-1 text-primary relative z-10">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-widest font-mono">Equipment</span>
                  </div>
                  <span className="text-sm font-bold text-white capitalize font-mono relative z-10">{exercise.equipment}</span>
                </div>
             </div>
          </div>

          <div className="bg-white/5 p-3 border border-white/5 rounded-sm">
                <div className="flex items-center gap-2 mb-2 text-gray-400">
                   <span className="text-[10px] uppercase tracking-widest font-mono">Secondary Muscles</span>
                </div>
                <div className="flex flex-wrap gap-1">
                   {exercise.secondaryMuscles.map(m => (
                      <span key={m} className="text-xs text-gray-300 bg-black/40 px-2 py-0.5 rounded-sm capitalize font-mono">{m}</span>
                   ))}
                </div>
           </div>
          
          {/* Instructions */}
          <div className="border-t border-white/10 pt-4">
            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-4 flex items-center gap-2 font-mono">
               <FileText className="w-3 h-3" /> Operational Sequence
            </label>
            
            <div className="space-y-4">
               {displayInstructions.map((step, idx) => (
                  <div key={idx} className="flex gap-4 group">
                     <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 text-primary border border-white/10 flex items-center justify-center text-xs font-mono group-hover:border-primary group-hover:bg-primary/10 transition-colors">
                        {idx + 1}
                     </div>
                     <p className="text-sm font-light text-gray-300 leading-relaxed pt-0.5 font-mono">{step}</p>
                  </div>
               ))}
               {!hasInstructions && (
                 <p className="text-[10px] text-gray-500 font-mono italic mt-4">* Standard operational procedure generated. Specific API data unavailable.</p>
               )}
            </div>
          </div>

          {/* Bottom Visual GIF/Video (Supplementary) */}
          {bottomGif && (
            <div className="border-t border-white/10 pt-4">
               <label className="text-xs text-gray-500 uppercase tracking-widest block mb-4 flex items-center gap-2 font-mono">
                  <MonitorPlay className="w-3 h-3" /> Visual Demonstration
               </label>
               <div className="w-full h-48 bg-black/40 border border-white/5 rounded-sm flex items-center justify-center overflow-hidden">
                   <img 
                      src={bottomGif} 
                      alt="Demonstration" 
                      className="h-full object-contain" 
                   />
               </div>
            </div>
          )}
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

// 3. DASHBOARD VIEW
const DashboardView: React.FC<{ 
  user: UserProfile; 
  routines: Routine[]; 
  onSelectRoutine: (r: Routine) => void; 
  onCreateRoutine: () => void;
  onForkRoutine: (r: Routine) => void;
}> = ({ user, routines, onSelectRoutine, onCreateRoutine, onForkRoutine }) => {
  const activeRoutine = routines.find(r => r.isFavorite);
  const otherRoutines = routines.filter(r => !r.isFavorite);

  return (
    <div className="pb-24 space-y-8 animate-fade-in">
       <ScreenHeader 
         title="Command Center" 
         subtitle={`Agent ${user.name}`} 
         rightAction={
            <div className="text-right">
               <div className="text-xs text-gray-500 font-mono">LEVEL {user.level}</div>
               <div className="text-xl font-bold text-primary font-mono">{user.currentXp} XP</div>
            </div>
         }
       />

       {/* Quick Stats / Status */}
       <div className="grid grid-cols-2 gap-4">
          <div className="glass-panel p-4 border border-white/10">
             <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Status</div>
             <div className="text-primary font-mono uppercase text-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                Active
             </div>
          </div>
          <div className="glass-panel p-4 border border-white/10">
             <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Next Goal</div>
             <div className="text-white font-mono uppercase text-sm">
                {Math.max(0, user.xpRequired - user.currentXp)} XP REQ
             </div>
          </div>
       </div>

       {/* Active Mission */}
       <div>
         <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
           <h3 className="text-sm font-mono uppercase tracking-widest text-primary">Active Mission</h3>
         </div>
         {activeRoutine ? (
           <Card onClick={() => onSelectRoutine(activeRoutine)} className="border-l-primary bg-primary/5 cursor-pointer group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-50">
                 <Cpu className="w-12 h-12 text-primary rotate-12" />
              </div>
              <div className="relative z-10">
                 <h4 className="text-lg font-bold text-white uppercase font-mono group-hover:text-primary transition-colors">{activeRoutine.name}</h4>
                 <p className="text-xs text-gray-400 mt-1 max-w-[80%]">{activeRoutine.description || "No description available."}</p>
                 <div className="flex gap-4 mt-4 text-[10px] font-mono text-gray-500 uppercase">
                    <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {activeRoutine.exercises.length} Exercises</span>
                    <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> ~{calculateEstimatedXP(activeRoutine)} XP</span>
                 </div>
              </div>
           </Card>
         ) : (
           <div className="p-6 border border-dashed border-white/20 rounded-lg text-center space-y-2">
              <p className="text-sm text-gray-500">No active mission protocol assigned.</p>
              <Button variant="secondary" onClick={() => document.getElementById('protocols-list')?.scrollIntoView({ behavior: 'smooth'})}>Select Protocol</Button>
           </div>
         )}
       </div>

       {/* All Routines */}
       <div id="protocols-list">
          <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
            <h3 className="text-sm font-mono uppercase tracking-widest text-white">Available Protocols</h3>
            <button onClick={onCreateRoutine} className="text-xs text-primary hover:text-white uppercase tracking-wider flex items-center gap-1">
               <Plus className="w-3 h-3" /> Create New
            </button>
          </div>
          
          <div className="space-y-4">
             {otherRoutines.map(routine => (
                <Card key={routine.id} onClick={() => onSelectRoutine(routine)} className="cursor-pointer group hover:bg-white/5">
                   <div className="flex justify-between items-start">
                      <div>
                         <h4 className="font-bold text-gray-300 uppercase font-mono group-hover:text-white transition-colors">{routine.name}</h4>
                         <p className="text-xs text-gray-500 mt-1">{routine.exercises.length} Exercises</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white" />
                   </div>
                </Card>
             ))}
             {otherRoutines.length === 0 && (
                <p className="text-xs text-gray-600 font-mono italic">No additional protocols in database.</p>
             )}
          </div>
       </div>
    </div>
  );
};

// 4. ROUTINE DETAIL VIEW
const RoutineDetailView: React.FC<{
  routine: Routine;
  onBack: () => void;
  onStart: (r: Routine) => void;
  onSave: (r: Routine) => void;
  onDelete: (id: string) => void;
  onAddExercises: () => void;
  onViewDetails: (ex: RoutineExercise) => void;
  isNew: boolean;
}> = ({ routine, onBack, onStart, onSave, onDelete, onAddExercises, onViewDetails, isNew }) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [editedRoutine, setEditedRoutine] = useState(routine);

  const handleUpdateExercise = (index: number, field: keyof RoutineExercise, value: any) => {
     const updatedExercises = [...editedRoutine.exercises];
     updatedExercises[index] = { ...updatedExercises[index], [field]: value };
     setEditedRoutine({ ...editedRoutine, exercises: updatedExercises });
  };

  const removeExercise = (index: number) => {
     const updatedExercises = [...editedRoutine.exercises];
     updatedExercises.splice(index, 1);
     setEditedRoutine({ ...editedRoutine, exercises: updatedExercises });
  };

  const toggleFavorite = () => {
     const updated = { ...editedRoutine, isFavorite: !editedRoutine.isFavorite };
     setEditedRoutine(updated);
     if (!isEditing) onSave(updated);
  };

  return (
    <div className="pb-32 space-y-6 h-full flex flex-col">
       <ScreenHeader 
         title="Protocol Details" 
         onBack={onBack}
         rightAction={
            <div className="flex gap-2">
               {isEditing ? (
                  <>
                     <button onClick={() => onDelete(routine.id)} className="p-2 rounded-full border border-red-500/50 text-red-500 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4" />
                     </button>
                     <button onClick={() => { onSave(editedRoutine); setIsEditing(false); }} className="p-2 rounded-full border border-primary text-primary hover:bg-primary/10">
                        <Check className="w-4 h-4" />
                     </button>
                  </>
               ) : (
                  <>
                     <button onClick={toggleFavorite} className={`p-2 rounded-full border ${editedRoutine.isFavorite ? 'bg-primary text-black border-primary' : 'border-white/20 text-gray-400'}`}>
                        <Zap className="w-4 h-4" />
                     </button>
                     <button onClick={() => setIsEditing(!isEditing)} className="p-2 rounded-full border border-white/20 text-gray-400 hover:text-white">
                        <Settings className="w-4 h-4" />
                     </button>
                  </>
               )}
            </div>
         }
       />

       <div className="space-y-4">
          {isEditing ? (
             <div className="space-y-4 animate-fade-in">
                <div>
                   <label className="text-[10px] uppercase text-gray-500 font-mono">Protocol Designation</label>
                   <Input value={editedRoutine.name} onChange={e => setEditedRoutine({...editedRoutine, name: e.target.value})} />
                </div>
                <div>
                   <label className="text-[10px] uppercase text-gray-500 font-mono">Mission Brief</label>
                   <Input value={editedRoutine.description} onChange={e => setEditedRoutine({...editedRoutine, description: e.target.value})} />
                </div>
             </div>
          ) : (
             <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white font-mono uppercase">{editedRoutine.name}</h2>
                <p className="text-sm text-gray-400 font-mono">{editedRoutine.description}</p>
             </div>
          )}
          
          {/* Initialize Mission Button moved up */}
          {!isEditing && (
            <Button onClick={() => onStart(editedRoutine)} className="w-full shadow-[0_0_20px_rgba(0,255,255,0.3)]">
                Initialize Mission
            </Button>
          )}
       </div>

       <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
             <h3 className="text-sm font-mono uppercase tracking-widest text-primary">Sequence</h3>
             {isEditing && (
                <button onClick={onAddExercises} className="text-xs text-primary hover:text-white uppercase tracking-wider flex items-center gap-1">
                   <Plus className="w-3 h-3" /> Add Unit
                </button>
             )}
          </div>

          {editedRoutine.exercises.length === 0 ? (
             <div className="p-8 border border-dashed border-white/20 text-center text-gray-500 font-mono text-xs">
                No exercises in sequence.
                {isEditing && <Button variant="ghost" onClick={onAddExercises} className="mt-4">Add Exercises</Button>}
             </div>
          ) : (
             editedRoutine.exercises.map((ex, idx) => (
                <div key={ex.id} className="glass-panel p-4 border border-white/10 flex flex-col gap-4 relative">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                         <span className="text-xs text-gray-600 font-mono">0{idx + 1}</span>
                         <h4 className="font-bold text-white uppercase font-mono text-sm cursor-pointer hover:text-primary" onClick={() => onViewDetails(ex)}>{ex.name}</h4>
                      </div>
                      {isEditing && (
                         <button onClick={() => removeExercise(idx)} className="text-red-500 hover:text-red-400 p-1">
                            <X className="w-4 h-4" />
                         </button>
                      )}
                   </div>

                   {isEditing ? (
                      <div className="grid grid-cols-3 gap-2">
                         <div>
                            <label className="text-[9px] uppercase text-gray-500 font-mono">Sets</label>
                            <input type="number" value={ex.targetSets} onChange={e => handleUpdateExercise(idx, 'targetSets', parseInt(e.target.value))} className="w-full bg-black/30 border border-white/10 px-2 py-1 text-xs text-white text-center" />
                         </div>
                         <div>
                            <label className="text-[9px] uppercase text-gray-500 font-mono">Reps</label>
                            <input value={ex.targetReps} onChange={e => handleUpdateExercise(idx, 'targetReps', e.target.value)} className="w-full bg-black/30 border border-white/10 px-2 py-1 text-xs text-white text-center" />
                         </div>
                         <div>
                            <label className="text-[9px] uppercase text-gray-500 font-mono">Kg</label>
                            <input value={ex.targetWeight} onChange={e => handleUpdateExercise(idx, 'targetWeight', e.target.value)} className="w-full bg-black/30 border border-white/10 px-2 py-1 text-xs text-white text-center" />
                         </div>
                      </div>
                   ) : (
                      <div className="flex gap-4 text-xs text-gray-400 font-mono">
                         <span>{ex.targetSets} SETS</span>
                         <span>{ex.targetReps} REPS</span>
                         <span>{ex.targetWeight} KG</span>
                      </div>
                   )}
                </div>
             ))
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
  onBack: () => void;
}> = ({ session, onFinish, onAbort, onUpdateSession, onViewDetails, onBack }) => {
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

  const updateSetLog = (exId: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
    const updatedExercises = session.exercises.map(ex => {
        if (ex.id === exId) {
          const newLogs = [...ex.setLogs];
          newLogs[setIndex] = { ...newLogs[setIndex], [field]: value };
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

  const totalSets = session.exercises.reduce((acc, ex) => acc + ex.targetSets, 0);
  const totalCompletedSets = session.exercises.reduce((acc, ex) => acc + ex.setLogs.filter(s => s.completed).length, 0);
  const workoutProgress = totalSets > 0 ? (totalCompletedSets / totalSets) * 100 : 0;

  return (
    <div className="pb-32 space-y-6 relative h-full flex flex-col">
       <div className="sticky top-0 bg-background/80 backdrop-blur-md z-20 pt-4 pb-0 border-b border-white/10">
         <div className="flex items-center gap-4 mb-4">
             <button onClick={onBack} className="p-1 text-gray-400 hover:text-white transition-colors">
               <ChevronLeft className="w-6 h-6" />
             </button>
            <div className="flex-1">
              <h2 className="text-lg text-primary uppercase tracking-widest animate-pulse font-mono">Mission Active</h2>
              <p className="text-xs text-white font-mono">{session.routineName}</p>
            </div>
            <div className="font-mono text-2xl font-light text-white">
              {new Date(elapsed).toISOString().substr(11, 8)}
            </div>
         </div>
         <ProgressBar progress={workoutProgress} className="h-1" />
       </div>

       <div className="space-y-4 flex-1 overflow-y-auto pt-4 pb-12 custom-scrollbar">
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
                   <div className="relative w-12 h-12 bg-white/5 rounded-sm overflow-hidden flex items-center justify-center">
                     <Activity className="w-6 h-6 text-gray-500" />
                     {isDone && (
                       <div className="absolute inset-0 bg-primary/20 flex items-center justify-center border border-primary">
                         <Check className="w-6 h-6 text-primary" />
                       </div>
                     )}
                   </div>
                   <div>
                     <h3 className={`text-lg font-medium font-mono uppercase ${isDone ? 'text-primary' : 'text-white'}`}>{ex.name}</h3>
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
                        className="text-[10px] uppercase tracking-wider text-primary border border-primary/30 px-2 py-1 hover:bg-primary/10 flex items-center gap-1 font-mono"
                      >
                         <Info className="w-3 h-3" /> View Guide
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); markExerciseComplete(ex.id); }} 
                        className="text-[10px] uppercase tracking-wider text-gray-400 border border-white/10 px-2 py-1 hover:bg-white/10 font-mono"
                      >
                         Toggle All
                      </button>
                   </div>
                   
                   <div className="space-y-2">
                     <div className="flex items-center gap-4 px-2 text-[9px] uppercase text-gray-500 font-mono mb-1">
                        <span className="w-6 text-center">Set</span>
                        <div className="flex-1 grid grid-cols-2 gap-2">
                            <span>Weight (kg)</span>
                            <span>Reps</span>
                        </div>
                        <span className="w-8"></span>
                     </div>
                     {ex.setLogs.map((set, idx) => (
                       <div key={set.id} className="flex items-center gap-4 bg-white/5 p-2 rounded-sm">
                          <span className="w-6 text-xs text-gray-500 font-mono text-center">{idx + 1}</span>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                             <div className="bg-black/40 px-2 py-1 text-xs text-gray-300 font-mono flex items-center">
                               <input 
                                 className="bg-transparent w-full text-white outline-none"
                                 value={set.weight}
                                 onChange={(e) => updateSetLog(ex.id, idx, 'weight', e.target.value)}
                                 type="number"
                               />
                             </div>
                             <div className="bg-black/40 px-2 py-1 text-xs text-gray-300 font-mono flex items-center">
                               <input 
                                 className="bg-transparent w-full text-white outline-none"
                                 value={set.reps}
                                 onChange={(e) => updateSetLog(ex.id, idx, 'reps', e.target.value)}
                                 type="number"
                               />
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
               
               <div className="h-1 bg-gray-900 w-full">
                 <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(completedSets / ex.targetSets) * 100}%` }}></div>
               </div>
             </div>
           );
         })}
       </div>

       {/* Footer Buttons fixed at bottom with enough z-index */}
       <div className="fixed bottom-6 left-6 right-6 grid grid-cols-2 gap-4 z-50">
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

// 6. EXPLORE VIEW
const ExploreView: React.FC<{
  onAddExercise: (ex: Exercise) => void;
  onViewDetails: (ex: Exercise) => void;
  onForkRoutine: (r: Routine) => void;
  isPickerMode: boolean;
  onExitPicker: () => void;
  hasActiveMission: boolean;
  activeMissionExerciseNames: string[];
}> = ({ onAddExercise, onViewDetails, onForkRoutine, isPickerMode, onExitPicker, hasActiveMission, activeMissionExerciseNames }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  
  // Filters
  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [equipments, setEquipments] = useState<string[]>([]);
  const [exerciseTypes, setExerciseTypes] = useState<string[]>([]);

  const [availBodyParts, setAvailBodyParts] = useState<string[]>([]);
  const [availEquipments, setAvailEquipments] = useState<string[]>([]);
  const [availExerciseTypes, setAvailExerciseTypes] = useState<string[]>([]);

  useEffect(() => {
     fetchBodyParts().then(setAvailBodyParts);
     fetchEquipments().then(setAvailEquipments);
     fetchExerciseTypes().then(setAvailExerciseTypes);
     searchExercises();
  }, []);

  useEffect(() => {
     searchExercises();
  }, [searchTerm, bodyParts, equipments, exerciseTypes]);

  const searchExercises = async () => {
     setLoading(true);
     try {
       const res = await fetchExercises(bodyParts, equipments, [], exerciseTypes, searchTerm);
       setExercises(res.data);
     } catch (e) {
       console.error(e);
     } finally {
       setLoading(false);
     }
  };

  return (
    <div className="pb-24 space-y-4 h-full flex flex-col">
       <div className="sticky top-0 bg-background/95 backdrop-blur-xl z-10 pb-4 border-b border-white/10 pt-2">
          {isPickerMode && (
             <div className="flex items-center gap-2 mb-2 text-primary">
                <button onClick={onExitPicker}><ChevronLeft className="w-5 h-5" /></button>
                <span className="text-xs uppercase tracking-widest">Adding to Sequence</span>
             </div>
          )}
          <div className="flex gap-2">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                <Input 
                   placeholder="SEARCH DATABASE..." 
                   className="pl-10 !bg-white/5 border-transparent focus:border-primary"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             <button onClick={() => setFilterModalOpen(true)} className={`px-4 border ${bodyParts.length > 0 || equipments.length > 0 || exerciseTypes.length > 0 ? 'bg-primary text-black border-primary' : 'border-white/20 text-gray-400'}`}>
                <SlidersHorizontal className="w-5 h-5" />
             </button>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {loading ? (
             <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500 font-mono">Accessing Archives...</p>
             </div>
          ) : (
             exercises.map(ex => {
                const isAdded = activeMissionExerciseNames.includes(ex.name);
                return (
                   <div key={ex.id} className="glass-panel p-4 border border-white/10 flex items-center justify-between group hover:border-white/30 transition-all">
                      <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => onViewDetails(ex)}>
                         <div className="w-12 h-12 bg-white/5 rounded-sm overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${getExerciseThumbnail(ex) || getTargetImageUrl(ex.bodyPart)})` }}>
                            {/* Placeholder if url fails */}
                         </div>
                         <div>
                            <h4 className="text-sm font-bold text-white uppercase font-mono group-hover:text-primary transition-colors">{ex.name}</h4>
                            <div className="flex gap-2 mt-1">
                               <span className="text-[9px] px-1 border border-white/10 text-gray-400 uppercase">{ex.bodyPart}</span>
                               <span className="text-[9px] px-1 border border-white/10 text-gray-400 uppercase">{ex.equipment}</span>
                            </div>
                         </div>
                      </div>
                      
                      {/* Check if we should show the button at all (must be active mission OR picking) */}
                      {(hasActiveMission || isPickerMode) && (
                          <button 
                             onClick={() => onAddExercise(ex)}
                             disabled={isAdded && !isPickerMode} 
                             className={`p-3 border ml-2 transition-all ${isAdded ? 'border-primary text-primary bg-primary/10' : 'border-white/20 text-white hover:bg-white/10'}`}
                          >
                             {isAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                          </button>
                      )}
                   </div>
                );
             })
          )}
          {!loading && exercises.length === 0 && (
             <div className="text-center py-12 text-gray-500 font-mono text-xs">
                No matching data found in archives.
             </div>
          )}
       </div>

       <FilterModal 
          isOpen={filterModalOpen} 
          onClose={() => setFilterModalOpen(false)} 
          sections={[
             { title: "Target Systems (Muscles)", options: availBodyParts },
             { title: "Tactical Gear (Machines)", options: availEquipments },
             { title: "Training Style", options: availExerciseTypes }
          ]}
          selectedFilters={[...bodyParts, ...equipments, ...exerciseTypes]}
          onToggleFilter={(opt) => {
             // Determine which category the option belongs to
             if (availBodyParts.includes(opt)) setBodyParts(prev => prev.includes(opt) ? prev.filter(p => p !== opt) : [...prev, opt]);
             else if (availEquipments.includes(opt)) setEquipments(prev => prev.includes(opt) ? prev.filter(p => p !== opt) : [...prev, opt]);
             else if (availExerciseTypes.includes(opt)) setExerciseTypes(prev => prev.includes(opt) ? prev.filter(p => p !== opt) : [...prev, opt]);
          }}
       />
    </div>
  );
};

// 7. AGENT VIEW (Profile) - unchanged
const AgentView: React.FC<{ user: UserProfile; onUpdateUser: (u: UserProfile) => void }> = ({ user, onUpdateUser }) => {
   const [isEditing, setIsEditing] = useState(false);
   
   const handleStatChange = (idx: number, newVal: number) => {
      const newStats = [...user.stats];
      newStats[idx].value = newVal;
      onUpdateUser({ ...user, stats: newStats });
   };

   // Simulate progress trends
   const getTrendData = (current: number) => {
      // Create a fake trend ending in the current value
      return [current * 0.8, current * 0.85, current * 0.75, current * 0.9, current * 0.95, current];
   };

   return (
      <div className="pb-24 space-y-8 animate-fade-in">
         <ScreenHeader 
           title="Agent Profile" 
           subtitle={`ID: ${user.name}`} 
           rightAction={
             <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-full border ${isEditing ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400'}`}>
               <Settings className="w-4 h-4" />
             </button>
           }
         />

         <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-2 border-primary p-1 relative">
               <div className="w-full h-full bg-gray-800 rounded-full overflow-hidden flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-500" />
               </div>
               <div className="absolute -bottom-2 -right-2 bg-black border border-primary px-2 py-0.5 rounded text-xs text-primary font-bold font-mono">
                  LVL {user.level}
               </div>
            </div>
            <div>
               <h2 className="text-2xl font-bold text-white uppercase font-mono">{user.name}</h2>
               <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">{user.goal} Specialist</p>
               <div className="mt-3 w-32">
                  <div className="flex justify-between text-[9px] text-gray-500 mb-1 font-mono">
                     <span>XP</span>
                     <span>{user.currentXp} / {user.xpRequired}</span>
                  </div>
                  <ProgressBar progress={(user.currentXp / user.xpRequired) * 100} className="h-1" />
               </div>
            </div>
         </div>

         <div className="glass-panel p-4 border border-white/10 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-primary opacity-50"><Crosshair className="w-6 h-6" /></div>
            <h3 className="text-sm font-mono uppercase tracking-widest text-white mb-4">Biometric Balance</h3>
            <RadarChart data={user.stats} />
         </div>

         <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
               <h3 className="text-sm font-mono uppercase tracking-widest text-white">{isEditing ? 'Biometric Calibration' : 'Performance Trends'}</h3>
            </div>
            
            {isEditing ? (
               <div className="space-y-6">
                  {user.stats.map((stat, idx) => (
                    <div key={stat.label}>
                       <div className="flex justify-between text-xs font-mono uppercase mb-2 text-gray-400">
                          <span>{stat.label}</span>
                          <span className="text-primary">{stat.value} / {stat.fullMark}</span>
                       </div>
                       <input 
                         type="range" 
                         min="0" 
                         max="120" 
                         value={stat.value} 
                         onChange={(e) => handleStatChange(idx, parseInt(e.target.value))}
                         className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                       />
                    </div>
                  ))}
               </div>
            ) : (
               <div className="grid grid-cols-1 gap-6">
                  {user.stats.map((stat) => (
                    <div key={stat.label} className="bg-white/5 p-4 border border-white/5">
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{stat.label}</span>
                           <span className="text-lg text-white font-mono">{stat.value}</span>
                        </div>
                        <SimpleChart data={getTrendData(stat.value)} labels={['', '', '', '', '', 'NOW']} />
                    </div>
                  ))}
               </div>
            )}
         </div>

         <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-mono uppercase tracking-widest text-white border-b border-white/10 pb-2">Service Record</h3>
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/5 p-4 border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest">Experience</div>
                  <div className="text-lg text-white font-mono">{user.experience}</div>
               </div>
               <div className="bg-white/5 p-4 border border-white/5">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest">Joined</div>
                  <div className="text-lg text-white font-mono">2024</div>
               </div>
            </div>
         </div>
      </div>
   );
};

// 8. LOGS VIEW
const LogsView: React.FC<{ logs: WorkoutLog[] }> = ({ logs }) => {
   const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);

   // Generate last 14 days calendar
   const last14Days = Array.from({length: 14}).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const dateStr = d.toISOString().split('T')[0];
      const hasLog = logs.some(l => l.date.startsWith(dateStr));
      return { day: d.getDate().toString(), active: hasLog };
   });

   return (
      <div className="pb-24 space-y-6 h-full flex flex-col">
         <ScreenHeader title="Mission Logs" subtitle="History & Analytics" />
         
         <div className="p-4 bg-white/5 border border-white/10 rounded-sm">
             <h4 className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-mono">Cycle Activity (14 Days)</h4>
             <CalendarGrid days={last14Days} />
         </div>

         {logs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4 opacity-50">
               <FileBadge className="w-16 h-16 stroke-1" />
               <p className="font-mono text-xs uppercase tracking-widest">No mission data recorded.</p>
            </div>
         ) : (
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar">
               {logs.map(log => (
                  <div key={log.id} onClick={() => setSelectedLog(log)} className="glass-panel p-4 border border-white/10 space-y-3 cursor-pointer hover:bg-white/5 transition-colors group">
                     <div className="flex justify-between items-start">
                        <div>
                           <div className="text-[10px] text-gray-500 font-mono uppercase mb-1">{new Date(log.date).toLocaleDateString()} • {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                           <h4 className="text-white font-bold font-mono uppercase group-hover:text-primary transition-colors">{log.routineName}</h4>
                        </div>
                        <StatusBadge status={log.status} />
                     </div>
                     
                     <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-3">
                        <div>
                           <div className="text-[9px] text-gray-500 uppercase">Duration</div>
                           <div className="text-sm text-white font-mono">{log.duration} MIN</div>
                        </div>
                        <div>
                           <div className="text-[9px] text-gray-500 uppercase">Volume</div>
                           <div className="text-sm text-white font-mono">{(log.totalVolume / 1000).toFixed(1)}k KG</div>
                        </div>
                        <div>
                           <div className="text-[9px] text-gray-500 uppercase">XP</div>
                           <div className="text-sm text-primary font-mono">+{log.xpEarned}</div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         )}
         <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      </div>
   );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LOGIN');
  // ... state declarations ...
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
    ],
    onboardingComplete: false
  });

  const [routines, setRoutines] = useState<Routine[]>(PREMADE_ROUTINES);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>(DUMMY_LOGS);
  
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState<Exercise | null>(null);
  const [pickerContext, setPickerContext] = useState<'ROUTINE' | 'ACTIVE_SESSION' | null>(null);

  const activeMission = routines.find(r => r.isFavorite);
  const hasActiveMission = !!activeMission;
  
  // FIXED LOGIC: Prioritize Picker Context (Editing Routine) over Active Mission for checkmarks
  const activeMissionExerciseNames = (pickerContext === 'ROUTINE' && selectedRoutine)
    ? selectedRoutine.exercises.map(ex => ex.name)
    : (activeMission ? activeMission.exercises.map(ex => ex.name) : []);

  const handleLogin = () => {
    if (!user.onboardingComplete) setView('SETUP');
    else setView('DASHBOARD');
  };

  const generateProtocols = async (goal: string, experience: string): Promise<Routine[]> => {
     const { data: allExercises } = await fetchExercises([], [], [], [], '', 1, 100);
     const generated: Routine[] = [];
     const toRoutineEx = (ex: Exercise, sets: number, reps: string, weight: string): RoutineExercise => ({
        ...ex,
        id: `gen_ex_${ex.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        targetSets: sets,
        targetReps: reps,
        targetWeight: weight,
        setLogs: []
     });
     const findEx = (parts: string[], equipments?: string[]) => {
        return allExercises.filter(ex => {
            const partMatch = parts.some(p => ex.bodyPart.toLowerCase().includes(p) || ex.target.toLowerCase().includes(p));
            const equipMatch = equipments ? equipments.some(e => ex.equipment.toLowerCase().includes(e)) : true;
            return partMatch && equipMatch;
        });
     };
     const isBeginner = experience === 'BEGINNER';
     const sets = isBeginner ? 3 : 4;
     const weight = isBeginner ? '20' : '50';

     if (goal === 'STRENGTH') {
        const pushEx = findEx(['chest', 'shoulders', 'triceps'], ['barbell', 'dumbbell']);
        const squatEx = findEx(['upper legs', 'quads'], ['barbell']);
        generated.push({
           id: `gen_str_1_${Date.now()}`,
           name: 'ALPHA PROTOCOL [PUSH]',
           description: 'Strength foundation. Focus on compound pressing movements.',
           isFavorite: true,
           exercises: [...(squatEx[0] ? [toRoutineEx(squatEx[0], 5, '5', weight)] : []), ...(pushEx.slice(0, 3).map(ex => toRoutineEx(ex, 5, '5', weight)))]
        });
        const pullEx = findEx(['back', 'lats', 'biceps'], ['barbell', 'cable', 'dumbbell']);
        const deadliftEx = findEx(['back', 'legs'], ['barbell']);
        generated.push({
           id: `gen_str_2_${Date.now()}`,
           name: 'BRAVO PROTOCOL [PULL]',
           description: 'Posterior chain dominance. Heavy pulls.',
           isFavorite: false,
           exercises: [...(deadliftEx[0] ? [toRoutineEx(deadliftEx[0], 5, '3', weight)] : []), ...(pullEx.slice(0, 3).map(ex => toRoutineEx(ex, 4, '6', weight)))]
        });
         const legEx = findEx(['legs', 'calves', 'glutes']);
         generated.push({ id: `gen_str_3_${Date.now()}`, name: 'CHARLIE PROTOCOL [LOWER]', description: 'Lower body output maximization.', isFavorite: false, exercises: legEx.slice(0, 4).map(ex => toRoutineEx(ex, 4, '8', weight)) });
     } else if (goal === 'HYPERTROPHY') {
        const reps = '10-12';
        const upperEx = findEx(['chest', 'back', 'shoulders']);
        generated.push({ id: `gen_hyp_1_${Date.now()}`, name: 'UPPER BODY SCULPT', description: 'Volume training for upper torso metrics.', isFavorite: true, exercises: upperEx.slice(0, 6).map(ex => toRoutineEx(ex, 4, reps, weight)) });
        const lowerEx = findEx(['legs', 'calves', 'glutes']);
        generated.push({ id: `gen_hyp_2_${Date.now()}`, name: 'LOWER BODY FOUNDATION', description: 'Leg development protocol.', isFavorite: false, exercises: lowerEx.slice(0, 5).map(ex => toRoutineEx(ex, 4, reps, weight)) });
        const armsEx = findEx(['biceps', 'triceps', 'forearms']);
        generated.push({ id: `gen_hyp_3_${Date.now()}`, name: 'ARMORY [ARMS]', description: 'Isolation work for arm appendages.', isFavorite: false, exercises: armsEx.slice(0, 5).map(ex => toRoutineEx(ex, 3, '15', weight)) });
        const coreEx = findEx(['abs', 'waist']);
        generated.push({ id: `gen_hyp_4_${Date.now()}`, name: 'CORE STABILITY', description: 'Midsection structural integrity.', isFavorite: false, exercises: coreEx.slice(0, 4).map(ex => toRoutineEx(ex, 3, '20', '0')) });
     } else {
        const reps = '15-20';
        const lightWeight = isBeginner ? '10' : '30';
        const circuitA = allExercises.slice(0, 6);
        generated.push({ id: `gen_end_1_${Date.now()}`, name: 'CIRCUIT ALPHA', description: 'High repetition metabolic conditioning.', isFavorite: true, exercises: circuitA.map(ex => toRoutineEx(ex, 3, reps, lightWeight)) });
        const circuitB = allExercises.slice(6, 12);
        generated.push({ id: `gen_end_2_${Date.now()}`, name: 'CIRCUIT BRAVO', description: 'Secondary metabolic pathway training.', isFavorite: false, exercises: circuitB.map(ex => toRoutineEx(ex, 3, reps, lightWeight)) });
        const fullBody = findEx(['legs', 'back', 'chest', 'cardio']);
        generated.push({ id: `gen_end_3_${Date.now()}`, name: 'FULL BODY CONDITIONING', description: 'Total system endurance test.', isFavorite: false, exercises: fullBody.slice(0, 5).map(ex => toRoutineEx(ex, 3, '20', lightWeight)) });
     }
     return generated;
  };

  const handleFinishSetup = async (data: SetupData) => {
    const updatedUser = { ...user, name: data.codename, experience: data.experience, goal: data.goal, onboardingComplete: true };
    try {
        const generatedRoutines = await generateProtocols(data.goal, data.experience);
        if (generatedRoutines.length === 0 || generatedRoutines[0].exercises.length === 0) {
           const fallbackEx: RoutineExercise = { id: 'fallback_1', name: 'Burpees', bodyPart: 'cardio', muscle: 'cardio', equipment: 'body weight', target: 'cardiovascular system', secondaryMuscles: ['legs', 'chest'], gifUrl: '', instructions: ['Perform a squat thrust with an additional stand between reps.'], targetSets: 3, targetReps: '10', targetWeight: '0', setLogs: [] };
           generatedRoutines.push({ id: 'fallback_routine', name: 'EMERGENCY PROTOCOL', description: 'Database unavailable. Standard issue PT.', isFavorite: true, exercises: [fallbackEx] });
        }
        setRoutines([...routines, ...generatedRoutines]);
    } catch (e) { console.error("Failed to generate protocols", e); }
    setUser(updatedUser);
    setView('DASHBOARD');
  };

  const handleStartWorkout = (routine: Routine) => {
    const preparedExercises = routine.exercises.map(ex => ({ ...ex, setLogs: Array.from({ length: ex.targetSets }).map((_, i) => ({ id: `set_${Date.now()}_${i}`, weight: ex.targetWeight, reps: ex.targetReps, completed: false })) }));
    setActiveSession({ id: `session_${Date.now()}`, routineId: routine.id, routineName: routine.name, startTime: Date.now(), exercises: preparedExercises });
    setView('WORKOUT');
  };

  const handleUpdateSession = (session: WorkoutSession) => { setActiveSession(session); };
  const handleFinishWorkout = (session: WorkoutSession) => {
    const xp = calculateXP(session.exercises);
    const completedSets = session.exercises.reduce((acc, ex) => acc + ex.setLogs.filter(s => s.completed).length, 0);
    const totalSets = session.exercises.reduce((acc, ex) => acc + ex.targetSets, 0);
    const duration = (Date.now() - session.startTime) / 60000;
    let status: LogStatus = 'COMPLETED';
    if (completedSets < totalSets) status = 'INCOMPLETE';
    const log: WorkoutLog = { id: session.id, routineName: session.routineName, date: new Date(session.startTime).toISOString(), duration: Math.round(duration), xpEarned: xp, exercisesCompleted: session.exercises.length, totalVolume: session.exercises.reduce((acc, ex) => acc + ex.setLogs.reduce((sAcc, s) => s.completed ? sAcc + (parseInt(s.weight) * parseInt(s.reps) || 0) : sAcc, 0), 0), status: status, exercises: session.exercises };
    setWorkoutHistory([log, ...workoutHistory]);
    const newXp = user.currentXp + xp;
    if (newXp >= user.xpRequired) { setUser({ ...user, level: user.level + 1, currentXp: newXp - user.xpRequired, xpRequired: Math.round(user.xpRequired * 1.2) }); } else { setUser({ ...user, currentXp: newXp }); }
    setRoutines(prev => prev.map(r => r.id === session.routineId ? { ...r, lastPerformed: new Date().toLocaleDateString() } : r));
    setActiveSession(null);
    setView('LOGS');
  };
  const handleAbortWorkout = (session: WorkoutSession) => {
     const duration = (Date.now() - session.startTime) / 60000;
     const log: WorkoutLog = { id: session.id, routineName: session.routineName, date: new Date(session.startTime).toISOString(), duration: Math.round(duration), xpEarned: 0, exercisesCompleted: 0, totalVolume: 0, status: 'ABORTED', exercises: session.exercises };
    setWorkoutHistory([log, ...workoutHistory]);
    setActiveSession(null);
    setView('DASHBOARD');
  };
  const handleAddExercise = (exercise: Exercise) => {
    const routineExercise: RoutineExercise = { ...exercise, id: `routine_ex_${Date.now()}`, targetSets: 3, targetReps: '10', targetWeight: '20', setLogs: [] };
    if (pickerContext === 'ROUTINE' && selectedRoutine) {
      const updated = { ...selectedRoutine, exercises: [...selectedRoutine.exercises, routineExercise] };
      setSelectedRoutine(updated);
      setRoutines(prev => prev.map(r => r.id === updated.id ? updated : r));
    } else if (pickerContext === 'ACTIVE_SESSION' && activeSession) {
       const withLogs = { ...routineExercise, setLogs: Array.from({ length: 3 }).map((_, i) => ({ id: `set_${Date.now()}_${i}`, weight: '20', reps: '10', completed: false })) };
       setActiveSession({ ...activeSession, exercises: [...activeSession.exercises, withLogs] });
    }
  };
  const handleAddExerciseToActiveMission = (exercise: Exercise) => {
     if (!activeMission) return;
     const routineExercise: RoutineExercise = { ...exercise, id: `routine_ex_${Date.now()}`, targetSets: 3, targetReps: '10', targetWeight: '20', setLogs: [] };
     const updated = { ...activeMission, exercises: [...activeMission.exercises, routineExercise] };
     setRoutines(prev => prev.map(r => r.id === updated.id ? updated : r));
  };
  const openExploreForRoutine = () => { setPickerContext('ROUTINE'); setView('EXPLORE'); };
  const exitPicker = () => { setPickerContext(null); if (selectedRoutine) setView('ROUTINE_DETAIL'); else setView('DASHBOARD'); };

  if (view === 'LOGIN') return <LoginView onLogin={handleLogin} />;
  if (view === 'SETUP') return <OnboardingView onComplete={handleFinishSetup} />;

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-black">
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-black">
        
        <main className="p-6 pt-8 h-full">
          {view === 'DASHBOARD' && (
            <DashboardView 
              user={user} 
              routines={routines} 
              onSelectRoutine={(r) => { setSelectedRoutine(r); setView('ROUTINE_DETAIL'); }}
              onCreateRoutine={() => { const newRoutine = { id: `routine_${Date.now()}`, name: 'NEW PROTOCOL', description: '', exercises: [] }; setRoutines([...routines, newRoutine]); setSelectedRoutine(newRoutine); setView('ROUTINE_DETAIL'); }}
              onForkRoutine={(r) => { const newRoutine = { ...r, id: `fork_${Date.now()}`, name: `${r.name} (COPY)`, isFavorite: false }; setRoutines([...routines, newRoutine]); setSelectedRoutine(newRoutine); setView('ROUTINE_DETAIL'); }}
            />
          )}

          {view === 'ROUTINE_DETAIL' && selectedRoutine && (
            <RoutineDetailView 
              routine={selectedRoutine}
              onBack={() => setView('DASHBOARD')}
              onStart={handleStartWorkout}
              onSave={(updated) => { setRoutines(prev => prev.map(r => r.id === updated.id ? updated : r)); if (updated.isFavorite) { setRoutines(prev => prev.map(r => ({ ...r, isFavorite: r.id === updated.id }))); } setSelectedRoutine(updated); }}
              onDelete={(id) => { setRoutines(prev => prev.filter(r => r.id !== id)); setView('DASHBOARD'); }}
              onAddExercises={openExploreForRoutine}
              onViewDetails={(ex) => setSelectedExerciseForDetail(ex)}
              isNew={selectedRoutine.exercises.length === 0}
            />
          )}

          {view === 'WORKOUT' && activeSession && (
            <WorkoutView 
              session={activeSession}
              onFinish={handleFinishWorkout}
              onAbort={handleAbortWorkout}
              onUpdateSession={handleUpdateSession}
              onViewDetails={(ex) => setSelectedExerciseForDetail(ex)}
              onBack={() => setView('DASHBOARD')}
            />
          )}

          {view === 'EXPLORE' && (
             <ExploreView 
               onAddExercise={pickerContext ? handleAddExercise : handleAddExerciseToActiveMission}
               onViewDetails={(ex) => setSelectedExerciseForDetail(ex)}
               onForkRoutine={(r) => { const newRoutine = { ...r, id: `fork_${Date.now()}`, name: `${r.name} (IMPORTED)`, isFavorite: false }; setRoutines([...routines, newRoutine]); }}
               isPickerMode={!!pickerContext}
               onExitPicker={exitPicker}
               hasActiveMission={hasActiveMission}
               activeMissionExerciseNames={activeMissionExerciseNames}
             />
          )}

          {view === 'PROFILE' && (
            <AgentView user={user} onUpdateUser={setUser} />
          )}

          {view === 'LOGS' && (
            <LogsView logs={workoutHistory} />
          )}
        </main>

        <ExerciseModal 
          exercise={selectedExerciseForDetail} 
          onClose={() => setSelectedExerciseForDetail(null)}
          onAddToRoutine={view === 'EXPLORE' ? (pickerContext ? handleAddExercise : handleAddExerciseToActiveMission) : undefined}
          actionLabel={pickerContext === 'ROUTINE' ? "Add to Protocol" : "Add to Active Mission"}
        />

        {view !== 'WORKOUT' && (
          <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex justify-between items-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-40">
            <button onClick={() => setView('DASHBOARD')} className={`p-3 rounded-xl transition-all ${view === 'DASHBOARD' || view === 'ROUTINE_DETAIL' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-500 hover:text-gray-300'}`}>
               <div className="relative"><Layers className="w-5 h-5" />{hasActiveMission && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full shadow-[0_0_5px_#00ffff]"></div>}</div>
            </button>
            <button onClick={() => setView('EXPLORE')} className={`p-3 rounded-xl transition-all ${view === 'EXPLORE' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-500 hover:text-gray-300'}`}><Database className="w-5 h-5" /></button>
            
            <button 
              onClick={() => { if (activeSession) setView('WORKOUT'); }}
              className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-lg transition-all mx-2
                  ${activeSession 
                    ? 'bg-primary border-primary text-black shadow-[0_0_30px_rgba(0,255,255,0.4)] animate-pulse' 
                    : 'bg-surfaceHighlight border-white/10 text-gray-600 cursor-default' // Gray and NOT clickable if no active session
                  }
              `}
              disabled={!activeSession}
            >
                <Dumbbell className={`w-7 h-7 ${activeSession ? 'animate-bounce-slow' : ''}`} />
            </button>
            
            <button onClick={() => setView('LOGS')} className={`p-3 rounded-xl transition-all ${view === 'LOGS' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-500 hover:text-gray-300'}`}><FileText className="w-5 h-5" /></button>
            <button onClick={() => setView('PROFILE')} className={`p-3 rounded-xl transition-all ${view === 'PROFILE' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-500 hover:text-gray-300'}`}><User className="w-5 h-5" /></button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default App;
