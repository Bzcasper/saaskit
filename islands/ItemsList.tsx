// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { Signal, useComputed, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { type Item } from "@/utils/db.ts";
import IconInfo from "@preact-icons/tb/TbInfoCircle";
import IconTrendingUp from "@preact-icons/tb/TbTrendingUp";
import { fetchValues } from "@/utils/http.ts";
import { decodeTime } from "@std/ulid/decode-time";
import { timeAgo } from "@/utils/display.ts";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";

async function fetchVotedItems() {
  const url = "/api/me/votes";
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Request failed: GET ${url}`);
  return await resp.json() as Item[];
}

function EmptyItemsList() {
  return (
    <div class="flex flex-col justify-center items-center gap-16 pt-64 pb-32">
      <div class="w-80 h-80 rounded-full bg-gradient-subtle flex items-center justify-center">
        <IconInfo class="size-40 text-foreground-muted" />
      </div>
      <p class="text-foreground-muted text-body-lg">No items found</p>
      <a href="/submit" class="btn-primary">
        Submit your discovery →
      </a>
    </div>
  );
}

interface VoteButtonProps {
  item: Item;
  scoreSig: Signal<number>;
  isVotedSig: Signal<boolean>;
}

function VoteButton(props: VoteButtonProps) {
  async function onClick(event: MouseEvent) {
    if (event.detail !== 1) return;
    const resp = await fetch(`/api/vote?item_id=${props.item.id}`, {
      method: "POST",
    });
    if (!resp.ok) throw new Error(await resp.text());
    props.scoreSig.value++;
    props.isVotedSig.value = true;
  }

  return (
    <button
      onClick={onClick}
      class="group flex flex-col items-center gap-4 transition-colors duration-fast"
      type="button"
    >
      <div class="w-40 h-40 rounded-full bg-background-elevated group-hover:bg-primary/20 flex items-center justify-center transition-colors duration-fast">
        <IconTrendingUp class="size-24 text-foreground-muted group-hover:text-primary transition-colors duration-fast" />
      </div>
    </button>
  );
}

interface ItemSummaryProps {
  item: Item;
  /** Whether the item has been voted-for by the signed-in user */
  isVoted: boolean;
  /** Whether the user is signed-in */
  isSignedIn: boolean;
}

function ItemSummary(props: ItemSummaryProps) {
  const scoreSig = useSignal(props.item.score);
  const isVotedSig = useSignal(props.isVoted);

  return (
    <div class="py-16 flex gap-16 border-b border-border last:border-b-0">
      <div
        class={`flex flex-col items-center gap-4 min-w-[60px] ${
          isVotedSig.value ? "text-primary" : "text-foreground-muted"
        }`}
      >
        {!props.isSignedIn && (
          <a
            title="Sign in to vote"
            href="/signin"
            class="group flex flex-col items-center gap-4"
          >
            <div class="w-40 h-40 rounded-full bg-background-elevated group-hover:bg-primary/20 flex items-center justify-center transition-colors duration-fast">
              <IconTrendingUp class="size-24 text-foreground-muted group-hover:text-primary transition-colors duration-fast" />
            </div>
          </a>
        )}
        {props.isSignedIn && !isVotedSig.value && (
          <VoteButton
            item={props.item}
            scoreSig={scoreSig}
            isVotedSig={isVotedSig}
          />
        )}
        {props.isSignedIn && isVotedSig.value && (
          <div class="flex flex-col items-center gap-4">
            <div class="w-40 h-40 rounded-full bg-primary/20 flex items-center justify-center">
              <IconTrendingUp class="size-24 text-primary" />
            </div>
          </div>
        )}
        <span class="font-heading font-bold text-h5">{scoreSig}</span>
      </div>
      <div class="flex-1 space-y-8 min-w-0">
        <h3 class="font-heading font-bold text-h5 leading-tight">
          <a
            class="text-foreground hover:text-primary transition-colors duration-fast"
            href={props.item.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {props.item.title}
          </a>
        </h3>
        <div class="flex items-center gap-12 text-foreground-muted text-body-sm flex-wrap">
          <a
            href={props.item.url}
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-primary transition-colors duration-fast truncate max-w-[200px]"
          >
            {new URL(props.item.url).host}
          </a>
          <span>•</span>
          <div class="flex items-center gap-8">
            <GitHubAvatarImg
              login={props.item.userLogin}
              size={20}
            />
            <a
              class="hover:text-primary transition-colors duration-fast"
              href={`/users/${props.item.userLogin}`}
            >
              {props.item.userLogin}
            </a>
          </div>
          <span>•</span>
          <span>{timeAgo(new Date(decodeTime(props.item.id)))}</span>
        </div>
      </div>
    </div>
  );
}

export interface ItemsListProps {
  /** Endpoint URL of the REST API to make the fetch request to */
  endpoint: string;
  /** Whether the user is signed-in */
  isSignedIn: boolean;
}

export default function ItemsList(props: ItemsListProps) {
  const itemsSig = useSignal<Item[]>([]);
  const votedItemsIdsSig = useSignal<string[]>([]);
  const cursorSig = useSignal("");
  const isLoadingSig = useSignal<boolean | undefined>(undefined);
  const itemsAreVotedSig = useComputed(() =>
    itemsSig.value.map((item) => votedItemsIdsSig.value.includes(item.id))
  );

  async function loadMoreItems() {
    if (isLoadingSig.value) return;
    isLoadingSig.value = true;
    try {
      const { values, cursor } = await fetchValues<Item>(
        props.endpoint,
        cursorSig.value,
      );
      itemsSig.value = [...itemsSig.value, ...values];
      cursorSig.value = cursor;
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      isLoadingSig.value = false;
    }
  }

  useEffect(() => {
    if (!props.isSignedIn) {
      loadMoreItems();
      return;
    }

    fetchVotedItems()
      .then((votedItems) =>
        votedItemsIdsSig.value = votedItems.map(({ id }) => id)
      )
      .finally(() => loadMoreItems());
  }, []);

  if (isLoadingSig.value === undefined) {
    return (
      <div class="flex justify-center py-64">
        <div class="animate-pulse flex items-center gap-12 text-foreground-muted">
          <div class="w-24 h-24 rounded-full bg-gradient-logo"></div>
          <span class="text-body">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {itemsSig.value.length
        ? (
          <div class="divide-y divide-border">
            {itemsSig.value.map((item, id) => (
              <ItemSummary
                key={item.id}
                item={item}
                isVoted={itemsAreVotedSig.value[id]}
                isSignedIn={props.isSignedIn}
              />
            ))}
          </div>
        )
        : <EmptyItemsList />}
      {cursorSig.value !== "" && (
        <div class="flex justify-center mt-32">
          <button
            onClick={loadMoreItems}
            class="btn-ghost"
            type="button"
            disabled={isLoadingSig.value}
          >
            {isLoadingSig.value ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
