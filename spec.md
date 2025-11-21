# YouTube Parody Song Generator - Technical Specification

## Project Overview

A single-page web application that allows users to create parody songs by stitching together segments from multiple YouTube videos. Users can preview their creation in real-time using Video.js, then generate and download an audio file.

---

## Core Features

### 1. Video Segment Management
- Users paste YouTube URLs one at a time
- Each video is added to a list with:
  - Thumbnail preview
  - Start/End time input fields (HH:MM:SS format)
  - Delete button
  - Individual segment preview button
- Drag-and-drop reordering of segments
- Minimum 1 segment, maximum 10 segments
- Each segment must be at least 1 second long
- Total video duration must not exceed 20 minutes

### 2. Real-Time Preview
- Video.js player with YouTube plugin for smooth playback
- Two-column layout:
  - Left: Segment list with controls
  - Right: Preview player
- Preview features:
  - Auto-play all segments in sequence
  - Standard playback controls (play/pause, seek, volume)
  - Visual highlight of currently playing segment
  - Click any segment to jump to it
  - Seamless automatic transitions between segments
- URLs are marked as "verified" when successfully played in preview
- Preview updates automatically when segment times are edited

### 3. Time Input Methods
- Manual text input (HH:MM:SS format)
- "Set Start" and "Set End" buttons to capture current playback time
- Both methods work together for flexibility

### 4. Multi-Project Management
- Projects stored in browser local storage
- Dropdown selector at top of page showing all projects
- Auto-generated project names (editable by user)
- Auto-save on every change
- Features:
  - "New Project" button
  - Delete project option
  - Duplicate project option
  - No limit on number of projects
- Prompt to continue previous project on page load

### 5. Video Generation & Download
- "Generate and Download" button (disabled until validation passes)
- Client-side validation before generation:
  - Valid YouTube URL format
  - Start time < End time for each segment
  - Minimum segment duration (1 second)
  - 1-10 segments total
  - Total duration ≤ 20 minutes
  - All segments verified (played in preview)
- Inline error messages on invalid segments
- Detailed progress indicator during generation:
  - "Downloading video 1 of 5..."
  - "Cutting segments..."
  - "Merging audio..."
- Instant download when complete
- Simple error handling: show error message, allow retry

---

## Technical Architecture

### Frontend: Next.js Application

**Tech Stack:**
- Next.js (latest) with React
- Video.js with YouTube plugin
- Tailwind CSS for styling
- Local Storage API for persistence

**Structure:**
- Single-page application
- Two-column responsive layout
- Components:
  - ProjectSelector (dropdown with management options)
  - SegmentList (drag-and-drop list)
  - SegmentCard (thumbnail, inputs, controls)
  - PreviewPlayer (Video.js wrapper)
  - GenerateButton (with validation state)
  - ProgressModal (generation status)

**State Management:**
- Project list and current project in local storage
- Segment list with validation states
- Preview player state (current segment, playback position)
- Generation progress state

### Backend: Node.js API Server

**Tech Stack:**
- Express or Fastify (latest)
- Runs on separate port (e.g., 3001)
- Accessible locally only (no authentication)
- Reuses existing Docker compose setup with FFmpeg and yt-dlp

**API Endpoints:**

1. `POST /api/generate`
   - Request body: Array of segments (url, startTime, endTime)
   - Process:
     1. Download 360p MP4 videos (format 18) using yt-dlp
     2. Extract audio segments using FFmpeg
     3. Concatenate audio segments
     4. Return audio file (MP3 or M4A)
   - Response:
     - Success: Stream audio file for download
     - Error: JSON with error message
   - Stores output in `./media/output`
   - Files cleaned up after 24 hours

2. `GET /api/progress/:jobId` (optional)
   - Returns current progress status for long-running jobs
   - Used by frontend for detailed progress updates

**Docker Integration:**
- Reuses existing `docker-compose.yml`
- FFmpeg service for audio extraction and merging
- yt-dlp service for video downloads
- Shared volume: `./media` mounted to `/workdir`

**Directory Structure:**
```
./media/
  ├── .youtube_cache/     # Cached full videos
  ├── .temp_segments/     # Temporary audio segments
  └── output/             # Generated audio files (24hr retention)
```

### Communication Flow

```
User Browser (Next.js)
    ↓
Next.js API Routes (/api/*)
    ↓
Backend API Server (Express, localhost:3001)
    ↓
Docker Containers (FFmpeg + yt-dlp)
```

---

## Output Specifications

**Audio Format:**
- Container: MP4 (M4A) or MP3
- Quality: Extracted from 360p YouTube videos (format 18)
- Codec: AAC
- Filename: `parody_[timestamp].m4a`

**Future Enhancement:** Support for higher quality (720p+)

---

## Validation Rules

### Client-Side Validation:
1. **YouTube URL Format:**
   - Must match YouTube URL patterns
   - Support: youtube.com/watch?v=, youtu.be/, etc.

2. **Segment Count:**
   - Minimum: 1 segment
   - Maximum: 10 segments

3. **Time Constraints:**
   - Start time must be before end time
   - Minimum segment duration: 1 second
   - Total duration across all segments: ≤ 20 minutes

4. **Verification:**
   - All segments must be successfully played in preview
   - Marks URLs as "verified"

5. **Generate Button State:**
   - Disabled until all validation passes
   - Shows inline errors for invalid segments

---

## User Interface Design

### Layout
- **Two-Column Desktop Layout:**
  - Left: Segment management panel (40%)
  - Right: Preview player (60%)
- **Mobile Responsive:** Stacked layout (segments above, player below)

### Components

1. **Header:**
   - Project selector dropdown (with name editing)
   - New Project button
   - Simple, clean branding

2. **Left Panel - Segment List:**
   - URL input field with "Add Video" button
   - Scrollable list of segment cards
   - Each card shows:
     - Video thumbnail
     - YouTube URL (truncated)
     - Start time input with "Set Start" button
     - End time input with "Set End" button
     - Validation error messages (if any)
     - Play segment button
     - Delete button
     - Drag handle for reordering

3. **Right Panel - Preview Player:**
   - Video.js player with YouTube videos
   - Playback controls
   - Current segment indicator
   - Segment timeline/list below player

4. **Footer:**
   - "Generate and Download" button (large, prominent)
   - Summary: segment count, total duration
   - Validation status indicator

5. **Progress Modal:**
   - Overlay during generation
   - Detailed progress steps
   - Loading animation

### Styling
- Simple, clean, functional design
- Tailwind CSS for utility-first styling
- Clear visual hierarchy
- Accessible colors and contrast
- Loading states and transitions

---

## Data Models

### Project Object (Local Storage)
```javascript
{
  id: "uuid",
  name: "My Parody Song",
  createdAt: "2025-01-21T10:30:00Z",
  updatedAt: "2025-01-21T11:45:00Z",
  segments: [
    {
      id: "uuid",
      url: "https://www.youtube.com/watch?v=VIDEO_ID",
      videoId: "VIDEO_ID",
      startTime: "00:00:20",
      endTime: "00:01:09",
      thumbnail: "https://i.ytimg.com/vi/VIDEO_ID/default.jpg",
      verified: true,
      validationErrors: []
    }
  ]
}
```

### API Request Format
```javascript
POST /api/generate
{
  projectId: "uuid",
  segments: [
    {
      url: "https://www.youtube.com/watch?v=VIDEO_ID",
      startTime: "00:00:20",
      endTime: "00:01:09"
    }
  ]
}
```

### API Response Format
```javascript
// Success
{
  success: true,
  downloadUrl: "/downloads/parody_1642768200.m4a",
  filename: "parody_1642768200.m4a"
}

// Error
{
  success: false,
  error: "Failed to download video: Video is private",
  details: { segmentIndex: 2 }
}
```

---

## Error Handling

### Client-Side Errors:
- Invalid YouTube URL format
- Invalid time format
- Start time >= End time
- Segment too short (< 1 second)
- Total duration exceeds 20 minutes
- Too many/few segments

### Server-Side Errors:
- Video unavailable (private, deleted, region-locked)
- Download failure
- FFmpeg processing error
- Disk space issues
- Docker containers not running

**Error Display:**
- Inline validation errors on segment cards
- Toast notifications for server errors
- Modal with error details and retry option
- Simple error messages (no technical jargon)

---

## Development Setup

### Prerequisites:
- Node.js (latest LTS)
- Docker with Docker Compose
- npm or yarn

### Installation:
```bash
# Install dependencies
npm install

# Start Docker containers
docker compose up -d

# Start development servers (both Next.js and Backend API)
npm run dev
```

### Scripts:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:next\" \"npm run dev:api\"",
    "dev:next": "next dev",
    "dev:api": "nodemon backend/server.js",
    "build": "next build",
    "start": "npm run start:next & npm run start:api",
    "start:next": "next start",
    "start:api": "node backend/server.js"
  }
}
```

### Environment Variables:
```
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
BACKEND_PORT=3001
MEDIA_DIR=./media
CACHE_DIR=./media/.youtube_cache
TEMP_DIR=./media/.temp_segments
OUTPUT_DIR=./media/output
```

---

## File Structure

```
video-gen/
├── frontend/                   # Next.js application
│   ├── app/
│   │   ├── page.jsx           # Main page component
│   │   ├── layout.jsx         # Root layout
│   │   └── api/               # Next.js API routes (proxy to backend)
│   ├── components/
│   │   ├── ProjectSelector.jsx
│   │   ├── SegmentList.jsx
│   │   ├── SegmentCard.jsx
│   │   ├── PreviewPlayer.jsx
│   │   ├── GenerateButton.jsx
│   │   └── ProgressModal.jsx
│   ├── lib/
│   │   ├── localStorage.js    # Project persistence
│   │   ├── validation.js      # Client-side validation
│   │   └── videojs-setup.js   # Video.js configuration
│   └── public/
├── backend/                    # Express/Fastify API server
│   ├── server.js              # Main server file
│   ├── routes/
│   │   └── generate.js        # Video generation endpoint
│   ├── services/
│   │   ├── videoDownloader.js # yt-dlp wrapper
│   │   ├── audioProcessor.js  # FFmpeg operations
│   │   └── cleanup.js         # File cleanup service
│   └── utils/
│       └── docker.js          # Docker exec helpers
├── media/                      # Shared media directory
│   ├── .youtube_cache/
│   ├── .temp_segments/
│   └── output/
├── docker-compose.yml          # Existing Docker setup
├── package.json
├── CLAUDE.md
├── spec.md
└── README.md
```

---

## Future Enhancements

1. **Quality Options:**
   - Allow users to choose output quality (360p, 720p, 1080p)
   - Better audio extraction

2. **Advanced Editing:**
   - Fade in/out transitions
   - Volume adjustment per segment
   - Audio effects

3. **Social Features:**
   - Share projects via URL
   - Embed generated parodies
   - Gallery of public parodies

4. **User Accounts:**
   - Cloud storage for projects
   - Project history
   - Generation history

5. **Performance:**
   - Queue system for multiple generations
   - Background processing
   - WebSocket for real-time progress

6. **Export Options:**
   - Different audio formats (MP3, WAV, FLAC)
   - Video output with visualizations
   - Export project as JSON

---

## Success Metrics

- Users can create a parody song with 3-5 segments in under 5 minutes
- Preview loads within 2 seconds
- Generation completes within 1-2 minutes for typical project
- Zero data loss (auto-save works reliably)
- Intuitive UI requires no instructions

---

## Known Limitations

1. **YouTube API Rate Limits:**
   - May hit rate limits with heavy usage
   - No workaround for private/region-locked videos

2. **Audio Quality:**
   - Limited by source YouTube video quality
   - 360p audio may not be ideal for music

3. **Browser Compatibility:**
   - Video.js YouTube plugin may have issues in older browsers
   - Local storage limits vary by browser

4. **Processing Time:**
   - Depends on video length and number of segments
   - No background processing (user must wait)

5. **Storage:**
   - Local storage has size limits (~5-10MB)
   - Server storage cleanup after 24 hours only

---

## Security Considerations

1. **Input Validation:**
   - Sanitize all user inputs
   - Validate YouTube URLs strictly
   - Prevent path traversal in file operations

2. **Resource Limits:**
   - Max 10 segments, 20 minutes total
   - Rate limiting on generation endpoint
   - Disk space monitoring

3. **Backend API:**
   - Localhost-only access
   - No sensitive data exposure
   - Proper error handling (no stack traces to client)

4. **Docker Security:**
   - Containers run with limited permissions
   - No network exposure
   - Volume mounts are read/write only where needed

---

## Testing Strategy

### Unit Tests:
- Validation functions
- YouTube URL parsing
- Time calculation utilities
- Local storage operations

### Integration Tests:
- Next.js API routes
- Backend API endpoints
- Docker command execution
- File operations

### End-to-End Tests:
- Complete user flow (add segments → preview → generate → download)
- Project management (create, edit, delete, duplicate)
- Error scenarios (invalid URLs, failed downloads)

### Manual Testing:
- Video.js playback across browsers
- Drag-and-drop functionality
- Responsive design on mobile
- Progress indicator accuracy

---

## Deployment

### Development:
- Local development with Docker
- Hot reload for both frontend and backend
- No authentication required

### Production (Future):
- Next.js deployed to Vercel or self-hosted
- Backend API on separate server (Node.js + Docker)
- Nginx reverse proxy
- SSL certificates
- Domain and CDN

---

## Timeline Estimate

**Phase 1: Core Functionality (Week 1-2)**
- Basic Next.js setup with Tailwind
- Segment list UI with add/delete
- Local storage integration
- Video.js preview player setup

**Phase 2: Backend Integration (Week 2-3)**
- Express API server setup
- Docker integration for video processing
- Generation endpoint with progress tracking
- Download functionality

**Phase 3: Polish & Features (Week 3-4)**
- Drag-and-drop reordering
- Multi-project management
- Validation and error handling
- UI improvements and responsive design

**Phase 4: Testing & Refinement (Week 4)**
- Bug fixes
- Performance optimization
- Cross-browser testing
- Documentation

---

## Developer Handoff Notes

1. **Reuse Existing Code:**
   - Docker compose setup is already configured
   - Video processing logic in `video-processor.js` can be adapted
   - YouTube ID extraction function is ready to use

2. **Key Dependencies:**
   - Video.js: `video.js` + `@videojs/youtube`
   - Drag-and-drop: `react-beautiful-dnd` or `@dnd-kit/core`
   - Backend: `express` or `fastify`
   - Process management: `concurrently` for dev scripts

3. **Critical Paths:**
   - Video.js YouTube plugin configuration (smooth transitions)
   - FFmpeg audio extraction commands
   - Local storage sync and conflict resolution
   - Progress tracking during generation

4. **Watch Out For:**
   - YouTube IFrame API quirks with Video.js
   - Docker exec command path translations (host vs container)
   - Browser local storage limits
   - FFmpeg audio codec compatibility

---

*This specification is ready for development. Adjust as needed based on technical constraints discovered during implementation.*
