<template>
  <div>
    <div class="relative">
      <nav class="relative z-10 mr-3 flex justify-end xl:justify-start">
        <ul class="relative z-[3] flex flex-col gap-1">
          <li
            v-for="(item, index) in items"
            :key="index"
            class="relative cursor-pointer rounded-full text-amber-950 transition-all dark:text-white"
          >
            <RouterLink
              v-if="item.href"
              :to="item.href"
              class="relative z-10 flex h-[3.2rem] items-center px-3 outline-none xl:px-[4.6rem]"
            >
              <span class="relative left-6 hidden xl:block">{{ item.label }}</span>
              <component
                :is="item.icon"
                :size="'1.7rem'"
                :class="['left-[4rem] transition-all xl:absolute', { 'active-icon': activeIndex === index }]"
              />
            </RouterLink>
            <button
              v-else
              @click="handleAction(item.action)"
              class="relative z-10 flex h-[3.2rem] w-full cursor-pointer items-center px-3 text-left outline-none xl:px-[4.6rem]"
            >
              <span class="relative left-6 hidden xl:block">{{ item.label }}</span>
              <component
                :is="item.icon"
                :size="'1.7rem'"
                :class="[
                  'left-[4rem] transition-all xl:absolute',
                  { 'active-icon': activeIndex === initialActiveIndex },
                ]"
              />
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
  const index = props.items.findIndex((item) => item.href && route.path.includes(item.href))
  return index !== -1 ? index : props.initialActiveIndex
})
</script>

<style>
.active-icon {
  transform: scale(1.3);
  filter: drop-shadow(0 2px 4px rgba(102, 212, 228, 0.1));
}
.dark .active-icon {
  filter: drop-shadow(0 2px 4px rgba(139, 181, 88, 0.1));
}
</style>
