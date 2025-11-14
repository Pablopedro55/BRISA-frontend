<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let className: string = '';

  const baseStyles = 'p-4 align-middle [&:has([role=checkbox])]:pr-0';
  
  $: classes = cn(baseStyles, className);
</script>

<td class={classes} {...$$restProps}>
  <slot />
</td>
