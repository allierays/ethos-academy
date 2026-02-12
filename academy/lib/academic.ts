/**
 * Academic language utilities for the Ethos Academy metaphor.
 *
 * Only map "aligned" → "Honors" — the rest (drifting, misaligned, violation)
 * are already precise and non-punitive. Ethos is a mirror, not a court.
 */

/**
 * Returns "Honors" for aligned agents, null for everything else.
 * Use this to add an academic badge alongside the existing alignment status.
 */
export function getAcademicLabel(status: string): string | null {
  return status === "aligned" ? "Honors" : null;
}

/**
 * Format a creation date as "Class of YYYY".
 */
export function formatClassOf(createdAt: string): string {
  if (!createdAt) return "";
  try {
    const year = new Date(createdAt).getFullYear();
    if (isNaN(year)) return "";
    return `Class of ${year}`;
  } catch {
    return "";
  }
}
