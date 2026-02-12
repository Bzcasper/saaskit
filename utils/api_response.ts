// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.

/**
 * Standardized API Response Utilities for Music API
 * Ensures consistent JSON format across all endpoints
 */

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: number;
}

export interface PaginatedResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T[];
  total?: number;
  limit?: number;
  offset?: number;
  error?: string;
  timestamp?: number;
}

/**
 * Create successful response
 */
export function successResponse<T>(
  data: T,
  message?: string,
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    timestamp: Date.now(),
  };
}

/**
 * Create error response
 */
export function errorResponse(
  error: string,
  message?: string,
): ApiResponse {
  return {
    success: false,
    error,
    message,
    timestamp: Date.now(),
  };
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number,
): PaginatedResponse<T> {
  return {
    success: true,
    data,
    total,
    limit,
    offset,
    timestamp: Date.now(),
  };
}

/**
 * Convert response to HTTP Response
 */
export function toJson<T>(
  response: ApiResponse<T> | PaginatedResponse<T>,
  status = 200,
): Response {
  return new Response(JSON.stringify(response), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Vary": "Accept-Encoding", // Indicate response may be compressed
    },
  });
}

/**
 * Handle API error with proper status code
 */
export function handleApiError(
  error: unknown,
  defaultStatus = 500,
): [ApiResponse, number] {
  if (error instanceof Error) {
    const message = error.message;

    if (message.includes("not found")) {
      return [errorResponse("NOT_FOUND", message), 404];
    }
    if (message.includes("unauthorized") || message.includes("forbidden")) {
      return [errorResponse("UNAUTHORIZED", message), 401];
    }
    if (message.includes("invalid")) {
      return [errorResponse("INVALID_REQUEST", message), 400];
    }

    return [errorResponse("INTERNAL_ERROR", message), defaultStatus];
  }

  return [
    errorResponse("UNKNOWN_ERROR", String(error)),
    defaultStatus,
  ];
}

/**
 * Validate required query parameters
 */
export function validateQueryParams(
  params: Record<string, string | null>,
  required: string[],
): [boolean, string | null] {
  for (const param of required) {
    if (!params[param]) {
      return [false, `Missing required parameter: ${param}`];
    }
  }
  return [true, null];
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T>(
  json: string,
  fallback: T,
): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}
