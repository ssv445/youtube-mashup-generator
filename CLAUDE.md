# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**yt-video-stitcher** is a Node.js CLI tool that downloads YouTube videos, extracts specific segments, and merges them into a single output file. It uses Docker containers for FFmpeg and yt-dlp to avoid local system dependency installation.

## Architecture

### Docker-Based Execution Model

The tool uses a unique hybrid architecture:
- **Host**: Node.js script (`video-processor.js`) orchestrates the workflow
- **Containers**: FFmpeg and yt-dlp run in Docker containers via `docker compose exec`
- **Shared Volume**: `./media` directory is mounted to `/workdir` in both containers

### Key Components

1. **video-processor.js** (main entry point)
   - Command-line argument parsing with yargs
   - YouTube video ID extraction
   - Cache management (avoids re-downloading videos)
   - Segment cutting and merging coordination
   - Error handling and validation

2. **docker-compose.yml**
   - `ffmpeg` service: Uses `jrottenberg/ffmpeg:4.4-alpine`
   - `ytdlp` service: Uses `python:3.11-alpine` with yt-dlp installed on startup
   - Both services kept alive with `tail -f` for exec commands

3. **Directory Structure**
   - `./media/.youtube_cache/`: Original full video downloads (cached by video ID)
   - `./media/.temp_segments/`: Temporary cut segments (cleared after merge)
   - `./media/`: Final output videos

### Workflow

1. **Dependency Check**: Verify FFmpeg and yt-dlp are accessible via Docker
2. **Video Download**: Download 360p MP4 (format 18) from YouTube using yt-dlp
3. **Segment Extraction**: Cut specified time ranges using FFmpeg with `-c copy` (no re-encoding)
4. **Merge Segments**: Use FFmpeg concat demuxer to join segments
5. **Cleanup**: Remove temporary files (unless `--verbose` flag is set)

## Development Commands

### Running the Tool

```bash
# Process videos from input JSON
./video-processor.js --input input.json --output final_compilation.mp4

# With custom cache/temp directories
./video-processor.js -i input.json -o output.mp4 --cache-dir ./custom_cache --temp-dir ./custom_temp

# Verbose mode (keeps temp files for debugging)
./video-processor.js -i input.json -o output.mp4 --verbose
```

### Docker Container Management

```bash
# Start Docker containers
docker compose up -d

# Stop containers
docker compose down

# View container logs
docker compose logs ffmpeg
docker compose logs ytdlp

# Test FFmpeg directly
docker compose exec ffmpeg ffmpeg -version

# Test yt-dlp directly
docker compose exec ytdlp yt-dlp --version
```

### Installation

```bash
# Install dependencies
npm install

# Make script executable (Linux/macOS)
chmod +x video-processor.js
```

## Input JSON Format

The tool expects a JSON array with video segment specifications:

```json
[
  {
    "url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "startTime": "00:00:00",
    "endTime": "00:01:09"
  }
]
```

**Time Format**: `HH:MM:SS`, `MM:SS`, or `SS`

## Important Implementation Details

### Path Translation

The script translates host paths to container paths:
- Host: `./media/.youtube_cache/VIDEO_ID.360p.mp4`
- Container: `/workdir/.youtube_cache/VIDEO_ID.360p.mp4`

All FFmpeg and yt-dlp commands must use container paths (`/workdir/...`).

### Video Format Strategy

- Downloads **360p MP4 (format 18)** with audio included
- Uses `-c copy` for segment cutting (fast, no quality loss)
- Output uses AAC audio codec during merge

### Caching Mechanism

Videos are cached by YouTube ID as `{VIDEO_ID}.360p.mp4` to prevent re-downloading when processing multiple segments from the same video.

### Error Handling

- Skips individual videos/segments on error (doesn't fail entire batch)
- Validates JSON structure before processing
- Checks for FFmpeg/yt-dlp accessibility at startup
- Provides detailed error messages with `--verbose` flag

## System Requirements

- **Node.js**: v16 or newer
- **Docker**: With Docker Compose support
- **System**: Must support running Docker containers

Note: FFmpeg and yt-dlp do NOT need to be installed on the host system - they run entirely within Docker containers.
