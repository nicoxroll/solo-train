
import React, { ReactNode, useState } from 'react';
import { Search, X, Check, AlertTriangle, Ban, ChevronLeft, Calendar, Clock, BarChart3, Layers } from 'lucide-react';
import { WorkoutLog, RoutineExercise } from '../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', children, ...props }) => {
  const baseStyles = "relative font-mono uppercase text-xs tracking-[0.15em] py-3 px-6 transition-all duration-300 border backdrop-blur-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";
  
  const variants = {
    primary: "bg-primary/10 border-primary text-primary hover:bg-primary hover:text-black shadow-[0_0_15px_rgba(0,255,255,0.2)]",
    secondary: "bg-transparent border-white/20 text-white hover:border-white hover:bg-white/5",
    danger: "bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500 hover:text-white",
    ghost: "border-transparent text-gray-400 hover:text-white",
    glass: "bg-white/5 border-white/10 text-white hover:bg-white/10 backdrop-blur-md"
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
      {/* Decorative corner markers for tactical look */}
      {variant === 'primary' && (
        <>
          <span className="absolute top-0 left-0 w-1 h-1 bg-primary"></span>
          <span className="absolute bottom-0 right-0 w-1 h-1 bg-primary"></span>
        </>
      )}
    </button>
  );
};

export const Card: React.FC<{ children: ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`glass-panel p-6 border-l-2 border-l-transparent hover:border-l-primary transition-colors duration-300 ${className}`}>
    {children}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full bg-surfaceHighlight border-b border-white/20 px-4 py-3 text-sm font-light text-white focus:outline-none focus:border-primary focus:bg-white/5 transition-all placeholder-gray-600 ${props.className}`}
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <div className="relative">
    <select
      {...props}
      className={`w-full appearance-none bg-surfaceHighlight border-b border-white/20 px-4 py-3 text-sm font-light text-white focus:outline-none focus:border-primary focus:bg-white/5 transition-all placeholder-gray-600 ${props.className}`}
    >
      {props.children}
    </select>
    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>
);

export const Badge: React.FC<{ children: ReactNode; variant?: 'default' | 'primary' | 'outline' }> = ({ children, variant = 'default' }) => {
  const styles = {
    default: 'border-white/10 text-gray-300 bg-white/5',
    primary: 'border-primary/50 text-primary bg-primary/10',
    outline: 'border-white/20 text-gray-400 bg-transparent'
  };
  
  return (
    <span className={`inline-block px-2 py-0.5 border text-[10px] uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
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
    <div className={`flex items-center gap-2 px-2 py-1 rounded border ${config.border} ${config.bg} ${config.color}`}>
      <Icon className="w-3 h-3" />
      <span className="text-[9px] uppercase font-bold tracking-wider">{status}</span>
    </div>
  );
};

export const ProgressBar: React.FC<{ progress: number; className?: string }> = ({ progress, className = '' }) => (
  <div className={`w-full h-1 bg-gray-800 relative overflow-hidden ${className}`}>
    <div 
      className="h-full bg-primary shadow-[0_0_10px_#00ffff] transition-all duration-500 ease-out" 
      style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
    />
  </div>
);

// Standardized Header Component
export const ScreenHeader: React.FC<{ 
  title: string; 
  subtitle?: string; 
  rightAction?: ReactNode;
  onBack?: () => void;
  className?: string;
}> = ({ title, subtitle, rightAction, onBack, className = '' }) => (
  <header className={`flex items-end justify-between border-b border-white/10 pb-4 mb-6 ${className}`}>
    <div className="flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors p-1 -ml-1">
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      <div>
        <h2 className="text-3xl font-light text-white uppercase tracking-tight leading-none">{title}</h2>
        {subtitle && <p className="text-[10px] text-primary uppercase tracking-[0.2em] font-mono mt-1">{subtitle}</p>}
      </div>
    </div>
    {rightAction && <div className="mb-1">{rightAction}</div>}
  </header>
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
    <div className="w-full overflow-hidden relative">
      <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full h-auto overflow-visible">
        {/* Grid lines */}
        <line x1="0" y1="0" x2={width} y2="0" stroke="#333" strokeDasharray="4" strokeOpacity="0.5" />
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#333" strokeDasharray="4" strokeOpacity="0.5" />
        <line x1="0" y1={height} x2={width} y2={height} stroke="#333" strokeDasharray="4" strokeOpacity="0.5" />
        
        {/* Fill Area Gradient */}
        <defs>
          <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${height} ${points} ${width},${height}`} fill={`url(#grad-${color})`} />

        {/* The Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          className="drop-shadow-[0_0_4px_rgba(0,255,255,0.5)]"
        />
        
        {/* Points */}
        {data.map((val, i) => {
           const x = (i / (data.length - 1)) * width;
           const y = height - ((val - min) / (max - min)) * height;
           return (
             <circle key={i} cx={x} cy={y} r="3" fill="#000" stroke={color} strokeWidth="2" />
           );
        })}

        {/* Labels */}
        {labels.map((lbl, i) => {
           const x = (i / (labels.length - 1)) * width;
           return (
             <text key={i} x={x} y={height + 15} fontSize="8" fill="#666" textAnchor="middle" fontFamily="monospace">{lbl}</text>
           )
        })}
      </svg>
    </div>
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
    <div className="flex justify-center items-center py-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background Grid */}
        {gridLevels.map((level, i) => {
          const points = data.map((d, j) => {
            const coords = getCoordinates(d.fullMark * level, j, d.fullMark);
            return `${coords.x},${coords.y}`;
          }).join(' ');
          return (
            <polygon 
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
            <line 
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
        <polygon 
          points={polyPoints} 
          fill={color} 
          fillOpacity="0.2" 
          stroke={color} 
          strokeWidth="2" 
          className="drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]"
        />

        {/* Labels */}
        {data.map((d, i) => {
          const angle = i * angleSlice - Math.PI / 2;
          const labelRadius = radius + 20;
          const x = center + Math.cos(angle) * labelRadius;
          const y = center + Math.sin(angle) * labelRadius;
          return (
            <text 
              key={i} 
              x={x} 
              y={y} 
              textAnchor="middle" 
              dominantBaseline="middle" 
              fill="#888" 
              fontSize="10" 
              fontFamily="monospace"
              className="uppercase"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export const CalendarGrid: React.FC<{ days: { day: string; active: boolean }[] }> = ({ days }) => (
  <div className="grid grid-cols-7 gap-2">
    {days.map((d, i) => (
      <div key={i} className="flex flex-col items-center gap-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${d.active ? 'bg-primary text-black border-primary font-bold shadow-[0_0_10px_rgba(0,255,255,0.4)]' : 'border-white/10 text-gray-500'}`}>
          {d.day}
        </div>
        {d.active && <div className="w-1 h-1 bg-primary rounded-full"></div>}
      </div>
    ))}
  </div>
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
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isActive = selected.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className={`
              relative px-4 py-1.5 text-[10px] uppercase tracking-wider font-mono border transition-all duration-300
              ${isActive 
                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_8px_rgba(0,255,255,0.2)]' 
                : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-300'
              }
              clip-path-angled
            `}
            style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
          >
            {opt}
          </button>
        )
      })}
    </div>
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
    <div className="w-full flex justify-center py-4 bg-black/20 rounded border border-white/5 mb-4">
       <svg viewBox="0 0 250 200" className="w-64 h-48 drop-shadow-lg">
          {/* Front Body Silhouette Outline */}
          <path d="M 100 20 A 15 15 0 0 1 100 50 A 5 5 0 0 0 100 55 L 130 55 L 145 100 L 120 190 L 80 190 L 55 100 L 70 55 L 100 55" 
                fill="none" stroke="#333" strokeWidth="1" strokeDasharray="4 2" />

          {/* Render Groups */}
          {muscleGroups.map(group => {
             const active = isSelected(group.aliases);
             return (
               <g key={group.id} onClick={() => handleZoneClick(group)} className="cursor-pointer group">
                  <path 
                    d={group.path} 
                    fill={active ? '#00ffff' : 'rgba(255,255,255,0.05)'} 
                    stroke={active ? '#00ffff' : 'rgba(255,255,255,0.3)'}
                    strokeWidth="1"
                    className="transition-all duration-300 hover:fill-primary/40"
                  />
                  {/* Label on Hover or Active */}
                  {(active) && !group.isBackView && (
                     <text x="30" y="30" fill="#00ffff" fontSize="8" fontFamily="monospace" className="uppercase animate-pulse">
                        Target: {group.label}
                     </text>
                  )}
                  {group.isBackView && (
                      <text x="200" y="45" fill="#666" fontSize="8" fontFamily="monospace" textAnchor="middle">POSTERIOR</text>
                  )}
               </g>
             )
          })}
          
          {/* Decorative Head */}
          <circle cx="100" cy="35" r="12" fill="none" stroke="#444" strokeWidth="1" />
          <circle cx="200" cy="35" r="12" fill="none" stroke="#444" strokeWidth="1" />
       </svg>
    </div>
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl animate-fade-in">
       {/* Header */}
       <div className="flex items-center justify-between p-6 border-b border-white/10">
         <div>
           <h2 className="text-xl font-light text-white tracking-widest">FILTER // CONFIG</h2>
           <p className="text-[10px] text-primary uppercase">Select Parameters</p>
         </div>
         <button onClick={onClose} className="p-2 border border-white/10 hover:border-white/50 text-white rounded-full transition-colors">
            <X className="w-5 h-5" />
         </button>
       </div>

       {/* Search in filters */}
       <div className="p-6 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Search parameters..." 
              className="pl-10 !bg-white/5 border-transparent focus:border-primary"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
            />
          </div>
       </div>

       {/* Content */}
       <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* VISUAL MUSCLE FILTER */}
          <div className="mb-8">
             <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4 border-l-2 border-primary pl-2">Visual Targeting</h3>
             <MuscleMap selected={selectedFilters} onToggle={onToggleFilter} />
          </div>

          {sections.map((section) => {
             // Safe check for string to avoid toLowerCase crash
             const filteredOptions = section.options.filter(opt => String(opt).toLowerCase().includes(filterSearch.toLowerCase()));
             if (filteredOptions.length === 0) return null;

             return (
               <div key={section.title}>
                 <h3 className="text-xs text-gray-500 uppercase tracking-widest mb-4 border-l-2 border-primary pl-2">{section.title}</h3>
                 <div className="flex flex-wrap gap-2">
                   {filteredOptions.map(opt => {
                     const isActive = selectedFilters.includes(opt);
                     return (
                       <button
                          key={opt}
                          onClick={() => onToggleFilter(opt)}
                          className={`
                            px-4 py-2 text-xs uppercase tracking-wide font-mono border transition-all duration-300
                            ${isActive 
                              ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,255,255,0.4)]' 
                              : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-white'
                            }
                          `}
                          style={{ clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)' }}
                       >
                         {opt}
                       </button>
                     )
                   })}
                 </div>
               </div>
             )
          })}
       </div>

       {/* Footer */}
       <div className="p-6 border-t border-white/10 bg-black/40">
         <Button onClick={onClose} className="w-full">
            Apply Filters ({selectedFilters.length})
         </Button>
       </div>
    </div>
  );
};

// Modal for viewing detailed log of a completed mission
export const LogDetailModal: React.FC<{ log: WorkoutLog | null; onClose: () => void }> = ({ log, onClose }) => {
   if (!log) return null;

   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm" onClick={onClose}>
       <div className="w-full max-w-lg bg-surface border border-white/10 relative overflow-hidden flex flex-col max-h-[80vh] shadow-[0_0_50px_rgba(0,0,0,0.8)]" onClick={e => e.stopPropagation()}>
         
         <div className="bg-white/5 border-b border-white/10 p-6 flex justify-between items-start">
            <div>
               <h2 className="text-xl font-mono text-white uppercase tracking-wide mb-1">{log.routineName}</h2>
               <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono uppercase">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(log.date).toLocaleDateString()}</span>
                  <Clock className="w-3 h-3 ml-2" />
                  <span>{log.duration} MIN</span>
               </div>
            </div>
            <button onClick={onClose} className="p-2 bg-black/50 hover:text-primary rounded-full transition-colors"><X className="w-4 h-4" /></button>
         </div>

         <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <div className="glass-panel p-3 border border-white/10 text-center">
                   <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">XP</div>
                   <div className="text-xl text-primary font-mono font-bold">+{log.xpEarned}</div>
                </div>
                <div className="glass-panel p-3 border border-white/10 text-center">
                   <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Volume</div>
                   <div className="text-xl text-white font-mono font-bold">{(log.totalVolume/1000).toFixed(1)}k</div>
                </div>
                <div className="glass-panel p-3 border border-white/10 text-center">
                   <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Status</div>
                   <div className="flex justify-center"><StatusBadge status={log.status} /></div>
                </div>
            </div>

            <div className="space-y-4">
               <h3 className="text-xs text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">Mission Log</h3>
               {log.exercises.map((ex, i) => {
                  const completedCount = ex.setLogs.filter(s => s.completed).length;
                  return (
                     <div key={i} className="bg-white/5 border border-white/5 p-3 space-y-2">
                        <div className="flex justify-between items-center">
                           <span className="text-sm font-mono text-white uppercase font-bold">{ex.name}</span>
                           <span className="text-[10px] font-mono text-gray-400">{completedCount}/{ex.targetSets} SETS</span>
                        </div>
                        <div className="space-y-1">
                           {ex.setLogs.map((set, j) => (
                              <div key={j} className="flex justify-between items-center text-xs font-mono px-2 py-1 bg-black/20 rounded-sm">
                                 <span className="text-gray-500">SET {j+1}</span>
                                 <span className="text-gray-300">{set.weight}kg x {set.reps}</span>
                                 {set.completed ? <Check className="w-3 h-3 text-primary" /> : <span className="w-3 h-3 block bg-gray-700/50 rounded-full"></span>}
                              </div>
                           ))}
                        </div>
                     </div>
                  )
               })}
            </div>
         </div>

         <div className="p-4 bg-surfaceHighlight border-t border-white/10">
            <Button onClick={onClose} className="w-full">Close Log</Button>
         </div>
       </div>
     </div>
   );
};
