import { Segment, ValidationResult } from "./types";
import { isValidYouTubeUrl, isValidTimeFormat, timeToSeconds } from "./youtube";

const MIN_SEGMENTS = 1;
const MAX_SEGMENTS = 10;
const MAX_TOTAL_DURATION = 20 * 60; // 20 minutes in seconds
const MIN_SEGMENT_DURATION = 1; // 1 second

export function validateSegment(segment: Segment): string[] {
  const errors: string[] = [];

  // Validate URL
  if (!segment.url || !isValidYouTubeUrl(segment.url)) {
    errors.push("Invalid YouTube URL");
  }

  // Validate time format
  if (!isValidTimeFormat(segment.startTime)) {
    errors.push("Invalid start time format. Use HH:MM:SS, MM:SS, or SS");
  }

  if (!isValidTimeFormat(segment.endTime)) {
    errors.push("Invalid end time format. Use HH:MM:SS, MM:SS, or SS");
  }

  // Validate time logic
  if (isValidTimeFormat(segment.startTime) && isValidTimeFormat(segment.endTime)) {
    try {
      const startSeconds = timeToSeconds(segment.startTime);
      const endSeconds = timeToSeconds(segment.endTime);

      if (startSeconds >= endSeconds) {
        errors.push("Start time must be before end time");
      }

      const duration = endSeconds - startSeconds;
      if (duration < MIN_SEGMENT_DURATION) {
        errors.push(`Segment must be at least ${MIN_SEGMENT_DURATION} second long`);
      }
    } catch (error) {
      errors.push("Error calculating segment duration");
    }
  }

  return errors;
}

export function validateAllSegments(segments: Segment[]): ValidationResult {
  const segmentErrors = new Map<string, string[]>();
  const globalErrors: string[] = [];

  // Check segment count
  if (segments.length < MIN_SEGMENTS) {
    globalErrors.push(`You need at least ${MIN_SEGMENTS} segment`);
  }

  if (segments.length > MAX_SEGMENTS) {
    globalErrors.push(`Maximum ${MAX_SEGMENTS} segments allowed`);
  }

  // Validate each segment
  let totalDuration = 0;
  segments.forEach(segment => {
    const errors = validateSegment(segment);
    if (errors.length > 0) {
      segmentErrors.set(segment.id, errors);
    }

    // Calculate duration for total
    if (isValidTimeFormat(segment.startTime) && isValidTimeFormat(segment.endTime)) {
      try {
        const startSeconds = timeToSeconds(segment.startTime);
        const endSeconds = timeToSeconds(segment.endTime);
        totalDuration += (endSeconds - startSeconds);
      } catch (error) {
        // Skip invalid segments
      }
    }
  });

  // Check total duration
  if (totalDuration > MAX_TOTAL_DURATION) {
    globalErrors.push(`Total duration exceeds ${MAX_TOTAL_DURATION / 60} minutes limit`);
  }

  const isValid = globalErrors.length === 0 && segmentErrors.size === 0;

  return {
    isValid,
    errors: globalErrors,
    segmentErrors,
  };
}
