# TrendRadar Music API Documentation

## Overview

TrendRadar provides a comprehensive REST API for music discovery, analysis, and trend detection. The API integrates multiple AI providers (OpenAI, Cerebras, Groq) for advanced music intelligence.

## Base URL
```
https://api.trendradar.com
```

## Authentication

All API requests require authentication via API key or OAuth token.

### API Key Authentication
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.trendradar.com/api/music/search
```

### OAuth Authentication
```bash
curl -H "Authorization: Bearer YOUR_OAUTH_TOKEN" https://api.trendradar.com/api/music/search
```

## Rate Limits

- Free tier: 100 requests/hour
- Premium tier: 10,000 requests/hour
- Enterprise tier: Unlimited

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests per hour
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time until reset (Unix timestamp)

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

Common error codes:
- `MISSING_PARAM`: Required parameter missing
- `INVALID_PARAM`: Parameter value invalid
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `RATE_LIMITED`: Rate limit exceeded
- `INTERNAL_ERROR`: Server error

## Music Search API

### Search Tracks
```http
GET /api/music/search?q={query}&limit={limit}&offset={offset}
```

**Parameters:**
- `q` (required): Search query
- `limit` (optional): Results per page (default: 20, max: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "tracks": [
      {
        "videoId": "dQw4w9WgXcQ",
        "title": "Never Gonna Give You Up",
        "artist": "Rick Astley",
        "duration": "3:32",
        "thumbnail": "https://...",
        "views": 1000000
      }
    ],
    "total": 100,
    "hasMore": true
  }
}
```

### Get Track Details
```http
GET /api/music/tracks/{videoId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "videoId": "dQw4w9WgXcQ",
    "title": "Never Gonna Give You Up",
    "artist": "Rick Astley",
    "album": "Whenever You Need Somebody",
    "duration": "3:32",
    "genre": "Pop",
    "releaseDate": "1987-07-27",
    "thumbnail": "https://...",
    "views": 1000000,
    "likes": 500000
  }
}
```

## AI-Powered Analysis API

### Track Analysis
```http
GET /api/music/ai/analysis?type=track&videoId={videoId}
```

Analyzes track audio features, lyrics, and metadata using AI.

**Parameters:**
- `videoId` (required): YouTube video ID
- `refresh` (optional): Force refresh cached analysis

**Response:**
```json
{
  "success": true,
  "data": {
    "track": {...},
    "audioFeatures": {
      "tempo": 120,
      "key": "C Major",
      "energy": 0.8,
      "danceability": 0.7,
      "valence": 0.6
    },
    "lyricsAnalysis": {
      "sentiment": "positive",
      "themes": ["love", "relationships"],
      "mood": "upbeat",
      "summary": "A song about...",
      "keyPhrases": ["never gonna give you up"],
      "emotionalJourney": ["hopeful", "confident"]
    }
  }
}
```

### OpenAI Track Description
```http
GET /api/music/ai/analysis?type=description&videoId={videoId}
```

Generates detailed track descriptions using OpenAI GPT-4.

**Response:**
```json
{
  "success": true,
  "data": {
    "track": {...},
    "description": "This iconic 1980s pop track by Rick Astley features...",
    "generatedBy": "openai"
  }
}
```

### Lyrics Analysis
```http
GET /api/music/ai/analysis?type=lyrics&videoId={videoId}
```

AI-powered analysis of song lyrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "lyricsAnalysis": {
      "sentiment": "positive",
      "themes": ["love", "hope"],
      "mood": "romantic",
      "summary": "Lyrics express...",
      "keyPhrases": ["love you", "forever"],
      "emotionalJourney": ["longing", "joy"]
    }
  }
}
```

### Listening Pattern Analysis
```http
GET /api/music/ai/analysis?type=listening
```

**Authentication Required**

Analyzes user's listening patterns and preferences.

**Response:**
```json
{
  "success": true,
  "data": {
    "trends": {
      "topGenres": ["Pop", "Rock"],
      "topArtists": ["Artist A", "Artist B"],
      "listeningTimes": {
        "morning": 30,
        "afternoon": 40,
        "evening": 30
      }
    },
    "recommendations": ["Similar tracks..."]
  }
}
```

### Track Comparison
```http
GET /api/music/ai/analysis?type=compare&videoId1={id1}&videoId2={id2}
```

Compares two tracks using AI analysis.

**Parameters:**
- `videoId1`, `videoId2` (required): YouTube video IDs to compare

**Response:**
```json
{
  "success": true,
  "data": {
    "track1": {...},
    "track2": {...},
    "comparison": {
      "similarity": 0.75,
      "sharedGenres": ["Pop"],
      "tempoDifference": 10,
      "moodComparison": "Both upbeat..."
    }
  }
}
```

## AI Recommendations API

### Get Recommendations
```http
GET /api/music/ai/recommendations?seed={videoId}&count={count}
```

Get AI-powered music recommendations based on seed tracks.

**Parameters:**
- `seed` (required): Seed track video ID
- `count` (optional): Number of recommendations (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "seedTrack": {...},
    "recommendations": [
      {
        "videoId": "...",
        "title": "...",
        "artist": "...",
        "reason": "Similar tempo and genre",
        "confidence": 0.85
      }
    ]
  }
}
```

### Playlist Generation
```http
POST /api/music/ai/playlists
```

Generate complete playlists using AI.

**Request Body:**
```json
{
  "theme": "Workout",
  "duration": 3600,
  "genres": ["Electronic", "Rock"],
  "mood": "energetic"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "playlist": {
      "name": "Ultimate Workout Mix",
      "tracks": [...],
      "totalDuration": 3600,
      "generatedBy": "ai"
    }
  }
}
```

## Trending & Charts API

### Get Trending Tracks
```http
GET /api/music/trending?region={region}&limit={limit}
```

**Parameters:**
- `region` (optional): Country code (default: US)
- `limit` (optional): Number of results (default: 20)

### Top Artists
```http
GET /api/music/top/artists?timeRange={range}&limit={limit}
```

**Parameters:**
- `timeRange` (optional): "day", "week", "month", "year" (default: week)
- `limit` (optional): Number of results (default: 20)

### Top Tracks
```http
GET /api/music/top/tracks?timeRange={range}&limit={limit}
```

## User Management API

### Get User Profile
```http
GET /api/me
```

**Authentication Required**

### Update User Preferences
```http
PUT /api/me/preferences
```

**Request Body:**
```json
{
  "favoriteGenres": ["Pop", "Rock"],
  "preferredLanguages": ["en"],
  "explicitContent": false
}
```

## Billing & Subscription API

### Get Subscription Status
```http
GET /api/me/subscription
```

**Response:**
```json
{
  "success": true,
  "data": {
    "plan": "premium",
    "status": "active",
    "currentPeriodEnd": "2024-12-31",
    "features": ["unlimited_requests", "ai_analysis"]
  }
}
```

### Upgrade Subscription
```http
POST /api/account/upgrade
```

**Request Body:**
```json
{
  "plan": "premium",
  "paymentMethod": "card_..."
}
```

## Webhooks

### Stripe Webhooks
```http
POST /api/stripe-webhooks
```

Handles Stripe subscription events. Configure webhook endpoint in Stripe dashboard.

## SDKs & Libraries

### JavaScript SDK
```javascript
import { TrendRadar } from 'trendradar-sdk';

const client = new TrendRadar({
  apiKey: 'your-api-key'
});

// Search tracks
const results = await client.search('never gonna give you up');

// Get AI analysis
const analysis = await client.analyzeTrack('dQw4w9WgXcQ');
```

### Python SDK
```python
from trendradar import TrendRadar

client = TrendRadar(api_key='your-api-key')

# Search tracks
results = client.search('never gonna give you up')

# Get recommendations
recs = client.get_recommendations(seed_track_id='dQw4w9WgXcQ')
```

## OpenAI Integration Details

TrendRadar integrates OpenAI's GPT-4 for advanced music analysis:

### Features Using OpenAI:
- **Track Descriptions**: Detailed, engaging descriptions of songs
- **Playlist Recommendations**: Smart playlist suggestions
- **Trend Analysis**: Deep insights into music trends
- **Content Generation**: AI-generated playlist names and descriptions

### OpenAI Models Used:
- **GPT-4**: Primary model for complex analysis and generation
- **Text-Embedding-Ada-002**: For semantic similarity and recommendations

### Cost Optimization:
- Caching of AI responses
- Batch processing where possible
- Tiered access based on subscription level

## Support

For API support:
- Email: api@trendradar.com
- Discord: https://discord.gg/trendradar
- Documentation: https://docs.trendradar.com

## Changelog

### v2.0.0 (Latest)
- Added OpenAI GPT-4 integration
- Enhanced AI analysis capabilities
- Improved recommendation algorithms
- Added playlist generation API

### v1.5.0
- Added AI-powered trend analysis
- Introduced subscription tiers
- Enhanced search with filters

### v1.0.0
- Initial release
- Basic music search and streaming
- User authentication