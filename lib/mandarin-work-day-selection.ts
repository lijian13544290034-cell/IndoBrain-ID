export type MandarinWorkDaySelection = {
  selectedDay: number;
  restoredFromProfile: boolean;
};

function clampLevelOneDay(day: number) {
  return Math.min(30, Math.max(1, Math.trunc(day || 1)));
}

export function parseMandarinWorkDayParam(value: string | string[] | undefined): number | null {
  if (typeof value !== 'string' || !/^\d{1,2}$/u.test(value)) return null;
  const day = Number(value);
  return Number.isInteger(day) && day >= 1 && day <= 30 ? day : null;
}

export function createMandarinWorkDaySelection(initialDay: number | null = null): MandarinWorkDaySelection {
  if (initialDay != null && Number.isInteger(initialDay) && initialDay >= 1 && initialDay <= 30) {
    return { selectedDay: initialDay, restoredFromProfile: true };
  }
  return { selectedDay: 1, restoredFromProfile: false };
}

export function restoreMandarinWorkDay(selection: MandarinWorkDaySelection, savedCurrentDay: number): MandarinWorkDaySelection {
  if (selection.restoredFromProfile) return selection;
  return { selectedDay: clampLevelOneDay(savedCurrentDay), restoredFromProfile: true };
}

export function selectMandarinWorkDay(selection: MandarinWorkDaySelection, day: number): MandarinWorkDaySelection {
  const selectedDay = clampLevelOneDay(day);
  if (selection.restoredFromProfile && selection.selectedDay === selectedDay) return selection;
  return { selectedDay, restoredFromProfile: true };
}
