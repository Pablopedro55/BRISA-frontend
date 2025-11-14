<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let placeholder: string = '';
  export let value: string = '';
  export let className: string = '';
  export let disabled: boolean = false;
  export let rows: number = 3;

  const baseStyles = 'flex min-h-[80px] w-full rounded-lg border border-border bg-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  
  $: classes = cn(baseStyles, className);
</script>

<textarea
  {placeholder}
  {disabled}
  {rows}
  bind:value
  class={classes}
  on:input
  on:change
  on:focus
  on:blur
  {...$$restProps}
/>
