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

    {/* Pointed ears */}
    <path d="M40 28l-4-8 8 2c2 1 2 3 1 4l-3 3c-1 0-2-1-2-1z" fill="var(--color-primary)" />
    <path d="M60 28l4-8-8 2c-2 1-2 3-1 4l3 3c1 0 2-1 2-1z" fill="var(--color-primary)" />

    {/* Inner ears */}
    <path d="M41 26l-2-4 4 1c1 0 1 1 0 2l-1 1c-1 0-1 0-1 0z" fill="var(--color-accent)" />
    <path d="M59 26l2-4-4 1c-1 0-1 1 0 2l1 1c1 0 1 0 1 0z" fill="var(--color-accent)" />

    {/* Eyes */}
    <ellipse cx="45" cy="38" rx="2" ry="3" fill="var(--color-background)" />
    <ellipse cx="55" cy="38" rx="2" ry="3" fill="var(--color-background)" />

    {/* Eye pupils */}
    <ellipse cx="45" cy="38" rx="1" ry="2" fill="var(--color-primary)" />
    <ellipse cx="55" cy="38" rx="1" ry="2" fill="var(--color-primary)" />

    {/* Fox snout */}
    <ellipse cx="50" cy="45" rx="5" ry="4" fill="var(--color-chart-2)" />

    {/* Fox nose */}
    <ellipse cx="50" cy="43" rx="1" ry="1" fill="var(--color-chart-1)" />

    {/* Fox mouth */}
    <path
      d="M50 45c-1 0-2 1-2 2 0 0 1 0 1 0 1 0 1-1 1-1s0 1 1 1c1 0 1 0 1 0 0-1-1-2-2-2z"
      stroke="var(--color-primary)"
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
