<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let className: string = '';

  const baseStyles = '[&_tr]:border-b';
  
  $: classes = cn(baseStyles, className);
</script>

<thead class={classes} {...$$restProps}>
  <slot />
</thead>
