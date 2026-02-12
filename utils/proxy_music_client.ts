// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * Proxy-Enhanced Music Client
 * Integrates ProxyHub with music API clients for robust fallback
 */

import { fetchWithProxy, proxyHub } from "./proxy_hub.ts";

// ============ YOUTUBE MUSIC API WITH PROXY SUPPORT ============
export class ProxyYTMusic {
  private baseURL: string;
  private apiKey = "AIzaSyC9XL3ZjWjXClIX1FmUxJq--EohcD4_oSs";
  private context: Record<string, unknown>;

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
    ignoreSpelling = false,
    region?: string,
    language?: string,
  ): Promise<{ results: unknown[]; continuationToken?: string }> {
    const normalizedQuery = query.normalize("NFC");
    const filterParams = this.getFilterParams(filter);
    const params: Record<string, unknown> = continuationToken
      ? { continuation: continuationToken }
      : filterParams
      ? { query: normalizedQuery, params: filterParams }
      : { query: normalizedQuery };

    const context = (region || language)
      ? {
        client: {
          ...(this.context.client as any),
          gl: region || (this.context.client as any).gl,
          hl: language || (this.context.client as any).hl,
        },
      }
      : this.context;

    const url = `${this.baseURL}/search?key=${this.apiKey}`;
    const body = { context, ...params };

    // Use ProxyHub for the request
    const response = await proxyHub.fetch({
      url,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      timeout: 30000,
    });

    if (!response.success) {
      console.error("[ProxyYTMusic] Search failed:", response.error);
      throw new Error(`Search failed: ${response.error}`);
    }

    const data = JSON.parse(response.body);
    return this.parseSearchResults(data);
  }

  async getSong(videoId: string): Promise<{
    videoId: string;
    title: string;
    author: string;
    lengthSeconds: string;
    thumbnail: string;
  }> {
    const url = `${this.baseURL}/player?key=${this.apiKey}`;
    const body = { context: this.context, videoId };

    const response = await proxyHub.fetch({
      url,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      timeout: 30000,
    });

    if (!response.success) {
      throw new Error(`Get song failed: ${response.error}`);
    }

    const data = JSON.parse(response.body);
    const details = data?.videoDetails || {};

    return {
      videoId: details.videoId,
      title: details.title,
      author: details.author,
      lengthSeconds: details.lengthSeconds,
      thumbnail: details.thumbnail?.thumbnails?.[0]?.url,
    };
  }

  async getAlbum(browseId: string): Promise<unknown> {
    const url = `${this.baseURL}/browse?key=${this.apiKey}`;
    const body = { context: this.context, browseId };

    const response = await proxyHub.fetch({
      url,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      timeout: 30000,
    });

    if (!response.success) {
      throw new Error(`Get album failed: ${response.error}`);
    }

    return JSON.parse(response.body);
  }

  async getPlaylist(playlistId: string): Promise<unknown> {
    const browseId = `VL${playlistId.replace(/^VL/, "")}`;
    const url = `${this.baseURL}/browse?key=${this.apiKey}`;
    const body = { context: this.context, browseId };

    const response = await proxyHub.fetch({
      url,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      timeout: 30000,
    });

    if (!response.success) {
      throw new Error(`Get playlist failed: ${response.error}`);
    }

    return JSON.parse(response.body);
  }

  async getRelated(videoId: string): Promise<unknown[]> {
    const url = `https://www.youtube.com/youtubei/v1/next?key=${this.apiKey}`;
    const body = {
      videoId,
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20251013.01.00",
        },
      },
    };

    const response = await proxyHub.fetch({
      url,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      timeout: 30000,
    });

    if (!response.success) {
      throw new Error(`Get related failed: ${response.error}`);
    }

    const data = JSON.parse(response.body);
    return this.parseRelatedResults(data);
  }

  private getFilterParams(filter?: string): string | undefined {
    if (!filter) return undefined;
    const filterMap: Record<string, string> = {
      songs: "EgWKAQIIAWoKEAkQAxAEEAoQBQ%3D%3D",
      videos: "EgWKAQIQAWoKEAkQAxAEEAoQBQ%3D%3D",
      albums: "EgWKAQIYAWoKEAkQAxAEEAoQBQ%3D%3D",
      artists: "EgWKAQIgAWoKEAkQAxAEEAoQBQ%3D%3D",
      playlists: "EgWKAQIoAWoKEAkQAxAEEAoQBQ%3D%3D",
    };
    return filterMap[filter] || undefined;
  }

  private parseSearchResults(data: any): {
    results: unknown[];
    continuationToken?: string;
  } {
    const results: unknown[] = [];
    let continuationToken: string | undefined;

    const sections =
      data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer
        ?.content?.sectionListRenderer?.contents || [];

    for (const section of sections) {
      if (section.musicShelfRenderer) {
        for (const item of section.musicShelfRenderer.contents || []) {
          const parsed = this.parseMusicItem(
            item.musicResponsiveListItemRenderer,
          );
          if (parsed) results.push(parsed);
        }
        continuationToken =
          section.musicShelfRenderer.continuations?.[0]?.nextContinuationData
            ?.continuation || continuationToken;
      }
    }

    return { results, continuationToken };
  }

  private parseMusicItem(item: any) {
    if (!item) return null;
    const title = item.flexColumns?.[0]
      ?.musicResponsiveListItemFlexColumnRenderer?.text
      ?.runs?.[0]?.text;
    const thumbnail = item.thumbnail?.musicThumbnailRenderer?.thumbnail
      ?.thumbnails?.[0]?.url;
    const videoId = item.overlay?.musicItemThumbnailOverlayRenderer?.content
      ?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint
      ?.videoId;
    const browseId = item.navigationEndpoint?.browseEndpoint?.browseId;
    const subtitle =
      item.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text
        ?.runs || [];
    const duration = item.fixedColumns?.[0]
      ?.musicResponsiveListItemFixedColumnRenderer?.text
      ?.runs?.[0]?.text;

    return {
      title,
      thumbnails: [{ url: thumbnail }],
      videoId,
      browseId,
      duration,
      resultType: videoId
        ? "song"
        : browseId?.startsWith("UC")
        ? "artist"
        : "album",
    };
  }

  private parseRelatedResults(data: any): unknown[] {
    const secondaryResults =
      data?.contents?.twoColumnWatchNextResults?.secondaryResults
        ?.secondaryResults?.results || [];
    const results: Record<string, unknown>[] = [];

    for (const item of secondaryResults) {
      if (item.lockupViewModel) {
        const lockup = item.lockupViewModel;
        const metadata = lockup.metadata?.lockupMetadataViewModel;
        const contentImage = lockup.contentImage?.collectionThumbnailViewModel
          ?.primaryThumbnail
          ?.thumbnailViewModel;
        const videoIdMatch =
          lockup.rendererContext?.commandContext?.onTap?.innertubeCommand
            ?.watchEndpoint?.videoId || lockup.contentId;

        if (videoIdMatch) {
          results.push({
            videoId: videoIdMatch,
            title: metadata?.title?.content,
            artist: metadata?.metadata?.contentMetadataViewModel?.metadataRows
              ?.[0]?.metadataParts?.[0]?.text?.content,
            thumbnail: contentImage?.image?.sources?.[0]?.url,
            duration: metadata?.metadata?.contentMetadataViewModel
              ?.metadataRows?.[0]?.metadataParts?.[2]?.text?.content,
          });
        }
      }
    }

    return results.slice(0, 20);
  }
}

// ============ STREAMING API WITH PROXY SUPPORT ============
export class ProxyStreamingClient {
  private pipeInstances = [
    "https://api.piped.private.coffee",
    "https://pipedapi.darkness.services",
    "https://pipedapi.r4fo.com",
    "https://api.piped.yt",
    "https://pipedapi.kavin.rocks",
  ];

  async fetchFromPiped(videoId: string): Promise<{
    success: boolean;
    instance?: string;
    streamingUrls?: unknown[];
    metadata?: Record<string, unknown>;
    hlsUrl?: string;
    error?: string;
  }> {
    // Try each Piped instance with proxy fallback
    for (const instance of this.pipeInstances) {
      const url = `${instance}/streams/${videoId}`;

      try {
        const response = await proxyHub.fetch({
          url,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
          timeout: 30000,
        });

        if (!response.success) {
          console.warn(
            `[ProxyStreaming] ${instance} failed: ${response.error}`,
          );
          continue;
        }

        const data = JSON.parse(response.body);

        if (data?.error) continue;
        if (data?.audioStreams?.length) {
          return {
            success: true,
            instance,
            streamingUrls: data.audioStreams.map((
              s: Record<string, unknown>,
            ) => ({
              url: s.url,
              quality: s.quality,
              mimeType: s.mimeType,
              bitrate: s.bitrate,
            })),
            metadata: {
              id: videoId,
              title: data.title,
              uploader: data.uploader,
              thumbnail: data.thumbnailUrl,
              duration: data.duration,
              views: data.views,
            },
            hlsUrl: data.hls,
          };
        }
      } catch (error) {
        console.warn(
          `[ProxyStreaming] ${instance} error:`,
          error instanceof Error ? error.message : String(error),
        );
        continue;
      }
    }

    return { success: false, error: "No working Piped instances found" };
  }
}

// ============ LYRICS API WITH PROXY SUPPORT ============
export class ProxyLyricsClient {
  async getLyrics(
    title: string,
    artist: string,
    duration?: number,
  ): Promise<{
    success: boolean;
    trackName?: string;
    artistName?: string;
    albumName?: string;
    duration?: number;
    plainLyrics?: string;
    syncedLyrics?: string;
    error?: string;
  }> {
    try {
      let url = `https://lrclib.net/api/get?track_name=${
        encodeURIComponent(title)
      }&artist_name=${encodeURIComponent(artist)}`;
      if (duration) url += `&duration=${duration}`;

      let response = await proxyHub.fetch({
        url,
        timeout: 10000,
      });

      if (!response.success) {
        // Try search fallback
        const searchUrl = `https://lrclib.net/api/search?q=${
          encodeURIComponent(`${title} ${artist}`)
        }`;
        response = await proxyHub.fetch({
          url: searchUrl,
          timeout: 10000,
        });

        if (!response.success) {
          return { success: false, error: "Lyrics not found" };
        }

        const results = JSON.parse(response.body);
        if (Array.isArray(results) && results.length > 0) {
          const data = results[0];
          return {
            success: true,
            trackName: data.trackName,
            artistName: data.artistName,
            albumName: data.albumName,
            duration: data.duration,
            plainLyrics: data.plainLyrics,
            syncedLyrics: data.syncedLyrics,
          };
        }
      } else {
        const data = JSON.parse(response.body);
        if (!data || data.statusCode) {
          return { success: false, error: "Lyrics not found" };
        }

        return {
          success: true,
          trackName: data.trackName,
          artistName: data.artistName,
          albumName: data.albumName,
          duration: data.duration,
          plainLyrics: data.plainLyrics,
          syncedLyrics: data.syncedLyrics,
        };
      }

      return { success: false, error: "Lyrics not found" };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }
}

// ============ LAST.FM API WITH PROXY SUPPORT ============
export class ProxyLastFMClient {
  private API_KEY = "0867bcb6f36c879398969db682a7b69b";

  async getSimilarTracks(
    title: string,
    artist: string,
    limit = "5",
  ): Promise<{ error: string } | Array<{ title: string; artist: string }>> {
    const url =
      `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${
        encodeURIComponent(artist)
      }&track=${
        encodeURIComponent(title)
      }&api_key=${this.API_KEY}&limit=${limit}&format=json`;

    try {
      const response = await proxyHub.fetch({
        url,
        timeout: 10000,
      });

      if (!response.success) {
        return { error: "Failed to fetch similar tracks" };
      }

      const data = JSON.parse(response.body);
      if (data?.error) return { error: data.message || "Last.fm error" };

      return (data?.similartracks?.track || [])
        .map((t: any) => ({ title: t.name, artist: t?.artist?.name }))
        .filter((t: any) => t.title && t.artist);
    } catch {
      return { error: "Failed to fetch similar tracks" };
    }
  }

  async getArtistInfo(artist: string): Promise<{
    success: boolean;
    name?: string;
    bio?: string;
    tags?: string[];
    stats?: { listeners: string; playcount: string };
    error?: string;
  }> {
    try {
      const url =
        `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${
          encodeURIComponent(artist)
        }&api_key=${this.API_KEY}&format=json`;

      const response = await proxyHub.fetch({
        url,
        timeout: 10000,
      });

      if (!response.success) {
        return { success: false, error: "Failed to fetch artist info" };
      }

      const data = JSON.parse(response.body);
      if (data?.error) return { success: false, error: data.message };

      const a = data?.artist;
      return {
        success: true,
        name: a?.name,
        bio: a?.bio?.summary?.replace(/<[^>]*>/g, ""),
        tags: a?.tags?.tag?.map((t: Record<string, unknown>) => t.name) || [],
        stats: {
          listeners: a?.stats?.listeners,
          playcount: a?.stats?.playcount,
        },
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }
}

// Export singleton instances
export const proxyYTMusic = new ProxyYTMusic();
export const proxyStreaming = new ProxyStreamingClient();
export const proxyLyrics = new ProxyLyricsClient();
export const proxyLastFM = new ProxyLastFMClient();
