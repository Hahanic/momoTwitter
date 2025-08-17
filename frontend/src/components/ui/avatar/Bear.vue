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
    <ellipse cx="50" cy="40" rx="16" ry="14" fill="var(--avatar-primary)" />

    <!-- Round ears -->
    <circle cx="38" cy="30" r="6" fill="var(--avatar-primary)" />
    <circle cx="62" cy="30" r="6" fill="var(--avatar-primary)" />

    <!-- Inner ears -->
    <circle cx="38" cy="30" r="3" fill="var(--avatar-accent)" />
    <circle cx="62" cy="30" r="3" fill="var(--avatar-accent)" />

    <!-- Eyes -->
    <ellipse cx="45" cy="38" rx="2" ry="3" fill="var(--avatar-background)" />
    <ellipse cx="55" cy="38" rx="2" ry="3" fill="var(--avatar-background)" />

    <!-- Eye pupils -->
    <ellipse cx="45" cy="38" rx="1" ry="2" fill="var(--avatar-primary)" />
    <ellipse cx="55" cy="38" rx="1" ry="2" fill="var(--avatar-primary)" />

    <!-- Bear snout -->
    <ellipse cx="50" cy="45" rx="4" ry="3" fill="var(--avatar-snout)" />

    <!-- Bear nose -->
    <ellipse cx="50" cy="43" rx="2" ry="1" fill="var(--avatar-nose)" />

    <!-- Bear mouth -->
    <path
      d="M50 46c-2 0-3 1-3 2 0 0 1 0 2 0 1 0 1-1 1-1s0 1 1 1c1 0 2 0 2 0 0-1-1-2-3-2z"
      stroke="var(--avatar-primary)"
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
