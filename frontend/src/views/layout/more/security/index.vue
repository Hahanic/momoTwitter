<template>
  <MorePageComponent :title="t('more.securityAndSessions.title')" :items="listItems" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import MorePageComponent from '../components/index.vue'

const { t } = useI18n()

const listItems = computed(() => [
  {
    label: t('more.securityAndSessions.security.label'),
    value: t('more.securityAndSessions.security.value'),
    component: null,
  },
  {
    label: t('more.securityAndSessions.sessions.label'),
    value: t('more.securityAndSessions.sessions.value'),
    component: null,
  },
  {
    label: t('more.securityAndSessions.connectedAccounts.label'),
    value: t('more.securityAndSessions.connectedAccounts.value'),
    component: null,
  },
  {
    label: t('more.securityAndSessions.delegation.label'),
    value: t('more.securityAndSessions.delegation.value'),
    component: null,
  },
])
</script>

<style scoped></style>
