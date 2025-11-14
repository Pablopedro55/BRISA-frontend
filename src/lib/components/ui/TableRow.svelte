<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let className: string = '';

  const baseStyles = 'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted';
  
  $: classes = cn(baseStyles, className);
</script>

<tr class={classes} {...$$restProps}>
  <slot />
</tr>
