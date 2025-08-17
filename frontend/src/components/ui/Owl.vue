<script setup lang="ts">
defineProps({
  size: {
    type: Number,
    default: 64,
  },
})
</script>

<template>
  <svg
    width="{size}"
    height="{size}"
    viewBox="28 17 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="{className}"
  >
    <ellipse cx="50" cy="40" rx="16" ry="14" fill="var(--color-primary)" />

    {/* Ear tufts */}
    <path d="M40 26l-2-4 4 1c1 0 1 2 0 3l-2 0z" fill="var(--color-primary)" />
    <path d="M60 26l2-4-4 1c-1 0-1 2 0 3l2 0z" fill="var(--color-primary)" />

    {/* Large owl eyes */}
    <circle cx="45" cy="38" r="5" fill="var(--color-background)" />
    <circle cx="55" cy="38" r="5" fill="var(--color-background)" />

    {/* Eye rings */}
    <circle cx="45" cy="38" r="5" fill="none" stroke="var(--color-accent)" strokeWidth="1" />
    <circle cx="55" cy="38" r="5" fill="none" stroke="var(--color-accent)" strokeWidth="1" />

    {/* Eye pupils */}
    <circle cx="45" cy="38" r="2" fill="var(--color-primary)" />
    <circle cx="55" cy="38" r="2" fill="var(--color-primary)" />

    {/* Owl beak */}
    <path d="M50 44l-2 3 2-1 2 1-2-3z" fill="var(--color-chart-1)" />

    {/* Facial disc pattern */}
    <path
      d="M34 40c0-8 7-15 16-15s16 7 16 15"
      stroke="var(--color-accent)"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
</template>

<style scoped>
svg {
  display: inline-block;
}
</style>
