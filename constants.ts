
import { Task } from './types';

export const INITIAL_START_DATE = '2026-02-03T00:00:00';
export const TOTAL_DAYS = 30;
export const WATER_GOAL = 4.0;

export const DIET_TASKS: Task[] = [
  { id: 'd1', time: '06:30', label: 'Black Coffee' },
  { id: 'd2', time: '10:30', label: '0.75 Katori Rice + Big Saag/Tarkari/Curd' },
  { id: 'd3', time: '15:00', label: 'Black Coffee + Apple/Guava' },
  { id: 'd4', time: '19:00', label: '2 Roti + Tarkari + Salad' },
];

export const EXERCISES: Task[] = [
  { 
    id: 'e1', 
    label: 'Squats', 
    tip: 'Keep back straight, weight on heels, sit like there\'s an invisible chair. Aim for 3 sets of 20.' 
  },
  { 
    id: 'e2', 
    label: 'Mountain Climbers', 
    tip: 'Keep hands under shoulders, drive knees fast, keep butt low. Go for 45 seconds straight.' 
  },
  { 
    id: 'e3', 
    label: 'Push-ups', 
    tip: 'Keep body in a straight line, chest to floor, don\'t drop your hips. Scale to knees if needed.' 
  },
  { 
    id: 'e4', 
    label: 'Lunges', 
    tip: '90-degree angle for both knees, don\'t let front knee pass your toes. 15 each leg.' 
  },
  { 
    id: 'e5', 
    label: 'Plank', 
    tip: 'Squeeze your stomach and glutes, don\'t let your back sag. Hold for 60 seconds.' 
  },
  { 
    id: 'e6', 
    label: 'Surya Namaskar', 
    tip: 'Synchronize breath with movement, 12 rounds for maximum burn. Focus on fluidity.' 
  },
];

export const MOTIVATIONAL_QUOTES = [
  "Discipline is doing what needs to be done, even if you don't want to.",
  "Your future self will thank you for the work you do today.",
  "Motivation gets you started. Habit keeps you going.",
  "The pain of discipline is far less than the pain of regret.",
  "Don't stop until you're proud.",
  "Small daily wins lead to giant results over 30 days.",
  "Focus on the feeling of completion, not the struggle of the moment.",
  "You are one workout away from a better mood.",
  "Fitness is not about being better than someone else; it's about being better than you were yesterday.",
  "Suffer the pain of discipline or suffer the pain of regret.",
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It’s your mind that you have to convince.",
  "Fitness is a mental game. If you can control your mind, you can control your body.",
  "Results happen over time, not overnight. Work hard, stay patient.",
  "Success is the sum of small efforts, repeated day-in and day-out.",
  "Don't wish for it, work for it.",
  "Energy and persistence conquer all things.",
  "Believe in yourself and all that you are. You are stronger than any obstacle.",
  "The hard part isn't getting your body in shape. The hard part is getting your mind in shape.",
  "Action is the foundational key to all success.",
  "The only place where success comes before work is in the dictionary.",
  "Don't decrease the goal. Increase the effort.",
  "The difference between the impossible and the possible lies in a person's determination.",
  "If you want something you've never had, you must be willing to do something you've never done.",
  "Strength does not come from winning. Your struggles develop your strengths.",
  "You don't have to be great to start, but you have to start to be great.",
  "A 30-minute workout is only 2% of your day. No excuses.",
  "The finish line is just the beginning of a new you.",
  "Push yourself because no one else is going to do it for you.",
  "One month from now, you will thank yourself."
];

export const APP_STORAGE_KEY = '30_day_sprint_v2_coach';
