const { dockerExec } = require('../utils/docker');
const fs = require('fs-extra');
const path = require('path');

/**
 * Converts time string to seconds
 */
function timeToSeconds(timeStr) {
  const parts = timeStr.split(':').map(Number);

  if (parts.length === 3) { // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) { // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) { // SS
    return parts[0];
  }

  throw new Error(`Invalid time format: ${timeStr}`);
}

/**
 * Calculates duration between two timestamps
 */
function calculateDuration(startTime, endTime) {
  const startSeconds = timeToSeconds(startTime);
  const endSeconds = timeToSeconds(endTime);

  if (endSeconds <= startSeconds) {
    throw new Error(`End time (${endTime}) must be after start time (${startTime})`);
  }

  return (endSeconds - startSeconds).toString();
}

/**
 * Extracts audio segment from a video file
 */
async function extractAudioSegment(videoPath, startTime, endTime, outputPath, onProgress) {
  const duration = calculateDuration(startTime, endTime);

  onProgress(`Extracting audio segment: ${startTime} to ${endTime}`);

  // Convert host paths to container paths
  const videoPathContainer = videoPath.replace(/.*media/, '/workdir');
  const outputPathContainer = outputPath.replace(/.*media/, '/workdir');

  const ffmpegCmd = `ffmpeg -y -ss ${startTime} -i "${videoPathContainer}" -t ${duration} -vn -acodec copy "${outputPathContainer}"`;

  try {
    await dockerExec('ffmpeg', ffmpegCmd);
    onProgress(`✅ Extracted audio segment`);
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to extract audio: ${error.message}`);
  }
}

/**
 * Merges multiple audio files into one
 */
async function mergeAudioFiles(audioPaths, outputPath, tempDir, onProgress) {
  onProgress(`Merging ${audioPaths.length} audio segments...`);

  // Create concat list file
  const concatListPath = path.join(tempDir, 'concat_list.txt');
  const concatListContent = audioPaths.map(p => `file '${path.basename(p)}'`).join('\n');
  await fs.writeFile(concatListPath, concatListContent);

  // Convert to container path
  const concatListPathContainer = concatListPath.replace(/.*media/, '/workdir');
  const outputPathContainer = outputPath.replace(/.*media/, '/workdir');

  const mergeCmd = `ffmpeg -y -f concat -safe 0 -i "${concatListPathContainer}" -c copy "${outputPathContainer}"`;

  try {
    await dockerExec('ffmpeg', mergeCmd);
    onProgress(`✅ Merged all audio segments`);
    return outputPath;
  } catch (error) {
    throw new Error(`Failed to merge audio: ${error.message}`);
  }
}

module.exports = {
  extractAudioSegment,
  mergeAudioFiles,
  timeToSeconds,
  calculateDuration,
};
