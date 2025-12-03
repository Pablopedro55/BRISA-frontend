<script context="module" lang="ts">
  import { fade } from "svelte/transition";
</script>

<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { cn } from "$lib/utils/cn";
  import { X } from "lucide-svelte";
  import Button from "./Button.svelte";

  export let open: boolean = false;
  export let title: string = "";
  export let className: string = "";

  const dispatch = createEventDispatcher();

  function close() {
    open = false;
    dispatch("close");
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && open) {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto"
    on:click={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    on:keydown={handleKeydown}
    tabindex="-1"
    transition:fade={{ duration: 200 }}
  >
    <!-- Modal Container - permite scroll vertical -->
    <div class="flex min-h-full items-center justify-center p-4">
      <!-- Modal -->
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <div
        class={cn(
          "bg-white rounded-lg shadow-lg w-full max-w-lg relative",
          className
        )}
        on:click|stopPropagation
      >
        <!-- Header -->
        {#if title}
          <div
            class="flex items-center justify-between p-6 pb-4 border-b border-border"
          >
            <h2 class="text-xl font-semibold text-foreground">{title}</h2>
            <Button
              variant="ghost"
              size="icon"
              on:click={close}
              className="h-8 w-8"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>
        {/if}

        <!-- Content -->
        <div class="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <slot />
        </div>
      </div>
    </div>
  </div>
{/if}
