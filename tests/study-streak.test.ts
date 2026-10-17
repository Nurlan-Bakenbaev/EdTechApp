import { describe, expect, it } from "vitest";
import {
  getCurrentStudyStreak,
  getLocalDateKey,
  getNextStudyStreak,
  getRussianDayUnit,
} from "@/lib/study-streak";

describe("study streak", () => {
  const today = new Date(2026, 9, 17, 12);
  const todayKey = getLocalDateKey(today);
  const yesterdayKey = getLocalDateKey(new Date(2026, 9, 16, 12));

  it("starts a streak on the first completed lesson and keeps same-day completions unchanged", () => {
    expect(getNextStudyStreak(0, null, today)).toBe(1);
    expect(getNextStudyStreak(3, todayKey, today)).toBe(3);
  });

  it("continues only on the day after the previous study date", () => {
    expect(getNextStudyStreak(3, yesterdayKey, today)).toBe(4);
    expect(getNextStudyStreak(3, "2026-10-15", today)).toBe(1);
    expect(getCurrentStudyStreak(3, "2026-10-15", today)).toBe(0);
  });

  it("keeps the displayed streak active for today and yesterday only", () => {
    expect(getCurrentStudyStreak(2, todayKey, today)).toBe(2);
    expect(getCurrentStudyStreak(2, yesterdayKey, today)).toBe(2);
    expect(getCurrentStudyStreak(0, null, today)).toBe(0);
  });

  it("uses the correct Russian day form", () => {
    expect(getRussianDayUnit(1)).toBe("день");
    expect(getRussianDayUnit(2)).toBe("дня");
    expect(getRussianDayUnit(5)).toBe("дней");
    expect(getRussianDayUnit(11)).toBe("дней");
    expect(getRussianDayUnit(21)).toBe("день");
  });
});
