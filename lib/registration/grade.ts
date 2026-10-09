/**
 * An attendee is either in a school year or comes in a role — the youth
 * leader bringing the group, or the praise team. One select on the form
 * covers all of it, because to the person filling it in they answer the same
 * question — but they're stored as two columns, since "which year" and "what
 * role" are different facts and the admin monitor filters and counts on each.
 */

export const YOUTH_LEADER = "youth_leader";
export const PRAISE_TEAM = "praise_team";

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
  PRAISE_TEAM,
] as const;

export type GradeChoice = (typeof GRADE_CHOICES)[number];

export type NonStudentRole = typeof YOUTH_LEADER | typeof PRAISE_TEAM;

export type AttendeeRole = "student" | NonStudentRole;

const ROLE_LABELS: Record<NonStudentRole, { full: string; short: string }> = {
  [YOUTH_LEADER]: { full: "Өсвөрийн ахлагч", short: "Ахлагч" },
  [PRAISE_TEAM]: { full: "Магтаалын баг", short: "Магтаал" },
};

/** One attendee's year/role, however it was read back from the database. */
export type GradeLike = {
  grade: number | null;
  role?: AttendeeRole | string | null;
};

export function isNonStudentRole(value: unknown): value is NonStudentRole {
  return value === YOUTH_LEADER || value === PRAISE_TEAM;
}

/** Splits the single select value into the two columns it's stored as. */
export function toGradeColumns(choice: GradeChoice): {
  grade: number | null;
  role: AttendeeRole;
} {
  return isNonStudentRole(choice)
    ? { grade: null, role: choice }
    : { grade: Number(choice), role: "student" };
}

/** The role a row is in, or null for a student. */
export function nonStudentRole(row: GradeLike): NonStudentRole | null {
  if (isNonStudentRole(row.role)) return row.role;
  // A null grade with no role can only mean a leader — every student picks a
  // year — so rows written before `role` existed still read correctly.
  return row.grade === null ? YOUTH_LEADER : null;
}

export function isYouthLeader(row: GradeLike): boolean {
  return nonStudentRole(row) === YOUTH_LEADER;
}

/** Back from the two stored columns to the single value the form offers. */
export function toGradeChoice(row: GradeLike): GradeChoice {
  return nonStudentRole(row) ?? (String(row.grade) as GradeChoice);
}

/** "10-р анги", "Өсвөрийн ахлагч" or "Магтаалын баг". */
export function formatGrade(row: GradeLike): string {
  const role = nonStudentRole(row);
  return role ? ROLE_LABELS[role].full : `${row.grade}-р анги`;
}

/** Short form for dense table cells: "10-р", "Ахлагч" or "Магтаал". */
export function formatGradeShort(row: GradeLike): string {
  const role = nonStudentRole(row);
  return role ? ROLE_LABELS[role].short : `${row.grade}-р`;
}

/** The label for one option of the form's select. */
export function gradeChoiceLabel(choice: GradeChoice): string {
  return isNonStudentRole(choice) ? ROLE_LABELS[choice].full : `${choice}-р анги`;
}

/** Sorts roles after year 12 rather than before year 7. */
export function gradeSortValue(row: GradeLike): number {
  const role = nonStudentRole(row);
  if (!role) return row.grade ?? 0;
  return Number.MAX_SAFE_INTEGER - (role === YOUTH_LEADER ? 1 : 0);
}
