<template>
  <MorePageComponent :title="t('more.account.title')" :items="listItems" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import MorePageComponent from '../components/index.vue'

import { useUserStore } from '@/stores'

const { t } = useI18n()
const userStore = useUserStore()

const listItems = computed(() => [
  {
    label: t('more.account.username'),
    value: userStore.user ? `@${userStore.user.username}` : '-',
    component: null,
  },
  {
    label: t('more.account.displayName'),
    value: userStore.user?.displayName || '-',
    component: null,
  },
  { label: t('more.account.phone'), value: '+1234567890', component: null },
  {
    label: t('more.account.email'),
    value: userStore.user?.email || '-',
    component: null,
  },
  { label: t('more.account.creationDate'), value: '2020-01-01', component: null },
  { label: t('more.account.countryRegion'), value: '中国', component: null },
  { label: t('more.account.language'), value: '中文 (简体)', component: null },
  { label: t('more.account.gender'), value: 'Bot', component: null },
  { label: t('more.account.birthDate'), value: '2000-06-01', component: null },
  { label: t('more.account.age'), value: '27', component: null },
  {
    label: t('more.account.parodyAndFanAccounts.label'),
    value: t('more.account.parodyAndFanAccounts.value'),
    component: null,
  },
  {
    label: t('more.account.changeYourPassword.label'),
    value: t('more.account.changeYourPassword.value'),
    component: null,
  },
  {
    label: t('more.account.deactivateYourAccount.label'),
    value: t('more.account.deactivateYourAccount.value'),
    component: null,
  },
])

// const logoutAndclear = async () => {
//   try {
//     await userStore.logout()
//     message.success('已退出登录')
//     router.push('/login')
//   } catch (error) {
//     console.error('Logout failed:', error)
//   } finally {
//   }
// }
</script>

<style scoped></style>
