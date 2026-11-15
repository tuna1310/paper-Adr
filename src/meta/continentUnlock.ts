export interface ContinentProgressSnapshot {
  completed: number;
  total: number;
  isCompleted: boolean;
}

/**
 * Kiểm tra một châu lục đã được mở khóa theo tiến trình khu vực tuần tự hay chưa.
 * Không dùng cờ bỏ qua mở khóa (`|| true`).
 */
export function isContinentUnlocked(
  continentIndex: number,
  currentProgress: ContinentProgressSnapshot,
  previousProgress: ContinentProgressSnapshot | null,
  unlockedByDefault = false
): boolean {
  if (continentIndex <= 0 || unlockedByDefault) return true;
  if (currentProgress.completed > 0) return true;
  if (!previousProgress) return false;
  const requiredCompleted = Math.min(3, Math.max(1, previousProgress.total));
  return previousProgress.completed >= requiredCompleted || previousProgress.isCompleted;
}
