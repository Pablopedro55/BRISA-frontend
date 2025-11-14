<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let type: string = 'text';
  export let placeholder: string = '';
  export let value: string | number = '';
  export let className: string = '';
  export let disabled: boolean = false;

  const baseStyles = 'flex h-10 w-full rounded-lg border border-border bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';
  
  $: classes = cn(baseStyles, className);
</script>

<input
  {type}
  {placeholder}
  {disabled}
  bind:value
  class={classes}
  on:input
  on:change
  on:focus
  on:blur
  {...$$restProps}
/>
