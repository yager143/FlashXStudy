/**
 * Helpers for persisting and retrieving Personal Best records for the Match game mode.
 */

export function getPersonalBest(deckId: string): number | null {
  try {
    const raw = localStorage.getItem(`flashx_match_pb_${deckId}`);
    if (!raw) return null;
    const parsed = parseFloat(raw);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

export function savePersonalBest(deckId: string, seconds: number): { isNewRecord: boolean; best: number } {
  try {
    const rounded = parseFloat(seconds.toFixed(1));
    const current = getPersonalBest(deckId);

    if (current === null || rounded < current) {
      localStorage.setItem(`flashx_match_pb_${deckId}`, rounded.toFixed(1));
      return { isNewRecord: true, best: rounded };
    }

    return { isNewRecord: false, best: current };
  } catch {
    return { isNewRecord: false, best: seconds };
  }
}
