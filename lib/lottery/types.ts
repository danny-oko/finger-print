export type LotteryWinner = {
  id: string;
  attendeeId: string;
  ticketCode: string;
  fullName: string;
  churchName: string;
  prize: string | null;
  drawnAt: string;
};

export type LotteryState = {
  /** Everyone checked in at the door with a paid ticket. */
  checkedIn: number;
  /** Of those, the ones who can still win — who the next draw picks from. */
  pool: number;
  /** Newest first. */
  winners: LotteryWinner[];
};

export type DrawResponse = { winner: LotteryWinner; state: LotteryState };

export const PRIZE_MAX_LENGTH = 60;
