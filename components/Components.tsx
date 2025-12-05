
import React, { ReactNode, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Modal, Pressable, ActivityIndicator } from 'react-native';
import { Search, X, Check, AlertTriangle, Ban, ChevronLeft, Calendar, Clock, BarChart3, Layers } from 'lucide-react-native';
import Svg, { Polygon, Line, Text as SvgText, Circle, Path, G, Defs, LinearGradient, Stop, Polyline } from 'react-native-svg';
import { WorkoutLog, RoutineExercise } from '../types';
// import { styled } from 'nativewind';
const styled = (Component: any) => Component;

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledTextInput = styled(TextInput);
const StyledPressable = styled(Pressable);
const StyledScrollView = styled(ScrollView);

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  children: ReactNode;
  className?: string;
  onPress?: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, onPress, disabled, ...props }) => {
  const baseStyles = "relative py-3 px-6 border flex-row items-center justify-center";
  
  const variants = {
    primary: "bg-primary/10 border-primary shadow-sm",
    secondary: "bg-transparent border-white/20",
    danger: "bg-red-500/10 border-red-500",
    ghost: "border-transparent",
    glass: "bg-white/5 border-white/10"
  };

  const textVariants = {
    primary: "text-primary",
    secondary: "text-white",
    danger: "text-red-500",
    ghost: "text-gray-400",
    glass: "text-white"
  };

  return (
    <StyledTouchableOpacity 
      onPress={onPress}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50' : ''} ${className}`} 
      {...props}
    >
      <StyledText className={`font-mono uppercase text-xs tracking-widest ${textVariants[variant]}`}>
        {children}
      </StyledText>
      {/* Decorative corner markers for tactical look */}
      {variant === 'primary' && (
        <>
          <StyledView className="absolute top-0 left-0 w-1 h-1 bg-primary" />
          <StyledView className="absolute bottom-0 right-0 w-1 h-1 bg-primary" />
        </>
      )}
    </StyledTouchableOpacity>
  );
};

export const Card: React.FC<{ children: ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <StyledPressable onPress={onClick} className={`p-6 border-l-2 border-l-transparent active:border-l-primary bg-white/5 ${className}`}>
    {children}
  </StyledPressable>
);

export const Input: React.FC<any> = (props) => (
  <StyledTextInput
    {...props}
    placeholderTextColor="#666"
    className={`w-full bg-surfaceHighlight border-b border-white/20 px-4 py-3 text-sm font-light text-white ${props.className}`}
  />
);

export const Select: React.FC<any> = (props) => (
  <StyledView className="relative">
    {/* React Native doesn't have a direct Select equivalent, using View for now. 
        Ideally use a Picker or Modal based selector */}
    <StyledText className="text-white">Select Component Placeholder</StyledText>
  </StyledView>
);

export const Badge: React.FC<{ children: ReactNode; variant?: 'default' | 'primary' | 'outline' }> = ({ children, variant = 'default' }) => {
  const styles = {
    default: 'border-white/10 bg-white/5',
    primary: 'border-primary/50 bg-primary/10',
    outline: 'border-white/20 bg-transparent'
  };

  const textStyles = {
    default: 'text-gray-300',
    primary: 'text-primary',
    outline: 'text-gray-400'
  };
  
  return (
    <StyledView className={`px-2 py-0.5 border ${styles[variant]}`}>
      <StyledText className={`text-[10px] uppercase tracking-wider ${textStyles[variant]}`}>
        {children}
      </StyledText>
    </StyledView>
  );
};

export const StatusBadge: React.FC<{ status: 'COMPLETED' | 'INCOMPLETE' | 'ABORTED' }> = ({ status }) => {
  const styles = {
    COMPLETED: { color: 'text-primary', border: 'border-primary', icon: Check, bg: 'bg-primary/10' },
    INCOMPLETE: { color: 'text-yellow-500', border: 'border-yellow-500', icon: AlertTriangle, bg: 'bg-yellow-500/10' },
    ABORTED: { color: 'text-red-500', border: 'border-red-500', icon: Ban, bg: 'bg-red-500/10' }
  };

  const config = styles[status];
  const Icon = config.icon;

  return (
    <StyledView className={`flex-row items-center gap-2 px-2 py-1 rounded border ${config.border} ${config.bg}`}>
      <Icon size={12} color={status === 'COMPLETED' ? '#00ffff' : status === 'INCOMPLETE' ? '#eab308' : '#ef4444'} />
      <StyledText className={`text-[9px] uppercase font-bold tracking-wider ${config.color}`}>{status}</StyledText>
    </StyledView>
  );
};

export const ProgressBar: React.FC<{ progress: number; className?: string }> = ({ progress, className = '' }) => (
  <StyledView className={`w-full h-1 bg-gray-800 relative overflow-hidden ${className}`}>
    <StyledView 
      className="h-full bg-primary" 
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </StyledView>
);

// Standardized Header Component
export const ScreenHeader: React.FC<{ 
  title: string; 
  subtitle?: string; 
  rightAction?: ReactNode;
  onBack?: () => void;
  className?: string;
}> = ({ title, subtitle, rightAction, onBack, className = '' }) => (
  <StyledView className={`flex-row items-end justify-between border-b border-white/10 pb-4 mb-6 px-6 pt-4 bg-black/40 ${className}`}>
    <StyledView className="flex-row items-center gap-4">
      {onBack && (
        <StyledTouchableOpacity onPress={onBack} className="p-2 -ml-2 bg-white/5 border border-white/10 rounded-sm mr-2">
          <ChevronLeft className="w-5 h-5 text-primary" />
        </StyledTouchableOpacity>
      )}
      <StyledView>
        <StyledView className="flex-row items-center gap-2">
           <StyledView className="w-1 h-4 bg-primary" />
           <StyledText className="text-2xl font-black text-white uppercase tracking-tighter leading-none font-mono">{title}</StyledText>
        </StyledView>
        {subtitle && <StyledText className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-mono mt-1 ml-3">{subtitle}</StyledText>}
      </StyledView>
    </StyledView>
    {rightAction && <StyledView className="mb-1">{rightAction}</StyledView>}
  </StyledView>
);

// Simple SVG Line Chart
export const SimpleChart: React.FC<{ data: number[]; labels: string[]; color?: string }> = ({ data, labels, color = '#00ffff' }) => {
  const height = 100;
  const width = 300;
  const max = Math.max(...data, 1) * 1.1; // Add padding
  const min = Math.min(...data) * 0.9;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <StyledView className="w-full overflow-hidden relative">
      <Svg viewBox={`0 0 ${width} ${height + 20}`} width="100%" height={height + 20}>
        {/* Grid lines */}
        <Line x1="0" y1="0" x2={width} y2="0" stroke="#333" strokeDasharray="4" strokeOpacity="0.5" />
        <Line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#333" strokeDasharray="4" strokeOpacity="0.5" />
        <Line x1="0" y1={height} x2={width} y2={height} stroke="#333" strokeDasharray="4" strokeOpacity="0.5" />
        
        {/* Fill Area Gradient */}
        <Defs>
          <LinearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#grad-${color})`} />

        {/* The Line */}
        <Polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        
        {/* Points */}
        {data.map((val, i) => {
           const x = (i / (data.length - 1)) * width;
           const y = height - ((val - min) / (max - min)) * height;
           return (
             <Circle key={i} cx={x} cy={y} r="3" fill="#000" stroke={color} strokeWidth="2" />
           );
        })}

        {/* Labels */}
        {labels.map((lbl, i) => {
           const x = (i / (labels.length - 1)) * width;
           return (
             <SvgText key={i} x={x} y={height + 15} fontSize="8" fill="#666" textAnchor="middle" fontFamily="monospace">{lbl}</SvgText>
           )
        })}
      </Svg>
    </StyledView>
  );
};

// Radar Chart for "PES" Style stats
export const RadarChart: React.FC<{ 
  data: { label: string; value: number; fullMark: number }[]; 
  size?: number; 
  color?: string; 
}> = ({ data, size = 200, color = '#00ffff' }) => {
  const center = size / 2;
  const radius = (size / 2) - 30; // Padding
  const angleSlice = (Math.PI * 2) / data.length;

  // Helper to calculate coordinates
  const getCoordinates = (value: number, index: number, max: number) => {
    const angle = index * angleSlice - Math.PI / 2;
    const r = (value / max) * radius;
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r
    };
  };

  const polyPoints = data.map((d, i) => {
    const coords = getCoordinates(d.value, i, d.fullMark);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <StyledView className="items-center justify-center py-4">
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Grid */}
        {gridLevels.map((level, i) => {
          const points = data.map((d, j) => {
            const coords = getCoordinates(d.fullMark * level, j, d.fullMark);
            return `${coords.x},${coords.y}`;
          }).join(' ');
          return (
            <Polygon 
              key={i} 
              points={points} 
              fill="none" 
              stroke="#333" 
              strokeWidth="1" 
              strokeDasharray={level === 1 ? "0" : "4"}
            />
          );
        })}

        {/* Axis Lines */}
        {data.map((d, i) => {
          const coords = getCoordinates(d.fullMark, i, d.fullMark);
          return (
            <Line 
              key={i} 
              x1={center} 
              y1={center} 
              x2={coords.x} 
              y2={coords.y} 
              stroke="#333" 
              strokeWidth="1" 
            />
          );
        })}

        {/* Data Area */}
        <Polygon 
          points={polyPoints} 
          fill={color} 
          fillOpacity="0.2" 
          stroke={color} 
          strokeWidth="2" 
        />

        {/* Labels */}
        {data.map((d, i) => {
          const angle = i * angleSlice - Math.PI / 2;
          const labelRadius = radius + 20;
          const x = center + Math.cos(angle) * labelRadius;
          const y = center + Math.sin(angle) * labelRadius;
          return (
            <SvgText 
              key={i} 
              x={x} 
              y={y} 
              textAnchor="middle" 
              alignmentBaseline="middle" 
              fill="#888" 
              fontSize="10" 
              fontFamily="monospace"
            >
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
    </StyledView>
  );
};

export const CalendarGrid: React.FC<{ days: { day: string; active: boolean }[] }> = ({ days }) => (
  <StyledView className="flex-row flex-wrap gap-2 justify-between">
    {days.map((d, i) => (
      <StyledView key={i} className="items-center gap-1">
        <StyledView className={`w-8 h-8 rounded-full items-center justify-center border ${d.active ? 'bg-primary border-primary' : 'border-white/10'}`}>
          <StyledText className={`text-xs ${d.active ? 'text-black font-bold' : 'text-gray-500'}`}>{d.day}</StyledText>
        </StyledView>
        {d.active && <StyledView className="w-1 h-1 bg-primary rounded-full" />}
      </StyledView>
    ))}
  </StyledView>
);

export const FilterGroup: React.FC<{ 
  options: string[]; 
  selected: string[]; 
  onChange: (selected: string[]) => void 
}> = ({ options, selected, onChange }) => {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <StyledView className="flex-row flex-wrap gap-2">
      {options.map(opt => {
        const isActive = selected.includes(opt);
        return (
          <StyledTouchableOpacity
            key={opt}
            onPress={() => toggle(opt)}
            className={`
              px-4 py-1.5 border
              ${isActive 
                ? 'bg-primary/20 border-primary' 
                : 'bg-white/5 border-white/10'
              }
            `}
          >
            <StyledText className={`text-[10px] uppercase tracking-wider font-mono ${isActive ? 'text-primary' : 'text-gray-500'}`}>
              {opt}
            </StyledText>
          </StyledTouchableOpacity>
        )
      })}
    </StyledView>
  );
};

// Interactive Muscle Map Component
const MuscleMap: React.FC<{ 
  selected: string[]; 
  onToggle: (muscle: string) => void;
}> = ({ selected, onToggle }) => {
  // Helper to check if any of the target aliases are selected
  const isSelected = (aliases: string[]) => aliases.some(a => selected.includes(a));

  const muscleGroups = [
    { id: 'chest', label: 'CHEST', path: "M 85 55 L 115 55 L 110 80 L 90 80 Z", aliases: ['chest'] },
    { id: 'shoulders', label: 'DELTS', path: "M 70 55 L 85 55 L 90 75 L 65 65 Z M 130 55 L 115 55 L 110 75 L 135 65 Z", aliases: ['shoulders'] },
    { id: 'arms', label: 'ARMS', path: "M 65 65 L 90 75 L 85 110 L 55 100 Z M 135 65 L 110 75 L 115 110 L 145 100 Z", aliases: ['upper arms', 'lower arms'] },
    { id: 'abs', label: 'CORE', path: "M 90 80 L 110 80 L 105 110 L 95 110 Z", aliases: ['waist', 'abs'] },
    { id: 'legs', label: 'LEGS', path: "M 95 110 L 105 110 L 120 160 L 110 190 L 100 160 Z M 95 110 L 85 110 L 80 160 L 90 190 L 100 160 Z", aliases: ['upper legs', 'lower legs'] },
    { id: 'back', label: 'BACK', path: "M 160 55 L 240 55 L 230 100 L 170 100 Z", aliases: ['back', 'lats', 'traps'], isBackView: true } // Simplified Back representation next to it
  ];

  const handleZoneClick = (group: typeof muscleGroups[0]) => {
     // For simplicity, just toggle the first alias, or special logic
     // If mapped to multiple, we might toggle the primary one (e.g. 'upper arms')
     onToggle(group.aliases[0]);
  };

  return (
    <StyledView className="w-full items-center justify-center py-4 bg-black/20 rounded border border-white/5 mb-4">
       <Svg viewBox="0 0 250 200" width={250} height={200}>
          {/* Front Body Silhouette Outline */}
          <Path d="M 100 20 A 15 15 0 0 1 100 50 A 5 5 0 0 0 100 55 L 130 55 L 145 100 L 120 190 L 80 190 L 55 100 L 70 55 L 100 55" 
                fill="none" stroke="#333" strokeWidth="1" strokeDasharray="4 2" />

          {/* Render Groups */}
          {muscleGroups.map(group => {
             const active = isSelected(group.aliases);
             return (
               <G key={group.id} onPress={() => handleZoneClick(group)}>
                  <Path 
                    d={group.path} 
                    fill={active ? '#00ffff' : 'rgba(255,255,255,0.05)'} 
                    stroke={active ? '#00ffff' : 'rgba(255,255,255,0.3)'}
                    strokeWidth="1"
                  />
                  {/* Label on Hover or Active */}
                  {(active) && !group.isBackView && (
                     <SvgText x="30" y="30" fill="#00ffff" fontSize="8" fontFamily="monospace" className="uppercase">
                        Target: {group.label}
                     </SvgText>
                  )}
                  {group.isBackView && (
                      <SvgText x="200" y="45" fill="#666" fontSize="8" fontFamily="monospace" textAnchor="middle">POSTERIOR</SvgText>
                  )}
               </G>
             )
          })}
          
          {/* Decorative Head */}
          <Circle cx="100" cy="35" r="12" fill="none" stroke="#444" strokeWidth="1" />
          <Circle cx="200" cy="35" r="12" fill="none" stroke="#444" strokeWidth="1" />
       </Svg>
    </StyledView>
  );
};

export const FilterModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  sections: { title: string; options: string[] }[];
  selectedFilters: string[];
  onToggleFilter: (filter: string) => void;
}> = ({ isOpen, onClose, sections, selectedFilters, onToggleFilter }) => {
  const [filterSearch, setFilterSearch] = useState('');

  return (
    <Modal visible={isOpen} animationType="slide" transparent={true} onRequestClose={onClose}>
      <StyledView className="flex-1 bg-black/95">
         {/* Header */}
         <StyledView className="flex-row items-center justify-between p-6 border-b border-white/10 mt-10">
           <StyledView>
             <StyledText className="text-xl text-white tracking-widest font-light">FILTER // CONFIG</StyledText>
             <StyledText className="text-[10px] text-primary uppercase">Select Parameters</StyledText>
           </StyledView>
           <StyledTouchableOpacity onPress={onClose} className="p-2 border border-white/10 rounded-full">
              <X className="w-5 h-5 text-white" />
           </StyledTouchableOpacity>
         </StyledView>

         {/* Search in filters */}
         <StyledView className="p-6 pb-2">
            <StyledView className="relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500 z-10" />
              <StyledTextInput 
                placeholder="Search parameters..." 
                placeholderTextColor="#666"
                className="pl-10 bg-white/5 border border-transparent text-white h-10 rounded"
                value={filterSearch}
                onChangeText={setFilterSearch}
              />
            </StyledView>
         </StyledView>

         {/* Content */}
         <StyledScrollView className="flex-1 p-6">
            
            {/* VISUAL MUSCLE FILTER */}
            <StyledView className="mb-8">
               <StyledText className="text-xs text-gray-500 uppercase tracking-widest mb-4 border-l-2 border-primary pl-2">Visual Targeting</StyledText>
               <MuscleMap selected={selectedFilters} onToggle={onToggleFilter} />
            </StyledView>

            {sections.map((section) => {
               // Safe check for string to avoid toLowerCase crash
               const filteredOptions = section.options.filter(opt => String(opt).toLowerCase().includes(filterSearch.toLowerCase()));
               if (filteredOptions.length === 0) return null;

               return (
                 <StyledView key={section.title} className="mb-6">
                   <StyledText className="text-xs text-gray-500 uppercase tracking-widest mb-4 border-l-2 border-primary pl-2">{section.title}</StyledText>
                   <StyledView className="flex-row flex-wrap gap-2">
                     {filteredOptions.map(opt => {
                       const isActive = selectedFilters.includes(opt);
                       return (
                         <StyledTouchableOpacity
                            key={opt}
                            onPress={() => onToggleFilter(opt)}
                            className={`
                              px-4 py-2 border
                              ${isActive 
                                ? 'bg-primary border-primary' 
                                : 'bg-white/5 border-white/10'
                              }
                            `}
                         >
                           <StyledText className={`text-xs uppercase tracking-wide font-mono ${isActive ? 'text-black font-bold' : 'text-gray-400'}`}>
                             {opt}
                           </StyledText>
                         </StyledTouchableOpacity>
                       )
                     })}
                   </StyledView>
                 </StyledView>
               )
            })}
         </StyledScrollView>

         {/* Footer */}
         <StyledView className="p-6 border-t border-white/10 bg-black/40 mb-6">
           <Button onPress={onClose} className="w-full">
              Apply Filters ({selectedFilters.length})
           </Button>
         </StyledView>
      </StyledView>
    </Modal>
  );
};

// Modal for viewing detailed log of a completed mission
export const LogDetailModal: React.FC<{ log: WorkoutLog | null; onClose: () => void }> = ({ log, onClose }) => {
   if (!log) return null;

   return (
     <Modal visible={!!log} animationType="fade" transparent={true} onRequestClose={onClose}>
       <StyledView className="flex-1 bg-black/90 justify-center items-center p-4">
         <StyledView className="w-full max-w-lg bg-black border border-white/10 flex-col max-h-[80%] shadow-lg">
           
           <StyledView className="bg-white/5 border-b border-white/10 p-6 flex-row justify-between items-start">
              <StyledView>
                 <StyledText className="text-xl font-mono text-white uppercase tracking-wide mb-1">{log.routineName}</StyledText>
                 <StyledView className="flex-row items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <StyledText className="text-[10px] text-gray-400 font-mono uppercase">{new Date(log.date).toLocaleDateString()}</StyledText>
                    <Clock className="w-3 h-3 ml-2 text-gray-400" />
                    <StyledText className="text-[10px] text-gray-400 font-mono uppercase">{log.duration} MIN</StyledText>
                 </StyledView>
              </StyledView>
              <StyledTouchableOpacity onPress={onClose} className="p-2 bg-black/50 rounded-full"><X className="w-4 h-4 text-white" /></StyledTouchableOpacity>
           </StyledView>

           <StyledScrollView className="p-6">
              <StyledView className="flex-row justify-between gap-4 mb-6">
                  <StyledView className="flex-1 p-3 border border-white/10 items-center bg-white/5">
                     <StyledText className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">XP</StyledText>
                     <StyledText className="text-xl text-primary font-mono font-bold">+{log.xpEarned}</StyledText>
                  </StyledView>
                  <StyledView className="flex-1 p-3 border border-white/10 items-center bg-white/5">
                     <StyledText className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Volume</StyledText>
                     <StyledText className="text-xl text-white font-mono font-bold">{(log.totalVolume/1000).toFixed(1)}k</StyledText>
                  </StyledView>
                  <StyledView className="flex-1 p-3 border border-white/10 items-center bg-white/5">
                     <StyledText className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Status</StyledText>
                     <StatusBadge status={log.status} />
                  </StyledView>
              </StyledView>

              <StyledView className="mb-6">
                 <StyledText className="text-xs text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2 mb-4">Mission Log</StyledText>
                 {log.exercises.map((ex, i) => {
                    const completedCount = ex.setLogs.filter(s => s.completed).length;
                    return (
                       <StyledView key={i} className="bg-white/5 border border-white/5 p-3 mb-2">
                          <StyledView className="flex-row justify-between items-center mb-2">
                             <StyledText className="text-sm font-mono text-white uppercase font-bold">{ex.name}</StyledText>
                             <StyledText className="text-[10px] font-mono text-gray-400">{completedCount}/{ex.targetSets} SETS</StyledText>
                          </StyledView>
                          <StyledView>
                             {ex.setLogs.map((set, j) => (
                                <StyledView key={j} className="flex-row justify-between items-center px-2 py-1 bg-black/20 rounded-sm mb-1">
                                   <StyledText className="text-xs font-mono text-gray-500">SET {j+1}</StyledText>
                                   <StyledText className="text-xs font-mono text-gray-300">{set.weight}kg x {set.reps}</StyledText>
                                   {set.completed ? <Check className="w-3 h-3 text-primary" /> : <StyledView className="w-3 h-3 bg-gray-700/50 rounded-full" />}
                                </StyledView>
                             ))}
                          </StyledView>
                       </StyledView>
                    )
                 })}
              </StyledView>
           </StyledScrollView>

           <StyledView className="p-4 border-t border-white/10">
              <Button onPress={onClose} className="w-full">Close Log</Button>
           </StyledView>
         </StyledView>
       </StyledView>
     </Modal>
   );
};
