<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let className: string = '';

  const baseStyles = '[&_tr:last-child]:border-0';
  
  $: classes = cn(baseStyles, className);
</script>

<tbody class={classes} {...$$restProps}>
  <slot />
</tbody>
