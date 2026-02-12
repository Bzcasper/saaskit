// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import IconBrandFacebook from "@preact-icons/tb/TbBrandFacebook";
import IconBrandLinkedin from "@preact-icons/tb/TbBrandLinkedin";
import IconBrandReddit from "@preact-icons/tb/TbBrandReddit";
import IconBrandTwitter from "@preact-icons/tb/TbBrandTwitter";

interface ShareProps {
  url: URL;
  title: string;
}

/**
 * Dynamically generates links for sharing the current content on the major
 * social media platforms.
 *
 * @see {@link https://schier.co/blog/pure-html-share-buttons}
 */
export default function Share(props: ShareProps) {
  return (
    <div class="flex flex-row gap-16 my-32 items-center">
      <span class="align-middle text-foreground-muted font-ui font-medium">Share</span>
      <div class="flex gap-12">
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${
            encodeURIComponent(props.url.href)
          }`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share ${props.title} on Facebook`}
          class="text-foreground-muted hover:text-primary transition-colors duration-fast"
        >
          <IconBrandFacebook class="size-24" />
        </a>
        <a
          href={`https://www.linkedin.com/shareArticle?url=${
            encodeURIComponent(props.url.href)
          }&title=${encodeURIComponent(props.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share ${props.title} on LinkedIn`}
          class="text-foreground-muted hover:text-primary transition-colors duration-fast"
        >
          <IconBrandLinkedin class="size-24" />
        </a>
        <a
          href={`https://reddit.com/submit?url=${
            encodeURIComponent(props.url.href)
          }&title=${encodeURIComponent(props.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share ${props.title} on Reddit`}
          class="text-foreground-muted hover:text-primary transition-colors duration-fast"
        >
          <IconBrandReddit class="size-24" />
        </a>
        <a
          href={`https://twitter.com/share?url=${
            encodeURIComponent(props.url.href)
          }&text=${encodeURIComponent(props.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share ${props.title} on Twitter`}
          class="text-foreground-muted hover:text-primary transition-colors duration-fast"
        >
          <IconBrandTwitter class="size-24" />
        </a>
      </div>
    </div>
  );
}
