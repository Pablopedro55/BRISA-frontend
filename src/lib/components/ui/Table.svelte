<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let className: string = '';

  const baseStyles = 'w-full border-collapse';
  
  $: classes = cn(baseStyles, className);
</script>

<div class="relative w-full overflow-auto">
  <table class={classes} {...$$restProps}>
    <slot />
  </table>
</div>
