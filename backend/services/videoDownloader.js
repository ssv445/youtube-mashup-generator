const { dockerExec } = require('../utils/docker');
const fs = require('fs-extra');
const path = require('path');

/**
 * Extracts YouTube Video ID from URL
 */
function getYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Downloads a YouTube video in 360p format
 * Returns the path to the downloaded file
 */
async function downloadVideo(url, cacheDir, onProgress) {
  const videoId = getYouTubeId(url);
  if (!videoId) {
    throw new Error(`Invalid YouTube URL: ${url}`);
  }

  const videoFileName = `${videoId}.360p.mp4`;
  const videoFilePath = path.join(cacheDir, videoFileName);

  // Check if already cached
  if (await fs.pathExists(videoFilePath)) {
    onProgress(`Video ${videoId} already in cache`);
    return videoFilePath;
  }

  onProgress(`Downloading video ${videoId}...`);

  const ytdlpCmd = `yt-dlp -f 18 --output "/workdir/.youtube_cache/${videoFileName}" "${url}"`;

  try {
    await dockerExec('ytdlp', ytdlpCmd);
    onProgress(`✅ Downloaded ${videoId}`);
    return videoFilePath;
  } catch (error) {
    throw new Error(`Failed to download ${url}: ${error.message}`);
  }
}

module.exports = {
  getYouTubeId,
  downloadVideo,
};
