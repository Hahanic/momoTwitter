<template>
  <div
    class="flex h-[3.2rem] w-full justify-start bg-white dark:bg-black"
    :class="{ 'fixed top-0': windowStore.isMobile }"
  >
    <div class="flex items-center justify-center">
      <button
        @click="router.push('/more')"
        class="rounded-full p-2 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <ArrowLeft :size="24" />
      </button>
      <div class="ml-5 text-xl font-bold">
        <p>{{ props.title || t('more.ability.title') }}</p>
      </div>
    </div>
  </div>

  <div class="flex w-full flex-col pt-[3.2rem] sm:pt-0">
    <div>
      <TransitionGroup tag="ul" name="list" class="w-full">
        <li v-for="(item, index) in listItems" :key="item.label" class="w-full">
          <button
            @click="toggleItem(index)"
            :disabled="!item.component"
            class="flex w-full items-center justify-between px-4 py-3 transition-all hover:bg-[#f7f9f9] dark:hover:bg-[#16181c]"
          >
            <div class="flex flex-col items-start text-left">
              <span class="text-1 leading-1.1">{{ item.label }}</span>
              <span v-if="item.value" class="text-[0.9rem] leading-none text-[#71767b]">{{ item.value }}</span>
            </div>
            <svg
              class="ml-4 w-6 text-[#71767b] transition-transform"
              :class="{ 'rotate-90': openIndexs.includes(index) }"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <g>
                <path
                  fill="currentColor"
                  d="M14.586 12L7.543 4.96l1.414-1.42L17.414 12l-8.457 8.46-1.414-1.42L14.586 12z"
                ></path>
              </g>
            </svg>
          </button>
          <Transition
            name="slide-down"
            @before-enter="onBeforeEnter"
            @enter="onEnter"
            @after-enter="onAfterEnter"
            @before-leave="onBeforeLeave"
            @leave="onLeave"
            @after-leave="onAfterLeave"
          >
            <div v-if="openIndexs.includes(index)" class="overflow-hidden">
              <component :is="item.component" />
            </div>
          </Transition>
        </li>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useWindowStore } from '@/stores'

interface ListItem {
  label: string
  value?: string
  component?: any
  disabled?: boolean
}

const props = defineProps<{
  title?: string
  items: ListItem[]
}>()

const router = useRouter()
const windowStore = useWindowStore()
const { t } = useI18n()

const openIndexs = ref<number[]>([])
const toggleItem = (index: number) => {
  if (openIndexs.value.includes(index)) {
    openIndexs.value = openIndexs.value.filter((i) => i !== index)
  } else {
    openIndexs.value.push(index)
  }
}

const listItems = computed(() => props.items)

const onBeforeEnter = (el: Element) => {
  const element = el as HTMLElement
  element.style.height = '0'
}

const onEnter = (el: Element, done: () => void) => {
  const element = el as HTMLElement
  // 强制浏览器重绘
  element.style.height = `${element.scrollHeight}px`
  // 监听 transition 结束事件，确保动画完成后调用 done
  element.addEventListener('transitionend', done, { once: true })
}

const onAfterEnter = (el: Element) => {
  const element = el as HTMLElement
  // 动画结束后，设置 height 为 auto，以应对内容动态变化
  element.style.height = 'auto'
}

const onBeforeLeave = (el: Element) => {
  const element = el as HTMLElement
  // 在离开前，必须获取元素的实时高度
  element.style.height = `${element.scrollHeight}px`
}

const onLeave = (el: Element, done: () => void) => {
  const element = el as HTMLElement
  // 强制浏览器重绘
  requestAnimationFrame(() => {
    element.style.height = '0'
  })
  element.addEventListener('transitionend', done, { once: true })
}

const onAfterLeave = (el: Element) => {
  const element = el as HTMLElement
  // 离开动画结束后，清理样式
  element.style.height = ''
}
</script>

<style scoped>
.list-move {
  transition: transform 0.3s ease;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: height 0.3s ease;
  overflow: hidden;
}
</style>
