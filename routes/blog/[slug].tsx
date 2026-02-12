// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { defineRoute } from "$fresh/server.ts";
import { CSS, render } from "jsr:@deno/gfm";
import { getPost } from "@/utils/posts.ts";
import Head from "@/components/Head.tsx";
import Share from "@/components/Share.tsx";
import IconCalendar from "@preact-icons/tb/TbCalendar";
import IconArrowLeft from "@preact-icons/tb/TbArrowLeft";
import IconRadar from "@preact-icons/tb/TbRadar";
import { SITE_NAME, SITE_TAGLINE } from "@/utils/constants.ts";

export default defineRoute(async (_req, ctx) => {
  const post = await getPost(ctx.params.slug);
  if (post === null) return await ctx.renderNotFound();

  return (
    <>
      <Head title={post.title} href={ctx.url.href}>
        <style>{CSS}</style>
      </Head>
      <main class="p-16 lg:p-24 flex-1 max-w-3xl mx-auto w-full">
        {/* Brand Header */}
        <div class="flex justify-center mb-32">
          <a href="/" class="flex items-center gap-12 group">
            <div class="w-48 h-48 rounded-lg bg-gradient-logo flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-fast">
              <IconRadar class="size-24 text-background-dark" />
            </div>
            <span class="font-heading font-bold text-h4 gradient-text lowercase">{SITE_NAME}</span>
          </a>
        </div>

        {/* Back Link */}
        <a 
          href="/blog" 
          class="inline-flex items-center gap-8 text-foreground-muted hover:text-primary transition-colors duration-fast mb-32"
        >
          <IconArrowLeft class="size-18" />
          Back to blog
        </a>
        
        {/* Article Header */}
        <article>
          <header class="mb-32">
            <h1 class="font-heading font-black text-h2 gradient-text mb-24">
              {post.title}
            </h1>
            {post.publishedAt.toString() !== "Invalid Date" && (
              <div class="flex items-center gap-12 text-foreground-muted">
                <IconCalendar class="size-20" />
                <time 
                  dateTime={post.publishedAt.toISOString()}
                  class="text-body"
                >
                  {post.publishedAt.toLocaleDateString("en-US", {
                    dateStyle: "long",
                  })}
                </time>
              </div>
            )}
          </header>
          
          <Share url={ctx.url} title={post.title} />
          
          {/* Article Content */}
          <div
            class="mt-32 prose prose-invert prose-lg max-w-none
                   prose-headings:font-heading prose-headings:font-bold
                   prose-h2:text-h3 prose-h3:text-h4
                   prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                   prose-code:text-primary-300 prose-code:bg-background-dark prose-code:px-8 prose-code:py-4 prose-code:rounded-sm
                   prose-pre:bg-background-dark prose-pre:border prose-pre:border-border
                   prose-blockquote:border-l-primary prose-blockquote:border-l-4 prose-blockquote:bg-background-elevated prose-blockquote:py-16 prose-blockquote:px-24 prose-blockquote:rounded-r-sm"
            data-color-mode="dark"
            data-dark-theme="dark"
            // deno-lint-ignore react-no-danger
            dangerouslySetInnerHTML={{ __html: render(post.content) }}
          />
        </article>

        {/* Brand Footer */}
        <div class="mt-48 pt-32 border-t border-border text-center">
          <p class="text-h5 font-heading text-primary-300 mb-16">
            "{SITE_TAGLINE}"
          </p>
          <a href="/" class="btn-ghost inline-flex items-center gap-8">
            <IconRadar class="size-18" />
            Explore {SITE_NAME}
          </a>
        </div>
      </main>
    </>
  );
});
