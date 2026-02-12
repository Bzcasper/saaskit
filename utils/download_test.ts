// Copyright 2023-2025 Deno authors. All rights reserved. MIT license.

import { assertEquals, assertExists } from "@std/assert";
import {
  cancelDownloadJob,
  completeDownloadJob,
  createDownloadJob,
  deleteDownloadJob,
  failDownloadJob,
  getDownloadJob,
  getDownloadStats,
  getUserDownloadJobs,
  selectBestStream,
  updateDownloadJob,
} from "./download.ts";

// Mock data for testing
const mockVideoId = "test_video_123";
const mockTitle = "Test Song";
const mockArtist = "Test Artist";

Deno.test("createDownloadJob - creates job with correct defaults", async () => {
  const job = await createDownloadJob(mockVideoId, mockTitle, mockArtist);

  assertExists(job.id);
  assertEquals(job.videoId, mockVideoId);
  assertEquals(job.title, mockTitle);
  assertEquals(job.artist, mockArtist);
  assertEquals(job.status, "queued");
  assertEquals(job.progress, 0);
  assertEquals(job.format, "mp3");
  assertEquals(job.quality, "medium");
});

Deno.test("createDownloadJob - creates job with custom options", async () => {
  const job = await createDownloadJob(
    mockVideoId,
    mockTitle,
    mockArtist,
    "user123",
    { format: "wav", quality: "high" },
  );

  assertEquals(job.format, "wav");
  assertEquals(job.quality, "high");
  assertEquals(job.userId, "user123");
});

Deno.test("getDownloadJob - retrieves existing job", async () => {
  const created = await createDownloadJob(mockVideoId, mockTitle, mockArtist);
  const retrieved = await getDownloadJob(created.id);

  assertExists(retrieved);
  assertEquals(retrieved?.id, created.id);
  assertEquals(retrieved?.videoId, mockVideoId);
});

Deno.test("getDownloadJob - returns null for non-existent job", async () => {
  const retrieved = await getDownloadJob("non_existent_id");
  assertEquals(retrieved, null);
});

Deno.test("updateDownloadJob - updates job fields", async () => {
  const created = await createDownloadJob(mockVideoId, mockTitle, mockArtist);
  const updated = await updateDownloadJob(created.id, {
    status: "downloading",
    progress: 50,
  });

  assertExists(updated);
  assertEquals(updated?.status, "downloading");
  assertEquals(updated?.progress, 50);
  assertEquals(updated?.videoId, mockVideoId); // Unchanged fields
});

Deno.test("completeDownloadJob - sets status to completed", async () => {
  const created = await createDownloadJob(mockVideoId, mockTitle, mockArtist);
  const completed = await completeDownloadJob(
    created.id,
    "/path/to/file.mp3",
    1024000,
    "https://example.com/download/file.mp3",
  );

  assertExists(completed);
  assertEquals(completed?.status, "completed");
  assertEquals(completed?.progress, 100);
  assertEquals(completed?.filePath, "/path/to/file.mp3");
  assertEquals(completed?.fileSize, 1024000);
  assertEquals(completed?.downloadUrl, "https://example.com/download/file.mp3");
  assertExists(completed?.completedAt);
});

Deno.test("failDownloadJob - sets status to failed", async () => {
  const created = await createDownloadJob(mockVideoId, mockTitle, mockArtist);
  const failed = await failDownloadJob(created.id, "Network error");

  assertExists(failed);
  assertEquals(failed?.status, "failed");
  assertEquals(failed?.error, "Network error");
  assertExists(failed?.completedAt);
});

Deno.test("cancelDownloadJob - cancels queued job", async () => {
  const created = await createDownloadJob(mockVideoId, mockTitle, mockArtist);
  const cancelled = await cancelDownloadJob(created.id);

  assertEquals(cancelled, true);

  const retrieved = await getDownloadJob(created.id);
  assertEquals(retrieved?.status, "cancelled");
});

Deno.test("cancelDownloadJob - cannot cancel completed job", async () => {
  const created = await createDownloadJob(mockVideoId, mockTitle, mockArtist);
  await completeDownloadJob(created.id, "/path", 100, "url");

  const cancelled = await cancelDownloadJob(created.id);
  assertEquals(cancelled, false);
});

Deno.test("deleteDownloadJob - deletes existing job", async () => {
  const created = await createDownloadJob(mockVideoId, mockTitle, mockArtist);
  const deleted = await deleteDownloadJob(created.id);

  assertEquals(deleted, true);

  const retrieved = await getDownloadJob(created.id);
  assertEquals(retrieved, null);
});

Deno.test("deleteDownloadJob - returns false for non-existent job", async () => {
  const deleted = await deleteDownloadJob("non_existent_id");
  assertEquals(deleted, false);
});

Deno.test("getDownloadStats - returns correct statistics", async () => {
  const userId = "stats_test_user";

  // Create multiple jobs
  const job1 = await createDownloadJob(
    mockVideoId,
    mockTitle,
    mockArtist,
    userId,
  );
  const job2 = await createDownloadJob("vid2", mockTitle, mockArtist, userId);
  const job3 = await createDownloadJob("vid3", mockTitle, mockArtist, userId);

  // Complete one, fail one, leave one queued
  await completeDownloadJob(job1.id, "/path1", 1000, "url1");
  await failDownloadJob(job2.id, "Error");

  const stats = await getDownloadStats(userId);

  assertEquals(stats.totalJobs, 3);
  assertEquals(stats.activeJobs, 1); // job3 is still queued
  assertEquals(stats.completedJobs, 1);
  assertEquals(stats.failedJobs, 1);
});

Deno.test("selectBestStream - selects high quality stream", () => {
  const streams = [
    { url: "low", bitrate: 128000, mimeType: "audio/mp4" },
    { url: "medium", bitrate: 192000, mimeType: "audio/mp4" },
    { url: "high", bitrate: 320000, mimeType: "audio/mp4" },
  ];

  const selected = selectBestStream(streams, "high");

  assertExists(selected);
  assertEquals(selected?.url, "high");
});

Deno.test("selectBestStream - selects low quality stream", () => {
  const streams = [
    { url: "low", bitrate: 128000, mimeType: "audio/mp4" },
    { url: "medium", bitrate: 192000, mimeType: "audio/mp4" },
    { url: "high", bitrate: 320000, mimeType: "audio/mp4" },
  ];

  const selected = selectBestStream(streams, "low");

  assertExists(selected);
  assertEquals(selected?.url, "low");
});

Deno.test("selectBestStream - selects medium quality stream", () => {
  const streams = [
    { url: "low", bitrate: 128000, mimeType: "audio/mp4" },
    { url: "medium", bitrate: 192000, mimeType: "audio/mp4" },
    { url: "high", bitrate: 320000, mimeType: "audio/mp4" },
  ];

  const selected = selectBestStream(streams, "medium");

  assertExists(selected);
  assertEquals(selected?.url, "medium");
});

Deno.test("selectBestStream - filters out non-audio streams", () => {
  const streams = [
    { url: "video", bitrate: 1000000, mimeType: "video/mp4" },
    { url: "audio", bitrate: 192000, mimeType: "audio/mp4" },
  ];

  const selected = selectBestStream(streams, "high");

  assertExists(selected);
  assertEquals(selected?.url, "audio");
});

Deno.test("selectBestStream - returns null when no audio streams", () => {
  const streams = [
    { url: "video1", bitrate: 1000000, mimeType: "video/mp4" },
    { url: "video2", bitrate: 2000000, mimeType: "video/webm" },
  ];

  const selected = selectBestStream(streams, "high");

  assertEquals(selected, null);
});
