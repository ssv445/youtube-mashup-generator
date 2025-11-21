# Quick Start Guide 🚀

## Get Started in 3 Steps

### 1. Start the Development Servers

```bash
npm run dev
```

This will:
- Start Frontend on http://localhost:3031
- Start Backend on http://localhost:3032
- Ensure Docker containers are running

### 2. Open the App

Navigate to **http://localhost:3031** in your browser.

### 3. Create Your First Parody Song

1. **Add a YouTube video**: Paste a URL and click Add
2. **Set times**: Adjust start and end times for the segment
3. **Preview**: Click "Play This Segment" to preview
4. **Add more segments**: Repeat steps 1-3
5. **Generate**: Click "Generate & Download" when ready

## What Just Got Built?

### Frontend (http://localhost:3031)
- ✅ Next.js 15 with React 19
- ✅ Tailwind CSS for styling
- ✅ YouTube IFrame API for preview
- ✅ Drag-and-drop segment reordering
- ✅ Local storage for project management
- ✅ Real-time validation

### Backend (http://localhost:3032)
- ✅ Express API server
- ✅ Docker integration for FFmpeg and yt-dlp
- ✅ Video downloading and caching
- ✅ Audio extraction and merging
- ✅ Automatic cleanup (24hr retention)

### Components Built
1. **ProjectSelector** - Manage multiple projects
2. **SegmentList** - Add and organize video segments
3. **SegmentCard** - Individual segment with drag handle
4. **PreviewPlayer** - YouTube player with auto-advance
5. **GenerateButton** - Validation and generation UI

### Backend Services
1. **videoDownloader** - Downloads YouTube videos (360p)
2. **audioProcessor** - Extracts and merges audio
3. **cleanup** - Schedules file deletion
4. **docker** - Executes Docker commands

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Browser   │─────▶│   Next.js   │─────▶│   Express    │
│             │      │   (3031)    │      │    (3032)    │
└─────────────┘      └─────────────┘      └──────┬───────┘
                                                  │
                                                  ▼
                                        ┌──────────────────┐
                                        │  Docker Compose  │
                                        │                  │
                                        │  ┌────────────┐ │
                                        │  │   FFmpeg   │ │
                                        │  └────────────┘ │
                                        │  ┌────────────┐ │
                                        │  │   yt-dlp   │ │
                                        │  └────────────┘ │
                                        └──────────────────┘
```

## Directory Structure

```
video-gen/
├── frontend/              # Next.js app
│   ├── app/
│   │   ├── page.tsx      # Main page
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Global styles
│   ├── components/
│   │   ├── ProjectSelector.tsx
│   │   ├── SegmentList.tsx
│   │   ├── SegmentCard.tsx
│   │   ├── PreviewPlayer.tsx
│   │   └── GenerateButton.tsx
│   └── lib/
│       ├── types.ts      # TypeScript types
│       ├── localStorage.ts
│       ├── youtube.ts    # YouTube utilities
│       └── validation.ts
├── backend/              # Express API
│   ├── server.js        # Main server
│   ├── routes/
│   │   └── generate.js  # Generation endpoint
│   ├── services/
│   │   ├── videoDownloader.js
│   │   ├── audioProcessor.js
│   │   └── cleanup.js
│   └── utils/
│       └── docker.js    # Docker exec wrapper
├── media/               # Shared volume
│   ├── .youtube_cache/  # Downloaded videos
│   ├── .temp_segments/  # Temp audio files
│   └── output/          # Generated audio
└── docker-compose.yml   # FFmpeg + yt-dlp
```

## Available Scripts

```bash
# Development
npm run dev              # Start everything
npm run dev:frontend     # Frontend only
npm run dev:backend      # Backend only

# Docker
npm run docker:up        # Start containers
npm run docker:down      # Stop containers
npm run docker:logs      # View logs

# Installation
npm run install:all      # Install all deps

# Production
npm run build           # Build frontend
npm run start           # Start both servers
```

## API Endpoints

### POST /api/generate
Generates audio from video segments.

**Request:**
```json
{
  "projectName": "My Parody",
  "segments": [
    {
      "url": "https://youtube.com/watch?v=...",
      "startTime": "00:00:10",
      "endTime": "00:00:30"
    }
  ]
}
```

**Response:** Audio file download (M4A format)

### GET /api/status
Check API and Docker status.

**Response:**
```json
{
  "status": "ok",
  "docker": "running",
  "message": "All systems operational"
}
```

## Testing the Flow

1. **Check Docker**: `docker compose ps` (should show 2 running containers)
2. **Check Backend**: Visit http://localhost:3032/health
3. **Check Frontend**: Visit http://localhost:3031
4. **Add a segment**: Use any public YouTube video
5. **Preview**: Click the segment to see it play
6. **Generate**: Click generate (first time will take longer to download)

## Troubleshooting

### "Docker containers not running"
```bash
npm run docker:up
```

### "Port 3031 already in use"
Kill the process or change port in `frontend/package.json`

### "Port 3032 already in use"
Change `PORT` in `backend/server.js`

### "Cannot find module"
```bash
npm run install:all
```

### Videos won't download
- Check internet connection
- Try a different YouTube video
- Check Docker logs: `npm run docker:logs`

## Next Steps

- Add more features (see spec.md for ideas)
- Deploy to production
- Add user authentication
- Implement higher quality options
- Add fade transitions

## Need Help?

- See `README_NEW.md` for detailed documentation
- Check `spec.md` for complete specifications
- Review `CLAUDE.md` for codebase guidance

Happy parody making! 🎵
