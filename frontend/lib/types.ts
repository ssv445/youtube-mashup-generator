export interface Segment {
  id: string;
  url: string;
  videoId: string;
  startTime: string; // HH:MM:SS format
  endTime: string;   // HH:MM:SS format
  thumbnail: string;
  verified: boolean;
  validationErrors: string[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  segments: Segment[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  segmentErrors: Map<string, string[]>;
}
