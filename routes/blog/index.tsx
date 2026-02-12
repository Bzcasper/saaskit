// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { defineRoute } from "$fresh/server.ts";
import { getPosts, type Post } from "@/utils/posts.ts";
import Head from "@/components/Head.tsx";
import IconCalendar from "@preact-icons/tb/TbCalendar";
import IconArrowRight from "@preact-icons/tb/TbArrowRight";
import IconRadar from "@preact-icons/tb/TbRadar";
import { SITE_NAME, SITE_TAGLINE } from "@/utils/constants.ts";

function PostCard(props: Post) {
  return (
    <article class="card card-elevated p-32 transition-all duration-normal">
      <a href={`/blog/${props.slug}`} class="block group">
        <div class="flex items-start justify-between gap-16">
          <div class="flex-1">
            <h2 class="font-heading font-bold text-h4 text-foreground group-hover:text-primary transition-colors duration-fast mb-12">
              {props.title}
            </h2>
            {props.publishedAt.toString() !== "Invalid Date" && (
              <div class="flex items-center gap-8 text-foreground-muted text-body-sm mb-16">
                <IconCalendar class="size-16" />
                <time dateTime={props.publishedAt.toISOString()}>
                  {props.publishedAt.toLocaleDateString("en-US", {
                    dateStyle: "long",
                  })}
                </time>
              </div>
            )}
            <p class="text-foreground-muted text-body line-clamp-2">
              {props.summary}
            </p>
            <div class="mt-24 flex items-center gap-8 text-primary font-medium text-body-sm group-hover:gap-12 transition-all duration-fast">
              Read more
              <IconArrowRight class="size-16" />
            </div>
          </div>
        </div>
      </a>
    </article>
  );
}

export default defineRoute(async (_req, ctx) => {
  const posts = await getPosts();

  return (
    <>
      <Head title="Blog" href={ctx.url.href} />
      <main class="p-16 lg:p-24 flex-1 max-w-container mx-auto w-full">
        {/* Brand Header */}
        <div class="text-center mb-48">
          <div class="flex justify-center mb-16">
            <div class="w-64 h-64 rounded-xl bg-gradient-logo flex items-center justify-center shadow-glow">
              <IconRadar class="size-32 text-background-dark" />
            </div>
          </div>
          <h1 class="font-heading font-black text-h2 gradient-text mb-16">
            Blog
          </h1>
          <p class="text-foreground-muted text-body-lg max-w-lg mx-auto">
            Insights and updates from the {SITE_NAME} team
          </p>
          <p class="text-h5 font-heading text-primary-300 mt-16">
            "The future of music analytics"
          </p>
        </div>

        {/* Posts Grid */}
        <div class="grid gap-24 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => <PostCard key={post.slug} {...post} />)}
        </div>

        {posts.length === 0 && (
          <div class="text-center py-64">
            <div class="w-64 h-64 rounded-full bg-gradient-subtle flex items-center justify-center mx-auto mb-16">
              <IconRadar class="size-32 text-foreground-muted" />
            </div>
            <p class="text-foreground-muted text-body-lg">No posts yet</p>
          </div>
        )}
      </main>
    </>
  );
});
