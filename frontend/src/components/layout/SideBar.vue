<template>
  <nav class="w-full pl-[5px]">
    <ul class="flex w-full flex-col gap-1">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="flex h-[3.2rem] w-full cursor-pointer items-center justify-center text-amber-950 transition-all dark:text-white"
      >
        <RouterLink v-if="item.href" :to="item.href" class="flex h-full w-[3.2rem] xl:w-full">
          <div class="relative flex h-[3.2rem] items-center justify-center rounded-full sm:w-[3.2rem]">
            <component :is="item.icon" :size="'1.7rem'" :class="[{ 'active-icon': activeIndex === index }]" />
            <span class="absolute left-[3.4rem] hidden text-nowrap xl:block">{{ item.label }}</span>
          </div>
        </RouterLink>

        <button v-else @click="handleAction(item.action)" class="flex h-full w-[3.2rem] xl:w-full">
          <div class="relative flex h-[3.2rem] items-center justify-center rounded-full sm:w-[3.2rem]">
            <component
              :is="item.icon"
              :size="'1.7rem'"
              :class="[{ 'active-icon': activeIndex === initialActiveIndex }]"
            />
            <span class="absolute left-[3.4rem] hidden text-nowrap xl:block">{{ item.label }}</span>
          </div>
        </button>
      </li>
    </ul>
  </nav>
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
