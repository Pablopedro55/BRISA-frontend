<script lang="ts">
  import { cn } from '$lib/utils/cn';

  export let variant: 'default' | 'outline' | 'ghost' | 'danger' = 'default';
  export let size: 'default' | 'sm' | 'lg' | 'icon' = 'default';
  export let className: string = '';
  export let disabled: boolean = false;
  export let type: 'button' | 'submit' | 'reset' = 'button';

  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-accent hover:bg-accent-hover text-white shadow-sm',
    outline: 'border border-border bg-white hover:bg-muted text-foreground',
    ghost: 'hover:bg-muted text-foreground',
    danger: 'bg-danger hover:bg-danger/90 text-white shadow-sm'
  };
  
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-8 px-3 text-sm',
    lg: 'h-12 px-6',
    icon: 'h-10 w-10'
  };
  
  $: classes = cn(baseStyles, variants[variant], sizes[size], className);
</script>

<button 
  {type}
  {disabled}
  class={classes}
  on:click
  {...$$restProps}
>
  <slot />
</button>
