<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let className: string = '';

  const baseStyles = 'rounded-lg border border-border bg-card text-card-foreground shadow-sm';
  
  $: classes = cn(baseStyles, className);
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
