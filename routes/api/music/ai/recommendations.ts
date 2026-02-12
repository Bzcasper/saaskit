// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * AI-Powered Music Recommendations
 * Uses Groq for intelligent recommendations and Cerebras for similarity matching
 */

import { groqClient } from "@/utils/groq_client.ts";
import { cerebrasClient } from "@/utils/cerebras_client.ts";
import {
  getAllTrackEmbeddings,
  getListeningHistory,
  getListeningStats,
  getUserTasteProfile,
  type ListeningHistory,
  saveTrackEmbedding,
  saveUserTasteProfile,
} from "@/utils/music_models.ts";
import {
  errorResponse,
  handleApiError,
  successResponse,
  toJson,
} from "@/utils/api_response.ts";
import type { Handlers } from "$fresh/server.ts";

/**
 * GET /api/music/ai/recommendations
 * Get AI-powered music recommendations based on listening history
 * Query params: limit (default: 10), type (personalized|similar|discovery|trending)
 */
export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      if (!ctx.state.user) {
        const response = errorResponse(
          "UNAUTHORIZED",
          "Authentication required",
        );
        return toJson(response, 401);
      }

      const url = new URL(req.url);
      const userLogin = (ctx.state.user as any).login;
      const limit = parseInt(url.searchParams.get("limit") || "10");
      const type = url.searchParams.get("type") || "personalized";
      const seedTrack = url.searchParams.get("seed");

      // Get user listening history and stats
      const history = await getListeningHistory(userLogin, 50);
      const stats = await getListeningStats(userLogin);

      if (history.length === 0) {
        const response = errorResponse(
          "NO_HISTORY",
          "No listening history found. Listen to some tracks first!",
        );
        return toJson(response, 404);
      }

      let recommendations: any[] = [];

      switch (type) {
        case "personalized":
          recommendations = await generatePersonalizedRecommendations(
            userLogin,
            history,
            stats,
            limit,
          );
          break;
        case "similar":
          if (!seedTrack) {
            const response = errorResponse(
              "MISSING_SEED",
              "Seed track required for similar recommendations",
            );
            return toJson(response, 400);
          }
          recommendations = await generateSimilarRecommendations(
            seedTrack,
            limit,
          );
          break;
        case "discovery":
          recommendations = await generateDiscoveryRecommendations(
            userLogin,
            history,
            limit,
          );
          break;
        case "trending":
          recommendations = await generateTrendingRecommendations(limit);
          break;
        default:
          const response = errorResponse(
            "INVALID_TYPE",
            "Invalid recommendation type",
          );
          return toJson(response, 400);
      }

      const response = successResponse({
        type,
        userLogin,
        basedOn: {
          historyCount: history.length,
          uniqueTracks: stats.uniqueTracks,
          topGenres: stats.topGenres.slice(0, 5),
          topArtists: stats.topArtists.slice(0, 5),
        },
        recommendations,
        generatedAt: Date.now(),
      });

      return toJson(response);
    } catch (error) {
      const [errorResp, status] = handleApiError(error);
      return toJson(errorResp, status);
    }
  },
};

// Placeholder implementations - TODO: implement actual recommendation logic
async function generatePersonalizedRecommendations(
  userLogin: string,
  history: ListeningHistory[],
  stats: any,
  limit: number,
): Promise<any[]> {
  // TODO: implement personalized recommendations
  return [];
}

async function generateSimilarRecommendations(
  seedTrack: string,
  limit: number,
): Promise<any[]> {
  // TODO: implement similar track recommendations
  return [];
}

async function generateDiscoveryRecommendations(
  userLogin: string,
  history: ListeningHistory[],
  limit: number,
): Promise<any[]> {
  // TODO: implement discovery recommendations
  return [];
}

async function generateTrendingRecommendations(limit: number): Promise<any[]> {
  // TODO: implement trending recommendations
  return [];
}
