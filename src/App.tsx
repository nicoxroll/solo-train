
import React, { useState, useEffect } from 'react';
import { fetchExercises, fetchBodyParts, fetchEquipments, fetchTargetMuscles, fetchExerciseTypes, getExerciseThumbnail, getExerciseGif, getEquipmentImageUrl, getTargetImageUrl, generateAiRoutine } from './services/api';
import { signInWithGoogle, signOut, fetchUserProfile, upsertUserProfile, fetchRoutines, saveRoutine, deleteRoutineFromDb, fetchLogs, saveLog, supabase, isSupabaseConfigured } from './services/supabaseClient';
import { Exercise, Routine, RoutineExercise, UserProfile, ViewState, WorkoutSession, WorkoutLog, LogStatus, UserStats } from './types';
import { Button, Card, Input, Badge, ProgressBar, SimpleChart, Select, RadarChart, FilterGroup, FilterModal, StatusBadge, CalendarGrid, ScreenHeader, LogDetailModal } from './components/Components';
import { 
  User, Dumbbell, Play, Search, Plus, Check, 
  Trash2, ChevronLeft, ChevronRight, Settings, Activity, Save, 
  X, ChevronDown, ChevronUp, Image as ImageIcon,
  Database, Layers, BrainCircuit, AlertTriangle, FileText, Calendar, Copy, SlidersHorizontal, Info, RefreshCw, Ban, BarChart3, List, Target, Zap, ArrowLeft, ArrowRight, Eye, EyeOff, Radio, Cpu, FileBadge, Crosshair, MonitorPlay, Sparkles, Timer, RotateCcw, Palette, LogOut, Pause, Square, CheckSquare, MinusSquare
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

// Available Theme Colors
const THEME_COLORS = [
  { id: 'cyan', hex: '#00ffff', label: 'CYAN' },
  { id: 'red', hex: '#ff2a2a', label: 'RED' },
  { id: 'pink', hex: '#ff00ff', label: 'PINK' },
  { id: 'violet', hex: '#bd00ff', label: 'VIOLET' },
  { id: 'green', hex: '#00ff41', label: 'GREEN' },
];

// --- Sub-Components ---

// 1. LOGIN VIEW
const LoginView: React.FC<{ 
  onLogin: () => void;
  currentColor: string;
  onChangeColor: (color: string) => void;
  loading?: boolean;
}> = ({ onLogin, currentColor, onChangeColor, loading }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-black">
    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,black_40%,transparent_100%)] pointer-events-none" style={{ filter: `hue-rotate(0deg)` }}></div>
    
    {/* Glitch effect container */}
    <div className="z-10 w-full max-w-md space-y-16 text-center">
      <div className="space-y-4 relative">
        <h1 className="text-7xl md:text-8xl font-mono font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600 drop-shadow-[0_0_25px_var(--color-primary)] select-none">
          SOLO<span className="text-primary drop-shadow-[0_0_10px_var(--color-primary)]">TRAIN</span>
        </h1>
        <div className="h-px w-24 bg-primary mx-auto shadow-[0_0_10px_var(--color-primary)]"></div>
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
            <p className="font-light text-gray-500 text-xs">Establish neural link via Google Auth.</p>
        </div>
        
        <Button onClick={onLogin} disabled={loading} className="w-full flex items-center justify-center gap-3 group !text-sm !py-4">
           {loading ? 'Initializing...' : 'Initialize System'}
           {!loading && <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />}
        </Button>
      </div>

      {/* Color Picker */}
      <div className="space-y-4">
        <div className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.3em] flex items-center justify-center gap-2">
           <Palette className="w-3 h-3" /> Interface Theme
        </div>
        <div className="flex justify-center gap-4">
           {THEME_COLORS.map(color => (
             <button
               key={color.id}
               onClick={() => onChangeColor(color.hex)}
               className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center relative group`}
               style={{ 
                 borderColor: currentColor === color.hex ? color.hex : 'rgba(255,255,255,0.1)',
                 boxShadow: currentColor === color.hex ? `0 0 15px ${color.hex}` : 'none',
                 background: 'transparent'
               }}
             >
                <div 
                  className="w-3 h-3 rounded-full transition-all" 
                  style={{ backgroundColor: color.hex }}
                ></div>
                {/* Tooltipish label */}
                <span className={`absolute -bottom-6 text-[8px] font-mono uppercase tracking-widest text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
                   {color.label}
                </span>
             </button>
           ))}
        </div>
      </div>
    </div>
    
    <div className="absolute bottom-6 text-[10px] text-gray-700 font-mono uppercase tracking-widest">
        System V.2.1.0 // Connection Secure
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

// ... [Existing AiMissionModal, ExerciseModal components remain unchanged] ...
const AiMissionModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onGenerate: (prompt: string) => Promise<void>; 
}> = ({ isOpen, onClose, onGenerate }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    await onGenerate(prompt);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-surface border border-primary/30 relative overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,255,255,0.15)]" onClick={e => e.stopPropagation()}>
         
         <div className="bg-primary/10 border-b border-primary/20 p-6 flex justify-between items-center">
            <h2 className="text-lg font-mono text-primary uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Tactical Generator
            </h2>
            <button onClick={onClose} disabled={isProcessing} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
         </div>

         <div className="p-6 space-y-4">
            <div className="space-y-2">
               <label className="text-xs text-gray-400 font-mono uppercase tracking-widest">Mission Parameters</label>
               <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'A high-intensity leg workout focusing on glutes without machines' or 'Full body routine for travel'"
                  className="w-full h-32 bg-black/50 border border-white/10 p-4 text-white font-mono text-sm focus:border-primary focus:outline-none focus:bg-primary/5 resize-none placeholder-gray-700"
                  autoFocus
               />
            </div>
            <p className="text-[10px] text-gray-500 font-mono">
               System will analyze constraints and search tactical database for optimal exercise selection.
            </p>
         </div>

         <div className="p-6 border-t border-white/10 bg-black/40">
            <Button onClick={handleSubmit} disabled={isProcessing || !prompt.trim()} className="w-full">
               {isProcessing ? 'COMPILING DATA...' : 'GENERATE PROTOCOL'}
            </Button>
         </div>
      </div>
    </div>
  );
};

const ExerciseModal: React.FC<{ 
  exercise: Exercise | null; 
  onClose: () => void; 
  onAddToRoutine?: (ex: Exercise) => void;
  actionLabel?: string;
}> = ({ exercise, onClose, onAddToRoutine, actionLabel = "Add to Active Mission" }) => {
  if (!exercise) return null;

  const hasInstructions = Array.isArray(exercise.instructions) && exercise.instructions.length > 0;
  const displayInstructions = hasInstructions ? exercise.instructions : [
    `Prepare your equipment: ${exercise.equipment}.`,
    `Focus on the target muscle: ${exercise.target}.`,
    `Ensure proper form and perform the movement with control.`,
    `Maintain tension on the ${exercise.bodyPart} throughout the set.`
  ];

  const targetImg = getTargetImageUrl(exercise.bodyPart);
  const equipImg = getEquipmentImageUrl(exercise.equipment);
  const headerImage = exercise.imageUrl || exercise.gifUrl;
  const bottomGif = exercise.gifUrl;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-surface border border-white/10 relative overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]" onClick={(e) => e.stopPropagation()}>
        
        <div className="relative shrink-0 bg-white/5 border-b border-white/10 flex flex-col">
            <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white hover:text-primary rounded-full backdrop-blur-md">
              <X className="w-5 h-5" />
            </button>
            
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
        
        <div className="p-6 pt-2 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/5 border border-white/5 rounded-sm h-24 bg-cover bg-center relative" style={{ backgroundImage: `url(${targetImg})` }}>
                <div className="absolute inset-0 bg-black/60"></div> 
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <span className="text-[10px] text-primary uppercase tracking-widest font-mono relative z-10">Target</span>
                  <span className="text-sm font-bold text-white capitalize font-mono relative z-10">{exercise.bodyPart}</span>
                </div>
             </div>
             <div className="bg-white/5 border border-white/5 rounded-sm h-24 bg-cover bg-center relative" style={{ backgroundImage: `url(${equipImg})` }}>
                 <div className="absolute inset-0 bg-black/60"></div>
                <div className="absolute inset-0 flex flex-col justify-end p-3">
                  <span className="text-[10px] text-primary uppercase tracking-widest font-mono relative z-10">Equipment</span>
                  <span className="text-sm font-bold text-white capitalize font-mono relative z-10">{exercise.equipment}</span>
                </div>
             </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <label className="text-xs text-gray-500 uppercase tracking-widest block mb-4 flex items-center gap-2 font-mono">
               <FileText className="w-3 h-3" /> Operational Sequence
            </label>
            <div className="space-y-4">
               {displayInstructions.map((step, idx) => (
                  <div key={idx} className="flex gap-4 group">
                     <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 text-primary border border-white/10 flex items-center justify-center text-xs font-mono">{idx + 1}</div>
                     <p className="text-sm font-light text-gray-300 leading-relaxed pt-0.5 font-mono">{step}</p>
                  </div>
               ))}
            </div>
          </div>

          {bottomGif && (
            <div className="border-t border-white/10 pt-4">
               <label className="text-xs text-gray-500 uppercase tracking-widest block mb-4 flex items-center gap-2 font-mono">
                  <MonitorPlay className="w-3 h-3" /> Visual Demonstration
               </label>
               <div className="w-full h-48 bg-black/40 border border-white/5 rounded-sm flex items-center justify-center overflow-hidden">
                   <img src={bottomGif} alt="Demonstration" className="h-full object-contain" />
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

const DashboardView: React.FC<{ 
  user: UserProfile; 
  routines: Routine[]; 
  onSelectRoutine: (r: Routine) => void; 
  onCreateRoutine: () => void;
  onForkRoutine: (r: Routine) => void;
  onAiGenerate: () => void;
}> = ({ user, routines, onSelectRoutine, onCreateRoutine, onAiGenerate }) => {
  const activeRoutine = routines.find(r => r.isFavorite);
  const otherRoutines = routines.filter(r => !r.isFavorite);

  return (
    <div className="pb-24 space-y-8 animate-fade-in">
       <ScreenHeader title="Command Center" subtitle={`Agent ${user.name}`} />
       
       <div>
         <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
           <h3 className="text-sm font-mono uppercase tracking-widest text-primary">Active Mission</h3>
         </div>
         {activeRoutine ? (
           <Card onClick={() => onSelectRoutine(activeRoutine)} className="border-l-primary bg-primary/5 cursor-pointer group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-50"><Cpu className="w-12 h-12 text-primary rotate-12" /></div>
              <div className="relative z-10">
                 <h4 className="text-lg font-bold text-white uppercase font-mono group-hover:text-primary transition-colors">{activeRoutine.name}</h4>
                 <div className="flex gap-4 mt-4 text-[10px] font-mono text-gray-500 uppercase">
                    <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {activeRoutine.exercises.length} Exercises</span>
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

       <div id="protocols-list">
          <div className="flex justify-between items-end mb-4 border-b border-white/10 pb-2">
            <h3 className="text-sm font-mono uppercase tracking-widest text-white">Available Protocols</h3>
            <div className="flex gap-2">
              <button onClick={onAiGenerate} className="text-xs text-primary hover:text-white uppercase tracking-wider flex items-center gap-1 border border-primary/30 px-2 py-1 bg-primary/5 rounded-sm"><Sparkles className="w-3 h-3" /> AI Generate</button>
              <button onClick={onCreateRoutine} className="text-xs text-gray-400 hover:text-white uppercase tracking-wider flex items-center gap-1 border border-white/20 px-2 py-1 rounded-sm"><Plus className="w-3 h-3" /> New</button>
            </div>
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
             {otherRoutines.length === 0 && <p className="text-xs text-gray-600 font-mono italic">No additional protocols.</p>}
          </div>
       </div>
    </div>
  );
};

const RoutineDetailView: React.FC<{
    routine: Routine;
    onBack: () => void;
    onStart: (r: Routine) => void;
    onSave: (r: Routine) => void;
    onDelete: (id: string) => void;
    onAddExercises: () => void;
    onViewDetails: (ex: Exercise) => void;
    isNew?: boolean;
}> = ({ routine, onBack, onStart, onSave, onDelete, onAddExercises, onViewDetails, isNew }) => {
    const [isEditing, setIsEditing] = useState(isNew || false);
    const [editedRoutine, setEditedRoutine] = useState<Routine>(routine);
    const [expandedExIds, setExpandedExIds] = useState<string[]>([]);
    
    // Reset editing state if viewing a different routine
    useEffect(() => {
        setEditedRoutine(routine);
        setIsEditing(isNew || false);
        // Initially expand all exercises
        setExpandedExIds(routine.exercises.map(ex => ex.id));
    }, [routine, isNew]);

    const handleSave = () => {
        onSave(editedRoutine);
        setIsEditing(false);
    };

    const toggleFavorite = () => {
        onSave({ ...routine, isFavorite: !routine.isFavorite });
    };

    const toggleExpand = (id: string) => {
        setExpandedExIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const updateExercise = (idx: number, field: keyof RoutineExercise, val: any) => {
        const newExs = [...editedRoutine.exercises];
        newExs[idx] = { ...newExs[idx], [field]: val };
        setEditedRoutine({ ...editedRoutine, exercises: newExs });
    };

    const removeExercise = (idx: number) => {
        const newExs = [...editedRoutine.exercises];
        newExs.splice(idx, 1);
        setEditedRoutine({ ...editedRoutine, exercises: newExs });
    };

    return (
        <div className="pb-32 animate-fade-in">
             <ScreenHeader 
                title={isEditing ? "Edit Protocol" : "Protocol Details"}
                subtitle={isEditing ? "Modify Parameters" : "Mission Overview"}
                onBack={onBack}
                rightAction={
                    isEditing ? (
                        <div className="flex gap-2">
                             <button onClick={() => onDelete(routine.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"><Trash2 className="w-5 h-5" /></button>
                             <button onClick={handleSave} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"><Check className="w-5 h-5" /></button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={toggleFavorite} className={`p-2 rounded-full transition-colors ${routine.isFavorite ? 'text-primary' : 'text-gray-600'}`}><Check className="w-5 h-5" /></button>
                            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-white transition-colors"><Settings className="w-5 h-5" /></button>
                        </div>
                    )
                }
             />

             <div className="space-y-6">
                <div className="space-y-4">
                    {isEditing ? (
                        <>
                           <div>
                             <label className="text-[10px] uppercase text-gray-500 tracking-widest block mb-1 font-mono">Protocol Name</label>
                             <Input value={editedRoutine.name} onChange={(e) => setEditedRoutine({...editedRoutine, name: e.target.value})} className="text-xl font-bold font-mono" />
                           </div>
                           <div>
                             <label className="text-[10px] uppercase text-gray-500 tracking-widest block mb-1 font-mono">Description</label>
                             <Input value={editedRoutine.description} onChange={(e) => setEditedRoutine({...editedRoutine, description: e.target.value})} />
                           </div>
                        </>
                    ) : (
                        <div>
                           <Button onClick={() => onStart(routine)} className="w-full mb-4 shadow-[0_0_20px_rgba(0,255,255,0.15)] gap-2">
                               <Play className="w-4 h-4 fill-current" /> Initialize Mission
                           </Button>
                           <h2 className="text-2xl font-bold text-white uppercase font-mono mb-2">{routine.name}</h2>
                           <p className="text-sm text-gray-400 font-light">{routine.description || "No classification data."}</p>
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                        <h3 className="text-sm font-mono uppercase tracking-widest text-white">Sequence</h3>
                        {isEditing && (
                            <button onClick={onAddExercises} className="text-xs flex items-center gap-1 text-primary border border-primary/20 px-2 py-1 bg-primary/5 uppercase font-mono hover:bg-primary/10 transition-colors">
                                <Plus className="w-3 h-3" /> Add
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        {(isEditing ? editedRoutine.exercises : routine.exercises).map((ex, idx) => (
                            <div key={ex.id} className="glass-panel border border-white/10 relative group overflow-hidden">
                                <div 
                                    className="flex justify-between items-center p-4 cursor-pointer bg-white/5 hover:bg-white/10 transition-colors"
                                    onClick={() => toggleExpand(ex.id)}
                                >
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 bg-black border border-white/10 flex items-center justify-center text-gray-500">
                                         <Dumbbell className="w-4 h-4" />
                                      </div>
                                      <div>
                                         <h4 className="font-bold text-white text-sm uppercase font-mono max-w-[180px] leading-tight truncate">{ex.name}</h4>
                                         {!isEditing && <div className="text-[9px] text-gray-500 font-mono mt-0.5">{ex.targetSets} SETS • {ex.targetReps} REPS</div>}
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                        {!isEditing && (
                                            <button onClick={(e) => { e.stopPropagation(); onViewDetails(ex); }} className="p-2 text-primary hover:text-white">
                                                <Info className="w-4 h-4" />
                                            </button>
                                        )}
                                        {isEditing && (
                                           <button onClick={(e) => { e.stopPropagation(); removeExercise(idx); }} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                        )}
                                        {expandedExIds.includes(ex.id) ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                   </div>
                                </div>
                                
                                {expandedExIds.includes(ex.id) && (
                                    <div className="p-4 pt-0 border-t border-white/5 bg-black/20">
                                        <div className="grid grid-cols-3 gap-2 mt-3">
                                            {isEditing ? (
                                                <>
                                                    <div>
                                                        <label className="text-[8px] uppercase text-gray-500 block">Sets</label>
                                                        <Input type="number" value={ex.targetSets} onChange={(e) => updateExercise(idx, 'targetSets', parseInt(e.target.value))} className="p-1 text-center font-mono !text-xs" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[8px] uppercase text-gray-500 block">Reps</label>
                                                        <Input value={ex.targetReps} onChange={(e) => updateExercise(idx, 'targetReps', e.target.value)} className="p-1 text-center font-mono !text-xs" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[8px] uppercase text-gray-500 block">Kg</label>
                                                        <Input value={ex.targetWeight} onChange={(e) => updateExercise(idx, 'targetWeight', e.target.value)} className="p-1 text-center font-mono !text-xs" />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="bg-white/5 p-2 text-center border border-white/5">
                                                        <div className="text-[8px] uppercase text-gray-500 font-mono">Sets</div>
                                                        <div className="text-sm font-mono">{ex.targetSets}</div>
                                                    </div>
                                                    <div className="bg-white/5 p-2 text-center border border-white/5">
                                                        <div className="text-[8px] uppercase text-gray-500 font-mono">Reps</div>
                                                        <div className="text-sm font-mono">{ex.targetReps}</div>
                                                    </div>
                                                    <div className="bg-white/5 p-2 text-center border border-white/5">
                                                        <div className="text-[8px] uppercase text-gray-500 font-mono">Load</div>
                                                        <div className="text-sm font-mono">{ex.targetWeight}kg</div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {(isEditing ? editedRoutine.exercises : routine.exercises).length === 0 && (
                            <p className="text-xs text-gray-600 font-mono italic text-center py-4">Protocol sequence empty.</p>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};

const WorkoutView: React.FC<{
    session: WorkoutSession;
    onFinish: (s: WorkoutSession) => void;
    onAbort: (s: WorkoutSession) => void;
    onUpdateSession: (s: WorkoutSession) => void;
    onViewDetails: (ex: Exercise) => void;
    onBack: () => void;
}> = ({ session, onFinish, onAbort, onUpdateSession, onViewDetails, onBack }) => {
    const [elapsed, setElapsed] = useState(0);
    const [pausedDuration, setPausedDuration] = useState(0);
    const [lastPauseTime, setLastPauseTime] = useState<number | null>(null);
    const [restTimer, setRestTimer] = useState(0);
    const [isResting, setIsResting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [expandedExIds, setExpandedExIds] = useState<string[]>([]);
    
    // Initialize expanded IDs to match session (expand all by default initially)
    useEffect(() => {
        if (expandedExIds.length === 0) {
             setExpandedExIds(session.exercises.map(ex => ex.id));
        }
    }, []); // Run once

    // Pause/Resume Logic
    const togglePause = () => {
        if (isPaused) {
            // Resume
            if (lastPauseTime) {
                const duration = Date.now() - lastPauseTime;
                setPausedDuration(prev => prev + duration);
            }
            setLastPauseTime(null);
            setIsPaused(false);
        } else {
            // Pause
            setLastPauseTime(Date.now());
            setIsPaused(true);
        }
    };

    // Overall timer
    useEffect(() => {
        let i: any;
        if (!isPaused) {
            i = setInterval(() => {
                 // Calculate true elapsed time: Current Time - Start Time - Total Paused Duration
                 setElapsed(Date.now() - session.startTime - pausedDuration);
            }, 1000);
        }
        return () => clearInterval(i);
    }, [session.startTime, isPaused, pausedDuration]);

    // Rest timer
    useEffect(() => {
        let i: any;
        if (isResting && !isPaused) {
            i = setInterval(() => setRestTimer(p => p + 1), 1000);
        } else if (!isResting) {
            setRestTimer(0);
        }
        return () => clearInterval(i);
    }, [isResting, isPaused]);

    const toggleSet = (exIdx: number, setIdx: number) => {
        const newExs = [...session.exercises];
        const set = newExs[exIdx].setLogs[setIdx];
        set.completed = !set.completed;
        onUpdateSession({ ...session, exercises: newExs });
        
        // Auto-start rest if completing a set
        if (set.completed) {
            setIsResting(true);
        }
    };

    const toggleAllSets = (exIdx: number) => {
        const newExs = [...session.exercises];
        const ex = newExs[exIdx];
        
        // Check if all are currently completed
        const allCompleted = ex.setLogs.every(s => s.completed);
        
        // Toggle: if all completed -> uncheck all. Else -> check all.
        const newStatus = !allCompleted;
        
        ex.setLogs = ex.setLogs.map(s => ({ ...s, completed: newStatus }));
        onUpdateSession({ ...session, exercises: newExs });

        if (newStatus) setIsResting(true); // Start rest if checking all
    };

    const updateSetData = (exIdx: number, setIdx: number, field: 'weight' | 'reps', val: string) => {
        const newExs = [...session.exercises];
        newExs[exIdx].setLogs[setIdx] = { ...newExs[exIdx].setLogs[setIdx], [field]: val };
        onUpdateSession({ ...session, exercises: newExs });
    };

    const toggleExpand = (id: string) => {
        setExpandedExIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const totalSets = session.exercises.reduce((acc, ex) => acc + ex.targetSets, 0);
    const completedSets = session.exercises.reduce((acc, ex) => acc + ex.setLogs.filter(s => s.completed).length, 0);
    const progress = (completedSets / totalSets) * 100;

    return (
        <div className={`h-full flex flex-col pb-24 relative ${isPaused ? 'grayscale-[0.5]' : ''}`}>
             <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/10 pb-4 pt-2 -mx-6 px-6 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                    <button onClick={onBack}><ChevronLeft className="w-6 h-6 text-gray-400" /></button>
                    <div className="flex flex-col items-center">
                         <div className={`font-mono text-2xl font-bold tracking-widest tabular-nums ${isPaused ? 'text-yellow-500 animate-pulse' : 'text-white'}`}>
                            {isPaused ? "PAUSED" : new Date(elapsed).toISOString().substr(11, 8)}
                        </div>
                    </div>
                    <button onClick={togglePause} className={`p-2 rounded-full border ${isPaused ? 'border-primary text-primary bg-primary/10' : 'border-white/20 text-gray-400'}`}>
                        {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
                    </button>
                </div>
                <ProgressBar progress={progress} className="h-1.5" />
                
                {isResting && (
                    <div className="mt-2 flex items-center justify-between bg-primary/10 border border-primary/30 p-2 rounded px-4 animate-fade-in">
                        <div className="flex items-center gap-2 text-primary font-mono text-sm">
                            <Timer className="w-4 h-4" />
                            <span>REST: {Math.floor(restTimer / 60)}:{(restTimer % 60).toString().padStart(2, '0')}</span>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => setRestTimer(0)} className="p-1 hover:text-white text-primary"><RotateCcw className="w-4 h-4" /></button>
                             <button onClick={() => setIsResting(false)} className="p-1 hover:text-white text-primary"><X className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
             </div>

             <div className="flex-1 overflow-y-auto space-y-4 pt-6 custom-scrollbar pb-32">
                {session.exercises.map((ex, exIdx) => {
                    const exCompletedSets = ex.setLogs.filter(s => s.completed).length;
                    const exProgress = (exCompletedSets / ex.targetSets) * 100;
                    const isExpanded = expandedExIds.includes(ex.id);
                    const allChecked = ex.setLogs.every(s => s.completed);

                    return (
                        <div key={ex.id} className="space-y-0 border border-white/10 bg-white/5 overflow-hidden transition-all duration-300">
                            {/* Exercise Header */}
                            <div className="flex justify-between items-center px-4 py-3 bg-black/20 cursor-pointer" onClick={() => toggleExpand(ex.id)}>
                                <div className="flex items-center gap-3 w-full overflow-hidden">
                                    <div className="w-10 h-10 bg-black/50 border border-white/10 flex items-center justify-center text-gray-500 rounded-sm shrink-0">
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center pr-2">
                                            <h3 className="text-white font-bold font-mono uppercase text-sm truncate pr-2">{ex.name}</h3>
                                            <span className="text-[10px] text-gray-500 font-mono shrink-0">{exCompletedSets}/{ex.targetSets}</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${exProgress}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 pl-2 border-l border-white/10 ml-2">
                                    {/* Expand/Collapse Chevron */}
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                </div>
                            </div>
                            
                            {/* Actions Bar (Inside when expanded, or summary) */}
                             {isExpanded && (
                                <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 bg-black/10">
                                    <button onClick={(e) => { e.stopPropagation(); onViewDetails(ex); }} className="text-[10px] text-gray-400 hover:text-primary uppercase font-mono flex items-center gap-1">
                                        <Info className="w-3 h-3" /> View Guide
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); toggleAllSets(exIdx); }} 
                                        className="text-[10px] text-primary hover:text-white uppercase font-mono flex items-center gap-1 border border-primary/20 px-2 py-1 rounded bg-primary/5 hover:bg-primary/20"
                                    >
                                        {allChecked ? <MinusSquare className="w-3 h-3" /> : <CheckSquare className="w-3 h-3" />}
                                        {allChecked ? "Uncheck All" : "Check All"}
                                    </button>
                                </div>
                             )}

                            {/* Sets List (Collapsible) */}
                            {isExpanded && (
                                <div className="space-y-px bg-white/5 animate-fade-in origin-top">
                                    {ex.setLogs.map((set, setIdx) => (
                                        <div key={set.id} className={`flex items-center gap-3 p-3 border-b border-white/5 transition-colors bg-black/20 ${set.completed ? 'text-primary' : 'text-gray-400'}`}>
                                            <div className={`w-6 text-center font-mono text-xs font-bold ${set.completed ? 'text-primary' : 'text-gray-600'}`}>{setIdx + 1}</div>
                                            <div className="flex-1 grid grid-cols-2 gap-2">
                                                <div className="relative group">
                                                    <input 
                                                    value={set.weight} 
                                                    onChange={(e) => updateSetData(exIdx, setIdx, 'weight', e.target.value)}
                                                    className={`w-full bg-transparent border-b text-center text-sm font-mono py-1 focus:outline-none transition-colors ${set.completed ? 'border-primary/30 text-primary' : 'border-white/20 text-white focus:border-white'}`}
                                                    disabled={isPaused}
                                                    />
                                                    <span className="absolute right-2 top-1.5 text-[8px] opacity-30 pointer-events-none">KG</span>
                                                </div>
                                                <div className="relative group">
                                                    <input 
                                                    value={set.reps} 
                                                    onChange={(e) => updateSetData(exIdx, setIdx, 'reps', e.target.value)}
                                                    className={`w-full bg-transparent border-b text-center text-sm font-mono py-1 focus:outline-none transition-colors ${set.completed ? 'border-primary/30 text-primary' : 'border-white/20 text-white focus:border-white'}`}
                                                    disabled={isPaused}
                                                    />
                                                    <span className="absolute right-2 top-1.5 text-[8px] opacity-30 pointer-events-none">REPS</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => toggleSet(exIdx, setIdx)} 
                                                disabled={isPaused}
                                                className={`w-8 h-8 flex items-center justify-center border transition-all rounded-sm ${set.completed ? 'bg-primary border-primary text-black shadow-[0_0_10px_var(--color-primary)]' : 'border-white/20 text-gray-600 hover:border-white hover:text-white bg-black/50'}`}
                                            >
                                                <Check className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
             </div>
             
             {isPaused && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center pointer-events-none z-40">
                    <div className="bg-black/80 backdrop-blur border border-primary/50 text-primary px-6 py-4 font-mono text-xl tracking-[0.2em] font-bold shadow-[0_0_30px_rgba(0,0,0,0.8)] animate-pulse">
                        SYSTEM PAUSED
                    </div>
                </div>
             )}
             
             <div className="fixed bottom-6 left-6 right-6 z-50 flex gap-4">
                 <Button onClick={() => onAbort(session)} variant="danger" className="flex-1 bg-black/90 backdrop-blur">Abort</Button>
                 <Button onClick={() => onFinish(session)} disabled={isPaused} className="flex-[2] bg-black/90 backdrop-blur">Complete Mission</Button>
             </div>
        </div>
    );
};

const ExploreView: React.FC<{
    onAddExercise: (ex: Exercise) => void;
    onViewDetails: (ex: Exercise) => void;
    onForkRoutine: (r: Routine) => void;
    isPickerMode?: boolean;
    onExitPicker?: () => void;
    hasActiveMission?: boolean;
    activeMissionExerciseNames?: string[];
}> = ({ onAddExercise, onViewDetails, onForkRoutine, isPickerMode, onExitPicker, hasActiveMission, activeMissionExerciseNames = [] }) => {
    const [search, setSearch] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Filters
    const [filterOpen, setFilterOpen] = useState(false);
    const [bodyPartOptions, setBodyPartOptions] = useState<string[]>([]);
    const [equipOptions, setEquipOptions] = useState<string[]>([]);
    const [typeOptions, setTypeOptions] = useState<string[]>([]);
    const [muscleOptions, setMuscleOptions] = useState<string[]>([]);

    const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
    const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 6;

    // Load filter options once
    useEffect(() => {
        fetchBodyParts().then(setBodyPartOptions);
        fetchEquipments().then(setEquipOptions);
        fetchExerciseTypes().then(setTypeOptions);
        fetchTargetMuscles().then(setMuscleOptions);
    }, []);

    // Load Data when filters/search/page changes
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data, total } = await fetchExercises(selectedBodyParts, selectedEquipments, selectedMuscles, selectedTypes, search, page, limit);
                setExercises(Array.isArray(data) ? data : []);
                setTotalPages(Math.ceil(total / limit));
            } catch (e) {
                console.error("Fetch error", e);
                setExercises([]);
            } finally {
                setLoading(false);
            }
        };
        // Debounce search
        const t = setTimeout(load, 500);
        return () => clearTimeout(t);
    }, [search, selectedBodyParts, selectedEquipments, selectedMuscles, selectedTypes, page]);

    const handleToggleFilter = (opt: string) => {
       // Logic to distribute option to correct category array
       if (bodyPartOptions.includes(opt)) {
           setSelectedBodyParts(prev => prev.includes(opt) ? prev.filter(x => x!==opt) : [...prev, opt]);
       } else if (equipOptions.includes(opt)) {
           setSelectedEquipments(prev => prev.includes(opt) ? prev.filter(x => x!==opt) : [...prev, opt]);
       } else if (typeOptions.includes(opt)) {
           setSelectedTypes(prev => prev.includes(opt) ? prev.filter(x => x!==opt) : [...prev, opt]);
       } else if (muscleOptions.includes(opt)) {
           setSelectedMuscles(prev => prev.includes(opt) ? prev.filter(x => x!==opt) : [...prev, opt]);
       }
       setPage(1);
    };

    const combinedFilters = [...selectedBodyParts, ...selectedEquipments, ...selectedTypes, ...selectedMuscles];

    return (
        <div className="pb-24 space-y-6 h-full flex flex-col">
            <ScreenHeader 
                title="Intel Database" 
                subtitle="Tactical Exercise Library" 
                rightAction={isPickerMode ? <Button onClick={onExitPicker} className="!py-2 !px-4">Done</Button> : null}
            />

            <div className="flex gap-2 relative z-20">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <Input 
                        value={search} 
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
                        placeholder="SEARCH INTEL..." 
                        className="pl-10 font-mono text-sm"
                    />
                </div>
                <button onClick={() => setFilterOpen(true)} className={`px-4 border border-white/20 bg-white/5 hover:bg-white/10 transition-colors ${combinedFilters.length > 0 ? 'border-primary text-primary' : 'text-gray-400'}`}>
                    <SlidersHorizontal className="w-5 h-5" />
                </button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                    {exercises.map(ex => {
                        const isAdded = activeMissionExerciseNames.includes(ex.name);
                        return (
                            <div key={ex.id} className="glass-panel p-4 border border-white/10 flex justify-between items-center group hover:border-white/30 transition-all">
                                <div>
                                    <h4 className="text-white font-bold font-mono uppercase text-sm">{ex.name}</h4>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-[10px] text-primary uppercase font-mono border border-primary/20 px-1">{ex.bodyPart}</span>
                                        <span className="text-[10px] text-gray-500 uppercase font-mono">{ex.equipment}</span>
                                    </div>
                                    <button onClick={() => onViewDetails(ex)} className="text-[10px] text-gray-400 hover:text-white mt-2 flex items-center gap-1">
                                        <Info className="w-3 h-3" /> Details
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    {(isPickerMode || hasActiveMission) && (
                                        <button 
                                            onClick={() => onAddExercise(ex)}
                                            disabled={isAdded && !isPickerMode} // In picker mode allow adding multiple copies? Usually checkmark means "present". Let's allow adding more but show check.
                                            className={`p-2 rounded-full border transition-all ${isAdded ? 'bg-primary text-black border-primary' : 'border-white/20 text-gray-400 hover:text-white hover:border-white'}`}
                                        >
                                            {isAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {/* Pagination */}
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 disabled:opacity-30 hover:text-primary"><ChevronLeft /></button>
                <span className="font-mono text-xs text-gray-500">PAGE {page} / {totalPages || 1}</span>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 disabled:opacity-30 hover:text-primary"><ChevronRight /></button>
            </div>

            <FilterModal 
                isOpen={filterOpen}
                onClose={() => setFilterOpen(false)}
                sections={[
                    { title: "Target Zone", options: bodyPartOptions },
                    { title: "Specific Muscle", options: muscleOptions },
                    { title: "Gear", options: equipOptions },
                    { title: "Training Style", options: typeOptions }
                ]}
                selectedFilters={combinedFilters}
                onToggleFilter={handleToggleFilter}
            />
        </div>
    );
};

// AGENT VIEW with Logout
const AgentView: React.FC<{ 
  user: UserProfile; 
  onUpdateUser: (u: UserProfile) => void;
  currentColor: string; 
  onUpdateColor: (color: string) => void; 
}> = ({ user, onUpdateUser, currentColor, onUpdateColor }) => {
   const [isEditing, setIsEditing] = useState(false);
   
   const handleStatChange = (idx: number, newVal: number) => {
      const newStats = [...user.stats];
      newStats[idx].value = newVal;
      onUpdateUser({ ...user, stats: newStats });
   };

   const handleLogout = async () => {
     await signOut();
     window.location.reload();
   };

   const getTrendData = (current: number) => {
      return [current * 0.8, current * 0.85, current * 0.75, current * 0.9, current * 0.95, current];
   };

   return (
      <div className="pb-24 space-y-8 animate-fade-in">
         <ScreenHeader 
           title="Agent Profile" 
           subtitle={`ID: ${user.name}`} 
           rightAction={
             <div className="flex gap-2">
               <button onClick={handleLogout} className="p-2 rounded-full border border-red-500/20 text-red-500 hover:bg-red-500/10" title="Logout">
                 <LogOut className="w-4 h-4" />
               </button>
               <button onClick={() => setIsEditing(!isEditing)} className={`p-2 rounded-full border ${isEditing ? 'bg-white text-black border-white' : 'border-white/20 text-gray-400'}`}>
                 <Settings className="w-4 h-4" />
               </button>
             </div>
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
            <RadarChart data={user.stats} color={currentColor} />
         </div>

         <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
               <h3 className="text-sm font-mono uppercase tracking-widest text-white">{isEditing ? 'Profile Calibration' : 'Performance Trends'}</h3>
            </div>
            
            {isEditing ? (
               <div className="space-y-6">
                  {/* Identity Edit */}
                  <div>
                     <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block font-mono">Identity Designation</label>
                     <Input 
                        value={user.name} 
                        onChange={(e) => onUpdateUser({...user, name: e.target.value})}
                        className="font-mono"
                     />
                  </div>

                  {/* Experience Edit */}
                  <div>
                     <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block font-mono">Class Authorization</label>
                     <div className="grid grid-cols-3 gap-2">
                        {['BEGINNER', 'INTERMEDIATE', 'EXPERT'].map((level) => (
                           <button 
                              key={level}
                              onClick={() => onUpdateUser({...user, experience: level as any})}
                              className={`
                                 py-2 px-1 text-[10px] font-mono border uppercase transition-all
                                 ${user.experience === level 
                                    ? 'bg-primary text-black border-primary font-bold' 
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                 }
                              `}
                           >
                              {level}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Goal Edit */}
                  <div>
                     <label className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 block font-mono">Mission Directive</label>
                     <div className="grid grid-cols-3 gap-2">
                        {['STRENGTH', 'HYPERTROPHY', 'ENDURANCE'].map((goal) => (
                           <button 
                              key={goal}
                              onClick={() => onUpdateUser({...user, goal: goal as any})}
                              className={`
                                 py-2 px-1 text-[10px] font-mono border uppercase transition-all
                                 ${user.goal === goal 
                                    ? 'bg-primary text-black border-primary font-bold' 
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                 }
                              `}
                           >
                              {goal}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Biometric Sliders */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                     <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Stat Calibration</h4>
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

                  {/* Interface Theme Picker */}
                  <div className="space-y-4 pt-4 border-t border-white/10">
                     <h4 className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Interface Theme</h4>
                     <div className="flex gap-4">
                        {THEME_COLORS.map(color => (
                          <button
                            key={color.id}
                            onClick={() => onUpdateColor(color.hex)}
                            className={`w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center relative group`}
                            style={{ 
                              borderColor: currentColor === color.hex ? color.hex : 'rgba(255,255,255,0.1)',
                              boxShadow: currentColor === color.hex ? `0 0 15px ${color.hex}` : 'none',
                              background: 'transparent'
                            }}
                          >
                             <div className="w-3 h-3 rounded-full transition-all" style={{ backgroundColor: color.hex }}></div>
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
            ) : (
               <div className="grid grid-cols-1 gap-6">
                  {user.stats.map((stat) => (
                    <div key={stat.label} className="bg-white/5 p-4 border border-white/5">
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{stat.label}</span>
                           <span className="text-lg text-white font-mono">{stat.value}</span>
                        </div>
                        <SimpleChart data={getTrendData(stat.value)} labels={['', '', '', '', '', 'NOW']} color={currentColor} />
                    </div>
                  ))}
               </div>
            )}
         </div>

         {!isEditing && (
            <div className="space-y-4 pt-4 border-t border-white/10">
               <h3 className="text-sm font-mono uppercase tracking-widest text-white border-b border-white/10 pb-2">Service Record</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 border border-white/5">
                     <div className="text-[10px] text-gray-500 uppercase tracking-widest">Experience</div>
                     <div className="text-lg text-white font-mono">{user.experience}</div>
                  </div>
                  <div className="bg-white/5 p-4 border border-white/5">
                     <div className="text-[10px] text-gray-500 uppercase tracking-widest">Directive</div>
                     <div className="text-lg text-white font-mono">{user.goal}</div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

// LogsView
const LogsView: React.FC<{ logs: WorkoutLog[] }> = ({ logs }) => {
   const [selectedLog, setSelectedLog] = useState<WorkoutLog | null>(null);

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
                        <div><div className="text-[9px] text-gray-500 uppercase">Duration</div><div className="text-sm text-white font-mono">{log.duration} MIN</div></div>
                        <div><div className="text-[9px] text-gray-500 uppercase">Volume</div><div className="text-sm text-white font-mono">{(log.totalVolume / 1000).toFixed(1)}k KG</div></div>
                        <div><div className="text-[9px] text-gray-500 uppercase">XP</div><div className="text-sm text-primary font-mono">+{log.xpEarned}</div></div>
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
  const [themeColor, setThemeColor] = useState('#00ffff');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  
  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', themeColor);
  }, [themeColor]);

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

  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutLog[]>([]);
  
  const [selectedExerciseForDetail, setSelectedExerciseForDetail] = useState<Exercise | null>(null);
  const [pickerContext, setPickerContext] = useState<'ROUTINE' | 'ACTIVE_SESSION' | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const activeMission = routines.find(r => r.isFavorite);
  const hasActiveMission = !!activeMission;
  
  const activeMissionExerciseNames = (pickerContext === 'ROUTINE' && selectedRoutine)
    ? selectedRoutine.exercises.map(ex => ex.name)
    : (activeMission ? activeMission.exercises.map(ex => ex.name) : []);

  // --- INIT DATA ---
  useEffect(() => {
    if (isSupabaseConfigured()) {
       supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          if (session) {
             loadUserData(session.user.id);
          } else {
             setLoading(false);
          }
       });
       const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          setSession(session);
          if (session) loadUserData(session.user.id);
          else { setView('LOGIN'); setLoading(false); }
       });
       return () => subscription.unsubscribe();
    } else {
       // Local Storage Fallback Check
       const localUser = localStorage.getItem('solotrain_user');
       if (localUser) {
          const u = JSON.parse(localUser);
          setUser(u);
          const localRoutines = localStorage.getItem('solotrain_routines');
          if (localRoutines) setRoutines(JSON.parse(localRoutines));
          const localLogs = localStorage.getItem('solotrain_logs');
          if (localLogs) setWorkoutHistory(JSON.parse(localLogs));
          
          setSession({ user: { id: 'local_user' } }); 
          setView(u.onboardingComplete ? 'DASHBOARD' : 'SETUP');
       }
       setLoading(false);
    }
  }, []);

  const loadUserData = async (userId: string) => {
     setLoading(true);
     try {
       const [profile, fetchedRoutines, fetchedLogs] = await Promise.all([
          fetchUserProfile(userId),
          fetchRoutines(userId),
          fetchLogs(userId)
       ]);

       if (profile) {
          setUser(profile);
          setView(profile.onboardingComplete ? 'DASHBOARD' : 'SETUP');
       } else {
          setView('SETUP');
       }
       if (fetchedRoutines) setRoutines(fetchedRoutines);
       if (fetchedLogs) setWorkoutHistory(fetchedLogs);
     } catch (e) {
       console.error("Failed to load user data", e);
     } finally {
       setLoading(false);
     }
  };

  const handleLogin = async () => {
    setLoading(true);
    if (isSupabaseConfigured()) {
       await signInWithGoogle();
    } else {
       // Simulate
       setTimeout(() => {
         const u: UserProfile = { ...user };
         setUser(u);
         setSession({ user: { id: 'local_user' } });
         // If no local data found, go to setup
         const localUser = localStorage.getItem('solotrain_user');
         setView(localUser && JSON.parse(localUser).onboardingComplete ? 'DASHBOARD' : 'SETUP');
         setLoading(false);
       }, 1500);
    }
  };

  // --- PERSISTENCE HELPERS ---
  const saveUser = async (u: UserProfile) => {
     setUser(u);
     if (isSupabaseConfigured() && session) await upsertUserProfile(session.user.id, u);
     else localStorage.setItem('solotrain_user', JSON.stringify(u));
  };

  const saveRoutinesList = async (list: Routine[], updatedRoutine?: Routine) => {
     setRoutines(list);
     if (isSupabaseConfigured() && session && updatedRoutine) await saveRoutine(session.user.id, updatedRoutine);
     else localStorage.setItem('solotrain_routines', JSON.stringify(list));
  };
  
  const saveHistory = async (list: WorkoutLog[], newLog?: WorkoutLog) => {
     setWorkoutHistory(list);
     if (isSupabaseConfigured() && session && newLog) await saveLog(session.user.id, newLog);
     else localStorage.setItem('solotrain_logs', JSON.stringify(list));
  };

  const deleteRoutineOp = async (id: string) => {
     const newList = routines.filter(r => r.id !== id);
     setRoutines(newList);
     setView('DASHBOARD');
     if (isSupabaseConfigured()) await deleteRoutineFromDb(id);
     else localStorage.setItem('solotrain_routines', JSON.stringify(newList));
  };

  const handleFinishSetup = async (data: SetupData) => {
    const updatedUser = { ...user, name: data.codename, experience: data.experience, goal: data.goal, onboardingComplete: true };
    try {
        // Generate Protocols
        const { data: allExercises } = await fetchExercises([], [], [], [], '', 1, 100);
        // Simple generation logic repetition for brevity
        const toRoutineEx = (ex: Exercise, sets: number, reps: string, weight: string): RoutineExercise => ({ ...ex, id: `gen_${Math.random()}`, targetSets: sets, targetReps: reps, targetWeight: weight, setLogs: [] });
        const generated: Routine[] = [];
        // [Simplified: Just generate 1 for demo if offline/quick]
        const sample = allExercises.slice(0, 5);
        if (sample.length > 0) {
            generated.push({ id: `gen_1_${Date.now()}`, name: `PROTOCOL ${data.goal}`, description: 'Auto-generated.', isFavorite: true, exercises: sample.map(ex => toRoutineEx(ex, 3, '10', '20')) });
        }
        
        const newRoutines = [...routines, ...generated];
        setRoutines(newRoutines);
        
        if (isSupabaseConfigured() && session) {
            for (const r of generated) await saveRoutine(session.user.id, r);
            await upsertUserProfile(session.user.id, updatedUser);
        } else {
            localStorage.setItem('solotrain_routines', JSON.stringify(newRoutines));
            localStorage.setItem('solotrain_user', JSON.stringify(updatedUser));
        }
        setUser(updatedUser);
        setView('DASHBOARD');
    } catch (e) { console.error("Setup error", e); }
  };

  // --- ACTIONS ---
  const handleFinishWorkout = async (sess: WorkoutSession) => {
    const xp = calculateXP(sess.exercises);
    const completedSets = sess.exercises.reduce((acc, ex) => acc + ex.setLogs.filter(s => s.completed).length, 0);
    const totalSets = sess.exercises.reduce((acc, ex) => acc + ex.targetSets, 0);
    const duration = (Date.now() - sess.startTime) / 60000;
    const status: LogStatus = completedSets < totalSets ? 'INCOMPLETE' : 'COMPLETED';
    
    const log: WorkoutLog = { 
        id: sess.id, 
        routineName: sess.routineName, 
        date: new Date(sess.startTime).toISOString(), 
        duration: Math.round(duration), 
        xpEarned: xp, 
        exercisesCompleted: sess.exercises.length, 
        totalVolume: sess.exercises.reduce((acc, ex) => acc + ex.setLogs.reduce((sAcc, s) => s.completed ? sAcc + (parseInt(s.weight) * parseInt(s.reps) || 0) : sAcc, 0), 0), 
        status: status, 
        exercises: sess.exercises 
    };
    
    const newXp = user.currentXp + xp;
    let updatedUser = { ...user };
    if (newXp >= user.xpRequired) { 
       updatedUser = { ...user, level: user.level + 1, currentXp: newXp - user.xpRequired, xpRequired: Math.round(user.xpRequired * 1.2) }; 
    } else { 
       updatedUser = { ...user, currentXp: newXp }; 
    }
    
    const updatedRoutine = routines.find(r => r.id === sess.routineId);
    if (updatedRoutine) {
       const stamped = { ...updatedRoutine, lastPerformed: new Date().toLocaleDateString() };
       const newList = routines.map(r => r.id === stamped.id ? stamped : r);
       saveRoutinesList(newList, stamped);
    }
    
    setActiveSession(null);
    setView('LOGS');
    saveHistory([log, ...workoutHistory], log);
    saveUser(updatedUser);
  };

  const handleAbortWorkout = async (sess: WorkoutSession) => {
     const duration = (Date.now() - sess.startTime) / 60000;
     const log: WorkoutLog = { id: sess.id, routineName: sess.routineName, date: new Date(sess.startTime).toISOString(), duration: Math.round(duration), xpEarned: 0, exercisesCompleted: 0, totalVolume: 0, status: 'ABORTED', exercises: sess.exercises };
    setActiveSession(null);
    setView('DASHBOARD');
    saveHistory([log, ...workoutHistory], log);
  };

  const updateRoutine = (r: Routine) => {
     const list = routines.map(ex => ex.id === r.id ? r : ex);
     saveRoutinesList(list, r);
  };

  const createRoutineState = (newRoutine: Routine) => {
    const list = [...routines, newRoutine];
    saveRoutinesList(list, newRoutine);
    setSelectedRoutine(newRoutine);
    setView('ROUTINE_DETAIL');
  };

  // ... [Handlers for adding exercises, AI generation etc use local state then saveRoutinesList] ...
  const handleAddExercise = (exercise: Exercise) => {
    const routineExercise: RoutineExercise = { ...exercise, id: `routine_ex_${Date.now()}`, targetSets: 3, targetReps: '10', targetWeight: '20', setLogs: [] };
    if (pickerContext === 'ROUTINE' && selectedRoutine) {
      const updated = { ...selectedRoutine, exercises: [...selectedRoutine.exercises, routineExercise] };
      setSelectedRoutine(updated);
      updateRoutine(updated);
    } else if (pickerContext === 'ACTIVE_SESSION' && activeSession) {
       const withLogs = { ...routineExercise, setLogs: Array.from({ length: 3 }).map((_, i) => ({ id: `set_${Date.now()}_${i}`, weight: '20', reps: '10', completed: false })) };
       setActiveSession({ ...activeSession, exercises: [...activeSession.exercises, withLogs] });
    }
  };

  const handleAddExerciseToActiveMission = (exercise: Exercise) => {
     if (!activeMission) return;
     const routineExercise: RoutineExercise = { ...exercise, id: `routine_ex_${Date.now()}`, targetSets: 3, targetReps: '10', targetWeight: '20', setLogs: [] };
     const updated = { ...activeMission, exercises: [...activeMission.exercises, routineExercise] };
     updateRoutine(updated);
  };

  const openExploreForRoutine = () => { setPickerContext('ROUTINE'); setView('EXPLORE'); };
  const exitPicker = () => { setPickerContext(null); if (selectedRoutine) setView('ROUTINE_DETAIL'); else setView('DASHBOARD'); };

  return (
    <div className="min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-black">
      <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-black">
        <main className="p-6 pt-8 h-full">
          {view === 'LOGIN' && (
             <LoginView onLogin={handleLogin} currentColor={themeColor} onChangeColor={setThemeColor} loading={loading} />
          )}

          {view === 'SETUP' && (
             <OnboardingView onComplete={handleFinishSetup} />
          )}

          {view === 'DASHBOARD' && (
            <DashboardView 
              user={user} 
              routines={routines} 
              onSelectRoutine={(r) => { setSelectedRoutine(r); setView('ROUTINE_DETAIL'); }}
              onCreateRoutine={() => { const newRoutine = { id: `routine_${Date.now()}`, name: 'NEW PROTOCOL', description: '', exercises: [] }; createRoutineState(newRoutine); }}
              onForkRoutine={(r) => { const newRoutine = { ...r, id: `fork_${Date.now()}`, name: `${r.name} (COPY)`, isFavorite: false }; createRoutineState(newRoutine); }}
              onAiGenerate={() => setAiModalOpen(true)}
            />
          )}

          {view === 'ROUTINE_DETAIL' && selectedRoutine && (
            <RoutineDetailView 
              routine={selectedRoutine}
              onBack={() => setView('DASHBOARD')}
              onStart={(r) => {
                  const preparedExercises = r.exercises.map(ex => ({ ...ex, setLogs: Array.from({ length: ex.targetSets }).map((_, i) => ({ id: `set_${Date.now()}_${i}`, weight: ex.targetWeight, reps: ex.targetReps, completed: false })) }));
                  setActiveSession({ id: `session_${Date.now()}`, routineId: r.id, routineName: r.name, startTime: Date.now(), exercises: preparedExercises });
                  setView('WORKOUT');
              }}
              onSave={(updated) => { updateRoutine(updated); setSelectedRoutine(updated); }}
              onDelete={(id) => deleteRoutineOp(id)}
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
              onUpdateSession={setActiveSession}
              onViewDetails={(ex) => setSelectedExerciseForDetail(ex)}
              onBack={() => setView('DASHBOARD')}
            />
          )}

          {view === 'EXPLORE' && (
             <ExploreView 
               onAddExercise={pickerContext ? handleAddExercise : handleAddExerciseToActiveMission}
               onViewDetails={(ex) => setSelectedExerciseForDetail(ex)}
               onForkRoutine={() => {}}
               isPickerMode={!!pickerContext}
               onExitPicker={exitPicker}
               hasActiveMission={hasActiveMission}
               activeMissionExerciseNames={activeMissionExerciseNames}
             />
          )}

          {view === 'PROFILE' && (
            <AgentView 
              user={user} 
              onUpdateUser={saveUser} 
              currentColor={themeColor}
              onUpdateColor={setThemeColor}
            />
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

        <AiMissionModal 
           isOpen={aiModalOpen}
           onClose={() => setAiModalOpen(false)}
           onGenerate={async (prompt) => {
              const aiRoutine = await generateAiRoutine(prompt);
              if (aiRoutine) {
                 // Simple Fallback Hydration for generated routine if needed
                 const newRoutine: Routine = { ...aiRoutine as any, id: `ai_${Date.now()}`, isFavorite: false, exercises: [] }; 
                 // In real logic, match DB exercises here.
                 const list = [...routines, newRoutine];
                 saveRoutinesList(list, newRoutine);
              }
           }}
        />

        {view !== 'WORKOUT' && view !== 'LOGIN' && view !== 'SETUP' && (
          <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex justify-between items-center shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-40">
            <button onClick={() => setView('DASHBOARD')} className={`p-3 rounded-xl transition-all ${view === 'DASHBOARD' || view === 'ROUTINE_DETAIL' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-500 hover:text-gray-300'}`}>
               <div className="relative"><Layers className="w-5 h-5" />{hasActiveMission && <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full shadow-[0_0_5px_var(--color-primary)]"></div>}</div>
            </button>
            <button onClick={() => setView('EXPLORE')} className={`p-3 rounded-xl transition-all ${view === 'EXPLORE' ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'text-gray-500 hover:text-gray-300'}`}><Database className="w-5 h-5" /></button>
            <button 
              onClick={() => { if (activeSession) setView('WORKOUT'); }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shadow-lg transition-all mx-2 ${activeSession ? 'bg-primary border-primary text-black shadow-[0_0_30px_var(--color-primary)] animate-pulse' : 'bg-surfaceHighlight border-white/10 text-gray-600 cursor-default'}`}
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
