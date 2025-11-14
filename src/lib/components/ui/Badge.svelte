<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let variant: 'default' | 'success' | 'warning' | 'danger' = 'default';
  export let className: string = '';

  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';
  
  const variants = {
    default: 'bg-accent text-white',
    success: 'bg-aprobado text-white',
    warning: 'bg-pendiente text-white',
    danger: 'bg-rechazado text-white'
  };
  
  $: classes = cn(baseStyles, variants[variant], className);
</script>

<div class={classes} {...$$restProps}>
  <slot />
</div>
