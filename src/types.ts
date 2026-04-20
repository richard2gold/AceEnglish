/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StudyStep = 'listening' | 'reading' | 'research' | 'practice';

export interface Vocabulary {
  word: string;
  phonetic: string;
  meaning: string;
  example: string;
}

export interface SentenceAnalysis {
  original: string;
  translation: string;
  analysis: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  type: 'multiple-choice' | 'fill-in-blank';
}

export interface LessonContent {
  id: number;
  title: string;
  topic: string;
  contentEn: string;
  contentCn: string;
  vocabulary: Vocabulary[];
  analysis: SentenceAnalysis[];
  practice: PracticeQuestion[];
}

export interface UserProgress {
  completedLessonIds: number[];
  currentLessonId: number;
}
