<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let className: string = '';

  const baseStyles = 'p-6 pt-0';
  
  $: classes = cn(baseStyles, className);
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
