// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

import { ulid } from "jsr:@std/ulid";
import { kv } from "@/utils/db.ts";

// ============ MUSIC DATA MODELS ============
export interface Track {
  id: string;
  videoId: string;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  thumbnail?: string;
  userLogin: string;
  createdAt: number;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  userLogin: string;
  trackIds: string[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface SearchResult {
  id: string;
  query: string;
  filter?: string;
  resultCount: number;
  userLogin: string;
  createdAt: number;
}

// ============ AI-ENHANCED MODELS ============
export interface AudioFeatures {
  trackId: string;
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  liveness: number;
  loudness: number;
  speechiness: number;
  valence: number;
  tempo: number;
  key: string;
  mode: string;
  timeSignature: string;
  estimatedDuration: number;
  complexity: number;
  productionStyle: string[];
  instrumentation: string[];
  era: string;
  createdAt: number;
}

export interface TrackEmbedding {
  trackId: string;
  videoId: string;
  embedding: number[];
  text: string;
  createdAt: number;
}

export interface UserTasteProfile {
  userLogin: string;
  genres: { name: string; weight: number }[];
  eras: { name: string; weight: number }[];
  moods: { name: string; weight: number }[];
  artists: { name: string; weight: number }[];
  energyPreference: number;
  valencePreference: number;
  discoveryGoals: string[];
  updatedAt: number;
}

export interface AIPlaylist {
  id: string;
  name: string;
  description: string;
  prompt: string;
  userLogin: string;
  tracks: { title: string; artist: string; videoId?: string; genre?: string; mood?: string }[];
  themes: string[];
  mood: string;
  energyCurve: string;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ListeningHistory {
  id: string;
  userLogin: string;
  videoId: string;
  title: string;
  artist: string;
  genre?: string;
  playedAt: number;
  duration: number;
  completionRate: number;
  liked: boolean;
}

export interface LyricsAnalysis {
  trackId: string;
  videoId: string;
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  themes: string[];
  mood: string;
  summary: string;
  keyPhrases: string[];
  emotionalJourney: string;
  createdAt: number;
}

// ============ TRACK OPERATIONS ============
export async function createTrack(track: Omit<Track, "id" | "createdAt">) {
  const newTrack: Track = {
    ...track,
    id: ulid(),
    createdAt: Date.now(),
  };
  const tracksKey = ["tracks", newTrack.id];
  const tracksByUserKey = ["tracks_by_user", track.userLogin, newTrack.id];
  const tracksByVideoIdKey = [
    "tracks_by_videoid",
    track.videoId,
    newTrack.id,
  ];
  const res = await kv.atomic()
    .check({ key: tracksKey, versionstamp: null })
    .set(tracksKey, newTrack)
    .set(tracksByUserKey, newTrack)
    .set(tracksByVideoIdKey, newTrack)
    .commit();
  if (!res.ok) throw new Error("Failed to create track");
  return newTrack;
}

export async function getTrack(trackId: string): Promise<Track | null> {
  const res = await kv.get(["tracks", trackId]);
  return res.value as Track | null;
}

export async function getTracksByUser(userLogin: string): Promise<Track[]> {
  const iter = kv.list({ prefix: ["tracks_by_user", userLogin] });
  const tracks: Track[] = [];
  for await (const entry of iter) {
    tracks.push(entry.value as Track);
  }
  return tracks;
}

export async function getTracksByVideoId(videoId: string): Promise<Track[]> {
  const iter = kv.list({ prefix: ["tracks_by_videoid", videoId] });
  const tracks: Track[] = [];
  for await (const entry of iter) {
    tracks.push(entry.value as Track);
  }
  return tracks;
}

export async function deleteTrack(
  trackId: string,
  userLogin: string,
): Promise<boolean> {
  const track = await getTrack(trackId);
  if (!track || track.userLogin !== userLogin) return false;
  await kv.atomic()
    .delete(["tracks", trackId])
    .delete(["tracks_by_user", userLogin, trackId])
    .delete(["tracks_by_videoid", track.videoId, trackId])
    .commit();
  return true;
}

// ============ PLAYLIST OPERATIONS ============
export async function createPlaylist(
  playlist: Omit<Playlist, "id" | "createdAt" | "updatedAt">,
) {
  const newPlaylist: Playlist = {
    ...playlist,
    id: ulid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const playlistsKey = ["playlists", newPlaylist.id];
  const playlistsByUserKey = [
    "playlists_by_user",
    playlist.userLogin,
    newPlaylist.id,
  ];
  const res = await kv.atomic()
    .check({ key: playlistsKey, versionstamp: null })
    .set(playlistsKey, newPlaylist)
    .set(playlistsByUserKey, newPlaylist)
    .commit();
  if (!res.ok) throw new Error("Failed to create playlist");
  return newPlaylist;
}

export async function getPlaylist(playlistId: string): Promise<Playlist | null> {
  const res = await kv.get(["playlists", playlistId]);
  return res.value as Playlist | null;
}

export async function getPlaylistsByUser(userLogin: string): Promise<Playlist[]> {
  const iter = kv.list({ prefix: ["playlists_by_user", userLogin] });
  const playlists: Playlist[] = [];
  for await (const entry of iter) {
    playlists.push(entry.value as Playlist);
  }
  return playlists;
}

export async function updatePlaylist(
  playlistId: string,
  userLogin: string,
  updates: Partial<Omit<Playlist, "id" | "userLogin" | "createdAt">>,
): Promise<Playlist | null> {
  const playlist = await getPlaylist(playlistId);
  if (!playlist || playlist.userLogin !== userLogin) return null;
  const updated: Playlist = {
    ...playlist,
    ...updates,
    updatedAt: Date.now(),
  };
  const playlistsKey = ["playlists", playlistId];
  const playlistsByUserKey = ["playlists_by_user", userLogin, playlistId];
  await kv.atomic()
    .set(playlistsKey, updated)
    .set(playlistsByUserKey, updated)
    .commit();
  return updated;
}

export async function addTrackToPlaylist(
  playlistId: string,
  trackId: string,
  userLogin: string,
): Promise<boolean> {
  const playlist = await getPlaylist(playlistId);
  if (!playlist || playlist.userLogin !== userLogin) return false;
  if (playlist.trackIds.includes(trackId)) return true;
  const updated = await updatePlaylist(playlistId, userLogin, {
    trackIds: [...playlist.trackIds, trackId],
  });
  return updated !== null;
}

export async function removeTrackFromPlaylist(
  playlistId: string,
  trackId: string,
  userLogin: string,
): Promise<boolean> {
  const playlist = await getPlaylist(playlistId);
  if (!playlist || playlist.userLogin !== userLogin) return false;
  const updated = await updatePlaylist(playlistId, userLogin, {
    trackIds: playlist.trackIds.filter((id) => id !== trackId),
  });
  return updated !== null;
}

export async function deletePlaylist(
  playlistId: string,
  userLogin: string,
): Promise<boolean> {
  const playlist = await getPlaylist(playlistId);
  if (!playlist || playlist.userLogin !== userLogin) return false;
  await kv.atomic()
    .delete(["playlists", playlistId])
    .delete(["playlists_by_user", userLogin, playlistId])
    .commit();
  return true;
}

export async function reorderTracksInPlaylist(
  playlistId: string,
  trackIds: string[],
  userLogin: string,
): Promise<boolean> {
  const playlist = await getPlaylist(playlistId);
  if (!playlist || playlist.userLogin !== userLogin) return false;

  // Validate that all trackIds exist in the current playlist
  const currentTrackIds = new Set(playlist.trackIds);
  const newTrackIds = new Set(trackIds);

  if (currentTrackIds.size !== newTrackIds.size) return false;
  for (const trackId of trackIds) {
    if (!currentTrackIds.has(trackId)) return false;
  }

  const updated = await updatePlaylist(playlistId, userLogin, {
    trackIds,
  });
  return updated !== null;
}

// ============ SEARCH HISTORY ============
export async function logSearch(
  query: string,
  filter: string | undefined,
  resultCount: number,
  userLogin: string,
) {
  const searchLog: SearchResult = {
    id: ulid(),
    query,
    filter,
    resultCount,
    userLogin,
    createdAt: Date.now(),
  };
  const key = ["search_history", userLogin, searchLog.id];
  await kv.set(key, searchLog);
}

export async function getSearchHistory(
  userLogin: string,
  limit = 20,
): Promise<SearchResult[]> {
  const iter = kv.list(
    { prefix: ["search_history", userLogin] },
    { limit, reverse: true },
  );
  const results: SearchResult[] = [];
  for await (const entry of iter) {
    results.push(entry.value as SearchResult);
  }
  return results;
}

// ============ AUDIO FEATURES OPERATIONS ============
export async function saveAudioFeatures(features: Omit<AudioFeatures, "createdAt">) {
  const newFeatures: AudioFeatures = {
    ...features,
    createdAt: Date.now(),
  };
  await kv.set(["audio_features", features.trackId], newFeatures);
  return newFeatures;
}

export async function getAudioFeatures(trackId: string): Promise<AudioFeatures | null> {
  const res = await kv.get(["audio_features", trackId]);
  return res.value as AudioFeatures | null;
}

// ============ TRACK EMBEDDINGS OPERATIONS ============
export async function saveTrackEmbedding(embedding: Omit<TrackEmbedding, "createdAt">) {
  const newEmbedding: TrackEmbedding = {
    ...embedding,
    createdAt: Date.now(),
  };
  await kv.set(["track_embeddings", embedding.trackId], newEmbedding);
  return newEmbedding;
}

export async function getTrackEmbedding(trackId: string): Promise<TrackEmbedding | null> {
  const res = await kv.get(["track_embeddings", trackId]);
  return res.value as TrackEmbedding | null;
}

export async function getAllTrackEmbeddings(): Promise<TrackEmbedding[]> {
  const iter = kv.list({ prefix: ["track_embeddings"] });
  const embeddings: TrackEmbedding[] = [];
  for await (const entry of iter) {
    embeddings.push(entry.value as TrackEmbedding);
  }
  return embeddings;
}

// ============ USER TASTE PROFILE OPERATIONS ============
export async function saveUserTasteProfile(profile: UserTasteProfile) {
  const updated: UserTasteProfile = {
    ...profile,
    updatedAt: Date.now(),
  };
  await kv.set(["taste_profiles", profile.userLogin], updated);
  return updated;
}

export async function getUserTasteProfile(userLogin: string): Promise<UserTasteProfile | null> {
  const res = await kv.get(["taste_profiles", userLogin]);
  return res.value as UserTasteProfile | null;
}

export async function updateUserTasteProfile(
  userLogin: string,
  updates: Partial<Omit<UserTasteProfile, "userLogin" | "updatedAt">>,
): Promise<UserTasteProfile | null> {
  const existing = await getUserTasteProfile(userLogin);
  if (!existing) return null;
  
  const updated: UserTasteProfile = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };
  await kv.set(["taste_profiles", userLogin], updated);
  return updated;
}

// ============ AI PLAYLIST OPERATIONS ============
export async function createAIPlaylist(
  playlist: Omit<AIPlaylist, "id" | "createdAt" | "updatedAt">,
) {
  const newPlaylist: AIPlaylist = {
    ...playlist,
    id: ulid(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const playlistsKey = ["ai_playlists", newPlaylist.id];
  const playlistsByUserKey = ["ai_playlists_by_user", playlist.userLogin, newPlaylist.id];
  
  const res = await kv.atomic()
    .check({ key: playlistsKey, versionstamp: null })
    .set(playlistsKey, newPlaylist)
    .set(playlistsByUserKey, newPlaylist)
    .commit();
    
  if (!res.ok) throw new Error("Failed to create AI playlist");
  return newPlaylist;
}

export async function getAIPlaylist(playlistId: string): Promise<AIPlaylist | null> {
  const res = await kv.get(["ai_playlists", playlistId]);
  return res.value as AIPlaylist | null;
}

export async function getAIPlaylistsByUser(userLogin: string): Promise<AIPlaylist[]> {
  const iter = kv.list({ prefix: ["ai_playlists_by_user", userLogin] });
  const playlists: AIPlaylist[] = [];
  for await (const entry of iter) {
    playlists.push(entry.value as AIPlaylist);
  }
  return playlists;
}

export async function deleteAIPlaylist(playlistId: string, userLogin: string): Promise<boolean> {
  const playlist = await getAIPlaylist(playlistId);
  if (!playlist || playlist.userLogin !== userLogin) return false;
  
  await kv.atomic()
    .delete(["ai_playlists", playlistId])
    .delete(["ai_playlists_by_user", userLogin, playlistId])
    .commit();
  return true;
}

// ============ LISTENING HISTORY OPERATIONS ============
export async function logListeningEvent(
  event: Omit<ListeningHistory, "id">,
) {
  const newEvent: ListeningHistory = {
    ...event,
    id: ulid(),
  };
  const key = ["listening_history", event.userLogin, newEvent.id];
  await kv.set(key, newEvent);
  return newEvent;
}

export async function getListeningHistory(
  userLogin: string,
  limit = 100,
): Promise<ListeningHistory[]> {
  const iter = kv.list(
    { prefix: ["listening_history", userLogin] },
    { limit, reverse: true },
  );
  const events: ListeningHistory[] = [];
  for await (const entry of iter) {
    events.push(entry.value as ListeningHistory);
  }
  return events;
}

export async function getListeningStats(userLogin: string): Promise<{
  totalPlays: number;
  uniqueTracks: number;
  topGenres: { genre: string; count: number }[];
  topArtists: { artist: string; count: number }[];
  averageCompletionRate: number;
}> {
  const history = await getListeningHistory(userLogin, 1000);
  
  const genreCounts: Record<string, number> = {};
  const artistCounts: Record<string, number> = {};
  const uniqueTracks = new Set(history.map(h => h.videoId));
  let totalCompletion = 0;
  
  for (const event of history) {
    if (event.genre) {
      genreCounts[event.genre] = (genreCounts[event.genre] || 0) + 1;
    }
    artistCounts[event.artist] = (artistCounts[event.artist] || 0) + 1;
    totalCompletion += event.completionRate;
  }
  
  const topGenres = Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
    
  const topArtists = Object.entries(artistCounts)
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    totalPlays: history.length,
    uniqueTracks: uniqueTracks.size,
    topGenres,
    topArtists,
    averageCompletionRate: history.length > 0 ? totalCompletion / history.length : 0,
  };
}

// ============ LYRICS ANALYSIS OPERATIONS ============
export async function saveLyricsAnalysis(
  analysis: Omit<LyricsAnalysis, "createdAt">,
) {
  const newAnalysis: LyricsAnalysis = {
    ...analysis,
    createdAt: Date.now(),
  };
  await kv.set(["lyrics_analysis", analysis.trackId], newAnalysis);
  return newAnalysis;
}

export async function getLyricsAnalysis(trackId: string): Promise<LyricsAnalysis | null> {
  const res = await kv.get(["lyrics_analysis", trackId]);
  return res.value as LyricsAnalysis | null;
}

export async function getLyricsByMood(mood: string): Promise<LyricsAnalysis[]> {
  const iter = kv.list({ prefix: ["lyrics_analysis"] });
  const analyses: LyricsAnalysis[] = [];
  for await (const entry of iter) {
    const analysis = entry.value as LyricsAnalysis;
    if (analysis.mood.toLowerCase().includes(mood.toLowerCase())) {
      analyses.push(analysis);
    }
  }
  return analyses;
}

export async function getLyricsByTheme(theme: string): Promise<LyricsAnalysis[]> {
  const iter = kv.list({ prefix: ["lyrics_analysis"] });
  const analyses: LyricsAnalysis[] = [];
  for await (const entry of iter) {
    const analysis = entry.value as LyricsAnalysis;
    if (analysis.themes.some(t => t.toLowerCase().includes(theme.toLowerCase()))) {
      analyses.push(analysis);
    }
  }
  return analyses;
}
