
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { DIET_TASKS, EXERCISES, INITIAL_START_DATE, TOTAL_DAYS, WATER_GOAL, APP_STORAGE_KEY, MOTIVATIONAL_QUOTES } from './constants';
import { AppState, DailyData, WeightEntry } from './types';

// Simple beep generator using Web Audio API
const playBeep = (freq: number, duration: number) => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Audio failed", e);
  }
};

const App: React.FC = () => {
  // --- STATE ---
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return { 
      history: {}, 
      weightLogs: [], 
      startDate: INITIAL_START_DATE 
    };
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState('');

  // Workout Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timerMode, setTimerMode] = useState<'WORK' | 'REST'>('WORK'); // 45s Work, 15s Rest
  const [timerSeconds, setTimerSeconds] = useState(45);
  const timerRef = useRef<number | null>(null);

  // --- EFFECTS ---
  useEffect(() => {
    const clock = setInterval(() => setCurrentDate(new Date()), 60000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Workout Timer Logic
  useEffect(() => {
    if (timerActive) {
      timerRef.current = window.setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            const nextMode = timerMode === 'WORK' ? 'REST' : 'WORK';
            const nextTime = nextMode === 'WORK' ? 45 : 15;
            playBeep(nextMode === 'WORK' ? 880 : 440, 0.5);
            setTimerMode(nextMode);
            return nextTime;
          }
          if (prev <= 3) playBeep(660, 0.1);
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timerMode]);

  // --- CALCULATIONS ---
  const dateString = useMemo(() => {
    return currentDate.toISOString().split('T')[0];
  }, [currentDate]);

  const sprintDay = useMemo(() => {
    const start = new Date(state.startDate).setHours(0, 0, 0, 0);
    const today = new Date(currentDate).setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [currentDate, state.startDate]);

  const daysRemaining = Math.max(0, TOTAL_DAYS - sprintDay + 1);

  const currentDayData = useMemo((): DailyData => {
    return state.history[dateString] || { diet: {}, exercises: {}, water: 0 };
  }, [state, dateString]);

  const currentQuote = useMemo(() => {
    const quoteIndex = Math.max(0, Math.min(MOTIVATIONAL_QUOTES.length - 1, sprintDay - 1));
    return MOTIVATIONAL_QUOTES[quoteIndex] || MOTIVATIONAL_QUOTES[0];
  }, [sprintDay]);

  const dayProgress = useMemo(() => {
    const dietCount = DIET_TASKS.length;
    const exerciseCount = EXERCISES.length;
    const waterUnit = WATER_GOAL / 0.25;
    
    const dietDone = DIET_TASKS.filter(t => currentDayData.diet[t.id]).length;
    const exerciseDone = EXERCISES.filter(e => currentDayData.exercises[e.id]).length;
    const waterDone = Math.min(currentDayData.water, WATER_GOAL) / 0.25;

    const totalActions = dietCount + exerciseCount + waterUnit;
    const completedActions = dietDone + exerciseDone + waterDone;
    
    return Math.round((completedActions / totalActions) * 100);
  }, [currentDayData]);

  // --- ACTIONS ---
  const toggleDiet = (id: string) => {
    setState(prev => {
      const dayData = prev.history[dateString] || { diet: {}, exercises: {}, water: 0 };
      return {
        ...prev,
        history: {
          ...prev.history,
          [dateString]: { ...dayData, diet: { ...dayData.diet, [id]: !dayData.diet[id] } }
        }
      };
    });
  };

  const toggleExercise = (id: string) => {
    setState(prev => {
      const dayData = prev.history[dateString] || { diet: {}, exercises: {}, water: 0 };
      return {
        ...prev,
        history: {
          ...prev.history,
          [dateString]: { ...dayData, exercises: { ...dayData.exercises, [id]: !dayData.exercises[id] } }
        }
      };
    });
  };

  const addWater = (amt: number) => {
    setState(prev => {
      const dayData = prev.history[dateString] || { diet: {}, exercises: {}, water: 0 };
      return {
        ...prev,
        history: {
          ...prev.history,
          [dateString]: { ...dayData, water: Math.min(10, dayData.water + amt) }
        }
      };
    });
  };

  const logWeight = () => {
    const val = parseFloat(weightInput);
    if (isNaN(val)) return;
    setState(prev => ({
      ...prev,
      weightLogs: [...prev.weightLogs, { date: dateString, value: val }]
    }));
    setWeightInput('');
  };

  const startNewSprint = () => {
    if (confirm("Reset everything and start new 30-day sprint?")) {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      setState({
        history: {},
        weightLogs: [],
        startDate: now.toISOString()
      });
    }
  };

  const isMonday = currentDate.getDay() === 1;

  // --- RENDER HELPERS ---
  const CheckIcon = ({ checked }: { checked: boolean }) => (
    <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
      checked ? 'bg-[#39FF14] border-[#39FF14]' : 'border-gray-700 bg-black'
    }`}>
      {checked && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-black text-white font-sans overflow-x-hidden selection:bg-[#39FF14]/30">
      
      {/* Top Header & Global Progress */}
      <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b border-gray-900 px-6 pt-10 pb-4">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">
              30-DAY <span className="text-[#39FF14]">SPRINT</span>
            </h1>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">
              Mission: 5kg Down
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Remaining</p>
            <p className="text-3xl font-black text-[#39FF14] leading-none">{daysRemaining}D</p>
          </div>
        </div>
        
        <div className="relative w-full h-3 bg-gray-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#39FF14] to-emerald-400 transition-all duration-700 ease-out"
            style={{ width: `${dayProgress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Day Progress</span>
          <span className="text-[10px] font-black text-[#39FF14]">{dayProgress}%</span>
        </div>
      </header>

      <main className="flex-1 px-6 py-6 space-y-8 pb-32">
        
        {/* Daily Motivation Card */}
        <section className="bg-gradient-to-br from-[#111] to-black border border-[#39FF14]/30 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#39FF14]/5 rounded-full blur-2xl group-hover:bg-[#39FF14]/10 transition-all" />
          <div className="flex items-start gap-3 relative z-10">
            <span className="text-3xl leading-none text-[#39FF14] font-serif">“</span>
            <p className="text-base font-bold text-gray-200 leading-tight italic">
              {currentQuote}
            </p>
          </div>
          <div className="mt-4 flex justify-end">
            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Day {sprintDay} Intensity</span>
          </div>
        </section>

        {/* Workout Timer Card */}
        <section className="bg-[#0a0a0a] border border-gray-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
             <div className={`w-3 h-3 rounded-full ${timerActive ? 'bg-[#39FF14] animate-pulse' : 'bg-gray-800'}`} />
          </div>
          <h2 className="text-xs font-black text-[#39FF14] uppercase tracking-widest mb-4">HIIT Timer</h2>
          <div className="flex flex-col items-center">
            <div className={`text-6xl font-black mb-2 font-mono ${timerMode === 'WORK' ? 'text-white' : 'text-orange-500'}`}>
              {timerSeconds}s
            </div>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-6">
              Mode: {timerMode} ({timerMode === 'WORK' ? '45s' : '15s'})
            </p>
            <button 
              onClick={() => {
                if (!timerActive) playBeep(880, 0.2);
                setTimerActive(!timerActive);
              }}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 ${
                timerActive ? 'bg-red-600/20 text-red-500 border border-red-600/30' : 'bg-[#39FF14] text-black shadow-[0_0_20px_rgba(57,255,20,0.3)]'
              }`}
            >
              {timerActive ? 'Pause Session' : 'Start Workout'}
            </button>
          </div>
        </section>

        {/* Exercise Checklist with Tips */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-[#39FF14] rounded-full" />
            <h2 className="text-sm font-black uppercase tracking-widest">Exercise & Form</h2>
          </div>
          <div className="space-y-3">
            {EXERCISES.map((ex) => (
              <div key={ex.id} className="group">
                <div className="flex items-center gap-4 bg-[#0a0a0a] border border-gray-900 p-4 rounded-2xl active:bg-gray-900 transition-colors">
                  <button onClick={() => toggleExercise(ex.id)} className="shrink-0">
                    <CheckIcon checked={!!currentDayData.exercises[ex.id]} />
                  </button>
                  <div className="flex-1" onClick={() => setExpandedExercise(expandedExercise === ex.id ? null : ex.id)}>
                    <p className={`text-sm font-bold ${currentDayData.exercises[ex.id] ? 'text-gray-500 line-through' : 'text-white'}`}>
                      {ex.label}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tight mt-0.5">Tap for coach tips</p>
                  </div>
                  <button 
                    onClick={() => setExpandedExercise(expandedExercise === ex.id ? null : ex.id)}
                    className="p-2 text-gray-600 hover:text-[#39FF14]"
                  >
                    <svg className={`transition-transform ${expandedExercise === ex.id ? 'rotate-180' : ''}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                </div>
                {expandedExercise === ex.id && (
                  <div className="mt-2 mx-4 p-4 bg-[#39FF14]/5 border-l-2 border-[#39FF14] rounded-r-xl">
                    <p className="text-xs text-[#39FF14] font-mono leading-relaxed">
                      <span className="font-bold uppercase block mb-1">Coach Tip:</span>
                      {ex.tip}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Diet Checklist */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h2 className="text-sm font-black uppercase tracking-widest">Nutrition Log</h2>
          </div>
          <div className="space-y-3">
            {DIET_TASKS.map((task) => (
              <button 
                key={task.id}
                onClick={() => toggleDiet(task.id)}
                className="w-full flex items-center gap-4 bg-[#0a0a0a] border border-gray-900 p-4 rounded-2xl active:bg-gray-900 text-left"
              >
                <CheckIcon checked={!!currentDayData.diet[task.id]} />
                <div>
                  <p className="text-[10px] font-mono text-gray-500 mb-0.5">{task.time}</p>
                  <p className={`text-sm font-bold ${currentDayData.diet[task.id] ? 'text-gray-500 line-through' : 'text-white'}`}>
                    {task.label}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Water Tracker */}
        <section className="bg-[#0a0a0a] border border-gray-900 rounded-3xl p-6">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Hydration</h2>
             <span className="text-xs font-black text-blue-400">{currentDayData.water.toFixed(1)} / {WATER_GOAL}L</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-6 h-12">
            {[1, 2, 3, 4].map(l => {
              const fill = Math.min(1, Math.max(0, currentDayData.water - (l - 1)));
              return (
                <div key={l} className="bg-gray-900 rounded-lg relative overflow-hidden">
                  <div 
                    className="absolute bottom-0 left-0 w-full bg-blue-600 transition-all duration-500" 
                    style={{ height: `${fill * 100}%` }}
                  />
                </div>
              );
            })}
          </div>
          <button 
            onClick={() => addWater(0.25)}
            className="w-full py-4 bg-blue-600/10 border border-blue-600/30 text-blue-400 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Add Glass (250ml)
          </button>
        </section>

        {/* Weight Log Section */}
        <section className="bg-[#111] rounded-3xl p-6 border border-gray-800">
          <div className="flex justify-between items-center mb-4">
             <h2 className="text-xs font-black text-white uppercase tracking-widest">Weight Monitor</h2>
             {isMonday && <span className="text-[10px] bg-red-600 px-2 py-1 rounded-full font-bold animate-pulse">MONDAY LOG!</span>}
          </div>
          <div className="flex gap-2 mb-6">
            <input 
              type="number" 
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              placeholder="Enter weight (kg)"
              className="flex-1 bg-black border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-[#39FF14] outline-none transition-colors"
            />
            <button 
              onClick={logWeight}
              className="px-6 bg-[#39FF14] text-black font-black uppercase text-xs rounded-xl active:scale-95 transition-all"
            >
              Log
            </button>
          </div>
          
          <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
            {state.weightLogs.slice().reverse().map((log, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-900 last:border-0">
                <span className="text-[10px] font-mono text-gray-500">{log.date}</span>
                <span className="text-sm font-bold">{log.value} kg</span>
              </div>
            ))}
            {state.weightLogs.length === 0 && <p className="text-center text-xs text-gray-600 py-4 italic">No weight logs yet.</p>}
          </div>
        </section>

        {/* Global Reset */}
        <section className="pt-10">
          <button 
            onClick={startNewSprint}
            className="w-full py-5 text-gray-700 font-black uppercase tracking-widest text-[10px] hover:text-red-500 transition-colors"
          >
            Reset 30-Day Sprint Data
          </button>
        </section>
      </main>

      {/* Persistent Bottom Bar */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-black/95 backdrop-blur-xl border-t border-gray-900 flex justify-center items-center gap-6 z-50">
        <div className="text-center">
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Status</p>
          <p className="text-sm font-black text-white uppercase">{dayProgress === 100 ? 'Level: Beast' : 'Grinding...'}</p>
        </div>
        <div className="w-1.5 h-6 bg-gray-800 rounded-full" />
        <div className="text-center">
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Weight Change</p>
          <p className="text-sm font-black text-[#39FF14] uppercase">
            {state.weightLogs.length > 1 
              ? `${(state.weightLogs[state.weightLogs.length - 1].value - state.weightLogs[0].value).toFixed(1)}kg`
              : '0.0kg'}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
