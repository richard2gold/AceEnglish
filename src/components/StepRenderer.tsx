/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, VolumeX, ChevronRight, Check, Book, 
  Languages, Search, HelpCircle, Send 
} from 'lucide-react';
import { LessonContent, StudyStep } from '../types';

interface StepRendererProps {
  step: StudyStep;
  content: LessonContent;
  onNext: () => void;
}

export default function StepRenderer({ step, content, onNext }: StepRendererProps) {
  switch (step) {
    case 'listening': return <ListeningStep content={content} onComplete={onNext} />;
    case 'reading': return <ReadingStep content={content} onComplete={onNext} />;
    case 'research': return <ResearchStep content={content} onComplete={onNext} />;
    case 'practice': return <PracticeStep content={content} onComplete={onNext} />;
    default: return null;
  }
}

import { speakWithGenAI, stopGenAISpeak, pauseGenAISpeak, resumeGenAISpeak } from '../services/tts';
import { Play, Pause, Square, SkipForward, Loader2 } from 'lucide-react';

// --- Listening Step ---
function ListeningStep({ content, onComplete }: { content: LessonContent; onComplete: () => void }) {
  const [round, setRound] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const handlePlay = async () => {
    if (isPaused) {
      resumeGenAISpeak();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      stopGenAISpeak();
      setIsSynthesizing(true);
      await speakWithGenAI(content.contentEn, () => {
        setIsPlaying(false);
        setIsPaused(false);
        setIsSynthesizing(false);
      });
      setIsSynthesizing(false);
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    pauseGenAISpeak();
    setIsPaused(true);
    setIsPlaying(false);
  };

  const handleStop = () => {
    stopGenAISpeak();
    setIsPlaying(false);
    setIsPaused(false);
    setIsSynthesizing(false);
  };

  const roundsInfo = [
    { id: 1, title: '第一遍：原文盲听', desc: '不看原文，尝试捕捉关键信息。' },
    { id: 2, title: '第二遍：对照原文', desc: '听的同时查看英语原文，匹配发音与词汇。' },
    { id: 3, title: '第三遍：全对照精听', desc: '对照中英原文及解释，彻底听懂。' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex gap-4 mb-6">
        {roundsInfo.map((r) => (
          <div 
            key={r.id}
            className={`flex-1 h-1 rounded-full transition-colors ${round >= r.id ? 'bg-indigo-500' : 'bg-zinc-100'}`}
          />
        ))}
      </div>

      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-zinc-900 mb-2">{roundsInfo[round - 1].title}</h3>
        <p className="text-zinc-500">{roundsInfo[round - 1].desc}</p>
      </div>

      {/* Broadcasting Controls */}
      <div className="flex flex-col items-center gap-6 mb-12">
        <div className="flex items-center gap-6 p-4 bg-zinc-50 rounded-full border border-zinc-100 shadow-inner">
          <button 
            onClick={handleStop}
            disabled={!isPlaying && !isPaused}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-zinc-200 text-zinc-400 hover:text-rose-500 hover:border-rose-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
            title="停止并重置"
          >
            <Square className="w-5 h-5 group-active:scale-90" />
          </button>

          <button 
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={isSynthesizing}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl
              ${isPlaying ? 'bg-indigo-100 text-indigo-600 animate-pulse ring-4 ring-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95'}
              ${isSynthesizing ? 'opacity-50 cursor-wait' : ''}
            `}
          >
            {isSynthesizing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>

          <button 
            onClick={() => { setRound(Math.min(3, round + 1)); handleStop(); }}
            disabled={round === 3}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-white border border-zinc-200 text-zinc-400 hover:text-indigo-600 hover:border-indigo-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
            title="下一遍"
          >
            <SkipForward className="w-5 h-5 group-active:scale-90" />
          </button>
        </div>
        
        {isPaused && (
          <motion.span 
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100"
          >
            已暂停
          </motion.span>
        )}
      </div>

      <div className="min-h-[200px] p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
        <AnimatePresence mode="wait">
          {round === 1 && (
            <motion.div 
              key="r1"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full text-zinc-400 italic"
            >
              此时不提供文字，请专注倾听...
            </motion.div>
          )}
          {round === 2 && (
            <motion.div key="r2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-lg leading-relaxed text-zinc-800 font-serif">{content.contentEn}</p>
            </motion.div>
          )}
          {round === 3 && (
            <motion.div key="r3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <p className="text-lg leading-relaxed text-zinc-800 font-serif border-b pb-4">{content.contentEn}</p>
              <p className="text-base text-zinc-500 leading-relaxed font-serif">{content.contentCn}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-end gap-4 mt-8">
        {round < 3 ? (
          <button 
            onClick={() => { setRound(round + 1); stop(); }}
            className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
          >
            进入下一遍 <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={() => { stop(); onComplete(); }}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            完成听力阶段 <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// --- Reading Step ---
function ReadingStep({ content, onComplete }: { content: LessonContent; onComplete: () => void }) {
  const [view, setView] = useState<'en' | 'bilingual' | 'cn'>('en');

  return (
    <div className="space-y-8">
      <div className="flex justify-center gap-2 mb-8 p-1 bg-zinc-100 rounded-xl w-fit mx-auto">
        <button 
          onClick={() => setView('en')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          英语原文
        </button>
        <button 
          onClick={() => setView('bilingual')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'bilingual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          中英对照
        </button>
        <button 
          onClick={() => setView('cn')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'cn' ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-800'}`}
        >
          中文翻译
        </button>
      </div>

      <div className="prose max-w-none">
        {view === 'en' && <p className="text-xl leading-relaxed text-zinc-800 font-serif">{content.contentEn}</p>}
        {view === 'cn' && <p className="text-xl leading-relaxed text-zinc-800 font-serif leading-loose">{content.contentCn}</p>}
        {view === 'bilingual' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ring-1 ring-zinc-100 p-6 rounded-2xl">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-4">English</h4>
                <p className="text-lg leading-relaxed text-zinc-800 font-serif">{content.contentEn}</p>
              </div>
              <div className="bg-zinc-50 -m-6 p-6 rounded-r-2xl border-l border-zinc-100">
                <h4 className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-4">中文</h4>
                <p className="text-lg leading-relaxed text-zinc-700 font-serif leading-loose">{content.contentCn}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-8">
        <button 
          onClick={onComplete}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          进入深度钻研 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// --- Research Step ---
function ResearchStep({ content, onComplete }: { content: LessonContent; onComplete: () => void }) {
  const [tab, setTab] = useState<'vocab' | 'analysis'>('vocab');

  return (
    <div className="space-y-8">
      <div className="flex border-b border-zinc-100 gap-8 mb-8">
        <button 
          onClick={() => setTab('vocab')}
          className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all ${tab === 'vocab' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
        >
          核心词汇 ({content.vocabulary.length})
        </button>
        <button 
          onClick={() => setTab('analysis')}
          className={`pb-4 px-2 text-sm font-bold border-b-2 transition-all ${tab === 'analysis' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
        >
          句型精析 ({content.analysis.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'vocab' ? (
          <motion.div 
            key="vocab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {content.vocabulary.map((v, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-zinc-100 hover:border-indigo-200 transition-all group">
                <div className="flex justify-between items-baseline mb-2">
                  <h4 className="text-lg font-bold text-indigo-600">{v.word}</h4>
                  <span className="text-xs text-zinc-400 font-mono italic">{v.phonetic}</span>
                </div>
                <p className="text-zinc-800 font-medium mb-3">{v.meaning}</p>
                <p className="text-xs text-zinc-500 bg-zinc-50 p-3 rounded-lg border-l-4 border-indigo-200 group-hover:border-zinc-300 transition-all italic">
                  "{v.example}"
                </p>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="analysis" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {content.analysis.map((a, i) => (
              <div key={i} className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100">
                <div className="flex gap-4 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-lg text-zinc-800 font-serif mb-2 leading-relaxed">{a.original}</p>
                    <p className="text-zinc-500 italic mb-4">{a.translation}</p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-zinc-200 text-sm leading-loose whitespace-pre-wrap text-zinc-700">
                  <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold">
                    <Search className="w-4 h-4" /> 语法重点与结构解析
                  </div>
                  {a.analysis}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end pt-8">
        <button 
          onClick={onComplete}
          className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          开始终极练习 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// --- Practice Step ---
function PracticeStep({ content, onComplete }: { content: LessonContent; onComplete: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = content.practice[currentIdx];

  const handleAnswer = (ans: string) => {
    if (isCorrect !== null) return;
    setSelected(ans);
    const correct = ans.toLowerCase() === question.answer.toLowerCase();
    setIsCorrect(correct);
    if (correct) setScore(score + 1);
  };

  const nextQuestion = () => {
    if (currentIdx < content.practice.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelected(null);
      setIsCorrect(null);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <div className="text-center py-12 space-y-8">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Check className="w-12 h-12" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-zinc-900 mb-2">练习完成！</h3>
          <p className="text-zinc-500">
            你本课的得分是 <span className="text-indigo-600 font-bold">{score}/{content.practice.length}</span>
          </p>
        </div>
        <button 
          onClick={onComplete}
          className="px-12 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-xl shadow-indigo-200"
        >
          领取本日成就并结课
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[400px] flex flex-col">
      <div className="flex justify-between items-center mb-10">
        <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Question {currentIdx + 1} of {content.practice.length}</span>
        <div className="w-32 h-2 bg-zinc-100 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-500 transition-all" style={{ width: `${((currentIdx + 1) / content.practice.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 space-y-8">
        <h3 className="text-xl font-bold text-zinc-800 leading-relaxed font-serif">
          {question.question}
        </h3>

        {question.type === 'multiple-choice' ? (
          <div className="grid grid-cols-1 gap-3">
            {question.options?.map((opt, idx) => {
              const isOptionCorrect = opt.toLowerCase() === question.answer.toLowerCase();
              const isSelected = selected === opt;
              
              let style = "bg-white border-zinc-200 hover:border-indigo-300 transform transition-all active:scale-95";
              if (selected) {
                 if (isOptionCorrect) style = "bg-emerald-50 border-emerald-500 text-emerald-700 ring-4 ring-emerald-50";
                 else if (isSelected) style = "bg-rose-50 border-rose-500 text-rose-700 ring-4 ring-rose-50";
                 else style = "bg-white border-zinc-100 opacity-50";
              }

              return (
                <button 
                  key={idx}
                  disabled={!!selected}
                  onClick={() => handleAnswer(opt)}
                  className={`p-5 rounded-2xl border text-left font-medium flex items-center justify-between group ${style}`}
                >
                  {opt}
                  {selected && isOptionCorrect && <Check className="w-5 h-5 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="请输入答案..."
              className="w-full p-5 rounded-2xl border border-zinc-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-lg font-serif"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !selected) {
                  handleAnswer((e.target as HTMLInputElement).value);
                }
              }}
              disabled={!!selected}
              autoFocus
            />
            {!selected && (
              <p className="text-xs text-zinc-400 italic">按 Enter 键提交答案</p>
            )}
          </div>
        )}

        <AnimatePresence>
          {selected && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-2xl border ${isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-rose-50/50 border-rose-100'}`}
            >
              <div className="flex items-center gap-2 font-bold mb-2">
                {isCorrect ? (
                  <><Check className="w-5 h-5 text-emerald-600" /><span className="text-emerald-700">回答正确！</span></>
                ) : (
                  <><HelpCircle className="w-5 h-5 text-rose-600" /><span className="text-rose-700">需要再努力，正确答案是: {question.answer}</span></>
                )}
              </div>
              <p className="text-zinc-600 text-sm leading-loose">{question.explanation}</p>
              
              <button 
                onClick={nextQuestion}
                className="mt-6 flex items-center gap-2 ml-auto text-indigo-600 font-bold hover:gap-3 transition-all"
              >
                {currentIdx < content.practice.length - 1 ? '下一题' : '查看结果'} <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
