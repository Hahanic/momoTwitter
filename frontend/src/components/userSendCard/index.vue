<template>
<div class="w-full flex border-b-1 dark:border-borderDark border-borderWhite">
  <!-- avator -->
  <div>
    <div class=" h-[3rem] w-[3rem] mx-2 mt-2">
      <img class="rounded-full select-none" src="/myAvatar.jpg"/>
    </div>
  </div>
  <!-- content -->
  <div class=" w-full">
    <!-- 文本 -->
    <div>
      <textarea ref="textareaRef" @input="handleTextareaInput" class="w-full text-xl mt-3 pr-2 resize-none focus:outline-none overflow-hidden" placeholder="有什么新鲜事?"></textarea>
    </div>
    <!-- 表情文件发送btn -->
    <div class="min-h-[3rem] flex justify-start">
      <div class="w-[90%] flex justify-between items-center border-t-1 dark:border-borderDark border-borderWhite">
        <div class="flex flex-wrap gap-4">
          <button type="button" class="hover:cursor-pointer"><Image :color="'#1eaafe'" :size="24"/></button>
          <button type="button" class="hover:cursor-pointer"><SmileIcon :color="'#1eaafe'" :size="24"/></button>
          <button type="button" class="hover:cursor-pointer"><LucideBot :color="'#1eaafe'" :size="24"/></button>
          <button type="button" class="hover:cursor-pointer"><MenuIcon :color="'#1eaafe'" :size="24"/></button>
          <button type="button" class="hover:cursor-pointer"><LocationEdit :color="'#1eaafe'" :size="24"/></button>
          <button type="button" class="hover:cursor-pointer"><CalendarClockIcon :color="'#1eaafe'" :size="24"/></button>
        </div>
        <div>
          <button class="w-15 h-10 dark:bg-[#787a7a] bg-[#87898c] dark:text-[#000] text-white font-semibold rounded-4xl">发帖</button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Image, LucideBot, MenuIcon, LocationEdit, CalendarClockIcon, SmileIcon } from 'lucide-vue-next';

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