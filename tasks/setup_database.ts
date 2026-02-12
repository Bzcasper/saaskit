// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
/**
 * Database Setup Script for trendradar
 *
 * This script initializes the Deno KV database with sample data
 * and verifies the database is working correctly.
 */

import { kv } from "@/utils/db.ts";
import { createItem, createUser, type Item, type User } from "@/utils/db.ts";
import { ulid } from "@std/ulid/ulid";

const SAMPLE_ITEMS: Omit<Item, "id">[] = [
  {
    userLogin: "trendradar",
    title: "Emerging Artist: New Electronic Track 2024",
    url: "https://open.spotify.com/track/example1",
    score: 42,
  },
  {
    userLogin: "musicfan",
    title: "Top 10 Indie Rock Discoveries This Week",
    url: "https://music.youtube.com/watch?v=example2",
    score: 38,
  },
  {
    userLogin: "curator",
    title: "Jazz Fusion Trends Rising in 2024",
    url: "https://soundcloud.com/example/jazz-trends",
    score: 35,
  },
  {
    userLogin: "discovery",
    title: "Lo-Fi Beats to Study To - New Compilation",
    url: "https://youtube.com/watch?v=example3",
    score: 31,
  },
  {
    userLogin: "analyst",
    title: "K-Pop Breaking Into Global Charts",
    url: "https://music.apple.com/track/example4",
    score: 28,
  },
];

const SAMPLE_USERS: Omit<User, "sessionId">[] = [
  {
    login: "trendradar",
    isSubscribed: true,
    stripeCustomerId: "cus_example1",
  },
  {
    login: "musicfan",
    isSubscribed: false,
  },
  {
    login: "curator",
    isSubscribed: true,
    stripeCustomerId: "cus_example2",
  },
];

async function seedDatabase() {
  console.log("🎵 Seeding trendradar database...\n");

  try {
    // Seed users
    console.log("👤 Creating sample users...");
    for (const userData of SAMPLE_USERS) {
      const user: User = {
        ...userData,
        sessionId: crypto.randomUUID(),
      };
      await createUser(user);
      console.log(`  ✓ User: ${user.login} (Premium: ${user.isSubscribed})`);
    }

    // Seed items
    console.log("\n🎶 Creating sample music discoveries...");
    for (const itemData of SAMPLE_ITEMS) {
      const item: Item = {
        ...itemData,
        id: ulid(),
      };
      await createItem(item);
      console.log(
        `  ✓ ${item.title.substring(0, 50)}... (${item.score} votes)`,
      );
    }

    console.log("\n✅ Database seeded successfully!");
    console.log(`   📊 ${SAMPLE_ITEMS.length} music discoveries added`);
    console.log(`   👥 ${SAMPLE_USERS.length} users created`);
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    throw error;
  }
}

async function verifyDatabase() {
  console.log("\n🔍 Verifying database...\n");

  try {
    // Check if we can read from the database
    const users = [];
    const items = [];

    for await (const entry of kv.list({ prefix: ["users"] })) {
      users.push(entry.value);
    }

    for await (const entry of kv.list({ prefix: ["items"] })) {
      items.push(entry.value);
    }

    console.log(`  ✓ Database connection working`);
    console.log(`  ✓ Found ${users.length} users`);
    console.log(`  ✓ Found ${items.length} items`);

    return { users, items };
  } catch (error) {
    console.error("\n❌ Database verification failed:", error);
    throw error;
  }
}

async function main() {
  console.log("╔════════════════════════════════════════╗");
  console.log("║     trendradar Database Setup          ║");
  console.log("╚════════════════════════════════════════╝\n");

  try {
    // Seed the database
    await seedDatabase();

    // Verify the data
    const { users: _users, items: _items } = await verifyDatabase();

    console.log("\n╔════════════════════════════════════════╗");
    console.log("║   ✅ Database Setup Complete!          ║");
    console.log("╚════════════════════════════════════════╝");
    console.log("\nNext steps:");
    console.log("  1. Start the server: deno task start");
    console.log("  2. Visit http://localhost:8000");
    console.log("  3. Log in with GitHub to see your data");
    console.log("\nUseful commands:");
    console.log("  • deno task db:dump > backup.json");
    console.log("  • deno task db:restore backup.json");
    console.log("  • deno task db:reset  # ⚠️ Destructive");
  } catch (error) {
    console.error("\n❌ Setup failed:", error);
    Deno.exit(1);
  } finally {
    kv.close();
  }
}

if (import.meta.main) {
  await main();
}
