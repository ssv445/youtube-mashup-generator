# YouTube Mashup Generator 🎵

A web application that lets you create custom audio mashups by combining specific time segments from multiple YouTube videos. Perfect for creating song compilations, medleys, or creative audio remixes. Features real-time preview with YouTube's player, intuitive drag-and-drop reordering, and high-quality audio-only downloads.

## Quick Links

- [Features](#features) | [How It Works](#how-it-works) | [Installation](#installation) | [Usage](#usage)
- [Validation Rules](#validation-rules) | [Troubleshooting](#troubleshooting) | [Use Cases](#use-cases)

## Features

- 🎬 **Add YouTube Videos**: Paste any YouTube URL and extract specific time segments
- ⏱️ **Precise Time Control**: Set start/end times in HH:MM:SS format with visual player controls
- 👀 **Real-Time Preview**: Watch and hear exactly how your mashup will sound before generating
- 🔄 **Drag & Drop Reordering**: Easily rearrange segments to perfect your mashup sequence
- 📥 **Import/Export**: Load example mashups or import your own segment configurations as JSON
- 💾 **Multi-Project Support**: Save and manage unlimited mashup projects in your browser
- ✅ **Smart Validation**: Real-time checks ensure all segments are valid before generation
- 🎵 **High-Quality Audio**: Downloads 360p YouTube videos and extracts AAC audio segments
- 🔗 **Seamless Merging**: Automatically concatenates all segments into a single audio file
- 🐳 **Docker-Based Processing**: FFmpeg and yt-dlp run in containers (no local installation needed)

## How It Works

1. **Frontend (Browser)**:
   - Next.js app with YouTube IFrame player for real-time preview
   - Projects and segments stored in browser's local storage
   - Visual controls for selecting video segments
   - Export/Import functionality for sharing configurations

2. **Backend (Node.js API)**:
   - Express.js server handles generation requests
   - Coordinates Docker containers for video processing
   - Manages temporary files and cleanup

3. **Processing (Docker)**:
   - **yt-dlp**: Downloads YouTube videos at 360p quality (includes audio)
   - **FFmpeg**: Extracts audio segments and merges them seamlessly
   - Videos are cached to speed up repeated use of the same source

4. **Workflow**:
   ```
   YouTube URLs → Download Videos → Extract Audio Segments → Merge → Download .m4a
   ```

## Architecture

- **Frontend**: Next.js 15, React 19, Tailwind CSS, YouTube IFrame API
- **Backend**: Express.js API server with Docker integration
- **Processing**: FFmpeg and yt-dlp in isolated Docker containers
- **Storage**: Browser LocalStorage (projects) + File system (media cache)

## Prerequisites

- **Node.js**: v16 or newer
- **Docker**: With Docker Compose support
- **npm**: Comes with Node.js

## Installation

1. **Clone the repository** (or you're already here!)

2. **Install all dependencies**:
   ```bash
   npm run install:all
   ```

   This will install dependencies for:
   - Root package (concurrently)
   - Frontend (Next.js + React + dependencies)
   - Backend (Express + dependencies)

3. **Start Docker containers**:
   ```bash
   npm run docker:up
   ```

   Or manually:
   ```bash
   docker compose up -d
   ```

## Development

Start both frontend and backend servers:

```bash
npm run dev
```

This will:
- Start Next.js frontend on http://localhost:3031
- Start Express backend on http://localhost:3032
- Ensure Docker containers are running

### Individual Services

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Docker containers
npm run docker:up
npm run docker:down
npm run docker:logs
```

## Usage

### Quick Start with Example

1. **Open the app**: Navigate to http://localhost:3031
2. **Import Example**: Click "Import Example Mashup" to load 7 pre-configured music segments
3. **Preview**: Click "Play All Segments" to hear the mashup
4. **Generate**: Click "Generate & Download" to create your audio file

### Creating Your Own Mashup

1. **Add YouTube videos**:
   - Paste any YouTube URL (e.g., `https://www.youtube.com/watch?v=VIDEO_ID`)
   - Click "Add" or press Enter
   - Video thumbnail and title will appear

2. **Set time ranges**:
   - Enter start time (e.g., `00:00:30` for 30 seconds)
   - Enter end time (e.g., `00:01:15` for 1 minute 15 seconds)
   - Or use the player controls to set times visually

3. **Preview your mashup**:
   - Click on any segment to preview that specific part
   - Click "Play All Segments" to watch the full sequence
   - Segments automatically advance to the next one

4. **Reorder segments**:
   - Drag and drop segment cards to rearrange them
   - Your mashup will play in the new order

5. **Generate audio file**:
   - The "Generate & Download" button activates when all segments are valid
   - Click to start processing (takes 1-2 minutes depending on total length)
   - Progress is shown during download, cutting, and merging
   - Audio file (`mashup_[timestamp].m4a`) downloads automatically when ready

6. **Manage projects**:
   - Use the project dropdown to switch between mashups
   - Create new projects with the "+" button
   - Rename, duplicate, or delete projects
   - All projects auto-save to your browser's local storage
   - Export segments as JSON for backup or sharing
   - Import JSON files to load saved configurations

## Validation Rules

The app enforces the following rules to ensure successful mashup generation:

- **Segment Count**: Minimum 1 segment, maximum 10 segments per mashup
- **Total Duration**: Combined length of all segments must be ≤ 20 minutes
- **Time Format**: Supports `HH:MM:SS`, `MM:SS`, or `SS` (e.g., `01:30:45`, `90:45`, or `30`)
- **Segment Length**: Each segment must be at least 1 second long
- **Time Logic**: Start time must be before end time for each segment
- **URL Format**: Must be a valid YouTube URL (supports `youtube.com/watch?v=` and `youtu.be/` formats)
- **Preview Verification**: All segments should play successfully in the preview player

The "Generate & Download" button is disabled until all validation rules pass.

## File Structure

```
video-gen/
├── frontend/                 # Next.js application
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   └── lib/                 # Utilities and types
├── backend/                 # Express API server
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   └── utils/              # Helper functions
├── media/                   # Shared media directory
│   ├── .youtube_cache/     # Downloaded videos
│   ├── .temp_segments/     # Temporary audio segments
│   └── output/             # Generated audio files
├── docker-compose.yml       # Docker services config
└── package.json            # Root scripts
```

## API Endpoints

### Backend API (http://localhost:3032)

- `POST /api/generate` - Generate audio from segments
- `GET /api/status` - Check API and Docker status
- `GET /health` - Health check

## Environment Variables

Create `.env.local` in the frontend directory (optional):

```env
NEXT_PUBLIC_API_URL=http://localhost:3032
```

## Troubleshooting

### Docker containers not running

```bash
npm run docker:up
```

Check status:
```bash
docker compose ps
```

### Port already in use

- Frontend (3000): Stop other Next.js apps or change port in `frontend/package.json`
- Backend (3001): Change `PORT` in `backend/server.js`

### Generation fails

1. Check Docker containers are running:
   ```bash
   docker compose ps
   ```

2. Check Docker logs:
   ```bash
   npm run docker:logs
   ```

3. Verify media directories exist:
   ```bash
   ls -la media/
   ```

### Videos won't download

- Check internet connection
- Verify YouTube URL is correct
- Some videos may be region-locked or private

## Output Format

Your generated mashup will be downloaded as:

- **Format**: M4A (MPEG-4 Audio)
- **Audio Codec**: AAC (Advanced Audio Coding)
- **Source Quality**: Extracted from 360p YouTube videos (format 18)
- **Bitrate**: Depends on source video quality
- **Filename**: `mashup_[timestamp].m4a` (e.g., `mashup_1700000000000.m4a`)
- **Compatibility**: Plays on all modern devices and media players

The audio is extracted using FFmpeg's `-c copy` method, which preserves the original quality without re-encoding.

## Cleanup

Generated audio files are automatically deleted after 24 hours. To manually clean up:

```bash
rm -rf media/output/*
rm -rf media/.temp_segments/*
```

Cache is persistent (speeds up re-using same videos):
```bash
# Only if you want to clear cache
rm -rf media/.youtube_cache/*
```

## Use Cases

- **Music Mashups**: Combine choruses from different songs
- **Medleys**: Create smooth transitions between your favorite tracks
- **Compilations**: Build "best of" collections from music videos
- **Creative Remixes**: Mix and match segments for unique compositions
- **Study/Practice**: Extract and loop specific musical passages
- **Entertainment**: Create humorous or themed audio compilations

## Future Enhancements

- Higher quality audio extraction (720p, 1080p sources)
- Video output with visualizations
- Audio crossfade transitions between segments
- Volume normalization and adjustment per segment
- Audio effects (reverb, echo, pitch shift)
- User accounts with cloud storage
- Share mashups via public URLs
- Collaborative editing
- Template library with pre-made mashup ideas

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, YouTube IFrame API, @dnd-kit
- **Backend**: Express.js, Node.js
- **Processing**: FFmpeg, yt-dlp (in Docker)
- **Storage**: Local Storage API (browser), File system (server)

## License

ISC

## JSON Import/Export Format

You can export and import mashup configurations using JSON files. Here's the format:

```json
[
  {
    "url": "https://www.youtube.com/watch?v=VIDEO_ID",
    "startTime": "00:00:19",
    "endTime": "00:01:40"
  },
  {
    "url": "https://youtu.be/VIDEO_ID",
    "startTime": "00:01:30",
    "endTime": "00:01:56"
  }
]
```

Each segment requires:
- `url`: Full YouTube URL (any format)
- `startTime`: Start timestamp in HH:MM:SS format
- `endTime`: End timestamp in HH:MM:SS format

See `example_mashup.json` for a complete example with 7 music segments.

## Credits

Built with Claude Code following modern web development best practices.

## Contributing

Feel free to open issues or submit pull requests for bug fixes, feature requests, or improvements!

## Support

If you encounter any issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Docker container logs: `npm run docker:logs`
3. Verify all prerequisites are installed correctly
4. Open an issue on GitHub with details about your environment
