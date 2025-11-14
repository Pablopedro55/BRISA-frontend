<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let className: string = '';

  const baseStyles = 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
  
  $: classes = cn(baseStyles, className);
</script>

<label class={classes} {...$$restProps}>
  <slot />
</label>
