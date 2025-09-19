<template>
  <div class="flex h-[3.2rem] items-center justify-center">
    <div class="dark:border-borderDark relative flex w-full items-center rounded-2xl">
      <SearchIcon :size="17.6" class="absolute left-3" />
      <input
        type="text"
        :placeholder="t('search.placeholder')"
        class="h-[2.4rem] w-full rounded-2xl bg-[#f5f5f5] pr-4 pl-9 text-amber-950 outline-none focus:ring-1 focus:ring-blue-300 dark:bg-[#181818] dark:text-white"
        v-model="searchQuery"
        @keyup.enter="performSearch"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { SearchIcon } from 'lucide-vue-next'
import { getCurrentInstance } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

const props = withDefaults(
  defineProps<{
    type?: string
  }>(),
  {
    type: 'posts',
  }
)
const emit = defineEmits<{ (e: 'search', value: string, type: string): void }>()

const { t } = useI18n()
const searchQuery = defineModel<string>({ default: '' })
const router = useRouter()
const instance = getCurrentInstance()

const performSearch = () => {
  if (searchQuery.value.trim()) {
    const hasSearchListener = instance?.vnode.props?.onSearch

    if (hasSearchListener) {
      emit('search', searchQuery.value, props.type)
    } else {
      router.push({ path: '/explore/posts', query: { q: searchQuery.value } })
      searchQuery.value = ''
    }
  }
}
</script>

<style scoped></style>
