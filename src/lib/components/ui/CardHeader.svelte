<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let className: string = '';

  const baseStyles = 'flex flex-col space-y-1.5 p-6';
  
  $: classes = cn(baseStyles, className);
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
