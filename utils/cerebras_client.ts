// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * Cerebras AI Client for Music API
 * Provides high-performance inference for audio analysis, embeddings, and batch processing
 */

const CEREBRAS_API_KEY = Deno.env.get("CEREBRAS_API_KEY") || "";
const CEREBRAS_BASE_URL = "https://api.cerebras.ai/v1";

export interface CerebrasMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CerebrasResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingResponse {
  data: {
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export class CerebrasClient {
  private apiKey: string;
  private model: string;
  private embeddingModel: string;

  constructor(
    model = "llama3.1-70b",
    embeddingModel = "llama3.1-8b",
  ) {
    this.apiKey = CEREBRAS_API_KEY;
    this.model = model;
    this.embeddingModel = embeddingModel;
  }

  async chat(messages: CerebrasMessage[], temperature = 0.7): Promise<CerebrasResponse> {
    if (!this.apiKey) {
      throw new Error("CEREBRAS_API_KEY not configured");
    }

    const response = await fetch(`${CEREBRAS_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cerebras API error: ${error}`);
    }

    return response.json();
  }

  /**
   * Generate embeddings for text (track metadata, descriptions)
   */
  async createEmbedding(text: string): Promise<number[]> {
    if (!this.apiKey) {
      throw new Error("CEREBRAS_API_KEY not configured");
    }

    const response = await fetch(`${CEREBRAS_BASE_URL}/embeddings`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.embeddingModel,
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cerebras embedding error: ${error}`);
    }

    const data: EmbeddingResponse = await response.json();
    return data.data[0]?.embedding || [];
  }

  /**
   * Batch generate embeddings for multiple texts
   */
  async createEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];
    
    // Process in batches of 10 to avoid rate limits
    for (let i = 0; i < texts.length; i += 10) {
      const batch = texts.slice(i, i + 10);
      const batchPromises = batch.map(text => this.createEmbedding(text));
      const batchResults = await Promise.all(batchPromises);
      embeddings.push(...batchResults);
    }
    
    return embeddings;
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Find similar items using embeddings
   */
  findSimilar(
    targetEmbedding: number[],
    candidates: { id: string; embedding: number[]; metadata?: Record<string, unknown> }[],
    threshold = 0.7,
    limit = 10,
  ): { id: string; similarity: number; metadata?: Record<string, unknown> }[] {
    const similarities = candidates.map(candidate => ({
      id: candidate.id,
      similarity: this.cosineSimilarity(targetEmbedding, candidate.embedding),
      metadata: candidate.metadata,
    }));

    return similarities
      .filter(s => s.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Advanced audio feature extraction from metadata
   */
  async extractAudioFeatures(
    title: string,
    artist: string,
    album?: string,
    genre?: string,
  ): Promise<{
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
  }> {
    const prompt = `Analyze this track and estimate audio features:

Title: ${title}
Artist: ${artist}
${album ? `Album: ${album}` : ""}
${genre ? `Genre: ${genre}` : ""}

Estimate audio features (0.0-1.0 scale where applicable) in JSON format:
{
  "acousticness": 0.5,
  "danceability": 0.7,
  "energy": 0.8,
  "instrumentalness": 0.1,
  "liveness": 0.3,
  "loudness": -8.5,
  "speechiness": 0.05,
  "valence": 0.6,
  "tempo": 120,
  "key": "C major|A minor|etc",
  "mode": "major|minor",
  "timeSignature": "4/4|3/4|6/8|etc",
  "estimatedDuration": 210,
  "complexity": 0.6,
  "productionStyle": ["style1", "style2"],
  "instrumentation": ["guitar", "drums", "synth"],
  "era": "2020s|2010s|2000s|90s|80s|etc"
}`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are an audio analysis expert. Estimate audio features based on track metadata, artist style, and genre characteristics.",
      },
      { role: "user", content: prompt },
    ], 0.3);

    const content = response.choices[0]?.message?.content || "";
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fallback to defaults
    }

    return {
      acousticness: 0.5,
      danceability: 0.5,
      energy: 0.5,
      instrumentalness: 0.5,
      liveness: 0.5,
      loudness: -10,
      speechiness: 0.5,
      valence: 0.5,
      tempo: 120,
      key: "C major",
      mode: "major",
      timeSignature: "4/4",
      estimatedDuration: 180,
      complexity: 0.5,
      productionStyle: [],
      instrumentation: [],
      era: "unknown",
    };
  }

  /**
   * Batch extract audio features for multiple tracks
   */
  async extractAudioFeaturesBatch(
    tracks: { title: string; artist: string; album?: string; genre?: string }[],
  ): Promise<{
    trackId: string;
    features: ReturnType<typeof CerebrasClient.prototype.extractAudioFeatures> extends Promise<infer T> ? T : never;
  }[]> {
    const results: {
      trackId: string;
      features: ReturnType<typeof CerebrasClient.prototype.extractAudioFeatures> extends Promise<infer T> ? T : never;
    }[] = [];

    // Process in batches of 5
    for (let i = 0; i < tracks.length; i += 5) {
      const batch = tracks.slice(i, i + 5);
      const batchPromises = batch.map(async (track, idx) => {
        const features = await this.extractAudioFeatures(
          track.title,
          track.artist,
          track.album,
          track.genre,
        );
        return {
          trackId: `${i + idx}`,
          features,
        };
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Generate semantic search query expansion
   */
  async expandSearchQuery(
    query: string,
  ): Promise<{
    expanded: string[];
    relatedGenres: string[];
    relatedArtists: string[];
    relatedMoods: string[];
    intent: "artist" | "song" | "album" | "genre" | "mood" | "discovery";
  }> {
    const prompt = `Expand this music search query: "${query}"

Provide expanded search terms and related concepts in JSON:
{
  "expanded": ["term1", "term2", "term3"],
  "relatedGenres": ["genre1", "genre2"],
  "relatedArtists": ["artist1", "artist2"],
  "relatedMoods": ["mood1", "mood2"],
  "intent": "artist|song|album|genre|mood|discovery"
}`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are a music search expert. Expand queries with synonyms, related genres, artists, and understand search intent.",
      },
      { role: "user", content: prompt },
    ], 0.5);

    const content = response.choices[0]?.message?.content || "";
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fallback
    }

    return {
      expanded: [query],
      relatedGenres: [],
      relatedArtists: [],
      relatedMoods: [],
      intent: "discovery",
    };
  }

  /**
   * Generate music trend analysis
   */
  async analyzeTrends(
    tracks: { title: string; artist: string; genre?: string; releaseDate?: string }[],
  ): Promise<{
    dominantGenres: { genre: string; percentage: number }[];
    eraDistribution: { era: string; count: number }[];
    emergingPatterns: string[];
    recommendations: { type: string; description: string }[];
    summary: string;
  }> {
    const prompt = `Analyze music trends from this dataset of ${tracks.length} tracks:

${tracks.slice(0, 50).map((t, i) => `${i + 1}. "${t.title}" by ${t.artist}${t.genre ? ` (${t.genre})` : ""}${t.releaseDate ? ` [${t.releaseDate}]` : ""}`).join("\n")}

Provide trend analysis in JSON:
{
  "dominantGenres": [{"genre": "genre name", "percentage": 35}],
  "eraDistribution": [{"era": "2020s", "count": 45}],
  "emergingPatterns": ["pattern 1", "pattern 2"],
  "recommendations": [
    {"type": "genre|artist|era", "description": "recommendation"}
  ],
  "summary": "Brief trend summary"
}`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are a music trend analyst. Identify patterns, genre distributions, and emerging trends in music collections.",
      },
      { role: "user", content: prompt },
    ], 0.5);

    const content = response.choices[0]?.message?.content || "";
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fallback
    }

    return {
      dominantGenres: [],
      eraDistribution: [],
      emergingPatterns: [],
      recommendations: [],
      summary: "Analysis unavailable",
    };
  }

  /**
   * Generate collaborative filtering recommendations
   */
  async collaborativeFilter(
    userHistory: { title: string; artist: string; rating?: number }[],
    similarUsers: { userId: string; tracks: { title: string; artist: string }[] }[],
  ): Promise<{
    recommendations: {
      title: string;
      artist: string;
      confidence: number;
      source: string;
    }[];
    userSimilarity: { userId: string; similarity: number }[];
  }> {
    const prompt = `Generate collaborative filtering recommendations:

User History:
${userHistory.map(h => `- "${h.title}" by ${h.artist}${h.rating ? ` [${h.rating}/5]` : ""}`).join("\n")}

Similar Users:
${similarUsers.slice(0, 5).map((u, i) => `User ${i + 1}:\n${u.tracks.slice(0, 10).map(t => `  - "${t.title}" by ${t.artist}`).join("\n")}`).join("\n\n")}

Provide recommendations in JSON:
{
  "recommendations": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "confidence": 0.85,
      "source": "user1|user2|etc"
    }
  ],
  "userSimilarity": [
    {"userId": "user1", "similarity": 0.75}
  ]
}`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are a collaborative filtering recommendation engine. Find patterns across users and suggest items liked by similar users.",
      },
      { role: "user", content: prompt },
    ], 0.5);

    const content = response.choices[0]?.message?.content || "";
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fallback
    }

    return {
      recommendations: [],
      userSimilarity: [],
    };
  }

  /**
   * Generate playlist continuation based on existing tracks
   */
  async generatePlaylistContinuation(
    existingTracks: { title: string; artist: string }[],
    count = 10,
  ): Promise<{
    continuation: { title: string; artist: string; reason: string }[];
    coherence: number;
    genreProgression: string;
  }> {
    const prompt = `Continue this playlist with ${count} more tracks:

Existing Tracks:
${existingTracks.map((t, i) => `${i + 1}. "${t.title}" by ${t.artist}`).join("\n")}

Provide continuation in JSON:
{
  "continuation": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "reason": "Why this fits the playlist flow"
    }
  ],
  "coherence": 0.9,
  "genreProgression": "Description of how genres flow"
}`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are a playlist continuation expert. Analyze existing tracks and suggest songs that maintain and enhance the playlist's flow and coherence.",
      },
      { role: "user", content: prompt },
    ], 0.7);

    const content = response.choices[0]?.message?.content || "";
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch {
      // Fallback
    }

    return {
      continuation: [],
      coherence: 0.5,
      genreProgression: "",
    };
  }
}

// Export singleton instance
export const cerebrasClient = new CerebrasClient();
