<template>
  <component :is="as" class="brand-logo" :class="[`brand-logo--${variant}`]" v-bind="rootAttrs">
    <span v-if="showMark" class="brand-logo__tile" aria-hidden="true">
      <svg viewBox="0 0 96 96" fill="none" role="img">
        <line x1="14" y1="78" x2="82" y2="78" stroke="currentColor" stroke-width="0.75" stroke-linecap="round" opacity="0.55" />
        <g stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" fill="none">
          <path
            d="M38 18C38 18 36 20 36 26L36 64C36 70 38 72 42 72L70 72"
            stroke-width="2.2"
          />
          <path d="M30 18L46 18" stroke-width="1.2" />
          <path d="M70 70L70 74" stroke-width="1.2" />
          <circle cx="26" cy="82" r="1.2" fill="currentColor" stroke="none" />
          <circle cx="70" cy="82" r="1.2" fill="currentColor" stroke="none" />
        </g>
        <circle cx="50" cy="14" r="1.4" fill="currentColor" />
      </svg>
    </span>

    <span class="brand-logo__body">
      <span class="brand-logo__word">
        <span class="brand-logo__swash">L</span><span>awver</span>
      </span>
    </span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    as?: 'a' | 'div';
    href?: string;
    variant?: 'full' | 'compact' | 'hero' | 'mark-only';
    showMark?: boolean;
  }>(),
  {
    as: 'div',
    href: undefined,
    variant: 'full',
    showMark: true,
  },
);

const rootAttrs = computed(() => {
  if (props.as === 'a') {
    return {
      href: props.href || '#top',
      'aria-label': 'Lawver',
    };
  }

  return {
    'aria-label': 'Lawver',
  };
});
</script>
