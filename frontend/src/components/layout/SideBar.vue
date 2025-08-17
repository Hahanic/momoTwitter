<template>
  <div>
    <div class="relative">
      <nav class="relative z-10 mr-3 flex justify-end xl:justify-start">
        <ul class="relative z-[3] flex flex-col gap-1">
          <li
            v-for="(item, index) in items"
            :key="index"
            :class="[
              'relative cursor-pointer rounded-full text-amber-950 dark:text-white',
              { active: activeIndex === index },
            ]"
          >
            <RouterLink
              v-if="item.href"
              :to="item.href"
              class="relative z-10 flex h-[3.2rem] items-center px-3 outline-none xl:px-[4.6rem]"
            >
              <span class="relative left-6 hidden xl:block">{{ item.label }}</span>
              <component :is="item.icon" :size="'1.7rem'" class="left-[4rem] xl:absolute" />
            </RouterLink>
            <button
              v-else
              @click="handleAction(item.action)"
              class="relative z-10 flex h-[3.2rem] w-full items-center px-3 text-left outline-none xl:px-[4.6rem]"
            >
              <span class="relative left-6 hidden xl:block">{{ item.label }}</span>
              <component :is="item.icon" :size="'1.7rem'" class="left-[4rem] xl:absolute" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type Component, computed } from 'vue'
import { useRoute } from 'vue-router'

interface NavItem {
  icon: Component
  label: string
  href: string | null
  action?: string
}

interface NavProps {
  items: NavItem[]
  initialActiveIndex?: number
}

const props = withDefaults(defineProps<NavProps>(), {
  initialActiveIndex: -1,
})

// 定义 emit 事件
const emit = defineEmits<{
  action: [actionType: string]
}>()

const route = useRoute()

// 处理特殊动作
const handleAction = (actionType?: string) => {
  if (actionType) {
    emit('action', actionType)
  }
}

const activeIndex = computed(() => {
  const index = props.items.findIndex(
    // 确保 item.href 存在，避免在 null 上调用 .includes 方法
    (item) => item.href && route.path.includes(item.href)
  )
  return index !== -1 ? index : props.initialActiveIndex
})
</script>

<style>
/* li.active {
  color: black;
  text-shadow: none;
  background-color: rgb(239, 199, 199);
}

.dark li.active {
  color: black;
  background-color: white;
} */
</style>
