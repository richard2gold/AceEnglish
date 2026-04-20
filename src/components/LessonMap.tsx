/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Lock, CheckCircle2, Play } from 'lucide-react';
import { NEWS_TOPICS } from '../constants';
import { UserProgress } from '../types';

interface LessonMapProps {
  progress: UserProgress;
  onSelectLesson: (id: number) => void;
}

export default function LessonMap({ progress, onSelectLesson }: LessonMapProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-zinc-900 mb-4 font-serif">Ace English: 深度精读 20 篇</h1>
        <p className="text-zinc-500 max-w-2xl mx-auto">
          彻底掌握当前内容后再进入下一阶段。通过“听、看、研、练”四个维度的循环打磨，将中级英语内化为高级表达能力。
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {NEWS_TOPICS.map((topic, index) => {
          const lessonId = index + 1;
          const isCompleted = progress.completedLessonIds.includes(lessonId);
          const isCurrent = progress.currentLessonId === lessonId;
          const canAccess = lessonId <= progress.completedLessonIds.length + 1;

          return (
            <motion.div
              key={lessonId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={canAccess ? { scale: 1.02, y: -4 } : {}}
              onClick={() => canAccess && onSelectLesson(lessonId)}
              className={`relative overflow-hidden rounded-2xl border p-6 transition-all cursor-pointer shadow-sm
                ${canAccess 
                  ? 'bg-white border-zinc-200 hover:border-indigo-400 hover:shadow-indigo-100/50' 
                  : 'bg-zinc-100 border-zinc-200 cursor-not-allowed opacity-75'}
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-tighter uppercase
                  ${canAccess ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-200 text-zinc-500'}`}>
                  Lesson {String(lessonId).padStart(2, '0')}
                </span>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                ) : !canAccess ? (
                  <Lock className="w-4 h-4 text-zinc-400" />
                ) : (
                  <Play className="w-4 h-4 text-indigo-500 animate-pulse" />
                )}
              </div>
              
              <h3 className={`font-semibold mb-2 line-clamp-2 ${canAccess ? 'text-zinc-900 font-serif' : 'text-zinc-400'}`}>
                {topic}
              </h3>
              
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1 bg-zinc-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${isCompleted ? 'w-full bg-emerald-400' : isCurrent ? 'w-1/3 bg-indigo-400' : 'w-0'}`} 
                  />
                </div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold">
                  {isCompleted ? 'Level Clear' : 'Unlock Now'}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
