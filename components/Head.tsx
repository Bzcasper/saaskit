// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { Head as _Head } from "$fresh/runtime.ts";
import Meta, { type MetaProps } from "./Meta.tsx";
import { SITE_DESCRIPTION, SITE_NAME } from "@/utils/constants.ts";
import { ComponentChildren } from "preact";

export type HeadProps =
  & Partial<Omit<MetaProps, "href">>
  & Pick<MetaProps, "href">
  & {
    children?: ComponentChildren;
  };

export default function Head(props: HeadProps) {
  return (
    <_Head>
      <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="apple-touch-icon" href="/logo.webp" />
      <Meta
        title={props?.title ? `${props.title} ▲ ${SITE_NAME}` : SITE_NAME}
        description={props?.description ?? SITE_DESCRIPTION}
        href={props.href}
        imageUrl="/cover.png"
      />
      {props.children}
    </_Head>
  );
}
