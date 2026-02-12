// Copyright 2023-2025 the Deno authors. All rights reserved. MIT license.
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { User } from "@/utils/db.ts";
import GitHubAvatarImg from "@/components/GitHubAvatarImg.tsx";
import { fetchValues } from "@/utils/http.ts";
import { PremiumBadge } from "@/components/PremiumBadge.tsx";
import IconUsers from "@preact-icons/tb/TbUsers";

const TH_STYLES = "p-16 text-left font-ui font-semibold text-foreground-muted text-body-sm";
const TD_STYLES = "p-16";

function UserTableRow(props: User) {
  return (
    <tr class="hover:bg-background-elevated border-b border-border transition-colors duration-fast">
      <td class={TD_STYLES}>
        <div class="flex items-center gap-12">
          <GitHubAvatarImg login={props.login} size={36} />
          <a
            class="text-foreground hover:text-primary transition-colors duration-fast font-medium"
            href={"/users/" + props.login}
          >
            {props.login}
          </a>
        </div>
      </td>
      <td class={TD_STYLES}>
        {props.isSubscribed
          ? (
            <span class="inline-flex items-center gap-8 text-success font-medium">
              <PremiumBadge class="size-20" />
              Premium
            </span>
          )
          : (
            <span class="text-foreground-muted">Free</span>
          )}
      </td>
      <td class={TD_STYLES}>
        <span class="font-mono text-foreground">
          ${(Math.random() * 100).toFixed(2)}
        </span>
      </td>
    </tr>
  );
}

export interface UsersTableProps {
  /** Endpoint URL of the REST API to make the fetch request to */
  endpoint: string;
}

export default function UsersTable(props: UsersTableProps) {
  const usersSig = useSignal<User[]>([]);
  const cursorSig = useSignal("");
  const isLoadingSig = useSignal(false);

  async function loadMoreUsers() {
    if (isLoadingSig.value) return;
    isLoadingSig.value = true;
    try {
      const { values, cursor } = await fetchValues<User>(
        props.endpoint,
        cursorSig.value,
      );
      usersSig.value = [...usersSig.value, ...values];
      cursorSig.value = cursor;
    } catch (error) {
      console.log((error as Error).message);
    } finally {
      isLoadingSig.value = false;
    }
  }

  useEffect(() => {
    loadMoreUsers();
  }, []);

  if (usersSig.value.length === 0 && !isLoadingSig.value) {
    return (
      <div class="card p-48 text-center">
        <div class="w-64 h-64 rounded-full bg-gradient-subtle flex items-center justify-center mx-auto mb-16">
          <IconUsers class="size-32 text-foreground-muted" />
        </div>
        <p class="text-foreground-muted text-body">No users found</p>
      </div>
    );
  }

  return (
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-background-dark border-b border-border">
            <tr>
              <th class={TH_STYLES}>User</th>
              <th class={TH_STYLES}>Subscription</th>
              <th class={TH_STYLES}>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {usersSig.value.map((user) => (
              <UserTableRow key={user.login} {...user} />
            ))}
          </tbody>
        </table>
      </div>
      {cursorSig.value !== "" && (
        <div class="p-16 border-t border-border">
          <button
            type="button"
            onClick={loadMoreUsers}
            class="btn-ghost w-full"
            disabled={isLoadingSig.value}
          >
            {isLoadingSig.value ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
