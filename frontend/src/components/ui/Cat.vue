<script setup lang="ts">
defineProps({
  size: {
    type: Number,
    default: 64,
  },
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="28 17 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="40" rx="16" ry="14" fill="var(--color-primary)" />
    <path d="M38 32c-1-3 0-6 2-8 1-1 3-1 4 0 1 1 1 3 0 4l-2 4c-1 1-2 1-3 1-1 0-1-1-1-1z" fill="var(--color-primary)" />
    <path d="M62 32c1-3 0-6-2-8-1-1-3-1-4 0-1 1-1 3 0 4l2 4c1 1 2 1 3 1 1 0 1-1 1-1z" fill="var(--color-primary)" />
    <path d="M40 30c0-1 0-2 1-3 0 0 1 0 1 0 1 0 1 1 1 2l-1 2c0 0-1 0-1 0-1 0-1-1-1-1z" fill="var(--color-accent)" />
    <path d="M60 30c0-1 0-2-1-3 0 0-1 0-1 0-1 0-1 1-1 2l1 2c0 0 1 0 1 0 1 0 1-1 1-1z" fill="var(--color-accent)" />
    <ellipse cx="45" cy="38" rx="2" ry="3" fill="var(--color-background)" />
    <ellipse cx="55" cy="38" rx="2" ry="3" fill="var(--color-background)" />
    <ellipse cx="45" cy="38" rx="1" ry="2" fill="var(--color-primary)" />
    <ellipse cx="55" cy="38" rx="1" ry="2" fill="var(--color-primary)" />
    <path d="M50 42c-1 0-2 1-2 2 0 1 1 1 2 1s2 0 2-1c0-1-1-2-2-2z" fill="var(--color-chart-1)" />
    <path
      d="M50 45c-2 0-3 1-3 2 0 0 0 1 1 1 1 0 2-1 2-1s1 1 2 1c1 0 1-1 1-1 0-1-1-2-3-2z"
      stroke="var(--color-primary)"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
    />
    <line x1="30" y1="40" x2="38" y2="39" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" />
    <line x1="30" y1="44" x2="38" y2="43" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" />
    <line x1="70" y1="40" x2="62" y2="39" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" />
    <line x1="70" y1="44" x2="62" y2="43" stroke="var(--color-primary)" strokeWidth="1" strokeLinecap="round" />
  </svg>
</template>

<style scoped>
svg {
  display: inline-block;
}
</style>
