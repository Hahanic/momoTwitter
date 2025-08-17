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

    <path d="M36 32c-2-2-2-5 0-7 1-1 3-1 4 0 1 1 1 3 0 4-1 1-2 2-4 3z" fill="var(--avatar-primary)" />
    <path d="M64 32c2-2 2-5 0-7-1-1-3-1-4 0-1 1-1 3 0 4 1 1 2 2 4 3z" fill="var(--avatar-primary)" />
    <path d="M39 29c0-1-1-1-2-1s-2 1-2 2 1 2 2 2 2-1 2-2z" fill="var(--avatar-accent)" />
    <path d="M61 29c0-1 1-1 2-1s2 1 2 2-1 2-2 2-2-1-2-2z" fill="var(--avatar-accent)" />

    <ellipse cx="45" cy="38" rx="2" ry="3" fill="var(--avatar-background)" />
    <ellipse cx="55" cy="38" rx="2" ry="3" fill="var(--avatar-background)" />
    <ellipse cx="45" cy="38" rx="1" ry="2" fill="var(--avatar-primary)" />
    <ellipse cx="55" cy="38" rx="1" ry="2" fill="var(--avatar-primary)" />

    <path d="M50 43c-2 0-3 1-3 2 0 1 1 1.5 3 1.5s3-.5 3-1.5c0-1-1-2-3-2z" fill="var(--avatar-nose)" />

    <path
      d="M47 46.5 C 48 48, 52 48, 53 46.5"
      stroke="var(--avatar-primary)"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
    />

    <line x1="32" y1="41" x2="40" y2="40" stroke="var(--avatar-primary)" strokeWidth="1" strokeLinecap="round" />
    <line x1="32" y1="45" x2="40" y2="44" stroke="var(--avatar-primary)" strokeWidth="1" strokeLinecap="round" />
    <line x1="68" y1="41" x2="60" y2="40" stroke="var(--avatar-primary)" strokeWidth="1" strokeLinecap="round" />
    <line x1="68" y1="45" x2="60" y2="44" stroke="var(--avatar-primary)" strokeWidth="1" strokeLinecap="round" />
  </svg>
</template>

<style scoped>
svg {
  display: inline-block;
}
</style>
