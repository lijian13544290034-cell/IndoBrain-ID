export type MandarinWorkDaySelection = {
  selectedDay: number;
  restoredFromProfile: boolean;
};

function clampLevelOneDay(day: number) {
  return Math.min(30, Math.max(1, Math.trunc(day || 1)));
}

export function createMandarinWorkDaySelection(): MandarinWorkDaySelection {
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
