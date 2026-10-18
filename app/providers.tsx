"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getLocalDateKey, getNextStudyStreak, isDateKey } from "@/lib/study-streak";

export type Language = "ru" | "ky";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface ProgressState {
  completed: string[];
  lastLesson: string;
  xp: number;
  studyStreak: number;
  lastStudyDate: string | null;
  lessonCheckpoints: Record<string, LessonCheckpoint>;
}

export interface LessonCheckpoint {
  phase: "A" | "B" | "C" | "D" | "result" | "homework";
  practiceIndex: number;
  practiceFailures: number;
  practiceSelection: string;
  practiceCorrect: boolean;
  testRound: number;
  testIndex: number;
  testAnswers: boolean[];
  testSelection: string;
  homeworkDone: number[];
}

const checkpointPhases = new Set<LessonCheckpoint["phase"]>(["A", "B", "C", "D", "result", "homework"]);

function parseLessonCheckpoints(value: unknown): Record<string, LessonCheckpoint> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const checkpoints: Record<string, LessonCheckpoint> = {};
  for (const [lessonId, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
    const item = raw as Partial<LessonCheckpoint>;
    if (
      typeof item.phase !== "string"
      || !checkpointPhases.has(item.phase as LessonCheckpoint["phase"])
      || typeof item.practiceSelection !== "string"
      || typeof item.practiceCorrect !== "boolean"
      || typeof item.testSelection !== "string"
      || !Array.isArray(item.testAnswers)
      || !Array.isArray(item.homeworkDone)
    ) continue;
    checkpoints[lessonId] = {
      phase: item.phase as LessonCheckpoint["phase"],
      practiceIndex: Number.isInteger(item.practiceIndex) && item.practiceIndex! >= 0 ? item.practiceIndex! : 0,
      practiceFailures: Number.isInteger(item.practiceFailures) && item.practiceFailures! >= 0 ? item.practiceFailures! : 0,
      practiceSelection: item.practiceSelection,
      practiceCorrect: item.practiceCorrect,
      testRound: Number.isInteger(item.testRound) && item.testRound! >= 0 ? item.testRound! : 0,
      testIndex: Number.isInteger(item.testIndex) && item.testIndex! >= 0 && item.testIndex! < 10 ? item.testIndex! : 0,
      testAnswers: item.testAnswers.filter((answer): answer is boolean => typeof answer === "boolean").slice(0, 10),
      testSelection: item.testSelection,
      homeworkDone: item.homeworkDone.filter((index): index is number => Number.isInteger(index) && index >= 0 && index < 6),
    };
  }
  return checkpoints;
}

interface ProgressContextValue extends ProgressState {
  ready: boolean;
  completeLesson: (lessonId: string, points?: number) => void;
  setLastLesson: (lessonId: string) => void;
  getLessonCheckpoint: (lessonId: string) => LessonCheckpoint | undefined;
  saveLessonCheckpoint: (lessonId: string, checkpoint: LessonCheckpoint) => void;
  isComplete: (lessonId: string) => boolean;
  resetProgress: () => void;
}

const emptyProgress: ProgressState = {
  completed: [],
  lastLesson: "g1-t01-h1",
  xp: 0,
  studyStreak: 0,
  lastStudyDate: null,
  lessonCheckpoints: {},
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ru");
  const [progress, setProgress] = useState<ProgressState>(emptyProgress);
  const [ready, setReady] = useState(false);
  const checkpointsRef = useRef(progress.lessonCheckpoints);

  useLayoutEffect(() => {
    checkpointsRef.current = progress.lessonCheckpoints;
  }, [progress.lessonCheckpoints]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const storedLanguage = window.localStorage.getItem("bilim-language");
      if (storedLanguage === "ru" || storedLanguage === "ky") setLanguageState(storedLanguage);

      const storedProgress = window.localStorage.getItem("bilim-progress");
      if (storedProgress) {
        try {
          const parsed = JSON.parse(storedProgress) as Partial<ProgressState>;
          setProgress({
            completed: Array.isArray(parsed.completed) ? parsed.completed.filter((item): item is string => typeof item === "string") : [],
            lastLesson: typeof parsed.lastLesson === "string" ? parsed.lastLesson : emptyProgress.lastLesson,
            xp: typeof parsed.xp === "number" ? parsed.xp : 0,
            studyStreak: Number.isInteger(parsed.studyStreak) && parsed.studyStreak! >= 0 ? parsed.studyStreak! : 0,
            lastStudyDate: isDateKey(parsed.lastStudyDate) ? parsed.lastStudyDate : null,
            lessonCheckpoints: parseLessonCheckpoints(parsed.lessonCheckpoints),
          });
        } catch {
          setProgress(emptyProgress);
        }
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem("bilim-progress", JSON.stringify(progress));
  }, [progress, ready]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem("bilim-language", next);
    document.documentElement.lang = next;
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "ru" ? "ky" : "ru");
  }, [language, setLanguage]);

  const completeLesson = useCallback((lessonId: string, points = 60) => {
    setProgress((current) => {
      const now = new Date();
      const today = getLocalDateKey(now);
      const studyStreak = getNextStudyStreak(current.studyStreak, current.lastStudyDate, now);
      if (current.completed.includes(lessonId)) {
        return { ...current, lastLesson: lessonId, studyStreak, lastStudyDate: today };
      }
      return {
        completed: [...current.completed, lessonId],
        lastLesson: lessonId,
        xp: current.xp + points,
        studyStreak,
        lastStudyDate: today,
        lessonCheckpoints: current.lessonCheckpoints,
      };
    });
  }, []);

  const setLastLesson = useCallback((lessonId: string) => {
    setProgress((current) => ({ ...current, lastLesson: lessonId }));
  }, []);

  const getLessonCheckpoint = useCallback((lessonId: string) => checkpointsRef.current[lessonId], []);

  const saveLessonCheckpoint = useCallback((lessonId: string, checkpoint: LessonCheckpoint) => {
    setProgress((current) => ({
      ...current,
      lessonCheckpoints: { ...current.lessonCheckpoints, [lessonId]: checkpoint },
    }));
  }, []);

  const isComplete = useCallback((lessonId: string) => progress.completed.includes(lessonId), [progress.completed]);

  const resetProgress = useCallback(() => setProgress(emptyProgress), []);

  const languageValue = useMemo(() => ({ language, setLanguage, toggleLanguage }), [language, setLanguage, toggleLanguage]);
  const progressValue = useMemo(
    () => ({ ...progress, ready, completeLesson, setLastLesson, getLessonCheckpoint, saveLessonCheckpoint, isComplete, resetProgress }),
    [progress, ready, completeLesson, setLastLesson, getLessonCheckpoint, saveLessonCheckpoint, isComplete, resetProgress],
  );

  return (
    <LanguageContext.Provider value={languageValue}>
      <ProgressContext.Provider value={progressValue}>{children}</ProgressContext.Provider>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage must be used inside AppProviders");
  return value;
}

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext);
  if (!value) throw new Error("useProgress must be used inside AppProviders");
  return value;
}

export function t(language: Language, ru: string, ky: string): string {
  return language === "ru" ? ru : ky;
}
