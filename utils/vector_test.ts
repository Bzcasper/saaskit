// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.

import { assertEquals, assertExists } from "@std/assert";
import {
  cosineSimilarity,
  euclideanDistance,
  manhattanDistance,
} from "./vector.ts";

Deno.test("cosineSimilarity - identical vectors", () => {
  const a = [1, 2, 3, 4];
  const b = [1, 2, 3, 4];
  const similarity = cosineSimilarity(a, b);
  assertEquals(Math.abs(similarity - 1) < 0.0001, true);
});

Deno.test("cosineSimilarity - orthogonal vectors", () => {
  const a = [1, 0, 0];
  const b = [0, 1, 0];
  const similarity = cosineSimilarity(a, b);
  assertEquals(Math.abs(similarity - 0) < 0.0001, true);
});

Deno.test("cosineSimilarity - opposite vectors", () => {
  const a = [1, 2, 3];
  const b = [-1, -2, -3];
  const similarity = cosineSimilarity(a, b);
  assertEquals(Math.abs(similarity - (-1)) < 0.0001, true);
});

Deno.test("euclideanDistance - same point", () => {
  const a = [1, 2, 3];
  const b = [1, 2, 3];
  const distance = euclideanDistance(a, b);
  assertEquals(Math.abs(distance - 0) < 0.0001, true);
});

Deno.test("euclideanDistance - different points", () => {
  const a = [0, 0, 0];
  const b = [3, 4, 0];
  const distance = euclideanDistance(a, b);
  assertEquals(Math.abs(distance - 5) < 0.0001, true);
});

Deno.test("manhattanDistance - same point", () => {
  const a = [1, 2, 3];
  const b = [1, 2, 3];
  const distance = manhattanDistance(a, b);
  assertEquals(distance, 0);
});

Deno.test("manhattanDistance - different points", () => {
  const a = [0, 0, 0];
  const b = [3, 4, 0];
  const distance = manhattanDistance(a, b);
  assertEquals(distance, 7);
});

Deno.test("cosineSimilarity - returns value between -1 and 1", () => {
  const a = [0.5, -0.3, 0.8];
  const b = [0.2, 0.9, -0.1];
  const similarity = cosineSimilarity(a, b);
  assertEquals(similarity >= -1 && similarity <= 1, true);
});

Deno.test("euclideanDistance - always non-negative", () => {
  const a = [1, 2, 3];
  const b = [4, 5, 6];
  const distance = euclideanDistance(a, b);
  assertEquals(distance >= 0, true);
});

Deno.test("manhattanDistance - always non-negative", () => {
  const a = [1, 2, 3];
  const b = [4, 5, 6];
  const distance = manhattanDistance(a, b);
  assertEquals(distance >= 0, true);
});

Deno.test("cosineSimilarity - symmetric", () => {
  const a = [1, 2, 3];
  const b = [4, 5, 6];
  const sim1 = cosineSimilarity(a, b);
  const sim2 = cosineSimilarity(b, a);
  assertEquals(Math.abs(sim1 - sim2) < 0.0001, true);
});

Deno.test("euclideanDistance - symmetric", () => {
  const a = [1, 2, 3];
  const b = [4, 5, 6];
  const dist1 = euclideanDistance(a, b);
  const dist2 = euclideanDistance(b, a);
  assertEquals(Math.abs(dist1 - dist2) < 0.0001, true);
});

Deno.test("manhattanDistance - symmetric", () => {
  const a = [1, 2, 3];
  const b = [4, 5, 6];
  const dist1 = manhattanDistance(a, b);
  const dist2 = manhattanDistance(b, a);
  assertEquals(dist1, dist2);
});
