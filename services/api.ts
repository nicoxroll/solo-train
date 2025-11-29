
import { Exercise } from '../types';

const RAPID_API_KEY = 'YOUR_RAPID_API_KEY'; // GET KEY FROM https://rapidapi.com/justin-wf/api/exercisedb
const BASE_URL = 'https://exercisedb.p.rapidapi.com/exercises';

// Fallback data with RELIABLE Unsplash images to ensure UI looks good immediately
const FALLBACK_EXERCISES: Exercise[] = [
  {
    id: "0001",
    name: "3/4 sit-up",
    bodyPart: "waist",
    muscle: "waist",
    equipment: "body weight",
    target: "abs",
    secondaryMuscles: ["hip flexors", "lower back"],
    gifUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop", 
    instructions: [
      "Lie flat on your back with your knees bent and feet flat on the ground.",
      "Place your hands behind your head with your elbows pointing outwards.",
      "Engaging your abs, slowly lift your upper body off the ground, curling forward until your torso is at a 45-degree angle.",
      "Pause for a moment at the top, then slowly lower your upper body back down to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    difficulty: "beginner",
    type: "strength"
  },
  {
    id: "0002",
    name: "45° side bend",
    bodyPart: "waist",
    muscle: "waist",
    equipment: "body weight",
    target: "abs",
    secondaryMuscles: ["obliques"],
    gifUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop",
    instructions: [
      "Stand with your feet shoulder-width apart and your arms extended straight down by your sides.",
      "Keeping your back straight and your core engaged, slowly bend your torso to one side, lowering your hand towards your knee.",
      "Pause for a moment at the bottom, then slowly return to the starting position.",
      "Repeat on the other side.",
      "Continue alternating sides for the desired number of repetitions."
    ],
    difficulty: "beginner",
    type: "strength"
  },
  {
    id: "0006",
    name: "alternating dumbbell floor press",
    bodyPart: "chest",
    muscle: "chest",
    equipment: "dumbbell",
    target: "pectorals",
    secondaryMuscles: ["triceps", "front deltoids"],
    gifUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop",
    instructions: [
      "Lie on the floor with your knees bent and feet flat on the ground.",
      "Hold a dumbbell in each hand with your palms facing forward and your arms extended straight up over your chest.",
      "Slowly lower one dumbbell towards your chest while keeping the other arm extended.",
      "Pause for a moment at the bottom, then push the dumbbell back up to the starting position.",
      "Repeat with the other arm.",
      "Continue alternating arms for the desired number of repetitions."
    ],
    difficulty: "intermediate",
    type: "strength"
  },
  {
    id: "0025",
    name: "barbell bench press",
    bodyPart: "chest",
    muscle: "chest",
    equipment: "barbell",
    target: "pectorals",
    secondaryMuscles: ["triceps", "shoulders"],
    gifUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop",
    instructions: [
      "Lie on a flat bench with your feet flat on the ground.",
      "Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.",
      "Unrack the barbell and lower it slowly towards your chest.",
      "Pause for a moment, then push the barbell back up to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    difficulty: "expert",
    type: "strength"
  },
   {
    id: "0032",
    name: "barbell deadlift",
    bodyPart: "back",
    muscle: "back",
    equipment: "barbell",
    target: "spine",
    secondaryMuscles: ["glutes", "hamstrings"],
    gifUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
    instructions: [
      "Stand with your feet hip-width apart and your toes pointing slightly outwards.",
      "Bend at your hips and knees to lower your body and grasp the barbell with an overhand grip.",
      "Keep your back straight and your chest up as you lift the barbell by extending your hips and knees.",
      "Pause for a moment at the top, then slowly lower the barbell back down to the ground.",
      "Repeat for the desired number of repetitions."
    ],
    difficulty: "expert",
    type: "strength"
  },
  {
    id: "0047",
    name: "barbell squat",
    bodyPart: "upper legs",
    muscle: "legs",
    equipment: "barbell",
    target: "quadriceps",
    secondaryMuscles: ["glutes", "hamstrings", "calves"],
    gifUrl: "https://images.unsplash.com/photo-1574680096141-1cddd32e2552?q=80&w=800&auto=format&fit=crop",
    instructions: [
      "Stand with your feet shoulder-width apart and the barbell resting on your upper back.",
      "Keep your chest up and your back straight as you lower your body by bending your knees and hips.",
      "Lower until your thighs are parallel to the ground.",
      "Pause for a moment, then push yourself back up to the starting position.",
      "Repeat for the desired number of repetitions."
    ],
    difficulty: "expert",
    type: "strength"
  }
];

export const fetchExercises = async (bodyPart?: string, name?: string): Promise<Exercise[]> => {
  const params = new URLSearchParams();
  params.append('limit', '50');

  try {
    let url = BASE_URL;
    if (bodyPart && bodyPart !== 'ALL') {
       url = `${BASE_URL}/bodyPart/${bodyPart}`;
    }

    // Since we don't have a guaranteed key, we attempt fetch but fallback gracefully
    // In a real app, you would uncomment this fetch logic
    /*
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      },
    });

    if (!response.ok) {
      console.warn("API Key invalid or limit reached, using fallback data.");
      return filterFallback(bodyPart);
    }
    const data = await response.json();
    return data.map((item: any) => ({ ... }));
    */

    // FOR DEMO: Always return fallback to ensure images work
    return new Promise((resolve) => {
        setTimeout(() => resolve(filterFallback(bodyPart)), 500);
    });

  } catch (error) {
    console.error("Failed to fetch exercises", error);
    return filterFallback(bodyPart);
  }
};

const filterFallback = (bodyPart?: string): Exercise[] => {
   if (!bodyPart || bodyPart === 'ALL') return FALLBACK_EXERCISES;
   return FALLBACK_EXERCISES.filter(ex => {
      if (bodyPart === 'legs') return ex.bodyPart.includes('legs') || ex.bodyPart.includes('quad') || ex.bodyPart.includes('calf');
      if (bodyPart === 'arms') return ex.bodyPart.includes('arms') || ex.bodyPart.includes('triceps') || ex.bodyPart.includes('biceps');
      return ex.bodyPart.includes(bodyPart) || ex.target.includes(bodyPart);
   });
}

// Helper to get a decorative image (fallback if GIF fails or for static views)
export const getExerciseImage = (exercise: Exercise): string => {
   if (exercise.gifUrl && exercise.gifUrl.startsWith('http')) return exercise.gifUrl;
   // Generic fallback
   return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800';
};
