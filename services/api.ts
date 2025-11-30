
import { Exercise } from '../types';

// RapidAPI Endpoint (More reliable for client-side)
const BASE_URL = 'https://exercisedb-api-v1-dataset1.p.rapidapi.com/api/v1';
const RAPID_API_KEY = 'c62bc9da85msh16633958acc03d8p164897jsnfb75294b4aa1';
const RAPID_API_HOST = 'exercisedb-api-v1-dataset1.p.rapidapi.com';

// Interface matching the V1 API response structure
interface ApiExercise {
  exerciseId: string;
  name: string;
  imageUrl?: string; // New field from new API
  gifUrl?: string;   // Old field
  targetMuscles: (string | { name: string })[]; // Can be string or object
  bodyParts: (string | { name: string })[];
  equipments: (string | { name: string })[];
  secondaryMuscles: (string | { name: string })[];
  instructions?: string[]; 
  difficulty?: string;
  exerciseTypes?: (string | { name: string })[];
}

// Helper to safely extract name from string or object
const safeName = (item: string | { name: string } | undefined): string => {
  if (!item) return 'unknown';
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item.name) return item.name;
  return 'unknown';
};

// Expanded Fallback Data for when API hits 429 (Rate Limit)
const FALLBACK_EXERCISES: Exercise[] = [
  {
    id: "EIeI8Vf",
    name: "barbell bench press",
    bodyPart: "chest", 
    muscle: "chest",
    equipment: "barbell",
    target: "pectorals",
    secondaryMuscles: ["triceps", "shoulders"],
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600",
    gifUrl: "https://static.exercisedb.dev/media/EIeI8Vf.gif", 
    instructions: ["Lie flat on a bench.", "Grasp barbell with overhand grip.", "Lower to chest.", "Press up."],
    difficulty: "expert",
    type: "strength"
  },
  {
    id: "52r52",
    name: "barbell squat",
    bodyPart: "upper legs",
    muscle: "legs",
    equipment: "barbell",
    target: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings", "calves"],
    imageUrl: "https://images.unsplash.com/photo-1574680096141-9c32faff8731?q=80&w=600",
    gifUrl: "https://static.exercisedb.dev/media/52r52.gif",
    instructions: ["Stand with feet shoulder-width.", "Barbell on back.", "Squat down.", "Drive up."],
    difficulty: "expert",
    type: "strength"
  },
  {
    id: "fb_db_curl",
    name: "dumbbell bicep curl",
    bodyPart: "upper arms",
    muscle: "arms",
    equipment: "dumbbell",
    target: "biceps",
    secondaryMuscles: ["forearms"],
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600",
    gifUrl: "",
    instructions: ["Hold dumbbells.", "Curl upwards.", "Lower slowly."],
    difficulty: "beginner",
    type: "strength"
  },
  {
    id: "fb_run",
    name: "treadmill running",
    bodyPart: "cardio",
    muscle: "cardio",
    equipment: "machine",
    target: "cardiovascular system",
    secondaryMuscles: ["legs"],
    imageUrl: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=600",
    gifUrl: "",
    instructions: ["Start machine.", "Run."],
    difficulty: "beginner",
    type: "cardio"
  },
  {
    id: "fb_cable_fly",
    name: "cable crossover",
    bodyPart: "chest",
    muscle: "chest",
    equipment: "cable",
    target: "pectorals",
    secondaryMuscles: ["shoulders"],
    imageUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600",
    gifUrl: "",
    instructions: ["Set pulleys high.", "Pull handles down and together."],
    difficulty: "intermediate",
    type: "strength"
  },
  {
    id: "fb_leg_press",
    name: "leg press",
    bodyPart: "upper legs",
    muscle: "legs",
    equipment: "machine",
    target: "quadriceps",
    secondaryMuscles: ["calves"],
    imageUrl: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600",
    gifUrl: "",
    instructions: ["Sit on machine.", "Push weight away.", "Return slowly."],
    difficulty: "beginner",
    type: "strength"
  },
  {
    id: "fb_box_jump",
    name: "box jump",
    bodyPart: "upper legs",
    muscle: "legs",
    equipment: "body weight",
    target: "quadriceps",
    secondaryMuscles: ["calves", "glutes"],
    imageUrl: "https://images.unsplash.com/photo-1434608519344-49d77a699ded?q=80&w=600",
    gifUrl: "",
    instructions: ["Stand before box.", "Jump onto box.", "Step down."],
    difficulty: "intermediate",
    type: "plyometrics"
  },
  {
    id: "fb_lat_pull",
    name: "lat pulldown",
    bodyPart: "back",
    muscle: "back",
    equipment: "cable",
    target: "lats",
    secondaryMuscles: ["biceps"],
    imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=600",
    gifUrl: "",
    instructions: ["Grip bar wide.", "Pull down to chest.", "Release up."],
    difficulty: "beginner",
    type: "strength"
  }
];

const EQUIP_IMAGES: Record<string, string> = {
  'barbell': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800',
  'dumbbell': 'https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?q=80&w=800',
  'cable': 'https://images.unsplash.com/photo-1596357395217-80de13130e92?q=80&w=800',
  'body weight': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800',
  'machine': 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800'
};

const MUSCLE_IMAGES: Record<string, string> = {
  'chest': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800',
  'back': 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800',
  'upper legs': 'https://images.unsplash.com/photo-1434608519344-49d77a699ded?q=80&w=800',
  'waist': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800',
  'upper arms': 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800',
  'shoulders': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800',
  'cardio': 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=800',
  'lower legs': 'https://images.unsplash.com/photo-1517963879466-eeb5db380426?q=80&w=800'
};

const mapApiExerciseToExercise = (apiEx: ApiExercise): Exercise => {
  return {
    id: apiEx.exerciseId,
    name: apiEx.name,
    bodyPart: apiEx.bodyParts && apiEx.bodyParts.length > 0 ? safeName(apiEx.bodyParts[0]) : 'unknown',
    muscle: apiEx.bodyParts && apiEx.bodyParts.length > 0 ? safeName(apiEx.bodyParts[0]) : 'unknown',
    equipment: apiEx.equipments && apiEx.equipments.length > 0 ? safeName(apiEx.equipments[0]) : 'unknown',
    target: apiEx.targetMuscles && apiEx.targetMuscles.length > 0 ? safeName(apiEx.targetMuscles[0]) : 'unknown',
    secondaryMuscles: apiEx.secondaryMuscles ? apiEx.secondaryMuscles.map(safeName) : [],
    gifUrl: apiEx.gifUrl || '', 
    imageUrl: apiEx.imageUrl || '',
    instructions: apiEx.instructions || [],
    difficulty: apiEx.difficulty || 'intermediate',
    type: apiEx.exerciseTypes && apiEx.exerciseTypes.length > 0 ? safeName(apiEx.exerciseTypes[0]) : 'strength'
  };
};

export const fetchExercises = async (
  bodyParts?: string | string[],
  equipments?: string | string[],
  targetMuscles?: string | string[],
  exerciseTypes?: string | string[],
  search?: string,
  page: number = 1,
  limit: number = 6
): Promise<{ data: Exercise[], total: number }> => {
  
  try {
    const url = new URL(`${BASE_URL}/exercises`);
    
    if (search && search.length > 1) url.searchParams.append('name', search);
    
    // Handle array filters for V1
    if (Array.isArray(bodyParts) && bodyParts.length > 0 && bodyParts[0] !== 'ALL') {
        url.searchParams.append('bodyParts', bodyParts.join(','));
    }
    if (Array.isArray(equipments) && equipments.length > 0 && equipments[0] !== 'ALL') {
        url.searchParams.append('equipments', equipments.join(','));
    }
    // API V1 might not support all these concurrently via query params without paid plan
    // We will attempt client side filtering if params are ignored, but we pass them anyway.
    
    url.searchParams.append('limit', '50'); 

    const response = await fetch(url.toString(), { 
        method: 'GET',
        headers: {
            'x-rapidapi-key': RAPID_API_KEY,
            'x-rapidapi-host': RAPID_API_HOST
        }
    });

    if (response.status === 429) {
        console.warn("API Rate Limit Exceeded. Using Fallback Data.");
        throw new Error("Rate Limit");
    }

    if (!response.ok) {
       throw new Error("API Fetch Failed");
    }

    const json: any = await response.json();
    
    let dataList: ApiExercise[] = [];
    if (Array.isArray(json)) {
        dataList = json;
    } else if (json.data && Array.isArray(json.data)) {
        dataList = json.data;
    } else {
        dataList = []; 
    }
    
    let mappedExercises = dataList.map(mapApiExerciseToExercise);

    // Client-side filtering
    if (search) {
      mappedExercises = mappedExercises.filter(ex => 
        ex.name.toLowerCase().includes(search.toLowerCase()) || 
        ex.target.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = mappedExercises.length;
    const start = (page - 1) * limit;
    const paginated = mappedExercises.slice(start, start + limit);

    return { data: paginated, total };

  } catch (error) {
    // --- FALLBACK LOGIC ---
    let res = FALLBACK_EXERCISES;

    if (search) {
      const s = search.toLowerCase();
      res = res.filter(ex => ex.name.toLowerCase().includes(s) || ex.target.toLowerCase().includes(s));
    }

    if (Array.isArray(bodyParts) && bodyParts.length > 0 && bodyParts[0] !== 'ALL') {
       const lowerFilters = bodyParts.map(bp => bp.toLowerCase());
       res = res.filter(ex => lowerFilters.some(f => ex.bodyPart.toLowerCase().includes(f)));
    }

    if (Array.isArray(equipments) && equipments.length > 0 && equipments[0] !== 'ALL') {
       const lowerFilters = equipments.map(eq => eq.toLowerCase());
       res = res.filter(ex => lowerFilters.some(f => ex.equipment.toLowerCase().includes(f)));
    }
    
    if (Array.isArray(exerciseTypes) && exerciseTypes.length > 0 && exerciseTypes[0] !== 'ALL') {
       const lowerFilters = exerciseTypes.map(t => t.toLowerCase());
       res = res.filter(ex => ex.type && lowerFilters.some(f => ex.type!.toLowerCase().includes(f)));
    }

    const total = res.length;
    const start = (page - 1) * limit;
    return { 
      data: res.slice(start, start + limit), 
      total 
    };
  }
};

const fetchList = async (endpoint: string, fallback: string[]): Promise<string[]> => {
    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
            headers: {
                'x-rapidapi-key': RAPID_API_KEY,
                'x-rapidapi-host': RAPID_API_HOST
            }
        });
        if (response.ok) {
            const data = await response.json();
            let list: any[] = [];
            
            if (Array.isArray(data)) list = data;
            else if (data.data && Array.isArray(data.data)) list = data.data;
            else return fallback;

            return list.map(item => {
                if (typeof item === 'string') return item;
                if (item && typeof item === 'object' && item.name) return item.name;
                return String(item);
            });
        }
        return fallback;
    } catch {
        return fallback;
    }
}

export const fetchBodyParts = async () => {
   return fetchList('bodyparts', ["back", "cardio", "chest", "lower arms", "lower legs", "neck", "shoulders", "upper arms", "upper legs", "waist"]);
};

export const fetchEquipments = async () => {
   return fetchList('equipments', ["assisted", "band", "barbell", "body weight", "bosu ball", "cable", "dumbbell", "machine", "kettlebell", "rope", "smith machine", "weighted"]);
};

export const fetchTargetMuscles = async () => {
    return fetchList('muscles', ["abductors", "abs", "adductors", "biceps", "calves", "delts", "forearms", "glutes", "hamstrings", "lats", "pectorals", "quads", "traps", "triceps"]);
};

export const fetchExerciseTypes = async () => {
    return fetchList('exercisetypes', ["cardio", "olympic_weightlifting", "plyometrics", "powerlifting", "strength", "stretching", "strongman"]);
};

export const getEquipmentImageUrl = (equipment: string) => {
   const key = Object.keys(EQUIP_IMAGES).find(k => equipment.toLowerCase().includes(k));
   return key ? EQUIP_IMAGES[key] : 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800';
};

export const getTargetImageUrl = (bodyPart: string) => {
   const key = Object.keys(MUSCLE_IMAGES).find(k => bodyPart.toLowerCase().includes(k));
   return key ? MUSCLE_IMAGES[key] : 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800';
};

export const getExerciseThumbnail = (exercise: Exercise): string => {
   // Return imageUrl (PNG) if available, otherwise gifUrl, otherwise empty
   return exercise.imageUrl || exercise.gifUrl || "";
};

export const getExerciseGif = (exercise: Exercise): string => {
   // Return gifUrl if available, otherwise empty
   if (exercise.gifUrl && (exercise.gifUrl.startsWith('http') || exercise.gifUrl.startsWith('/'))) return exercise.gifUrl;
   return "";
};

export const getExerciseSequence = (exercise: Exercise) => {
   const img = getTargetImageUrl(exercise.bodyPart);
   return [img, img, img];
};
