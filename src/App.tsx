/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserProgress } from './types';
import LessonMap from './components/LessonMap';
import LessonView from './components/LessonView';

const STORAGE_KEY = 'ace_english_progress';

export default function App() {
  const [progress, setProgress] = useState<UserProgress>({
    completedLessonIds: [],
    currentLessonId: 1
  });
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  // Load progress
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.completedLessonIds) {
          setProgress(parsed);
        }
      } catch (e) {
        console.error('Failed to parse progress', e);
      }
    }
  }, []);

  // Save progress
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const handleLessonComplete = (id: number) => {
    setProgress(prev => {
      const nextCompleted = Array.from(new Set([...prev.completedLessonIds, id]));
      // Logic for next lesson id
      const nextLessonId = Math.min(20, Math.max(prev.currentLessonId, id + 1));
      return {
        completedLessonIds: nextCompleted,
        currentLessonId: nextLessonId
      };
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 Selection:bg-indigo-100 Selection:text-indigo-900">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-zinc-100 z-50 h-16 flex items-center px-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl font-serif">A</div>
          <span className="font-bold text-zinc-900 tracking-tight">Ace English</span>
        </div>
        <div className="ml-auto flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Course Progress</span>
            <span className="text-sm font-bold text-zinc-700">{progress.completedLessonIds.length}/20 Completed</span>
          </div>
          <div className="w-24 h-2 bg-zinc-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-1000" 
              style={{ width: `${(progress.completedLessonIds.length / 20) * 100}%` }}
            />
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20">
        {!selectedLessonId ? (
          <LessonMap 
            progress={progress} 
            onSelectLesson={setSelectedLessonId} 
          />
        ) : (
          <LessonView 
            lessonId={selectedLessonId} 
            onBack={() => setSelectedLessonId(null)}
            onComplete={handleLessonComplete}
          />
        )}
      </main>

      <footer className="py-8 text-center text-zinc-400 text-xs border-t border-zinc-100">
        <p>© 2026 Ace English Academy. Powered by Google Gemini AI.</p>
        <p className="mt-2">不限时间，每一篇新闻都值得深度掌握</p>
      </footer>
    </div>
  );
}
