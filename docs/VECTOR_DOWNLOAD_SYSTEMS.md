# Vector Search and Download Systems

## Overview

This document describes the new vector search and download systems added to the
music application.

---

## Vector Search System

### Purpose

The vector search system enables semantic music search using embeddings and
similarity algorithms. It allows users to find tracks based on meaning and
context rather than exact text matching.

### Components

#### `utils/vector.ts`

Core utilities for vector operations and similarity search:

**Functions:**

- `generateEmbedding(text)` - Generates a 768-dimensional vector embedding from
  text
- `generateTrackEmbedding(...)` - Creates embeddings for track metadata
- `indexTrack(...)` - Generates and saves embeddings for a track
- `cosineSimilarity(a, b)` - Cosine similarity between vectors
- `euclideanDistance(a, b)` - Euclidean distance between vectors
- `manhattanDistance(a, b)` - Manhattan distance between vectors
- `vectorSearch(query, options)` - Semantic search across all indexed tracks
- `findSimilarTracks(trackId, options)` - Find tracks similar to a given track
- `batchIndexTracks(tracks)` - Index multiple tracks in batch
- `clusterTracks(numClusters)` - K-means clustering for playlist generation

**Distance Metrics:**

- `"cosine"` - Cosine similarity (1 = identical, 0 = orthogonal, -1 = opposite)
- `"euclidean"` - Euclidean distance converted to similarity
- `"manhattan"` - Manhattan distance converted to similarity

#### API Endpoints

**POST `/api/music/search/vector`**

```json
{
  "query": "chill electronic music for coding",
  "limit": 20,
  "threshold": 0.5,
  "metric": "cosine"
}
```

**GET `/api/music/tracks/[trackId]/similar`** Query params: `limit`,
`threshold`, `metric`

**POST `/api/music/index`** Index tracks for vector search:

```json
{
  "trackId": "abc123",
  // or
  "tracks": [
    { "trackId": "1", "videoId": "yt1", "title": "Song", "artist": "Artist" }
  ]
}
```

**GET `/api/music/index`** Get indexing status (total indexed tracks, last
update time)

**GET `/api/music/cluster`** Get track clusters for playlist generation. Query
param: `clusters` (number of clusters)

### Usage Example

```typescript
import { findSimilarTracks, indexTrack, vectorSearch } from "@/utils/vector.ts";

// Semantic search
const results = await vectorSearch("upbeat workout music", {
  limit: 10,
  threshold: 0.6,
  metric: "cosine",
});

// Find similar tracks
const similar = await findSimilarTracks("track_123", {
  limit: 15,
  threshold: 0.7,
});

// Index a track for search
await indexTrack(
  "track_123",
  "yt_abc123",
  "Bohemian Rhapsody",
  "Queen",
  "A Night at the Opera",
);
```

---

## Download System

### Purpose

The download system manages asynchronous audio file downloads with progress
tracking, job queuing, and quality selection.

### Components

#### `utils/download.ts`

Download job management utilities:

**Types:**

- `DownloadJob` - Represents a download job with status, progress, and metadata
- `DownloadOptions` - Format and quality options

**Functions:**

- `createDownloadJob(...)` - Create a new download job
- `getDownloadJob(jobId)` - Get job by ID
- `getDownloadJobByVideoId(videoId)` - Get job by video ID
- `getUserDownloadJobs(userId, limit)` - Get all jobs for a user
- `updateDownloadJob(jobId, updates)` - Update job progress/status
- `completeDownloadJob(...)` - Mark job as completed
- `failDownloadJob(jobId, error)` - Mark job as failed
- `cancelDownloadJob(jobId)` - Cancel a pending job
- `deleteDownloadJob(jobId, userId)` - Delete a job
- `cleanupOldDownloadJobs(maxAge)` - Clean up old completed/failed jobs
- `processDownloadJob(jobId)` - Process a download job
- `processDownloadQueue(maxConcurrent)` - Batch process queue
- `getDownloadStats(userId)` - Get download statistics

**Job Statuses:**

- `"queued"` - Job is queued, waiting to start
- `"downloading"` - Currently downloading
- `"converting"` - Converting audio format
- `"completed"` - Finished successfully
- `"failed"` - Failed with error
- `"cancelled"` - Cancelled by user

**Quality Levels:**

- `"low"` - Lowest bitrate/smallest file
- `"medium"` - Middle bitrate (default)
- `"high"` - Highest bitrate/largest file

#### API Endpoints

**POST `/api/music/download`** Create a new download job:

```json
{
  "videoId": "yt_video_id",
  "title": "Song Title",
  "artist": "Artist Name",
  "format": "mp3", // optional: "mp3", "m4a", "webm", "wav"
  "quality": "high" // optional: "low", "medium", "high"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "jobId": "job_ulid",
    "status": "queued",
    "message": "Download job created"
  }
}
```

**GET `/api/music/download?userId={userId}&limit={limit}`** Get download jobs
for a user

**GET `/api/music/download/[jobId]`** Get job status

**DELETE `/api/music/download/[jobId]?force=false`** Cancel or delete a job:

- `force=false` - Cancel (only queued/downloading jobs)
- `force=true` - Delete completely

**GET `/api/music/download/stats?userId={userId}`** Get download statistics

**DELETE `/api/music/download/stats?maxAge={milliseconds}`** Clean up old jobs
(default: 7 days)

### Usage Example

```typescript
import {
  cancelDownloadJob,
  createDownloadJob,
  getDownloadJob,
  getDownloadStats,
} from "@/utils/download.ts";

// Create download job
const job = await createDownloadJob(
  "yt_abc123",
  "Song Title",
  "Artist Name",
  "user_id", // optional user ID
  { format: "mp3", quality: "high" },
);

// Check job status
const updatedJob = await getDownloadJob(job.id);
console.log(`Progress: ${updatedJob.progress}%`);

// Cancel if needed
await cancelDownloadJob(job.id);

// Get statistics
const stats = await getDownloadStats("user_id");
console.log(`Total: ${stats.totalJobs}, Completed: ${stats.completedJobs}`);
```

---

## Integration with Existing Models

The systems integrate with existing `music_models.ts`:

- `TrackEmbedding` - Already defined in music_models.ts
- `getAllTrackEmbeddings()` - Already exported
- `getTrackEmbedding(trackId)` - Already exported
- `saveTrackEmbedding(embedding)` - Already exported

The download system stores jobs in Deno KV with these key patterns:

- `["download_jobs", jobId]` - Main job data
- `["download_jobs_by_video", videoId, jobId]` - Video lookup
- `["download_jobs_by_user", userId, jobId]` - User lookup

---

## Testing

Run tests with:

```bash
# Vector system tests
deno test -A --no-check utils/vector_test.ts

# Download system tests
deno test -A --no-check utils/download_test.ts

# All tests
deno test -A --no-check
```

---

## Future Enhancements

### Vector Search

1. **Real Embedding API** - Replace hash-based embedding with OpenAI/Cohere
   embeddings
2. **Hybrid Search** - Combine vector search with traditional filters (genre,
   era, mood)
3. **Incremental Indexing** - Auto-index new tracks as they're added
4. **Embedding Cache** - Cache embeddings to avoid regenerating

### Download System

1. **Actual File Download** - Download from streaming URL to storage
2. **Format Conversion** - Use ffmpeg to convert formats
3. **Progress Streaming** - WebSocket progress updates
4. **File Storage** - Integrate with S3/R2/storage backend
5. **Batch Operations** - Batch download for playlists

---

## API Reference

### Vector Search API

| Endpoint                         | Method   | Description         |
| -------------------------------- | -------- | ------------------- |
| `/api/music/search/vector`       | POST     | Semantic search     |
| `/api/music/tracks/[id]/similar` | GET      | Find similar tracks |
| `/api/music/index`               | GET/POST | Index management    |
| `/api/music/cluster`             | GET      | Get track clusters  |

### Download API

| Endpoint                    | Method     | Description            |
| --------------------------- | ---------- | ---------------------- |
| `/api/music/download`       | GET/POST   | Job management         |
| `/api/music/download/[id]`  | GET/DELETE | Individual job         |
| `/api/music/download/stats` | GET/DELETE | Statistics and cleanup |
