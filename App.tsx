
import React, { useState, useEffect } from 'react';
import './global.css';
import { View, Text, ScrollView, TouchableOpacity, Image, SafeAreaView, StatusBar, Platform, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { styled } from 'nativewind';
// NativeWind v4 compatibility: styled is not needed as className is supported on RN components
const styled = (Component: any) => Component;
import { fetchExercises, fetchBodyParts, fetchEquipments, fetchTargetMuscles, fetchExerciseTypes, getExerciseThumbnail, getExerciseGif, getEquipmentImageUrl, getTargetImageUrl, generateAiRoutine } from './services/api';
import { signInWithGoogle, signOut, fetchUserProfile, upsertUserProfile, fetchRoutines, saveRoutine, deleteRoutineFromDb, fetchLogs, saveLog, supabase, isSupabaseConfigured } from './services/supabaseClient';
import { Exercise, Routine, RoutineExercise, UserProfile, ViewState, WorkoutSession, WorkoutLog, LogStatus, UserStats } from './types';
import { Button, Card, Input, Badge, ProgressBar, SimpleChart, Select, RadarChart, FilterGroup, FilterModal, StatusBadge, CalendarGrid, ScreenHeader, LogDetailModal } from './components/Components';
import { 
  User, Dumbbell, Play, Search, Plus, Check, 
  Trash2, ChevronLeft, ChevronRight, Settings, Activity, Save, 
  X, ChevronDown, ChevronUp, Image as ImageIcon,
  Database, Layers, BrainCircuit, AlertTriangle, FileText, Calendar, Copy, SlidersHorizontal, Info, RefreshCw, Ban, BarChart3, List, Target, Zap, ArrowLeft, ArrowRight, Eye, EyeOff, Radio, Cpu, FileBadge, Crosshair, MonitorPlay, Sparkles, Timer, RotateCcw, Palette, LogOut, Pause, Square, CheckSquare, MinusSquare
} from 'lucide-react-native';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledImage = styled(Image);
const StyledTextInput = styled(TextInput);

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
  <StyledView className="flex-1 items-center justify-center p-6 relative bg-background">
    {/* Background grid is handled by parent App component to ensure continuity */}
    
    {/* Glitch effect container */}
    <StyledView className="z-10 w-full max-w-md space-y-16 items-center">
      <StyledView className="space-y-4 relative items-center">
        <StyledText className="text-5xl font-mono font-black tracking-tighter text-white">
          SOLO<StyledText className="text-primary">TRAIN</StyledText>
        </StyledText>
        <StyledView className="h-px w-24 bg-primary mx-auto shadow-sm" />
        <StyledText className="text-primary/60 font-mono text-xs tracking-[0.5em] uppercase">Tactical Performance Interface</StyledText>
      </StyledView>

      <StyledView className="bg-white/5 p-10 space-y-8 relative border border-white/10 w-full">
        {/* Corner Accents */}
        <StyledView className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-primary" />
        <StyledView className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t-2 border-r-2 border-primary" />
        <StyledView className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b-2 border-l-2 border-primary" />
        <StyledView className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-primary" />

        <StyledView className="space-y-2 mb-4">
            <StyledText className="text-white font-mono uppercase text-sm tracking-widest text-center">Authentication Required</StyledText>
            <StyledText className="font-light text-gray-500 text-xs text-center">Establish neural link via Google Auth.</StyledText>
        </StyledView>
        
        <Button onPress={onLogin} disabled={loading} className="w-full flex-row items-center justify-center gap-3">
           {loading ? 'Initializing...' : 'Login with Google'}
           {!loading && <ChevronDown size={16} color={currentColor} />}
        </Button>
      </StyledView>

      {/* Color Picker */}
      <StyledView className="space-y-4 items-center mt-8">
        <StyledView className="flex-row items-center justify-center gap-2 mb-2">
           <Palette size={12} color="#666" /> 
           <StyledText className="text-[10px] text-gray-600 font-mono uppercase tracking-[0.3em]">Interface Theme</StyledText>
        </StyledView>
        <StyledView className="flex-row justify-center gap-4">
           {THEME_COLORS.map(color => (
             <StyledTouchableOpacity
               key={color.id}
               onPress={() => onChangeColor(color.hex)}
               className={`w-8 h-8 rounded-full border-2 ${currentColor === color.hex ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
               style={{ backgroundColor: color.hex }}
             />
           ))}
        </StyledView>
      </StyledView>
    </StyledView>
  </StyledView>
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
      <StyledView className="flex-1 items-center justify-center p-6 bg-background space-y-8">
         <StyledView className="relative items-center justify-center">
            <Activity size={64} color="#00ffff" />
            <Cpu size={32} color="#00ffff" className="absolute" />
         </StyledView>
         <StyledView className="space-y-2 items-center w-full">
            <StyledText className="text-2xl font-mono font-bold text-white tracking-[0.2em] text-center">GENERATING PROTOCOLS</StyledText>
            <StyledView className="h-0.5 w-full max-w-[200px] bg-gray-800 mx-auto overflow-hidden">
                <StyledView className="h-full bg-primary w-1/2" /> 
            </StyledView>
            <StyledText className="text-xs text-primary font-mono mt-4 text-center">Accessing Tactical Database...</StyledText>
            <StyledText className="text-[10px] text-gray-500 font-mono text-center">Compiling {data.goal} parameters for {data.experience} class agent.</StyledText>
         </StyledView>
      </StyledView>
    );
  }

  return (
    <StyledView className="flex-1 justify-center p-6 w-full max-w-md mx-auto bg-background">
      <StyledView className="mb-12">
         <StyledView className="flex-row justify-between items-center mb-4">
             <StyledText className="text-primary text-xs font-mono uppercase tracking-widest">System Config // 00{step}</StyledText>
            <StyledText className="text-gray-500 text-xs font-mono">{step} / 3</StyledText>
         </StyledView>
         <ProgressBar progress={(step / 3) * 100} className="!h-0.5" />
      </StyledView>

      <StyledView className="bg-white/5 p-8 border border-white/10 space-y-10 relative">
        <StyledView className="absolute -top-2 -left-2 w-4 h-4 border-t border-l border-white/20" />
        <StyledView className="absolute -bottom-2 -right-2 w-4 h-4 border-b border-r border-white/20" />

        {step === 1 && (
          <StyledView className="space-y-8">
            <StyledView>
              <StyledText className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Identity</StyledText>
              <StyledText className="text-xs text-gray-400 font-sans tracking-wide">Enter your operational designation.</StyledText>
            </StyledView>
            <StyledView className="relative">
                <Input 
                autoFocus
                value={data.codename}
                onChangeText={(text: string) => setData({...data, codename: text})}
                placeholder="CODENAME"
                className="text-center text-3xl font-mono tracking-widest uppercase !border-primary/50 !bg-primary/5 py-6 text-white"
                />
                <StyledView className="absolute bottom-0 left-0 w-full h-px bg-primary opacity-50" />
            </StyledView>
          </StyledView>
        )}

        {step === 2 && (
          <StyledView className="space-y-6">
            <StyledView>
              <StyledText className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Capacity</StyledText>
              <StyledText className="text-xs text-gray-400 font-sans tracking-wide">Select current operating capability.</StyledText>
            </StyledView>
            <StyledView className="gap-4">
               {['BEGINNER', 'INTERMEDIATE', 'EXPERT'].map((level) => (
                 <StyledTouchableOpacity 
                    key={level}
                    onPress={() => setData({...data, experience: level as any})}
                    className={`p-5 border transition-all relative overflow-hidden ${data.experience === level ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'}`}
                 >
                    <StyledView className="flex-row justify-between items-center relative z-10">
                       <StyledText className={`text-sm tracking-[0.2em] font-bold ${data.experience === level ? 'text-white' : 'text-gray-400'}`}>{level}</StyledText>
                       {data.experience === level && <Cpu size={16} color="#00ffff" />}
                    </StyledView>
                 </StyledTouchableOpacity>
               ))}
            </StyledView>
          </StyledView>
        )}

        {step === 3 && (
          <StyledView className="space-y-6">
            <StyledView>
              <StyledText className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Directive</StyledText>
              <StyledText className="text-xs text-gray-400 font-sans tracking-wide">Define primary mission parameter.</StyledText>
            </StyledView>
            <StyledView className="gap-4">
               {[
                 { id: 'STRENGTH', label: 'STRENGTH', desc: 'Max Force Output' },
                 { id: 'HYPERTROPHY', label: 'HYPERTROPHY', desc: 'Muscular Volume' },
                 { id: 'ENDURANCE', label: 'ENDURANCE', desc: 'Sustained Output' }
               ].map((goal) => (
                 <StyledTouchableOpacity 
                    key={goal.id}
                    onPress={() => setData({...data, goal: goal.id as any})}
                    className={`p-5 border transition-all ${data.goal === goal.id ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'}`}
                 >
                    <StyledText className={`text-sm font-bold tracking-[0.2em] mb-1 ${data.goal === goal.id ? 'text-white' : 'text-gray-400'}`}>{goal.label}</StyledText>
                    <StyledText className="text-[10px] text-gray-500 font-mono uppercase">{goal.desc}</StyledText>
                 </StyledTouchableOpacity>
               ))}
            </StyledView>
          </StyledView>
        )}

        <StyledView className="pt-6 flex-row justify-between items-center border-t border-white/5">
           {step > 1 ? (
             <StyledTouchableOpacity onPress={() => setStep(step - 1)} className="px-2">
                <StyledText className="text-xs text-gray-500 uppercase tracking-wider font-mono">// Back</StyledText>
             </StyledTouchableOpacity>
           ) : <StyledView />}
           <Button onPress={handleNext} className="w-36">
              {step === 3 ? 'Initialize' : 'Next >>'}
           </Button>
        </StyledView>

      </StyledView>
    </StyledView>
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
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
      <StyledView className="flex-1 items-center justify-center p-4 bg-black/90">
        <StyledView className="w-full max-w-lg bg-surface border border-primary/30 relative overflow-hidden flex-col shadow-sm">
           
           <StyledView className="bg-primary/10 border-b border-primary/20 p-6 flex-row justify-between items-center">
              <StyledText className="text-lg font-mono text-primary uppercase tracking-widest flex-row items-center gap-2">
                <Sparkles size={16} color="#00ffff" /> AI Tactical Generator
              </StyledText>
              <StyledTouchableOpacity onPress={onClose} disabled={isProcessing}>
                <X size={20} color="#666" />
              </StyledTouchableOpacity>
           </StyledView>
  
           <StyledView className="p-6 space-y-4">
              <StyledView className="space-y-2">
                 <StyledText className="text-xs text-gray-400 font-mono uppercase tracking-widest">Mission Parameters</StyledText>
                 <StyledTextInput 
                    value={prompt}
                    onChangeText={setPrompt}
                    placeholder="e.g., 'A high-intensity leg workout focusing on glutes without machines' or 'Full body routine for travel'"
                    placeholderTextColor="#444"
                    multiline
                    numberOfLines={4}
                    className="w-full h-32 bg-black/50 border border-white/10 p-4 text-white font-mono text-sm text-top"
                    style={{ textAlignVertical: 'top' }}
                 />
              </StyledView>
              <StyledText className="text-[10px] text-gray-500 font-mono">
                 System will analyze constraints and search tactical database for optimal exercise selection.
              </StyledText>
           </StyledView>
  
           <StyledView className="p-6 border-t border-white/10 bg-black/40">
              <Button onPress={handleSubmit} disabled={isProcessing || !prompt.trim()} className="w-full">
                 {isProcessing ? 'COMPILING DATA...' : 'GENERATE PROTOCOL'}
              </Button>
           </StyledView>
        </StyledView>
      </StyledView>
    </Modal>
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
    <Modal visible={!!exercise} transparent animationType="slide" onRequestClose={onClose}>
      <StyledView className="flex-1 items-center justify-center p-4 bg-black/90">
        <StyledView className="w-full max-w-2xl bg-surface border border-white/10 relative overflow-hidden flex-col max-h-[90%]">
          
          <StyledView className="relative shrink-0 bg-white/5 border-b border-white/10 flex-col">
              <StyledTouchableOpacity onPress={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full">
                <X size={20} color="#fff" />
              </StyledTouchableOpacity>
              
              <StyledView className="w-full h-48 bg-white/5 items-center justify-center relative overflow-hidden">
                  {headerImage ? (
                     <StyledImage 
                        source={{ uri: headerImage }} 
                        className="w-full h-full opacity-90" 
                        resizeMode="contain"
                     />
                  ) : (
                      <StyledView className="items-center justify-center gap-2">
                          <ImageIcon size={48} color="#666" />
                          <StyledText className="text-[10px] font-mono uppercase text-gray-600">Visual Unavailable</StyledText>
                      </StyledView>
                  )}
                  <StyledView className="absolute inset-0 bg-black/20" />
              </StyledView>
  
              <StyledView className="p-6 pb-2 -mt-12 relative z-10">
                 <StyledView className="flex-row justify-between items-end">
                    <StyledView className="flex-1 mr-4">
                      <StyledText className="text-2xl font-light text-white uppercase tracking-wide font-mono shadow-black shadow-md">{exercise.name}</StyledText>
                      <StyledView className="flex-row gap-2 mt-2">
                         <Badge variant="primary">{exercise.bodyPart}</Badge>
                         <Badge variant="outline">{exercise.equipment}</Badge>
                      </StyledView>
                    </StyledView>
                    <StyledView className="items-end">
                       <StyledText className="text-[10px] text-gray-400 uppercase font-mono">Target</StyledText>
                       <StyledText className="text-primary font-mono text-sm uppercase">{exercise.target}</StyledText>
                    </StyledView>
                 </StyledView>
              </StyledView>
          </StyledView>
          
          <StyledScrollView className="p-6 pt-2 space-y-6 flex-1">
            
            <StyledView className="flex-row gap-4">
               <StyledView className="flex-1 bg-white/5 border border-white/5 rounded-sm h-24 relative overflow-hidden">
                  <StyledImage source={{ uri: targetImg }} className="absolute inset-0 w-full h-full opacity-50" resizeMode="cover" />
                  <StyledView className="absolute inset-0 bg-black/60" /> 
                  <StyledView className="absolute inset-0 justify-end p-3">
                    <StyledText className="text-[10px] text-primary uppercase tracking-widest font-mono relative z-10">Target</StyledText>
                    <StyledText className="text-sm font-bold text-white capitalize font-mono relative z-10">{exercise.bodyPart}</StyledText>
                  </StyledView>
               </StyledView>
               <StyledView className="flex-1 bg-white/5 border border-white/5 rounded-sm h-24 relative overflow-hidden">
                   <StyledImage source={{ uri: equipImg }} className="absolute inset-0 w-full h-full opacity-50" resizeMode="cover" />
                   <StyledView className="absolute inset-0 bg-black/60" />
                  <StyledView className="absolute inset-0 justify-end p-3">
                    <StyledText className="text-[10px] text-primary uppercase tracking-widest font-mono relative z-10">Equipment</StyledText>
                    <StyledText className="text-sm font-bold text-white capitalize font-mono relative z-10">{exercise.equipment}</StyledText>
                  </StyledView>
               </StyledView>
            </StyledView>
  
            <StyledView className="border-t border-white/10 pt-4">
              <StyledText className="text-xs text-gray-500 uppercase tracking-widest mb-4 flex-row items-center gap-2 font-mono">
                 <FileText size={12} color="#666" /> Operational Sequence
              </StyledText>
              <StyledView className="space-y-4">
                 {displayInstructions.map((step, idx) => (
                    <StyledView key={idx} className="flex-row gap-4">
                       <StyledView className="w-6 h-6 rounded-full bg-white/5 border border-white/10 items-center justify-center">
                          <StyledText className="text-primary text-xs font-mono">{idx + 1}</StyledText>
                       </StyledView>
                       <StyledText className="flex-1 text-sm font-light text-gray-300 leading-relaxed font-mono">{step}</StyledText>
                    </StyledView>
                 ))}
              </StyledView>
            </StyledView>
  
            {bottomGif && (
              <StyledView className="border-t border-white/10 pt-4 pb-8">
                 <StyledText className="text-xs text-gray-500 uppercase tracking-widest mb-4 flex-row items-center gap-2 font-mono">
                    <MonitorPlay size={12} color="#666" /> Visual Demonstration
                 </StyledText>
                 <StyledView className="w-full h-48 bg-black/40 border border-white/5 rounded-sm items-center justify-center overflow-hidden">
                     <StyledImage source={{ uri: bottomGif }} className="w-full h-full" resizeMode="contain" />
                 </StyledView>
              </StyledView>
            )}
          </StyledScrollView>
  
          {onAddToRoutine && (
            <StyledView className="p-4 border-t border-white/10 bg-surfaceHighlight z-20">
              <Button onPress={() => { onAddToRoutine(exercise); onClose(); }} className="w-full shadow-lg">
                {actionLabel}
              </Button>
            </StyledView>
          )}
        </StyledView>
      </StyledView>
    </Modal>
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
    <StyledScrollView className="flex-1 pb-24 space-y-8 bg-background">
       <ScreenHeader title="Command Center" subtitle={`Agent ${user.name}`} />
       
       <StyledView className="px-6">
         <StyledView className="flex-row justify-between items-end mb-4 border-b border-white/10 pb-2">
           <StyledText className="text-sm font-mono uppercase tracking-widest text-primary">Active Mission</StyledText>
         </StyledView>
         {activeRoutine ? (
           <Card onClick={() => onSelectRoutine(activeRoutine)} className="border-l-primary bg-primary/5 relative overflow-hidden">
              <StyledView className="absolute top-0 right-0 p-2 opacity-50"><Cpu size={48} color="#00ffff" style={{ transform: [{ rotate: '12deg' }] }} /></StyledView>
              <StyledView className="relative z-10">
                 <StyledText className="text-lg font-bold text-white uppercase font-mono">{activeRoutine.name}</StyledText>
                 <StyledView className="flex-row gap-4 mt-4">
                    <StyledView className="flex-row items-center gap-1">
                        <Dumbbell size={12} color="#666" /> 
                        <StyledText className="text-[10px] font-mono text-gray-500 uppercase">{activeRoutine.exercises.length} Exercises</StyledText>
                    </StyledView>
                 </StyledView>
              </StyledView>
           </Card>
         ) : (
           <StyledView className="p-6 border border-dashed border-white/20 rounded-lg items-center space-y-2">
              <StyledText className="text-sm text-gray-500">No active mission protocol assigned.</StyledText>
              <Button variant="secondary" onPress={onCreateRoutine}>Select Protocol</Button>
           </StyledView>
         )}
       </StyledView>

       <StyledView className="px-6 pb-24">
          <StyledView className="flex-row justify-between items-end mb-4 border-b border-white/10 pb-2">
            <StyledText className="text-sm font-mono uppercase tracking-widest text-white">Available Protocols</StyledText>
            <StyledView className="flex-row gap-2">
              <StyledTouchableOpacity onPress={onAiGenerate} className="flex-row items-center gap-1 border border-primary/30 px-2 py-1 bg-primary/5 rounded-sm">
                  <Sparkles size={12} color="#00ffff" /> 
                  <StyledText className="text-xs text-primary uppercase tracking-wider">AI Generate</StyledText>
              </StyledTouchableOpacity>
              <StyledTouchableOpacity onPress={onCreateRoutine} className="flex-row items-center gap-1 border border-white/20 px-2 py-1 rounded-sm">
                  <Plus size={12} color="#999" /> 
                  <StyledText className="text-xs text-gray-400 uppercase tracking-wider">New</StyledText>
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
          <StyledView className="space-y-4">
             {otherRoutines.map(routine => (
                <Card key={routine.id} onClick={() => onSelectRoutine(routine)} className="bg-white/5">
                   <StyledView className="flex-row justify-between items-start">
                      <StyledView>
                         <StyledText className="font-bold text-gray-300 uppercase font-mono">{routine.name}</StyledText>
                         <StyledText className="text-xs text-gray-500 mt-1">{routine.exercises.length} Exercises</StyledText>
                      </StyledView>
                      <ChevronRight size={16} color="#666" />
                   </StyledView>
                </Card>
             ))}
             {otherRoutines.length === 0 && <StyledText className="text-xs text-gray-600 font-mono italic">No additional protocols.</StyledText>}
          </StyledView>
       </StyledView>
    </StyledScrollView>
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
        // Initially expand only the first exercise
        if (routine.exercises.length > 0) {
            setExpandedExIds([routine.exercises[0].id]);
        } else {
            setExpandedExIds([]);
        }
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
        <StyledScrollView className="flex-1 pb-32 bg-background">
             <ScreenHeader 
                title={isEditing ? "Edit Protocol" : "Protocol Details"}
                subtitle={isEditing ? "Modify Parameters" : "Mission Overview"}
                onBack={onBack}
                rightAction={
                    isEditing ? (
                        <StyledView className="flex-row gap-2">
                             <StyledTouchableOpacity onPress={() => onDelete(routine.id)} className="p-2 bg-red-500/10 rounded-full"><Trash2 size={20} color="#ef4444" /></StyledTouchableOpacity>
                             <StyledTouchableOpacity onPress={handleSave} className="p-2 bg-primary/10 rounded-full"><Check size={20} color="#00ffff" /></StyledTouchableOpacity>
                        </StyledView>
                    ) : (
                        <StyledView className="flex-row gap-2">
                            <StyledTouchableOpacity onPress={toggleFavorite} className="p-2 rounded-full"><Check size={20} color={routine.isFavorite ? '#00ffff' : '#666'} /></StyledTouchableOpacity>
                            <StyledTouchableOpacity onPress={() => setIsEditing(true)} className="p-2"><Settings size={20} color="#999" /></StyledTouchableOpacity>
                        </StyledView>
                    )
                }
             />

             <StyledView className="px-6 space-y-6 pb-24">
                <StyledView className="space-y-4">
                    {isEditing ? (
                        <>
                           <StyledView>
                             <StyledText className="text-[10px] uppercase text-gray-500 tracking-widest mb-1 font-mono">Protocol Name</StyledText>
                             <Input value={editedRoutine.name} onChangeText={(text: string) => setEditedRoutine({...editedRoutine, name: text})} className="text-xl font-bold font-mono" />
                           </StyledView>
                           <StyledView>
                             <StyledText className="text-[10px] uppercase text-gray-500 tracking-widest mb-1 font-mono">Description</StyledText>
                             <Input value={editedRoutine.description} onChangeText={(text: string) => setEditedRoutine({...editedRoutine, description: text})} />
                           </StyledView>
                        </>
                    ) : (
                        <StyledView>
                           <Button onPress={() => onStart(routine)} className="w-full mb-4 gap-2 flex-row">
                               <Play size={16} color="#00ffff" fill="#00ffff" /> Initialize Mission
                           </Button>
                           <StyledText className="text-2xl font-bold text-white uppercase font-mono mb-2">{routine.name}</StyledText>
                           <StyledText className="text-sm text-gray-400 font-light">{routine.description || "No classification data."}</StyledText>
                        </StyledView>
                    )}
                </StyledView>

                <StyledView>
                    <StyledView className="flex-row justify-between items-center mb-4 border-b border-white/10 pb-2">
                        <StyledText className="text-sm font-mono uppercase tracking-widest text-white">Sequence</StyledText>
                        {isEditing && (
                            <StyledTouchableOpacity onPress={onAddExercises} className="flex-row items-center gap-1 border border-primary/20 px-2 py-1 bg-primary/5">
                                <Plus size={12} color="#00ffff" /> 
                                <StyledText className="text-xs text-primary uppercase font-mono">Add</StyledText>
                            </StyledTouchableOpacity>
                        )}
                    </StyledView>
                    
                    <StyledView className="space-y-3">
                        {(isEditing ? editedRoutine.exercises : routine.exercises).map((ex, idx) => (
                            <StyledView key={ex.id} className="bg-white/5 border border-white/10 relative overflow-hidden">
                                <StyledTouchableOpacity 
                                    className="flex-row justify-between items-center p-4"
                                    onPress={() => toggleExpand(ex.id)}
                                >
                                   <StyledView className="flex-row items-center gap-3 flex-1">
                                      <StyledView className="w-8 h-8 bg-black border border-white/10 items-center justify-center">
                                         <Dumbbell size={16} color="#666" />
                                      </StyledView>
                                      <StyledView className="flex-1">
                                         <StyledText className="font-bold text-white text-sm uppercase font-mono" numberOfLines={1}>{ex.name}</StyledText>
                                         {!isEditing && <StyledText className="text-[9px] text-gray-500 font-mono mt-0.5">{ex.targetSets} SETS • {ex.targetReps} REPS</StyledText>}
                                      </StyledView>
                                   </StyledView>
                                   <StyledView className="flex-row items-center gap-2">
                                        {!isEditing && (
                                            <StyledTouchableOpacity onPress={() => onViewDetails(ex)} className="p-2">
                                                <Info size={16} color="#00ffff" />
                                            </StyledTouchableOpacity>
                                        )}
                                        {isEditing && (
                                           <StyledTouchableOpacity onPress={() => removeExercise(idx)} className="p-2"><Trash2 size={16} color="#666" /></StyledTouchableOpacity>
                                        )}
                                        {expandedExIds.includes(ex.id) ? <ChevronUp size={16} color="#666" /> : <ChevronDown size={16} color="#666" />}
                                   </StyledView>
                                </StyledTouchableOpacity>
                                
                                {expandedExIds.includes(ex.id) && (
                                    <StyledView className="p-4 pt-0 border-t border-white/5 bg-black/20">
                                        <StyledView className="flex-row gap-2 mt-3">
                                            {isEditing ? (
                                                <>
                                                    <StyledView className="flex-1">
                                                        <StyledText className="text-[8px] uppercase text-gray-500 mb-1">Sets</StyledText>
                                                        <Input keyboardType="numeric" value={String(ex.targetSets)} onChangeText={(text: string) => updateExercise(idx, 'targetSets', parseInt(text) || 0)} className="p-1 text-center font-mono !text-xs" />
                                                    </StyledView>
                                                    <StyledView className="flex-1">
                                                        <StyledText className="text-[8px] uppercase text-gray-500 mb-1">Reps</StyledText>
                                                        <Input value={ex.targetReps} onChangeText={(text: string) => updateExercise(idx, 'targetReps', text)} className="p-1 text-center font-mono !text-xs" />
                                                    </StyledView>
                                                </>
                                            ) : (
                                                <StyledView className="flex-row gap-4 w-full">
                                                    <StyledView className="items-center flex-1 bg-white/5 p-2 rounded">
                                                        <StyledText className="text-[8px] text-gray-500 uppercase">Sets</StyledText>
                                                        <StyledText className="text-lg font-mono text-white">{ex.targetSets}</StyledText>
                                                    </StyledView>
                                                    <StyledView className="items-center flex-1 bg-white/5 p-2 rounded">
                                                        <StyledText className="text-[8px] text-gray-500 uppercase">Reps</StyledText>
                                                        <StyledText className="text-lg font-mono text-white">{ex.targetReps}</StyledText>
                                                    </StyledView>
                                                    <StyledView className="items-center flex-1 bg-white/5 p-2 rounded">
                                                        <StyledText className="text-[8px] text-gray-500 uppercase">Weight</StyledText>
                                                        <StyledText className="text-lg font-mono text-white">{ex.targetWeight || '-'}</StyledText>
                                                    </StyledView>
                                                </StyledView>
                                            )}
                                        </StyledView>
                                    </StyledView>
                                )}
                            </StyledView>
                        ))}
                    </StyledView>
                </StyledView>
             </StyledView>
        </StyledScrollView>
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
    
    // Initialize expanded IDs to match session (expand only the first by default)
    useEffect(() => {
        if (expandedExIds.length === 0 && session.exercises.length > 0) {
             setExpandedExIds([session.exercises[0].id]);
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
    const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

    return (
        <StyledView className={`h-full flex-col pb-24 relative ${isPaused ? 'opacity-50' : ''}`}>
             <StyledView className="bg-black/90 border-b border-white/10 pb-4 pt-2 px-6 shadow-lg z-30">
                <StyledView className="flex-row justify-between items-center mb-2">
                    <StyledTouchableOpacity onPress={onBack}><ChevronLeft className="w-6 h-6 text-gray-400" /></StyledTouchableOpacity>
                    <StyledView className="flex-col items-center">
                         <StyledText className={`font-mono text-2xl font-bold tracking-widest ${isPaused ? 'text-yellow-500' : 'text-white'}`}>
                            {isPaused ? "PAUSED" : new Date(elapsed).toISOString().substr(11, 8)}
                        </StyledText>
                    </StyledView>
                    <StyledTouchableOpacity onPress={togglePause} className={`p-2 rounded-full border ${isPaused ? 'border-primary bg-primary/10' : 'border-white/20'}`}>
                        {isPaused ? <Play className={`w-4 h-4 ${isPaused ? 'text-primary' : 'text-gray-400'}`} fill="currentColor" /> : <Pause className="w-4 h-4 text-gray-400" fill="currentColor" />}
                    </StyledTouchableOpacity>
                </StyledView>
                <ProgressBar progress={progress} className="h-1.5" />
                
                {isResting && (
                    <StyledView className="mt-2 flex-row items-center justify-between bg-primary/10 border border-primary/30 p-2 rounded px-4">
                        <StyledView className="flex-row items-center gap-2">
                            <Timer className="w-4 h-4 text-primary" />
                            <StyledText className="text-primary font-mono text-sm">REST</StyledText>
                        </StyledView>
                        <StyledText className="text-primary font-mono text-xl font-bold">{new Date(restTimer * 1000).toISOString().substr(14, 5)}</StyledText>
                        <StyledTouchableOpacity onPress={() => setIsResting(false)} className="bg-primary/20 px-2 py-1 rounded border border-primary/30">
                            <StyledText className="text-[10px] text-primary font-bold uppercase">Skip</StyledText>
                        </StyledTouchableOpacity>
                    </StyledView>
                )}
             </StyledView>

             <StyledScrollView className="flex-1 px-6 pt-4">
                {session.exercises.map((ex, exIdx) => {
                    const exCompletedSets = ex.setLogs.filter(s => s.completed).length;
                    const exProgress = ex.targetSets > 0 ? (exCompletedSets / ex.targetSets) * 100 : 0;
                    const isExpanded = expandedExIds.includes(ex.id);
                    const allChecked = ex.setLogs.every(s => s.completed);

                    return (
                        <StyledView key={ex.id} className={`mb-4 border border-white/10 overflow-hidden ${isExpanded ? 'bg-white/5' : 'bg-transparent'}`}>
                            {/* Exercise Header */}
                            <StyledTouchableOpacity 
                                onPress={() => toggleExpand(ex.id)}
                                className="flex-row justify-between items-center p-4 bg-black/40"
                            >
                                <StyledView className="flex-row items-center gap-3 flex-1">
                                    <StyledView className="w-10 h-10 bg-black/50 border border-white/10 items-center justify-center rounded-sm">
                                        <Activity className="w-5 h-5 text-gray-500" />
                                    </StyledView>
                                    <StyledView className="flex-1">
                                        <StyledView className="flex-row justify-between items-center pr-2">
                                            <StyledText className="text-white font-bold font-mono uppercase text-sm" numberOfLines={1}>{ex.name}</StyledText>
                                            <StyledText className="text-[10px] text-gray-500 font-mono">{exCompletedSets}/{ex.targetSets}</StyledText>
                                        </StyledView>
                                        <StyledView className="w-full h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
                                            <StyledView className="h-full bg-primary" style={{ width: `${exProgress}%` }} />
                                        </StyledView>
                                    </StyledView>
                                </StyledView>
                                <StyledView className="flex-row items-center gap-3 pl-2 border-l border-white/10 ml-2">
                                    {/* Expand/Collapse Chevron */}
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                </StyledView>
                            </StyledTouchableOpacity>
                            
                            {/* Actions Bar (Inside when expanded, or summary) */}
                             {isExpanded && (
                                <StyledView className="flex-row justify-between items-center px-4 py-2 border-b border-white/5 bg-black/10">
                                    <StyledTouchableOpacity onPress={() => onViewDetails(ex)} className="flex-row items-center gap-1">
                                        <Info className="w-3 h-3 text-gray-400" /> 
                                        <StyledText className="text-[10px] text-gray-400 uppercase font-mono">View Guide</StyledText>
                                    </StyledTouchableOpacity>
                                    <StyledTouchableOpacity 
                                        onPress={() => toggleAllSets(exIdx)} 
                                        className="flex-row items-center gap-1 border border-primary/20 px-2 py-1 rounded bg-primary/5"
                                    >
                                        {allChecked ? <MinusSquare className="w-3 h-3 text-primary" /> : <CheckSquare className="w-3 h-3 text-primary" />}
                                        <StyledText className="text-[10px] text-primary uppercase font-mono">
                                            {allChecked ? "Uncheck All" : "Check All"}
                                        </StyledText>
                                    </StyledTouchableOpacity>
                                </StyledView>
                             )}

                            {/* Sets List (Collapsible) */}
                            {isExpanded && (
                                <StyledView className="bg-white/5">
                                    {ex.setLogs.map((set, setIdx) => (
                                        <StyledView key={set.id} className={`flex-row items-center gap-3 p-3 border-b border-white/5 bg-black/20`}>
                                            <StyledText className={`w-6 text-center font-mono text-xs font-bold ${set.completed ? 'text-primary' : 'text-gray-600'}`}>{setIdx + 1}</StyledText>
                                            <StyledView className="flex-1 flex-row gap-2">
                                                <StyledView className="flex-1 relative">
                                                    <Input 
                                                        value={String(set.weight)} 
                                                        onChangeText={(text) => updateSetData(exIdx, setIdx, 'weight', text)}
                                                        className={`w-full bg-transparent border-b text-center text-sm font-mono py-1 ${set.completed ? 'border-primary/30 text-primary' : 'border-white/20 text-white'}`}
                                                        editable={!isPaused}
                                                        keyboardType="numeric"
                                                    />
                                                    <StyledText className="absolute right-2 top-1.5 text-[8px] opacity-30 text-white">KG</StyledText>
                                                </StyledView>
                                                <StyledView className="flex-1 relative">
                                                    <Input 
                                                        value={String(set.reps)} 
                                                        onChangeText={(text) => updateSetData(exIdx, setIdx, 'reps', text)}
                                                        className={`w-full bg-transparent border-b text-center text-sm font-mono py-1 ${set.completed ? 'border-primary/30 text-primary' : 'border-white/20 text-white'}`}
                                                        editable={!isPaused}
                                                        keyboardType="numeric"
                                                    />
                                                    <StyledText className="absolute right-2 top-1.5 text-[8px] opacity-30 text-white">REPS</StyledText>
                                                </StyledView>
                                            </StyledView>
                                            <StyledTouchableOpacity 
                                                onPress={() => toggleSet(exIdx, setIdx)} 
                                                disabled={isPaused}
                                                className={`w-8 h-8 items-center justify-center border rounded-sm ${set.completed ? 'bg-primary border-primary' : 'border-white/20 bg-black/50'}`}
                                            >
                                                <Check className={`w-5 h-5 ${set.completed ? 'text-black' : 'text-gray-600'}`} />
                                            </StyledTouchableOpacity>
                                        </StyledView>
                                    ))}
                                </StyledView>
                            )}
                        </StyledView>
                    );
                })}
             </StyledScrollView>
             
             {isPaused && (
                <StyledView className="absolute inset-0 justify-center items-center z-40 pointer-events-none">
                    <StyledView className="bg-black/80 border border-primary/50 px-6 py-4 shadow-lg">
                        <StyledText className="text-primary font-mono text-xl tracking-[0.2em] font-bold">SYSTEM PAUSED</StyledText>
                    </StyledView>
                </StyledView>
             )}
             
             <StyledView className="absolute bottom-6 left-6 right-6 z-50 flex-row gap-4">
                 <Button onPress={() => onAbort(session)} variant="danger" className="flex-1 bg-black/90">Abort</Button>
                 <Button onPress={() => onFinish(session)} disabled={isPaused} className="flex-[2] bg-black/90">Complete Mission</Button>
             </StyledView>
        </StyledView>
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
        <StyledView className="pb-24 h-full flex-col">
            <ScreenHeader 
                title="Intel Database" 
                subtitle="Tactical Exercise Library" 
                rightAction={isPickerMode ? <Button onPress={onExitPicker} className="!py-2 !px-4">Done</Button> : null}
            />

            <StyledView className="flex-row gap-2 relative z-20 mb-4 px-6">
                <StyledView className="relative flex-1">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500 z-10" />
                    <Input 
                        value={search} 
                        onChangeText={(text) => { setSearch(text); setPage(1); }} 
                        placeholder="SEARCH INTEL..." 
                        className="pl-10 font-mono text-sm"
                    />
                </StyledView>
                <StyledTouchableOpacity onPress={() => setFilterOpen(true)} className={`px-4 border border-white/20 bg-white/5 items-center justify-center ${combinedFilters.length > 0 ? 'border-primary' : ''}`}>
                    <SlidersHorizontal className={`w-5 h-5 ${combinedFilters.length > 0 ? 'text-primary' : 'text-gray-400'}`} />
                </StyledTouchableOpacity>
            </StyledView>

            {loading ? (
                <StyledView className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#00ff00" />
                </StyledView>
            ) : (
                <StyledScrollView className="flex-1 px-6">
                    {exercises.map(ex => {
                        const isAdded = activeMissionExerciseNames.includes(ex.name);
                        return (
                            <StyledView key={ex.id} className="p-4 border border-white/10 flex-row justify-between items-center mb-3 bg-white/5">
                                <StyledView className="flex-1">
                                    <StyledText className="text-white font-bold font-mono uppercase text-sm">{ex.name}</StyledText>
                                    <StyledView className="flex-row gap-2 mt-1">
                                        <StyledText className="text-[10px] text-primary uppercase font-mono border border-primary/20 px-1">{ex.bodyPart}</StyledText>
                                        <StyledText className="text-[10px] text-gray-500 uppercase font-mono">{ex.equipment}</StyledText>
                                    </StyledView>
                                    <StyledTouchableOpacity onPress={() => onViewDetails(ex)} className="flex-row items-center gap-1 mt-2">
                                        <Info className="w-3 h-3 text-gray-400" /> 
                                        <StyledText className="text-[10px] text-gray-400">Details</StyledText>
                                    </StyledTouchableOpacity>
                                </StyledView>
                                <StyledView className="flex-row items-center gap-3">
                                    {(isPickerMode || hasActiveMission) && (
                                        <StyledTouchableOpacity 
                                            onPress={() => onAddExercise(ex)}
                                            disabled={isAdded && !isPickerMode}
                                            className={`p-2 rounded-full border ${isAdded ? 'bg-primary border-primary' : 'border-white/20'}`}
                                        >
                                            {isAdded ? <Check className="w-5 h-5 text-black" /> : <Plus className="w-5 h-5 text-gray-400" />}
                                        </StyledTouchableOpacity>
                                    )}
                                </StyledView>
                            </StyledView>
                        );
                    })}
                </StyledScrollView>
            )}
            
            {/* Pagination */}
            <StyledView className="flex-row justify-between items-center pt-4 border-t border-white/10 px-6 pb-6">
                <StyledTouchableOpacity disabled={page <= 1} onPress={() => setPage(p => p - 1)} className="p-2">
                    <ChevronLeft className={`w-6 h-6 ${page <= 1 ? 'text-gray-700' : 'text-white'}`} />
                </StyledTouchableOpacity>
                <StyledText className="font-mono text-xs text-gray-500">PAGE {page} / {totalPages || 1}</StyledText>
                <StyledTouchableOpacity disabled={page >= totalPages} onPress={() => setPage(p => p + 1)} className="p-2">
                    <ChevronRight className={`w-6 h-6 ${page >= totalPages ? 'text-gray-700' : 'text-white'}`} />
                </StyledTouchableOpacity>
            </StyledView>

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
        </StyledView>
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
     // In React Native, we might navigate to login or reload the app context
     // For now, we rely on the parent's auth state listener
   };

   const getTrendData = (current: number) => {
      return [current * 0.8, current * 0.85, current * 0.75, current * 0.9, current * 0.95, current];
   };

   return (
      <StyledScrollView className="pb-24 space-y-8 h-full">
         <ScreenHeader 
           title="Agent Profile" 
           subtitle={`ID: ${user.name}`} 
           rightAction={
             <StyledView className="flex-row gap-2">
               <StyledTouchableOpacity onPress={handleLogout} className="p-2 rounded-full border border-red-500/20 bg-red-500/5">
                 <LogOut className="w-4 h-4 text-red-500" />
               </StyledTouchableOpacity>
               <StyledTouchableOpacity onPress={() => setIsEditing(!isEditing)} className={`p-2 rounded-full border ${isEditing ? 'bg-white border-white' : 'border-white/20 bg-transparent'}`}>
                 <Settings className={`w-4 h-4 ${isEditing ? 'text-black' : 'text-gray-400'}`} />
               </StyledTouchableOpacity>
             </StyledView>
           }
         />

         <StyledView className="flex-row items-center gap-6 px-6">
            <StyledView className="w-24 h-24 rounded-full border-2 border-primary p-1 relative">
               <StyledView className="w-full h-full bg-gray-800 rounded-full overflow-hidden items-center justify-center">
                  <User className="w-12 h-12 text-gray-500" />
               </StyledView>
               <StyledView className="absolute -bottom-2 -right-2 bg-black border border-primary px-2 py-0.5 rounded">
                  <StyledText className="text-xs text-primary font-bold font-mono">LVL {user.level}</StyledText>
               </StyledView>
            </StyledView>
            <StyledView>
               <StyledText className="text-2xl font-bold text-white uppercase font-mono">{user.name}</StyledText>
               <StyledText className="text-xs text-gray-400 font-mono uppercase tracking-widest">{user.goal} Specialist</StyledText>
               <StyledView className="mt-3 w-32">
                  <StyledView className="flex-row justify-between mb-1">
                     <StyledText className="text-[9px] text-gray-500 font-mono">XP</StyledText>
                     <StyledText className="text-[9px] text-gray-500 font-mono">{user.currentXp} / {user.xpRequired}</StyledText>
                  </StyledView>
                  <ProgressBar progress={(user.currentXp / user.xpRequired) * 100} className="h-1" />
               </StyledView>
            </StyledView>
         </StyledView>

         <StyledView className="mx-6 bg-white/5 p-4 border border-white/10 relative overflow-hidden">
            <StyledView className="absolute top-2 right-2 opacity-50"><Crosshair className="w-6 h-6 text-primary" /></StyledView>
            <StyledText className="text-sm font-mono uppercase tracking-widest text-white mb-4">Biometric Balance</StyledText>
            <RadarChart data={user.stats} color={currentColor} />
         </StyledView>

         <StyledView className="space-y-4 px-6">
            <StyledView className="flex-row items-center justify-between border-b border-white/10 pb-2">
               <StyledText className="text-sm font-mono uppercase tracking-widest text-white">{isEditing ? 'Profile Calibration' : 'Performance Trends'}</StyledText>
            </StyledView>
            
            {isEditing ? (
               <StyledView className="space-y-6">
                  {/* Identity Edit */}
                  <StyledView>
                     <StyledText className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-mono">Identity Designation</StyledText>
                     <Input 
                        value={user.name} 
                        onChangeText={(text) => onUpdateUser({...user, name: text})}
                        className="font-mono"
                     />
                  </StyledView>

                  {/* Experience Edit */}
                  <StyledView>
                     <StyledText className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-mono">Class Authorization</StyledText>
                     <StyledView className="flex-row gap-2 flex-wrap">
                        {['BEGINNER', 'INTERMEDIATE', 'EXPERT'].map((level) => (
                           <StyledTouchableOpacity 
                              key={level}
                              onPress={() => onUpdateUser({...user, experience: level as any})}
                              className={`
                                 py-2 px-3 border uppercase
                                 ${user.experience === level 
                                    ? 'bg-primary border-primary' 
                                    : 'bg-white/5 border-white/10'
                                 }
                              `}
                           >
                              <StyledText className={`text-[10px] font-mono ${user.experience === level ? 'text-black font-bold' : 'text-gray-400'}`}>{level}</StyledText>
                           </StyledTouchableOpacity>
                        ))}
                     </StyledView>
                  </StyledView>

                  {/* Goal Edit */}
                  <StyledView>
                     <StyledText className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-mono">Mission Directive</StyledText>
                     <StyledView className="flex-row gap-2 flex-wrap">
                        {['STRENGTH', 'HYPERTROPHY', 'ENDURANCE'].map((goal) => (
                           <StyledTouchableOpacity 
                              key={goal}
                              onPress={() => onUpdateUser({...user, goal: goal as any})}
                              className={`
                                 py-2 px-3 border uppercase
                                 ${user.goal === goal 
                                    ? 'bg-primary border-primary' 
                                    : 'bg-white/5 border-white/10'
                                 }
                              `}
                           >
                              <StyledText className={`text-[10px] font-mono ${user.goal === goal ? 'text-black font-bold' : 'text-gray-400'}`}>{goal}</StyledText>
                           </StyledTouchableOpacity>
                        ))}
                     </StyledView>
                  </StyledView>

                  {/* Biometric Sliders */}
                  <StyledView className="space-y-4 pt-4 border-t border-white/10">
                     <StyledText className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Stat Calibration</StyledText>
                     {user.stats.map((stat, idx) => (
                     <StyledView key={stat.label}>
                        <StyledView className="flex-row justify-between mb-2">
                           <StyledText className="text-xs font-mono uppercase text-gray-400">{stat.label}</StyledText>
                           <StyledText className="text-xs font-mono uppercase text-primary">{stat.value} / {stat.fullMark}</StyledText>
                        </StyledView>
                        {/* Simple Slider Replacement using Buttons for now or just Input */}
                        <StyledView className="flex-row items-center gap-4">
                            <StyledTouchableOpacity onPress={() => handleStatChange(idx, Math.max(0, stat.value - 5))} className="p-2 bg-white/10 rounded"><MinusSquare size={16} color="#fff" /></StyledTouchableOpacity>
                            <ProgressBar progress={(stat.value / stat.fullMark) * 100} className="flex-1 h-2" />
                            <StyledTouchableOpacity onPress={() => handleStatChange(idx, Math.min(120, stat.value + 5))} className="p-2 bg-white/10 rounded"><Plus size={16} color="#fff" /></StyledTouchableOpacity>
                        </StyledView>
                     </StyledView>
                     ))}
                  </StyledView>

                  {/* Interface Theme Picker */}
                  <StyledView className="space-y-4 pt-4 border-t border-white/10">
                     <StyledText className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Interface Theme</StyledText>
                     <StyledView className="flex-row gap-4">
                        {THEME_COLORS.map(color => (
                          <StyledTouchableOpacity
                            key={color.id}
                            onPress={() => onUpdateColor(color.hex)}
                            className={`w-8 h-8 rounded-full border-2 items-center justify-center ${currentColor === color.hex ? 'border-white' : 'border-transparent'}`}
                            style={{ borderColor: currentColor === color.hex ? color.hex : 'rgba(255,255,255,0.1)' }}
                          >
                             <StyledView className="w-3 h-3 rounded-full" style={{ backgroundColor: color.hex }} />
                          </StyledTouchableOpacity>
                        ))}
                     </StyledView>
                  </StyledView>
               </StyledView>
            ) : (
               <StyledView className="gap-6">
                  {user.stats.map((stat) => (
                    <StyledView key={stat.label} className="bg-white/5 p-4 border border-white/5">
                        <StyledView className="flex-row justify-between items-end mb-2">
                           <StyledText className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">{stat.label}</StyledText>
                           <StyledText className="text-lg text-white font-mono">{stat.value}</StyledText>
                        </StyledView>
                        <SimpleChart data={getTrendData(stat.value)} labels={['', '', '', '', '', 'NOW']} color={currentColor} />
                    </StyledView>
                  ))}
               </StyledView>
            )}
         </StyledView>

         {!isEditing && (
            <StyledView className="space-y-4 pt-4 border-t border-white/10 px-6 mb-8">
               <StyledText className="text-sm font-mono uppercase tracking-widest text-white border-b border-white/10 pb-2">Service Record</StyledText>
               <StyledView className="flex-row gap-4">
                  <StyledView className="flex-1 bg-white/5 p-4 border border-white/5">
                     <StyledText className="text-[10px] text-gray-500 uppercase tracking-widest">Experience</StyledText>
                     <StyledText className="text-lg text-white font-mono">{user.experience}</StyledText>
                  </StyledView>
                  <StyledView className="flex-1 bg-white/5 p-4 border border-white/5">
                     <StyledText className="text-[10px] text-gray-500 uppercase tracking-widest">Directive</StyledText>
                     <StyledText className="text-lg text-white font-mono">{user.goal}</StyledText>
                  </StyledView>
               </StyledView>
            </StyledView>
         )}
      </StyledScrollView>
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
      <StyledView className="pb-24 space-y-6 h-full flex-col">
         <ScreenHeader title="Mission Logs" subtitle="History & Analytics" />
         
         <StyledView className="mx-6 p-4 bg-white/5 border border-white/10 rounded-sm">
             <StyledText className="text-[10px] uppercase tracking-widest text-gray-500 mb-3 font-mono">Cycle Activity (14 Days)</StyledText>
             <CalendarGrid days={last14Days} />
         </StyledView>

         {logs.length === 0 ? (
            <StyledView className="flex-1 items-center justify-center space-y-4 opacity-50">
               <FileBadge className="w-16 h-16 text-gray-500" />
               <StyledText className="font-mono text-xs uppercase tracking-widest text-gray-500">No mission data recorded.</StyledText>
            </StyledView>
         ) : (
            <StyledScrollView className="flex-1 px-6">
               {logs.map(log => (
                  <StyledTouchableOpacity key={log.id} onPress={() => setSelectedLog(log)} className="bg-white/5 p-4 border border-white/10 mb-3">
                     <StyledView className="flex-row justify-between items-start mb-3">
                        <StyledView>
                           <StyledText className="text-[10px] text-gray-500 font-mono uppercase mb-1">{new Date(log.date).toLocaleDateString()} • {new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</StyledText>
                           <StyledText className="text-white font-bold font-mono uppercase">{log.routineName}</StyledText>
                        </StyledView>
                        <StatusBadge status={log.status} />
                     </StyledView>
                     <StyledView className="flex-row justify-between border-t border-white/5 pt-3">
                        <StyledView><StyledText className="text-[9px] text-gray-500 uppercase">Duration</StyledText><StyledText className="text-sm text-white font-mono">{log.duration} MIN</StyledText></StyledView>
                        <StyledView><StyledText className="text-[9px] text-gray-500 uppercase">Volume</StyledText><StyledText className="text-sm text-white font-mono">{(log.totalVolume / 1000).toFixed(1)}k KG</StyledText></StyledView>
                        <StyledView><StyledText className="text-[9px] text-gray-500 uppercase">XP</StyledText><StyledText className="text-sm text-primary font-mono">+{log.xpEarned}</StyledText></StyledView>
                     </StyledView>
                  </StyledTouchableOpacity>
               ))}
            </StyledScrollView>
         )}
         <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      </StyledView>
   );
};

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('LOGIN');
  const [themeColor, setThemeColor] = useState('#00ffff');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  
  useEffect(() => {
    // Theme color update for native if needed
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
       const checkLocal = async () => {
           try {
               const localUser = await AsyncStorage.getItem('solotrain_user');
               if (localUser) {
                  const u = JSON.parse(localUser);
                  setUser(u);
                  const localRoutines = await AsyncStorage.getItem('solotrain_routines');
                  if (localRoutines) setRoutines(JSON.parse(localRoutines));
                  const localLogs = await AsyncStorage.getItem('solotrain_logs');
                  if (localLogs) setWorkoutHistory(JSON.parse(localLogs));
                  
                  setSession({ user: { id: 'local_user' } }); 
                  setView(u.onboardingComplete ? 'DASHBOARD' : 'SETUP');
               }
           } catch (e) {
               console.error("Local storage error", e);
           } finally {
               setLoading(false);
           }
       };
       checkLocal();
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
    try {
      if (isSupabaseConfigured()) {
         await signInWithGoogle();
         // Note: The actual navigation happens in the onAuthStateChange listener
      } else {
         // Simulate
         setTimeout(async () => {
           const u: UserProfile = { ...user };
           setUser(u);
           setSession({ user: { id: 'local_user' } });
           // If no local data found, go to setup
           const localUser = await AsyncStorage.getItem('solotrain_user');
           setView(localUser && JSON.parse(localUser).onboardingComplete ? 'DASHBOARD' : 'SETUP');
           setLoading(false);
         }, 1500);
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      Alert.alert("Login Failed", "Could not establish connection.");
    }
  };

  // --- PERSISTENCE HELPERS ---
  const saveUser = async (u: UserProfile) => {
     setUser(u);
     if (isSupabaseConfigured() && session) await upsertUserProfile(session.user.id, u);
     else await AsyncStorage.setItem('solotrain_user', JSON.stringify(u));
  };

  const saveRoutinesList = async (list: Routine[], updatedRoutine?: Routine) => {
     setRoutines(list);
     if (isSupabaseConfigured() && session && updatedRoutine) await saveRoutine(session.user.id, updatedRoutine);
     else await AsyncStorage.setItem('solotrain_routines', JSON.stringify(list));
  };
  
  const saveHistory = async (list: WorkoutLog[], newLog?: WorkoutLog) => {
     setWorkoutHistory(list);
     if (isSupabaseConfigured() && session && newLog) await saveLog(session.user.id, newLog);
     else await AsyncStorage.setItem('solotrain_logs', JSON.stringify(list));
  };

  const deleteRoutineOp = async (id: string) => {
     const newList = routines.filter(r => r.id !== id);
     setRoutines(newList);
     setView('DASHBOARD');
     if (isSupabaseConfigured()) await deleteRoutineFromDb(id);
     else await AsyncStorage.setItem('solotrain_routines', JSON.stringify(newList));
  };

  const handleFinishSetup = async (data: SetupData) => {
    const updatedUser = { ...user, name: data.codename, experience: data.experience, goal: data.goal, onboardingComplete: true };
    try {
        let generatedRoutines: Routine[] = [];
        
        // 1. Try AI Generation
        try {
           const prompt = `Create a comprehensive ${data.goal} workout routine for a ${data.experience} level athlete. Focus on ${data.goal === 'STRENGTH' ? 'compound movements' : data.goal === 'HYPERTROPHY' ? 'volume and isolation' : 'endurance and stamina'}.`;
           const aiResult = await generateAiRoutine(prompt);
           
           if (aiResult && aiResult.exercises) {
              // Hydrate AI exercises with images/metadata from API if possible
              const { data: apiExercises } = await fetchExercises([], [], [], [], '', 1, 100);
              
              const hydratedExercises: RoutineExercise[] = aiResult.exercises.map((aiEx: any) => {
                  // Try to find a match by name (fuzzy)
                  const match = apiExercises.find(apiEx => apiEx.name.toLowerCase().includes(aiEx.name.toLowerCase()) || aiEx.name.toLowerCase().includes(apiEx.name.toLowerCase()));
                  
                  return {
                      id: `gen_${Math.random()}`,
                      name: aiEx.name,
                      bodyPart: match?.bodyPart || aiEx.bodyPart || 'unknown',
                      equipment: match?.equipment || aiEx.equipment || 'unknown',
                      target: match?.target || 'unknown',
                      gifUrl: match?.gifUrl || '',
                      imageUrl: match?.imageUrl || '',
                      instructions: aiEx.instructions || match?.instructions || [],
                      targetSets: aiEx.targetSets || 3,
                      targetReps: aiEx.targetReps || '10',
                      targetWeight: aiEx.targetWeight || '20',
                      setLogs: []
                  };
              });

              generatedRoutines.push({
                  id: `ai_init_${Date.now()}`,
                  name: aiResult.name || `PROTOCOL ${data.goal}`,
                  description: aiResult.description || 'AI Generated Protocol',
                  isFavorite: true,
                  exercises: hydratedExercises
              });
           }
        } catch (err) {
            console.log("AI Generation failed, falling back to API", err);
        }

        // 2. Fallback if AI failed
        if (generatedRoutines.length === 0) {
            const { data: allExercises } = await fetchExercises([], [], [], [], '', 1, 100);
            const sample = allExercises.slice(0, 5);
            const toRoutineEx = (ex: Exercise, sets: number, reps: string, weight: string): RoutineExercise => ({ ...ex, id: `gen_${Math.random()}`, targetSets: sets, targetReps: reps, targetWeight: weight, setLogs: [] });
            
            if (sample.length > 0) {
                generatedRoutines.push({ 
                    id: `gen_1_${Date.now()}`, 
                    name: `PROTOCOL ${data.goal}`, 
                    description: 'Standard Issue Protocol.', 
                    isFavorite: true, 
                    exercises: sample.map(ex => toRoutineEx(ex, 3, '10', '20')) 
                });
            }
        }
        
        const newRoutines = [...routines, ...generatedRoutines];
        setRoutines(newRoutines);
        
        if (isSupabaseConfigured() && session) {
            for (const r of generatedRoutines) await saveRoutine(session.user.id, r);
            await upsertUserProfile(session.user.id, updatedUser);
        } else {
            await AsyncStorage.setItem('solotrain_routines', JSON.stringify(newRoutines));
            await AsyncStorage.setItem('solotrain_user', JSON.stringify(updatedUser));
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
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <StyledView className="flex-1 bg-black relative">
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
          <StyledView className="absolute bottom-6 left-0 right-0 items-center z-40">
            <StyledView className="flex-row bg-black/90 border border-white/10 rounded-2xl p-2 justify-between items-center w-[90%] max-w-sm shadow-lg">
              <StyledTouchableOpacity onPress={() => setView('DASHBOARD')} className={`p-3 rounded-xl ${view === 'DASHBOARD' || view === 'ROUTINE_DETAIL' ? 'bg-white/10' : ''}`}>
                 <StyledView className="relative">
                    <Layers className={`w-6 h-6 ${view === 'DASHBOARD' || view === 'ROUTINE_DETAIL' ? 'text-white' : 'text-gray-500'}`} />
                    {hasActiveMission && <StyledView className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />}
                 </StyledView>
              </StyledTouchableOpacity>
              
              <StyledTouchableOpacity onPress={() => setView('EXPLORE')} className={`p-3 rounded-xl ${view === 'EXPLORE' ? 'bg-white/10' : ''}`}>
                 <Database className={`w-6 h-6 ${view === 'EXPLORE' ? 'text-white' : 'text-gray-500'}`} />
              </StyledTouchableOpacity>
              
              <StyledTouchableOpacity 
                onPress={() => { if (activeSession) setView('WORKOUT'); }}
                disabled={!activeSession}
                className={`w-14 h-14 rounded-2xl items-center justify-center border-2 mx-2 ${activeSession ? 'bg-primary border-primary' : 'bg-white/5 border-white/10'}`}
              >
                  <Dumbbell className={`w-8 h-8 ${activeSession ? 'text-black' : 'text-gray-600'}`} />
              </StyledTouchableOpacity>
              
              <StyledTouchableOpacity onPress={() => setView('LOGS')} className={`p-3 rounded-xl ${view === 'LOGS' ? 'bg-white/10' : ''}`}>
                 <FileText className={`w-6 h-6 ${view === 'LOGS' ? 'text-white' : 'text-gray-500'}`} />
              </StyledTouchableOpacity>
              
              <StyledTouchableOpacity onPress={() => setView('PROFILE')} className={`p-3 rounded-xl ${view === 'PROFILE' ? 'bg-white/10' : ''}`}>
                 <User className={`w-6 h-6 ${view === 'PROFILE' ? 'text-white' : 'text-gray-500'}`} />
              </StyledTouchableOpacity>
            </StyledView>
          </StyledView>
        )}
      </StyledView>
    </SafeAreaView>
  );
};

export default App;
