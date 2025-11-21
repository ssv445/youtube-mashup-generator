const fs = require('fs-extra');
const path = require('path');

/**
 * Schedules file deletion after specified time (in milliseconds)
 */
function scheduleCleanup(filePath, delayMs = 24 * 60 * 60 * 1000) { // 24 hours default
  setTimeout(async () => {
    try {
      await fs.remove(filePath);
      console.log(`✅ Cleaned up: ${filePath}`);
    } catch (error) {
      console.error(`❌ Failed to cleanup ${filePath}:`, error.message);
    }
  }, delayMs);
}

/**
 * Cleans up old files in a directory older than specified age
 */
async function cleanupOldFiles(directory, maxAgeMs = 24 * 60 * 60 * 1000) {
  try {
    const files = await fs.readdir(directory);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtimeMs > maxAgeMs) {
        await fs.remove(filePath);
        console.log(`✅ Cleaned up old file: ${file}`);
      }
    }
  } catch (error) {
    console.error(`❌ Error cleaning up directory ${directory}:`, error.message);
  }
}

module.exports = {
  scheduleCleanup,
  cleanupOldFiles,
};
