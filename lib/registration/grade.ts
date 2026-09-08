/**
 * An attendee is either in a school year or is the youth leader bringing the
 * group. One select on the form covers both, because to the person filling
 * it in they answer the same question — but they're stored as two columns,
 * since "which year" and "is a leader" are different facts and the admin
 * monitor filters and counts on each.
 */

export const YOUTH_LEADER = "youth_leader";

export const SCHOOL_GRADES = [7, 8, 9, 10, 11, 12] as const;

/** The values the form's select can hold, in the order they're offered. */
export const GRADE_CHOICES = [
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  YOUTH_LEADER,
] as const;

export type GradeChoice = (typeof GRADE_CHOICES)[number];

export type AttendeeRole = "student" | typeof YOUTH_LEADER;

/** One attendee's year/role, however it was read back from the database. */
export type GradeLike = {
  grade: number | null;
  role?: AttendeeRole | string | null;
};

/** Splits the single select value into the two columns it's stored as. */
export function toGradeColumns(choice: GradeChoice): {
  grade: number | null;
  role: AttendeeRole;
} {
  return choice === YOUTH_LEADER
    ? { grade: null, role: YOUTH_LEADER }
    : { grade: Number(choice), role: "student" };
}

export function isYouthLeader(row: GradeLike): boolean {
  // A null grade can only mean a leader — every student picks a year — so
  // rows written before `role` existed still read correctly.
  return row.role === YOUTH_LEADER || row.grade === null;
}

/** "10-р анги" or "Өсвөрийн ахлагч". */
export function formatGrade(row: GradeLike): string {
  return isYouthLeader(row) ? "Өсвөрийн ахлагч" : `${row.grade}-р анги`;
}

/** Short form for dense table cells: "10-р" or "Ахлагч". */
export function formatGradeShort(row: GradeLike): string {
  return isYouthLeader(row) ? "Ахлагч" : `${row.grade}-р`;
}

/** The label for one option of the form's select. */
export function gradeChoiceLabel(choice: GradeChoice): string {
  return choice === YOUTH_LEADER ? "Өсвөрийн ахлагч" : `${choice}-р анги`;
}

/** Sorts leaders after year 12 rather than before year 7. */
export function gradeSortValue(row: GradeLike): number {
  return isYouthLeader(row) ? Number.MAX_SAFE_INTEGER : (row.grade ?? 0);
}
