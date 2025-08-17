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
    <!-- Mane -->
    <circle cx="40" cy="32" r="6" fill="var(--avatar-accent)" />
    <circle cx="50" cy="28" r="7" fill="var(--avatar-accent)" />
    <circle cx="60" cy="32" r="6" fill="var(--avatar-accent)" />
    <circle cx="35" cy="40" r="7" fill="var(--avatar-accent)" />
    <circle cx="65" cy="40" r="7" fill="var(--avatar-accent)" />
    <circle cx="38" cy="48" r="6" fill="var(--avatar-accent)" />
    <circle cx="62" cy="48" r="6" fill="var(--avatar-accent)" />

    <!-- Face -->
    <ellipse cx="50" cy="40" rx="16" ry="14" fill="var(--avatar-primary)" />

    <!-- Round ears -->
    <circle cx="42" cy="32" r="4" fill="var(--avatar-primary)" />
    <circle cx="58" cy="32" r="4" fill="var(--avatar-primary)" />

    <!-- Inner ears -->
    <circle cx="42" cy="32" r="2" fill="var(--avatar-accent)" />
    <circle cx="58" cy="32" r="2" fill="var(--avatar-accent)" />

    <!-- Eyes -->
    <ellipse cx="45" cy="38" rx="2" ry="3" fill="var(--avatar-background)" />
    <ellipse cx="55" cy="38" rx="2" ry="3" fill="var(--avatar-background)" />

    <!-- Eye pupils -->
    <ellipse cx="45" cy="38" rx="1" ry="2" fill="var(--avatar-primary)" />
    <ellipse cx="55" cy="38" rx="1" ry="2" fill="var(--avatar-primary)" />

    <!-- Lion nose -->
    <path d="M50 42c-1 0-2 1-2 2 0 1 1 1 2 1s2 0 2-1c0-1-1-2-2-2z" fill="var(--avatar-nose)" />

    <!-- Lion mouth -->
    <path
      d="M50 45c-2 0-3 1-3 2 0 0 1 0 2 0 1 0 1-1 1-1s0 1 1 1c1 0 2 0 2 0 0-1-1-2-3-2z"
      stroke="var(--avatar-primary)"
      strokeWidth="1"
      fill="none"
      strokeLinecap="round"
    />

    <!-- Whiskers -->
    <line x1="32" y1="40" x2="39" y2="39" stroke="var(--avatar-primary)" strokeWidth="1" strokeLinecap="round" />
    <line x1="32" y1="44" x2="39" y2="43" stroke="var(--avatar-primary)" strokeWidth="1" strokeLinecap="round" />
    <line x1="68" y1="40" x2="61" y2="39" stroke="var(--avatar-primary)" strokeWidth="1" strokeLinecap="round" />
    <line x1="68" y1="44" x2="61" y2="43" stroke="var(--avatar-primary)" strokeWidth="1" strokeLinecap="round" />
  </svg>
</template>

<style scoped>
svg {
  display: inline-block;
}
</style>
