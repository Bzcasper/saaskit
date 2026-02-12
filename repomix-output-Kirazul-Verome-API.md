# TRENDRADAR - Music API for YouTube Music, Lyrics & Streaming

This file is a merged representation of the Virome API codebase, containing
files not matching ignore patterns, combined into a single document.

## File Summary

### Purpose

This file contains a complete packed representation of the Virome Music API
repository, designed for easy consumption by AI systems for analysis and code
review.

### File Format

The content is organized as follows:

1. Summary section
2. Repository information
3. Directory structure
4. Repository files
5. Multiple file entries with paths and complete contents

### Usage Guidelines

- Treat this file as read-only
- Use file paths to distinguish between different files
- Handle with security awareness as with original repository files

### Notes

- Binary files excluded (see repository structure for complete list)
- Files matching `.deno.lock` are excluded
- Files matching `.gitignore` rules are excluded
- Empty lines removed from all files
- Line numbers added to each line
- Content formatted for markdown parsing
- Files sorted by Git change count

## Directory Structure

```
assets/
  Logo.png
.gitignore
deno.json
lib.ts
mod.ts
README.md
ui.ts
```

## Files

### File: .gitignore

```
.DS_Store
*.log
.env
```

### File: deno.json

```json
{
  "name": "@kirazul/music-api",
  "version": "1.0.0",
  "exports": "./mod.ts",
  "tasks": {
    "start": "deno run --allow-net --allow-env --allow-read mod.ts",
    "dev": "deno run --watch --allow-net --allow-env --allow-read mod.ts"
  },
  "imports": {
    "std/": "https://deno.land/std@0.208.0/"
  },
  "compilerOptions": {
    "strict": true
  },
  "deploy": {
    "project": "85252de3-9b36-4d8b-b250-e491b4131838",
    "exclude": [
      "**/node_modules",
      "Music/**",
      "virome-music/**",
      ".git/**",
      ".vscode/**"
    ],
    "include": [],
    "entrypoint": "mod.ts"
  }
}
```

### File: lib.ts

```typescript
/**
 * Music API Library for Deno
 * Contains all the core functionality for YouTube Music, YouTube Search, JioSaavn, and Last.fm
 */

// ============ YOUTUBE MUSIC API ============

export class YTMusic {
  private baseURL: string;
  private apiKey = "AIzaSyC9XL3ZjWjXClIX1FmUxJq--EohcD4_oSs";
  private context: any;

  constructor() {
    this.baseURL = "https://music.youtube.com/youtubei/v1";
    this.context = {
      client: {
        hl: "en",
        gl: "US",
        clientName: "WEB_REMIX",
        clientVersion: "1.20251015.03.00",
        platform: "DESKTOP",
        utcOffsetMinutes: 0,
      },
    };
  }

  async search(
    query: string,
    filter?: string,
    continuationToken?: string,
    _ignoreSpelling = false,
    region?: string,
    language?: string,
  ) {
    const normalizedQuery = query.normalize("NFC");
    const filterParams = this.getFilterParams(filter);
    const params: any = continuationToken
      ? { continuation: continuationToken }
      : filterParams
      ? { query: normalizedQuery, params: filterParams }
      : { query: normalizedQuery };

    const context = region || language
      ? {
        client: {
          ...this.context.client,
          gl: region || this.context.client.gl,
          hl: language || this.context.client.hl,
        },
      }
      : this.context;

    const data = await this.makeRequestWithContext("search", params, context);
    return this.parseSearchResults(data);
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    const normalizedQuery = query.normalize("NFC");
    const data = await this.makeRequest("music/get_search_suggestions", {
      input: normalizedQuery,
    });
    return this.parseSuggestions(data);
  }

  async getSong(videoId: string) {
    const data = await this.makeRequest("player", { videoId });
    const details = data?.videoDetails || {};
    return {
      videoId: details.videoId,
      title: details.title,
      author: details.author,
      lengthSeconds: details.lengthSeconds,
      thumbnail: details.thumbnail?.thumbnails?.[0]?.url,
    };
  }

  // ... [Additional methods continue in same format]
}

// ============ YOUTUBE SEARCH ============

export class YouTubeSearch {
  private searchURL = "https://www.youtube.com/results";
  private continuationURL = "https://www.youtube.com/youtubei/v1/search";
  private suggestionsURL =
    "https://suggestqueries-clients6.youtube.com/complete/search";
  private apiKey: string | null = null;
  private clientVersion: string | null = null;

  async searchVideos(query: string | null, continuationToken?: string) {
    if (continuationToken) {
      return this.fetchContinuation(continuationToken, "video");
    }
    if (!query) throw new Error("Query is required for initial search");

    const normalizedQuery = query.normalize("NFC");
    const response = await fetch(
      `${this.baseURL}?search_query=${
        encodeURIComponent(normalizedQuery)
      }&sp=EgIQAQ%253D%253D`,
    );
    const html = await response.text();
    this.extractAPIConfig(html);
    return this.parseVideoResults(html);
  }

  // ... [Additional methods continue]
}

// ============ LAST.FM ============

export const LastFM = {
  API_KEY: "0867bcb6f36c879398969db682a7b69b",

  async getSimilarTracks(
    title: string,
    artist: string,
    limit = "5",
  ) {
    const url =
      `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${
        encodeURIComponent(artist)
      }&track=${
        encodeURIComponent(title)
      }&api_key=${this.API_KEY}&limit=${limit}&format=json`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data?.error) return { error: data.message || "Last.fm error" };

      return (data?.similartracks?.track || [])
        .map((t: any) => ({ title: t.name, artist: t?.artist?.name }))
        .filter((t: any) => t.title && t.artist);
    } catch {
      return { error: "Failed to fetch similar tracks" };
    }
  },
};
```

### File: mod.ts

```typescript
/**
 * Virome API for Deno
 * YouTube Music, YouTube Search, and Last.fm API
 *
 * Run with: deno run --allow-net --allow-env --allow-read mod.ts
 * Or deploy to Deno Deploy
 */

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import {
  fetchFromInvidious,
  fetchFromPiped,
  getAlbumComplete,
  getArtistComplete,
  getArtistInfo,
  getFullChain,
  getLyrics,
  getRadio,
  getSongComplete,
  getTopArtists,
  getTopTracks,
  getTrackInfo,
  getTrendingMusic,
  LastFM,
  YouTubeSearch,
  YTMusic,
} from "./lib.ts";
import { html as uiHtml } from "./ui.ts";

const PORT = parseInt(Deno.env.get("PORT") || "8000");
const ytmusic = new YTMusic();
const youtubeSearch = new YouTubeSearch();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}
```

### File: README.md

````markdown
# Virome API

Music API for YouTube Music, Lyrics & Streaming

## Features

- Search songs, albums, artists with fallback video IDs for playback
- Get synced lyrics (LRC format)
- Stream audio via Piped/Invidious proxies
- Generate radio mixes from any song
- Trending music and top artists by country
- Artist/track info from Last.fm
- Built-in music player with YouTube IFrame API
- Auto region detection from IP

## Quick Start

```bash
deno run --allow-net --allow-env --allow-read mod.ts
```
````

Server runs at `http://localhost:8000`

## API Endpoints

### Search

| Endpoint                     | Description              |
| ---------------------------- | ------------------------ |
| `/api/search?q=&filter=`     | Search YouTube Music     |
| `/api/yt_search?q=&filter=`  | Search YouTube           |
| `/api/search/suggestions?q=` | Autocomplete suggestions |

### Content

| Endpoint                     | Description             |
| ---------------------------- | ----------------------- |
| `/api/songs/:videoId`        | Song details            |
| `/api/albums/:browseId`      | Album with tracks       |
| `/api/artists/:browseId`     | Artist with discography |
| `/api/playlists/:playlistId` | Playlist tracks         |

## Deploy

```bash
deployctl deploy --project=verome-api --prod mod.ts
```

## License

MIT

````
### File: ui.ts

```typescript
/**
 * Virome API - Clean Professional UI
 */
export const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Virome API</title>
  <!-- UI content continues -->
</head>
<body>
  <!-- Main content -->
</body>
</html>`;
````

---

**Report Generated**: 2025 **Project**: Virome API - Music Streaming Service
**Status**: Documentation Complete
