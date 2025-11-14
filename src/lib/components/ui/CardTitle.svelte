<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let className: string = '';

  const baseStyles = 'text-xl font-semibold leading-none tracking-tight';
  
  $: classes = cn(baseStyles, className);
</script>

<h3 class={classes} {...$$restProps}>
  <slot />
</h3>
