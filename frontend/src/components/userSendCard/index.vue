<template>
  <div :class="{'border-b-1': !isCompose, 'h-full max-h-[100vh] flex flex-col': isCompose}" class="w-full dark:border-borderDark border-borderWhite">
    <div v-if="isCompose" class="pt-2 px-2 pb-3 flex justify-between items-center">
      <RouterLink to="/">
        <ArrowLeft class="sm:hidden block" :size="26" />
        <XIcon class="sm:block hidden" :size="26" />
      </RouterLink>
      <div class="text-[#1eaafe] flex items-center gap-4">
        <span>草稿</span>
        <div class="block sm:hidden">
          <button class="w-14 h-9 dark:bg-[#0f4e78] bg-[#87898c] dark:text-[#8e8781] text-white font-semibold rounded-4xl">发帖</button>
        </div>
      </div>
    </div>

    <div class="flex" :class="{'min-h-0': isCompose}">
      <div>
        <div class="h-[3rem] w-[3rem] mx-2 mt-2">
          <img class="rounded-full select-none" src="/myAvatar.jpg"/>
        </div>
      </div>
      
      <div class="w-full h-full relative">
        <n-scrollbar class="sm:max-h-[600px]">
          <textarea
            ref="textareaRef"
            @input="handleTextareaInput"
            class="w-full text-xl mt-3 pr-2 resize-none overflow-y-hidden break-all focus:outline-none bg-transparent"
            placeholder="有什么新鲜事?"
          ></textarea>
        </n-scrollbar>
      </div>
    </div>

    <div class="min-h-[3rem] sm:pl-[3.8rem] sm:pr-[1rem] px-4 flex">
      <div class="w-full flex justify-between items-center border-t-1 dark:border-borderDark border-borderWhite">
        <div class="flex flex-wrap gap-4 text-icon1">
          <button type="button" class="hover:cursor-pointer"><Image :size="24"/></button>
          <button type="button" class="hover:cursor-pointer"><SmileIcon :size="24"/></button>
          <button type="button" class="hover:cursor-pointer"><LucideBot :size="24"/></button>
          <button type="button" class="hover:cursor-pointer"><MenuIcon :size="24"/></button>
          <button type="button" class="hover:cursor-pointer"><LocationEdit :size="24"/></button>
          <button type="button" class="hover:cursor-pointer"><CalendarClockIcon :size="24"/></button>
        </div>
        <div :class="{ 'hidden sm:block': isCompose }">
          <button class="w-14 h-9 dark:bg-[#787a7a] bg-[#87898c] dark:text-[#000] text-white font-semibold rounded-4xl">发帖</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Image, LucideBot, MenuIcon, LocationEdit, CalendarClockIcon, SmileIcon, XIcon, ArrowLeft } from 'lucide-vue-next';
import { NScrollbar } from 'naive-ui';

interface Props {
  isCompose?: boolean;
}
withDefaults(defineProps<Props>(), {
  isCompose: false
})

const textareaRef = ref<HTMLTextAreaElement | null>(null)

const handleTextareaInput = () => {
  const textarea = textareaRef.value
  if(textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}
</script>

<style scoped>

</style>