<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let className: string = '';

  const baseStyles = 'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0';
  
  $: classes = cn(baseStyles, className);
</script>

<th class={classes} {...$$restProps}>
  <slot />
</th>
