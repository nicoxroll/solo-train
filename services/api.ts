import { Exercise } from '../types';

const API_KEY = 'mqEn/o3OvnhEMkhXND3t+g==QKAMwG86oYjU4xBt';
const BASE_URL = 'https://api.api-ninjas.com/v1/exercises';

export const fetchExercises = async (muscle?: string, name?: string): Promise<Exercise[]> => {
  const params = new URLSearchParams();
  if (muscle) params.append('muscle', muscle);
  if (name) params.append('name', name);
  
  // If no params, fetch a default set (e.g., chest) to avoid empty screens
  if (!muscle && !name) params.append('muscle', 'chest');

  try {
    const response = await fetch(`${BASE_URL}?${params.toString()}`, {
      method: 'GET',
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch exercises", error);
    return [];
  }
};

// Helper to get a decorative image based on muscle group (since API Ninjas doesn't provide images)
export const getMuscleImage = (muscle: string): string => {
  const map: Record<string, string> = {
    abdominals: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800',
    biceps: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=800',
    chest: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800',
    calves: 'https://images.unsplash.com/photo-1517344884109-540283b27123?auto=format&fit=crop&q=80&w=800',
    glutes: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&q=80&w=800',
    hamstrings: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800',
    lats: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?auto=format&fit=crop&q=80&w=800',
    quadriceps: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?auto=format&fit=crop&q=80&w=800',
    shoulders: 'https://images.unsplash.com/photo-1532029837068-59174c159b7e?auto=format&fit=crop&q=80&w=800',
    triceps: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
  };
  return map[muscle] || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800';
};
