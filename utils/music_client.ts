// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

/**
 * Music Client Library
 * Integrates YouTube Music, YouTube Search, Last.fm, and streaming APIs
 * Ported from Kirazul Verome API for Deno SaasKit
 */

// ============ YOUTUBE MUSIC API ============
export class YTMusic {
  private baseURL: string;
  private apiKey = "AIzaSyC9XL3ZjWjXClIX1FmUxJq--EohcD4_oSs";
  private context: {
    client: {
      hl: string;
      gl: string;
      clientName: string;
      clientVersion: string;
      platform: string;
      utcOffsetMinutes: number;
    };
  };

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
  ) {
    const normalizedQuery = query.normalize("NFC");
    const filterParams = this.getFilterParams(filter);
    const params: Record<string, unknown> = continuationToken
      ? { continuation: continuationToken }
      : filterParams
        ? { query: normalizedQuery, params: filterParams }
        : { query: normalizedQuery };

    const context = (region || language) ? {
      client: {
        ...this.context.client,
        gl: region || this.context.client.gl,
        hl: language || this.context.client.hl,
      },
    } : this.context;

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

  async getAlbum(browseId: string) {
    const data: any = await this.makeRequest("browse", { browseId });
    const singleColumn =
      data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer
        ?.content?.sectionListRenderer?.contents;
    const twoColumnPrimary =
      data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer
        ?.content?.sectionListRenderer?.contents;
    const twoColumnSecondary =
      data?.contents?.twoColumnBrowseResultsRenderer?.secondaryContents
        ?.sectionListRenderer?.contents;

    let title = "";
    let artist = "";
    let thumbnail = "";
    let year = "";

    const oldHeader =
      data?.header?.musicDetailHeaderRenderer ||
      data?.header?.musicImmersiveHeaderRenderer ||
      data?.header?.musicVisualHeaderRenderer;

    if (oldHeader) {
      title = oldHeader.title?.runs?.[0]?.text;
      const subtitleRuns = oldHeader.subtitle?.runs ||
        oldHeader.straplineTextOne?.runs || [];
      artist = subtitleRuns.find((r: Record<string, unknown>) =>
        r.navigationEndpoint
      )?.text || subtitleRuns[0]?.text;
      thumbnail =
        oldHeader.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
          ?.slice(-1)[0]?.url ||
        oldHeader.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail
          ?.thumbnails?.slice(-1)[0]?.url;
    }

    const primaryContents = twoColumnPrimary || singleColumn || [];
    for (const section of primaryContents) {
      if (section.musicResponsiveHeaderRenderer) {
        const h = section.musicResponsiveHeaderRenderer;
        title = h.title?.runs?.[0]?.text || title;
        const subtitleRuns = h.straplineTextOne?.runs || h.subtitle?.runs || [];
        artist = subtitleRuns.find((r: Record<string, unknown>) =>
          r.navigationEndpoint
        )?.text || subtitleRuns[0]?.text || artist;
        thumbnail =
          h.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
            ?.slice(-1)[0]?.url || thumbnail;
        const secondSubtitle = h.subtitle?.runs || [];
        for (const run of secondSubtitle) {
          const yearMatch = run.text?.match(/\d{4}/);
          if (yearMatch) year = yearMatch[0];
        }
      }
      if (section.musicDescriptionShelfRenderer) {
        const subHeader =
          section.musicDescriptionShelfRenderer.subheader?.runs?.[0]?.text ||
          "";
        const yearMatch = subHeader.match(/\d{4}/);
        if (yearMatch && !year) year = yearMatch[0];
      }
    }

    const trackContents = twoColumnSecondary || singleColumn || [];
    const tracks = this.parseTracksFromContents(trackContents);

    return {
      browseId,
      title,
      artist,
      thumbnail,
      year,
      trackCount: tracks.length,
      tracks,
    };
  }

  async getPlaylist(playlistId: string) {
    const browseId = `VL${playlistId.replace(/^VL/, "")}`;
    const data = await this.makeRequest("browse", { browseId });

    const primaryContents =
      data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer
        ?.content?.sectionListRenderer?.contents || [];
    let title = "";
    let author = "";
    let description = "";
    let thumbnail = "";

    for (const section of primaryContents) {
      if (section.musicResponsiveHeaderRenderer) {
        const h = section.musicResponsiveHeaderRenderer;
        title = h.title?.runs?.[0]?.text || "";
        const subtitleRuns = h.straplineTextOne?.runs || [];
        author = subtitleRuns.find((r: Record<string, unknown>) =>
          r.navigationEndpoint
        )?.text || subtitleRuns[0]?.text || "";
        description =
          h.description?.musicDescriptionShelfRenderer?.description?.runs?.[0]
            ?.text || "";
        thumbnail =
          h.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
            ?.slice(-1)[0]?.url || "";
      }
    }

    const secondaryContents =
      data?.contents?.twoColumnBrowseResultsRenderer?.secondaryContents
        ?.sectionListRenderer?.contents || [];
    const tracks: Record<string, unknown>[] = [];

    for (const section of secondaryContents) {
      if (section.musicPlaylistShelfRenderer) {
        for (const item of section.musicPlaylistShelfRenderer.contents || []) {
          const parsed = this.parseMusicItem(
            item.musicResponsiveListItemRenderer,
          );
          if (parsed) tracks.push(parsed);
        }
      }
      if (section.musicShelfRenderer) {
        for (const item of section.musicShelfRenderer.contents || []) {
          const parsed = this.parseMusicItem(
            item.musicResponsiveListItemRenderer,
          );
          if (parsed) tracks.push(parsed);
        }
      }
    }

    return {
      playlistId: playlistId.replace(/^VL/, ""),
      title,
      author,
      description,
      thumbnail,
      trackCount: tracks.length,
      tracks,
    };
  }

  async getRelated(videoId: string) {
    const url =
      `https://www.youtube.com/youtubei/v1/next?key=${this.apiKey}`;
    const body = {
      videoId,
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20251013.01.00",
        },
      },
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    const secondaryResults =
      data?.contents?.twoColumnWatchNextResults?.secondaryResults
        ?.secondaryResults?.results || [];
    const results: Record<string, unknown>[] = [];

    for (const item of secondaryResults) {
      if (item.lockupViewModel) {
        const lockup = item.lockupViewModel;
        const metadata = lockup.metadata?.lockupMetadataViewModel;
        const contentImage =
          lockup.contentImage?.collectionThumbnailViewModel?.primaryThumbnail
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

  private async makeRequest(endpoint: string, params: Record<string, unknown>) {
    const url = `${this.baseURL}/${endpoint}?key=${this.apiKey}`;
    const body = { context: this.context, ...params };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.json();
  }

  private async makeRequestWithContext(
    endpoint: string,
    params: Record<string, unknown>,
    context: Record<string, unknown>,
  ) {
    const url = `${this.baseURL}/${endpoint}?key=${this.apiKey}`;
    const body = { context, ...params };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return response.json();
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

  private parseSearchResults(data: any) {
    const results: Record<string, unknown>[] = [];
    let continuationToken: string | null = null;

    const sections =
      data?.contents?.tabbedSearchResultsRenderer?.tabs?.[0]?.tabRenderer
        ?.content?.sectionListRenderer?.contents || [];

    for (const section of sections) {
      if (section.musicShelfRenderer) {
        for (
          const item of (section.musicShelfRenderer.contents || [])
        ) {
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

  private parseSuggestions(data: any): string[] {
    const suggestions: string[] = [];
    const contents =
      data?.contents?.[0]?.searchSuggestionsSectionRenderer?.contents ||
      data?.contents || [];

    for (const content of contents) {
      const runs = content?.searchSuggestionRenderer?.suggestion?.runs || [];
      const text = runs.map((r: Record<string, unknown>) => r.text).join("");
      if (text) suggestions.push(text);
    }
    return suggestions;
  }

  private parseMusicItem(item: any) {
    if (!item) return null;
    const title =
      item.flexColumns?.[0]?.musicResponsiveListItemFlexColumnRenderer?.text
        ?.runs?.[0]?.text;
    const thumbnail =
      item.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url;
    const videoId =
      item.overlay?.musicItemThumbnailOverlayRenderer?.content
        ?.musicPlayButtonRenderer?.playNavigationEndpoint?.watchEndpoint
        ?.videoId;
    const browseId = item.navigationEndpoint?.browseEndpoint?.browseId;
    const subtitle =
      item.flexColumns?.[1]?.musicResponsiveListItemFlexColumnRenderer?.text
        ?.runs || [];
    const duration =
      item.fixedColumns?.[0]?.musicResponsiveListItemFixedColumnRenderer?.text
        ?.runs?.[0]?.text;

    return {
      title,
      thumbnails: [{ url: thumbnail }],
      videoId,
      browseId,
      duration,
      resultType: videoId ? "song" : browseId?.startsWith("UC")
        ? "artist"
        : "album",
    };
  }

  private parseTracksFromContents(contents: any[]): Record<
    string,
    unknown
  >[] {
    const tracks: Record<string, unknown>[] = [];
    for (const section of contents) {
      const items = section.musicShelfRenderer?.contents || [];
      for (const item of items) {
        const parsed = this.parseMusicItem(
          item.musicResponsiveListItemRenderer,
        );
        if (parsed) tracks.push(parsed);
      }
    }
    return tracks;
  }

  async getArtist(browseId: string) {
    const data: any = await this.makeRequest("browse", { browseId });

    const oldHeader =
      data?.header?.musicDetailHeaderRenderer ||
      data?.header?.musicImmersiveHeaderRenderer ||
      data?.header?.musicVisualHeaderRenderer;

    let name = "";
    let thumbnail = "";
    let description = "";

    if (oldHeader) {
      name = oldHeader.title?.runs?.[0]?.text;
      thumbnail =
        oldHeader.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
          ?.slice(-1)[0]?.url ||
        oldHeader.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail
          ?.thumbnails?.slice(-1)[0]?.url;
      description = oldHeader.description?.musicDescriptionShelfRenderer?.description?.runs?.[0]?.text || "";
    }

    const primaryContents =
      data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer
        ?.content?.sectionListRenderer?.contents || [];

    for (const section of primaryContents) {
      if (section.musicResponsiveHeaderRenderer) {
        const h = section.musicResponsiveHeaderRenderer;
        name = h.title?.runs?.[0]?.text || name;
        thumbnail =
          h.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
            ?.slice(-1)[0]?.url || thumbnail;
        description =
          h.description?.musicDescriptionShelfRenderer?.description?.runs?.[0]
            ?.text || description;
      }
    }

    const secondaryContents =
      data?.contents?.twoColumnBrowseResultsRenderer?.secondaryContents
        ?.sectionListRenderer?.contents || [];

    const albums: Record<string, unknown>[] = [];
    const singles: Record<string, unknown>[] = [];

    for (const section of secondaryContents) {
      if (section.musicShelfRenderer || section.musicCarouselShelfRenderer) {
        const contents = section.musicShelfRenderer?.contents ||
          section.musicCarouselShelfRenderer?.contents;
        const title = section.musicShelfRenderer?.title?.runs?.[0]?.text ||
          section.musicCarouselShelfRenderer?.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text;

        if (contents) {
          for (const item of contents) {
            const parsed = this.parseMusicItem(
              item.musicResponsiveListItemRenderer ||
              item.musicTwoRowItemRenderer,
            );
            if (parsed) {
              if (title?.toLowerCase().includes("album")) {
                albums.push(parsed);
              } else if (title?.toLowerCase().includes("single")) {
                singles.push(parsed);
              }
            }
          }
        }
      }
    }

    return {
      browseId,
      name,
      thumbnail,
      description,
      albums,
      singles,
    };
  }

  async getRadio(videoId: string, limit = 25) {
    try {
      // First get the song info to find the radio playlist
      const songData = await this.makeRequest("player", { videoId });
      const radioPlaylistId = songData?.playerOverlays?.playerOverlayRenderer
        ?.browserMediaSession?.browserMediaSessionRenderer?.radioPlaylistId;

      if (!radioPlaylistId) {
        // Fallback: use related tracks as radio
        const related = await this.getRelated(videoId);
        return related.slice(0, limit);
      }

      // Browse the radio playlist
      const browseId = `VL${radioPlaylistId.replace(/^VL/, "")}`;
      const data = await this.makeRequest("browse", { browseId });

      const contents = data?.contents?.twoColumnBrowseResultsRenderer
        ?.secondaryContents?.sectionListRenderer?.contents || [];

      const tracks = [];
      for (const section of contents) {
        if (section.musicPlaylistShelfRenderer) {
          for (const item of section.musicPlaylistShelfRenderer.contents.slice(0, limit)) {
            const parsed = this.parseMusicItem(item.musicResponsiveListItemRenderer);
            if (parsed) tracks.push(parsed);
          }
        }
      }

      return tracks.slice(0, limit);
    } catch (error) {
      console.error("Error getting radio:", error);
      // Fallback to related tracks
      try {
        const related = await this.getRelated(videoId);
        return related.slice(0, limit);
      } catch {
        return [];
      }
    }
  }

  async getTrendingMusic(country = "US") {
    try {
      const browseId = "FEmusic_trending";
      const params = country !== "US" ? `6gIQAjAA${country}` : undefined;

      const data = await this.makeRequest("browse", { browseId, params });
      const contents = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.sectionListRenderer?.contents;

      if (!contents) return [];

      const trending = [];
      for (const section of contents) {
        if (section.musicCarouselShelfRenderer) {
          const items = section.musicCarouselShelfRenderer.contents || [];
          for (const item of items) {
            if (item.musicTwoRowItemRenderer) {
              const track = item.musicTwoRowItemRenderer;
              trending.push({
                videoId: track.navigationEndpoint?.watchEndpoint?.videoId,
                title: track.title?.runs?.[0]?.text || "",
                artist: track.subtitle?.runs?.[0]?.text || "",
                thumbnail: track.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url || "",
                views: track.subtitle?.runs?.[2]?.text || "",
              });
            }
          }
        }
      }

      return trending.slice(0, 50);
    } catch (error) {
      console.error("Error getting trending music:", error);
      return [];
    }
  }

  async getTopArtists(limit = 50) {
    try {
      const browseId = "FEmusic_charts";
      const data = await this.makeRequest("browse", { browseId });

      const contents = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.sectionListRenderer?.contents;

      if (!contents) return [];

      const artists = [];
      for (const section of contents) {
        if (section.musicCarouselShelfRenderer) {
          const header = section.musicCarouselShelfRenderer.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text;
          if (header?.toLowerCase().includes("artist")) {
            const items = section.musicCarouselShelfRenderer.contents || [];
            for (const item of items.slice(0, limit)) {
              if (item.musicTwoRowItemRenderer) {
                const artist = item.musicTwoRowItemRenderer;
                artists.push({
                  browseId: artist.navigationEndpoint?.browseEndpoint?.browseId,
                  name: artist.title?.runs?.[0]?.text || "",
                  subscribers: artist.subtitle?.runs?.[0]?.text || "",
                  thumbnail: artist.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url || "",
                });
              }
            }
          }
        }
      }

      return artists;
    } catch (error) {
      console.error("Error getting top artists:", error);
      return [];
    }
  }

  async getTopTracks(limit = 50) {
    try {
      const browseId = "FEmusic_charts";
      const data = await this.makeRequest("browse", { browseId });

      const contents = data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.sectionListRenderer?.contents;

      if (!contents) return [];

      const tracks = [];
      for (const section of contents) {
        if (section.musicCarouselShelfRenderer) {
          const header = section.musicCarouselShelfRenderer.header?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text;
          if (header?.toLowerCase().includes("track") || header?.toLowerCase().includes("song")) {
            const items = section.musicCarouselShelfRenderer.contents || [];
            for (const item of items.slice(0, limit)) {
              if (item.musicTwoRowItemRenderer) {
                const track = item.musicTwoRowItemRenderer;
                tracks.push({
                  videoId: track.navigationEndpoint?.watchEndpoint?.videoId,
                  title: track.title?.runs?.[0]?.text || "",
                  artist: track.subtitle?.runs?.[0]?.text || "",
                  thumbnail: track.thumbnailRenderer?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url || "",
                  rank: tracks.length + 1,
                });
              }
            }
          }
        }
      }

      return tracks;
    } catch (error) {
      console.error("Error getting top tracks:", error);
      return [];
    }
  }
}

// ============ COMPLETE DATA FUNCTIONS ============

export async function getArtistComplete(artistName: string) {
  const ytmusic = new YTMusic();

  // Get Last.fm info
  const lastfmInfo = await LastFM.getArtistInfo(artistName);

  // Search for artist on YouTube Music to get browseId
  const searchResults = await ytmusic.search(`${artistName} artist`, "artists");
  const artistBrowseId = searchResults.results?.[0]?.browseId;

  let ytArtist: Record<string, unknown> | null = null;
  if (artistBrowseId) {
    ytArtist = await ytmusic.getArtist(artistBrowseId as string);
  }

  // Search for albums by this artist
  const albumResults = await ytmusic.search(`${artistName} albums`, "albums");
  const albums = albumResults.results || [];

  return {
    success: true,
    artist: {
      name: artistName,
      lastfm: lastfmInfo.success ? lastfmInfo : null,
      youtube: ytArtist,
    },
    discography: {
      albums,
      totalAlbums: albums.length,
    },
  };
}

export async function getAlbumComplete(browseId: string) {
  const ytmusic = new YTMusic();

  // Get album from YouTube Music
  const album = await ytmusic.getAlbum(browseId);

  if (!album?.title) {
    return { success: false, error: "Album not found" };
  }

  // Enhance tracks with Last.fm info
  const enhancedTracks = await Promise.all(
    (album.tracks as Record<string, unknown>[]).map(async (track: Record<string, unknown>) => {
      const trackInfo = await LastFM.getTrackInfo(
        track.title as string,
        album.artist as string,
      );
      return {
        ...track,
        lastfm: trackInfo.success ? trackInfo : null,
      };
    })
  );

  return {
    success: true,
    album: {
      ...album,
      tracks: enhancedTracks,
    },
  };
}

// ============ LAST.FM API ============
export const LastFM = {
  API_KEY: "0867bcb6f36c879398969db682a7b69b",

  async getSimilarTracks(
    title: string,
    artist: string,
    limit = "5",
  ): Promise<Record<string, unknown> | Record<string, unknown>[]> {
    const url =
      `https://ws.audioscrobbler.com/2.0/?method=track.getsimilar&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&api_key=${this.API_KEY}&limit=${limit}&format=json`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data?.error) return { error: data.message || "Last.fm error" };
      return (data?.similartracks?.track || [])
        .map((t: Record<string, unknown>) => ({
          title: t.name as string,
          artist: (t.artist as Record<string, unknown>)?.name as string,
        }))
        .filter((t: Record<string, unknown>) => t.title && t.artist);
    } catch {
      return { error: "Failed to fetch similar tracks" };
    }
  },

  async getArtistInfo(
    artist: string,
  ): Promise<Record<string, unknown>> {
    try {
      const url =
        `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artist)}&api_key=${this.API_KEY}&format=json`;
      const response = await fetch(url);
      const data = await response.json();
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
  },

  async getTrackInfo(
    title: string,
    artist: string,
  ): Promise<Record<string, unknown>> {
    try {
      const url =
        `https://ws.audioscrobbler.com/2.0/?method=track.getInfo&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&api_key=${this.API_KEY}&format=json`;
      const response = await fetch(url);
      const data = await response.json();
      if (data?.error) return { success: false, error: data.message };

      const t = data?.track;
      return {
        success: true,
        name: t?.name,
        artist: t?.artist?.name,
        album: t?.album?.title,
        duration: t?.duration,
        listeners: t?.listeners,
        playcount: t?.playcount,
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  },
};

// ============ LYRICS API ============
export async function getLyrics(
  title: string,
  artist: string,
  duration?: number,
): Promise<Record<string, unknown>> {
  try {
    let url =
      `https://lrclib.net/api/get?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`;
    if (duration) url += `&duration=${duration}`;

    let response = await fetch(url);
    let data = await response.json();

    if (!data || data.statusCode === 404) {
      const searchUrl =
        `https://lrclib.net/api/search?q=${encodeURIComponent(`${title} ${artist}`)}`;
      response = await fetch(searchUrl);
      const results = await response.json();
      if (Array.isArray(results) && results.length > 0) {
        data = results[0];
      }
    }

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
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ============ STREAMING API ============
const pipeInstances = [
  "https://api.piped.private.coffee",
  "https://pipedapi.darkness.services",
  "https://pipedapi.r4fo.com",
  "https://api.piped.yt",
  "https://pipedapi.kavin.rocks",
];

const invidiousInstances = [
  "https://invidious.snopyta.org",
  "https://invidious.kavin.rocks",
  "https://invidious-us.kavin.rocks",
  "https://invidious.fdn.fr",
  "https://invidious.nerdvpn.de",
];

export async function fetchFromPiped(
  videoId: string,
): Promise<Record<string, unknown>> {
  for (const instance of pipeInstances) {
    try {
      const response = await fetch(`${instance}/streams/${videoId}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      const data = await response.json();

      if (data?.error) continue;
      if (data?.audioStreams?.length) {
        return {
          success: true,
          instance,
          streamingUrls: data.audioStreams.map(
            (s: Record<string, unknown>) => ({
              url: s.url,
              quality: s.quality,
              mimeType: s.mimeType,
              bitrate: s.bitrate,
            }),
          ),
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
    } catch {
      continue;
    }
  }
  return { success: false, error: "No working Piped instances found" };
}

export async function fetchFromInvidious(
  videoId: string,
): Promise<Record<string, unknown>> {
  for (const instance of invidiousInstances) {
    try {
      const response = await fetch(`${instance}/api/v1/videos/${videoId}`, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });
      const data = await response.json();

      if (data?.error) continue;
      if (data?.adaptiveFormats?.length) {
        // Filter for audio-only formats
        const audioStreams = data.adaptiveFormats.filter(
          (format: Record<string, unknown>) => {
            const type = format.type as string;
            return type?.includes("audio") && !type?.includes("video");
          },
        );

        if (audioStreams.length) {
          return {
            success: true,
            instance,
            streamingUrls: audioStreams.map(
              (s: Record<string, unknown>) => ({
                url: s.url,
                quality: s.bitrate ? `${Math.round(Number(s.bitrate) / 1000)}kbps` : "unknown",
                mimeType: s.type,
                bitrate: s.bitrate,
              }),
            ),
            metadata: {
              id: videoId,
              title: data.title,
              uploader: data.author,
              thumbnail: data.videoThumbnails?.[0]?.url,
              duration: data.lengthSeconds,
              views: data.viewCount,
            },
            hlsUrl: null, // Invidious doesn't provide HLS
          };
        }
      }
    } catch {
      continue;
    }
  }
  return { success: false, error: "No working Invidious instances found" };
}

// ============ YOUTUBE SEARCH API ============

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
      `${this.searchURL}?search_query=${encodeURIComponent(normalizedQuery)}&sp=EgIQAQ%253D%253D`
    );
    const html = await response.text();
    this.extractAPIConfig(html);
    return this.parseVideoResults(html);
  }

  private extractAPIConfig(html: string) {
    // Extract API key
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/);
    if (apiKeyMatch) {
      this.apiKey = apiKeyMatch[1];
    }

    // Extract client version
    const clientVersionMatch = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/);
    if (clientVersionMatch) {
      this.clientVersion = clientVersionMatch[1];
    }
  }

  private parseVideoResults(html: string) {
    const results: any[] = [];
    let continuationToken: string | undefined;

    // Extract video data from ytInitialData
    const ytInitialDataMatch = html.match(/var ytInitialData = ({.*?});/);
    if (ytInitialDataMatch) {
      try {
        const data = JSON.parse(ytInitialDataMatch[1]);
        const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;

        if (contents) {
          for (const item of contents) {
            if (item.videoRenderer) {
              const video = item.videoRenderer;
              results.push({
                id: video.videoId,
                title: video.title?.runs?.[0]?.text || "",
                channel: {
                  id: video.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || "",
                  name: video.ownerText?.runs?.[0]?.text || "",
                  url: video.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || "",
                },
                duration: video.lengthText?.simpleText || "",
                viewCount: video.viewCountText?.simpleText || "",
                publishedTime: video.publishedTimeText?.simpleText || "",
                thumbnail: video.thumbnail?.thumbnails?.[0]?.url || "",
                url: `https://www.youtube.com/watch?v=${video.videoId}`,
              });
            }
          }
        }

        // Extract continuation token
        const continuationContents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
        if (continuationContents) {
          for (const section of continuationContents) {
            if (section.continuationItemRenderer) {
              continuationToken = section.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token;
              break;
            }
          }
        }
      } catch (error) {
        console.error("Failed to parse YouTube search results:", error);
      }
    }

    return {
      results,
      continuationToken,
    };
  }

  private async fetchContinuation(continuationToken: string, filter: string) {
    if (!this.apiKey || !this.clientVersion) {
      throw new Error("API configuration not available. Perform an initial search first.");
    }

    const payload = {
      context: {
        client: {
          clientName: "WEB",
          clientVersion: this.clientVersion,
          hl: "en",
          gl: "US",
        },
      },
      continuation: continuationToken,
    };

    const response = await fetch(this.continuationURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`YouTube API request failed: ${response.status}`);
    }

    const data = await response.json();
    return this.parseContinuationResults(data, filter);
  }

  private parseContinuationResults(data: any, filter: string) {
    const results: any[] = [];
    let continuationToken: string | undefined;

    try {
      const contents = data?.onResponseReceivedCommands?.[0]?.appendContinuationItemsAction?.continuationItems;

      if (contents) {
        for (const item of contents) {
          if (item.videoRenderer) {
            const video = item.videoRenderer;
            results.push({
              id: video.videoId,
              title: video.title?.runs?.[0]?.text || "",
              channel: {
                id: video.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || "",
                name: video.ownerText?.runs?.[0]?.text || "",
                url: video.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || "",
              },
              duration: video.lengthText?.simpleText || "",
              viewCount: video.viewCountText?.simpleText || "",
              publishedTime: video.publishedTimeText?.simpleText || "",
              thumbnail: video.thumbnail?.thumbnails?.[0]?.url || "",
              url: `https://www.youtube.com/watch?v=${video.videoId}`,
            });
          } else if (item.continuationItemRenderer) {
            continuationToken = item.continuationItemRenderer.continuationEndpoint?.continuationCommand?.token;
          }
        }
      }
    } catch (error) {
      console.error("Failed to parse continuation results:", error);
    }

    return {
      results,
      continuationToken,
    };
  }
}
