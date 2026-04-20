/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Headphones, BookOpen, Search, PenTool, 
  ChevronRight, Volume2, Languages, HelpCircle, CheckCircle2 
} from 'lucide-react';
import { LessonContent, StudyStep } from '../types';
import { generateLessonContent } from '../services/gemini';
import { NEWS_TOPICS } from '../constants';
import StepRenderer from './StepRenderer';

interface LessonViewProps {
  lessonId: number;
  onBack: () => void;
  onComplete: (id: number) => void;
}

const STEPS: { id: StudyStep; label: string; icon: any }[] = [
  { id: 'listening', label: '反复听', icon: Headphones },
  { id: 'reading', label: '反复看', icon: BookOpen },
  { id: 'research', label: '反复研', icon: Search },
  { id: 'practice', label: '反复练', icon: PenTool },
];

export default function LessonView({ lessonId, onBack, onComplete }: LessonViewProps) {
  const [currentStep, setCurrentStep] = useState<StudyStep>('listening');
  const [content, setContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await generateLessonContent(lessonId, NEWS_TOPICS[lessonId - 1]);
        setContent(data);
      } catch (error) {
        console.error('Failed to load lesson:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [lessonId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-zinc-500 font-medium animate-pulse">正在利用 AI 生成精读课件...</p>
      </div>
    );
  }

  if (!content) return null;

  const stepIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {/* Header */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors mb-6 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>返回计划图</span>
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900 mb-2 font-serif">{content.title}</h2>
        <p className="text-zinc-500">{content.topic}</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-12 bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isDone = idx < stepIndex;
          
          return (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`flex-1 flex flex-col items-center gap-2 py-3 px-4 rounded-xl transition-all
                ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-zinc-400 hover:text-zinc-600'}
              `}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                {isDone && (
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 absolute -top-1 -right-1 bg-white rounded-full" />
                )}
              </div>
              <span className="text-xs font-bold whitespace-nowrap">{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/50 p-8 min-h-[500px]"
        >
          <StepRenderer 
            step={currentStep} 
            content={content} 
            onNext={() => {
              if (stepIndex < STEPS.length - 1) {
                setCurrentStep(STEPS[stepIndex + 1].id);
              } else {
                onComplete(lessonId);
                onBack();
              }
            }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
