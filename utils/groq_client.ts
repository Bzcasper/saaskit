// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * Groq AI Client for Music API
 * Provides ultra-fast LLM inference for music recommendations, analysis, and generation
 */

const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY") || "";
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqResponse {
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

export class GroqClient {
  private apiKey: string;
  private model: string;

  constructor(model = "llama-3.3-70b-versatile") {
    this.apiKey = GROQ_API_KEY;
    this.model = model;
  }

  async chat(messages: GroqMessage[], temperature = 0.7): Promise<GroqResponse> {
    if (!this.apiKey) {
      throw new Error("GROQ_API_KEY not configured");
    }

    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
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
      throw new Error(`Groq API error: ${error}`);
    }

    return response.json();
  }

  /**
   * Generate music recommendations based on user history and preferences
   */
  async generateRecommendations(
    userHistory: { title: string; artist: string; genre?: string }[],
    preferences: { genres?: string[]; mood?: string; energy?: string },
    limit = 10,
  ): Promise<{
    recommendations: {
      title: string;
      artist: string;
      reason: string;
      confidence: number;
    }[];
    analysis: string;
  }> {
    const prompt = `Based on the user's listening history and preferences, generate ${limit} personalized music recommendations.

Listening History:
${userHistory.map(h => `- "${h.title}" by ${h.artist}${h.genre ? ` (${h.genre})` : ""}`).join("\n")}

User Preferences:
${preferences.genres ? `Preferred Genres: ${preferences.genres.join(", ")}` : ""}
${preferences.mood ? `Desired Mood: ${preferences.mood}` : ""}
${preferences.energy ? `Energy Level: ${preferences.energy}` : ""}

Provide recommendations in JSON format with this structure:
{
  "recommendations": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "reason": "Why this matches the user's taste",
      "confidence": 0.95
    }
  ],
  "analysis": "Brief analysis of the user's taste profile"
}`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are a music recommendation expert. Analyze listening patterns and provide personalized suggestions with explanations.",
      },
      { role: "user", content: prompt },
    ]);

    const content = response.choices[0]?.message?.content || "";
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { recommendations: [], analysis: content };
    } catch {
      return { recommendations: [], analysis: content };
    }
  }

  /**
   * Generate playlist from natural language description
   */
  async generatePlaylistFromDescription(
    description: string,
    trackCount = 20,
  ): Promise<{
    name: string;
    description: string;
    tracks: { title: string; artist: string; genre?: string; mood?: string }[];
    themes: string[];
  }> {
    const prompt = `Create a music playlist based on this description: "${description}"

Generate exactly ${trackCount} tracks in JSON format:
{
  "name": "Creative playlist name",
  "description": "Brief description of the playlist vibe",
  "tracks": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "genre": "Primary genre",
      "mood": "Mood descriptor"
    }
  ],
  "themes": ["theme1", "theme2", "theme3"]
}`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are a playlist curator. Create cohesive, well-structured playlists based on natural language descriptions.",
      },
      { role: "user", content: prompt },
    ]);

    const content = response.choices[0]?.message?.content || "";
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {
        name: "Generated Playlist",
        description: description,
        tracks: [],
        themes: [],
      };
    } catch {
      return {
        name: "Generated Playlist",
        description: description,
        tracks: [],
        themes: [],
      };
    }
  }

  /**
   * Analyze music lyrics for themes, sentiment, and meaning
   */
  async analyzeLyrics(
    title: string,
    artist: string,
    lyrics: string,
  ): Promise<{
    sentiment: "positive" | "negative" | "neutral" | "mixed";
    themes: string[];
    mood: string;
    summary: string;
    keyPhrases: string[];
    emotionalJourney: string;
  }> {
    const prompt = `Analyze these song lyrics for "${title}" by ${artist}:

"""
${lyrics}
"""

Provide analysis in JSON format:
{
  "sentiment": "positive|negative|neutral|mixed",
  "themes": ["theme1", "theme2", "theme3"],
  "mood": "Overall mood description",
  "summary": "Brief summary of what the song is about (2-3 sentences)",
  "keyPhrases": ["memorable phrase 1", "memorable phrase 2"],
  "emotionalJourney": "Description of emotional progression through the song"
}`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are a music analyst specializing in lyrical interpretation and thematic analysis.",
      },
      { role: "user", content: prompt },
    ], 0.5);

    const content = response.choices[0]?.message?.content || "";
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {
        sentiment: "neutral",
        themes: [],
        mood: "unknown",
        summary: content,
        keyPhrases: [],
        emotionalJourney: "",
      };
    } catch {
      return {
        sentiment: "neutral",
        themes: [],
        mood: "unknown",
        summary: content,
        keyPhrases: [],
        emotionalJourney: "",
      };
    }
  }

  /**
   * Generate similar tracks based on a seed track
   */
  async findSimilarTracks(
    title: string,
    artist: string,
    genre?: string,
    limit = 10,
  ): Promise<{
    similar: {
      title: string;
      artist: string;
      similarity: string;
      reason: string;
    }[];
    characteristics: string[];
  }> {
    const prompt = `Find ${limit} tracks similar to "${title}" by ${artist}${genre ? ` (${genre})` : ""}.

Provide results in JSON format:
{
  "similar": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "similarity": "High|Medium|Low",
      "reason": "Why this is similar (musical style, era, themes, etc.)"
    }
  ],
  "characteristics": ["shared characteristic 1", "shared characteristic 2"]
}`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are a music discovery expert. Find tracks with genuine musical similarities, not just same-genre matches.",
      },
      { role: "user", content: prompt },
    ]);

    const content = response.choices[0]?.message?.content || "";
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { similar: [], characteristics: [] };
    } catch {
      return { similar: [], characteristics: [] };
    }
  }

  /**
   * Generate music discovery questions for user profiling
   */
  async generateDiscoveryQuestions(
    answeredQuestions?: { question: string; answer: string }[],
  ): Promise<{
    questions: { id: string; question: string; category: string; options?: string[] }[];
    profile: {
      genres: string[];
      eras: string[];
      moods: string[];
      discoveryGoals: string[];
    };
  }> {
    const context = answeredQuestions && answeredQuestions.length > 0
      ? `Previous answers:\n${answeredQuestions.map(q => `Q: ${q.question}\nA: ${q.answer}`).join("\n\n")}`
      : "No previous answers. Start fresh.";

    const prompt = `${context}

Generate 5 music discovery questions to understand the user's taste. Include a mix of:
- Genre preferences
- Era/decade preferences  
- Mood/activity associations
- Discovery goals

Provide in JSON format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "category": "genre|era|mood|discovery",
      "options": ["option1", "option2", "option3"] // optional
    }
  ],
  "profile": {
    "genres": ["detected genres"],
    "eras": ["detected eras"],
    "moods": ["detected moods"],
    "discoveryGoals": ["detected goals"]
  }
}`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are a music taste profiler. Ask insightful questions to understand musical preferences and build a comprehensive taste profile.",
      },
      { role: "user", content: prompt },
    ]);

    const content = response.choices[0]?.message?.content || "";
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {
        questions: [],
        profile: { genres: [], eras: [], moods: [], discoveryGoals: [] },
      };
    } catch {
      return {
        questions: [],
        profile: { genres: [], eras: [], moods: [], discoveryGoals: [] },
      };
    }
  }

  /**
   * Create mood-based playlist recommendations
   */
  async generateMoodPlaylist(
    mood: string,
    activity?: string,
    timeOfDay?: string,
    trackCount = 15,
  ): Promise<{
    mood: string;
    tracks: { title: string; artist: string; why: string }[];
    transitions: { from: number; to: number; description: string }[];
    energyCurve: string;
  }> {
    const prompt = `Create a ${trackCount}-track playlist for mood: "${mood}"
${activity ? `Activity: ${activity}` : ""}
${timeOfDay ? `Time of day: ${timeOfDay}` : ""}

Design a playlist with emotional progression. Return JSON:
{
  "mood": "Refined mood description",
  "tracks": [
    {
      "title": "Song Title",
      "artist": "Artist Name",
      "why": "Why this fits the mood/flow"
    }
  ],
  "transitions": [
    {
      "from": 0,
      "to": 4,
      "description": "Opening energy/build"
    }
  ],
  "energyCurve": "Description of energy progression"
}`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are a mood-based playlist curator. Create playlists with intentional emotional arcs and smooth transitions.",
      },
      { role: "user", content: prompt },
    ]);

    const content = response.choices[0]?.message?.content || "";
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { mood, tracks: [], transitions: [], energyCurve: "" };
    } catch {
      return { mood, tracks: [], transitions: [], energyCurve: "" };
    }
  }

  /**
   * Analyze playlist coherence and suggest improvements
   */
  async analyzePlaylist(
    tracks: { title: string; artist: string }[],
    playlistName?: string,
  ): Promise<{
    coherence: number;
    themes: string[];
    strengths: string[];
    suggestions: { type: string; description: string; priority: "high" | "medium" | "low" }[];
    flow: { transitions: string[]; energyBalance: string };
  }> {
    const prompt = `Analyze this playlist${playlistName ? ` "${playlistName}"` : ""}:

Tracks:
${tracks.map((t, i) => `${i + 1}. "${t.title}" by ${t.artist}`).join("\n")}

Provide analysis in JSON format:
{
  "coherence": 0.85,
  "themes": ["detected theme 1", "detected theme 2"],
  "strengths": ["what works well 1", "what works well 2"],
  "suggestions": [
    {
      "type": "addition|removal|reorder|transition",
      "description": "Specific suggestion",
      "priority": "high|medium|low"
    }
  ],
  "flow": {
    "transitions": ["transition quality 1", "transition quality 2"],
    "energyBalance": "Description of energy distribution"
  }
}`;

    const response = await this.chat([
      {
        role: "system",
        content: "You are a playlist analyst. Evaluate coherence, flow, and provide actionable suggestions for improvement.",
      },
      { role: "user", content: prompt },
    ]);

    const content = response.choices[0]?.message?.content || "";
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return {
        coherence: 0.5,
        themes: [],
        strengths: [],
        suggestions: [],
        flow: { transitions: [], energyBalance: "" },
      };
    } catch {
      return {
        coherence: 0.5,
        themes: [],
        strengths: [],
        suggestions: [],
        flow: { transitions: [], energyBalance: "" },
      };
    }
  }
}

// Export singleton instance
export const groqClient = new GroqClient();
