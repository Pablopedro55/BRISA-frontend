<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let value: string = '';
  export let className: string = '';
  export let disabled: boolean = false;

  const baseStyles = 'flex h-10 w-full items-center justify-between rounded-lg border border-border bg-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  
  $: classes = cn(baseStyles, className);
</script>

<select
  bind:value
  {disabled}
  class={classes}
  on:change
  {...$$restProps}
>
  <slot />
</select>
