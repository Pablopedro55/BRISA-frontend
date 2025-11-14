<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { cn } from '$lib/utils/cn';
  import { X } from 'lucide-svelte';
  import Button from './Button.svelte';

  export let open: boolean = false;
  export let title: string = '';
  export let className: string = '';

  const dispatch = createEventDispatcher();

  function close() {
    open = false;
    dispatch('close');
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      close();
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <div 
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
    on:click={handleBackdropClick}
    transition:fade={{ duration: 200 }}
  >
    <!-- Modal -->
    <div class="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 p-6">
      <div class={cn('bg-white rounded-lg shadow-lg', className)}>
        <!-- Header -->
        {#if title}
          <div class="flex items-center justify-between p-6 pb-4 border-b border-border">
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
        <div class="p-6">
          <slot />
        </div>
      </div>
    </div>
  </div>
{/if}

<script context="module" lang="ts">
  import { fade } from 'svelte/transition';
</script>
