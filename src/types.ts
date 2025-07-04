
export interface Participant {
  id: string; // Could be index or a generated ID
  name: string;
}

export interface Prize {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface WinnerRecord {
  id: string;
  winnerName: string;
  prize: Prize | null;
  drawTime: Date;
}

// For simplicity, we'll mostly work with string[] for participant names.
// The Participant interface above is a suggestion for more complex scenarios.
