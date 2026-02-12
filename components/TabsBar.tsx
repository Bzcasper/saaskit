// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { ComponentChildren } from "preact";

export interface TabItemProps {
  /** Path of the item's URL */
  path: string;
  /** Whether the user is on the item's URL */
  active: boolean;
  children?: ComponentChildren;
}

export function TabItem(props: TabItemProps) {
  return (
    <a
      href={props.path}
      class={`px-16 py-8 rounded-sm font-ui font-medium transition-all duration-fast ${
        props.active
          ? "bg-primary/20 text-primary border border-primary/30"
          : "text-foreground-muted hover:text-foreground hover:bg-background-elevated"
      }`}
    >
      {props.children}
    </a>
  );
}

export interface TabsBarProps {
  links: {
    path: string;
    innerText: string;
  }[];
  currentPath: string;
}

export default function TabsBar(props: TabsBarProps) {
  return (
    <div class="flex flex-row w-full mb-32 gap-8">
      {props.links.map((link) => (
        <TabItem path={link.path} active={link.path === props.currentPath}>
          {link.innerText}
        </TabItem>
      ))}
    </div>
  );
}
