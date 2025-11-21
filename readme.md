# YouTube Parody Song Generator 🎵

A web application that lets you create parody songs by stitching together segments from multiple YouTube videos. Features real-time preview, drag-and-drop segment reordering, and audio-only output generation.

## Features

- 🎬 **Add YouTube Videos**: Paste URLs one at a time with thumbnail previews
- ⏱️ **Precise Time Control**: Set start/end times manually or with visual controls
- 👀 **Real-Time Preview**: Watch your parody come together using YouTube's player
- 🔄 **Drag & Drop**: Easily reorder segments
- 💾 **Multi-Project Support**: Save and manage multiple parody projects locally
- ✅ **Client-Side Validation**: Real-time validation ensures everything is correct
- 🎵 **Audio Generation**: Generate and download audio-only files
- 🐳 **Docker-Based**: FFmpeg and yt-dlp run in containers (no local installation needed)

## Architecture

- **Frontend**: Next.js 15 with React, Tailwind CSS, YouTube IFrame API
- **Backend**: Express.js API server with Docker integration
- **Processing**: FFmpeg and yt-dlp running in Docker containers

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

1. **Open the app**: Navigate to http://localhost:3031

2. **Add YouTube videos**:
   - Paste a YouTube URL
   - Click "Add" or press Enter
   - Set start and end times for each segment

3. **Preview your parody**:
   - Click on any segment to preview it
   - Use "Play All Segments" to watch the full sequence
   - Segments auto-advance when they finish

4. **Reorder segments**:
   - Drag and drop segments to rearrange them

5. **Generate audio**:
   - Once all segments are verified and valid
   - Click "Generate & Download"
   - Wait for processing (progress shown)
   - Audio file downloads automatically

6. **Manage projects**:
   - Use the project selector dropdown
   - Create new projects
   - Rename, duplicate, or delete projects
   - All saved locally in your browser

## Validation Rules

- **Segments**: Minimum 1, maximum 10
- **Duration**: Total must be ≤ 20 minutes
- **Time Format**: HH:MM:SS, MM:SS, or SS
- **Segment Length**: Minimum 1 second
- **Verification**: All segments must play successfully in preview

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

- **Container**: MP4 (M4A)
- **Audio Codec**: AAC
- **Quality**: Extracted from 360p YouTube videos
- **Filename**: `parody_[timestamp].m4a`

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

## Future Enhancements

- Higher quality options (720p, 1080p)
- Video output with visualizations
- Fade transitions between segments
- Volume adjustment per segment
- User accounts with cloud storage
- Share parodies via URL

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, YouTube IFrame API, @dnd-kit
- **Backend**: Express.js, Node.js
- **Processing**: FFmpeg, yt-dlp (in Docker)
- **Storage**: Local Storage API (browser), File system (server)

## License

ISC

## Credits

Built with Claude Code following the spec.md requirements.
