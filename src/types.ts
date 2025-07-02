
export interface Participant {
  id: string; // Could be index or a generated ID
  name: string;
}

// For simplicity, we'll mostly work with string[] for participant names.
// The Participant interface above is a suggestion for more complex scenarios.

export interface Prize {
  id: string;
  name: string;
  imageUrl?: string; // Optional image URL
}

export interface Draw {
  id: string;
  prizeName: string;
  prizeImageUrl?: string; // Store a copy, in case prize is deleted/modified later
  winners: string[];
  timestamp: Date;
}
