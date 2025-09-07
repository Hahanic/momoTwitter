<template>
  <MorePageComponent :title="t('more.ability.title')" :items="listItems" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import MorePageComponent from '../components/index.vue'

import LanguageSettings from './components/LanguageSettings.vue'
import ThemeSettings from './components/ThemeSettings.vue'

const { t } = useI18n()

const listItems = computed(() => [
  {
    label: t('more.ability.accessibility.label'),
    value: t('more.ability.accessibility.value'),
    component: null,
  },
  {
    label: t('more.ability.display.label'),
    value: t('more.ability.display.value'),
    component: ThemeSettings,
  },
  {
    label: t('more.ability.languages.label'),
    value: t('more.ability.languages.value'),
    component: LanguageSettings,
  },
  {
    label: t('more.ability.dataUsage.label'),
    value: t('more.ability.dataUsage.value'),
    component: null,
  },
  {
    label: t('more.ability.keyboardShortcuts.label'),
    value: t('more.ability.keyboardShortcuts.value'),
    component: null,
  },
])
</script>
