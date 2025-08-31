<template>
  <FormModal>
    <template #header>
      <div class="flex h-full w-full items-center justify-between px-2">
        <div class="flex items-center gap-8">
          <button @click="handleClose" class="cursor-pointer rounded-full p-1 transition-colors hover:bg-blue-500/30">
            <X />
          </button>
          <p class="text-[1.1rem] font-bold">编辑个人资料</p>
        </div>
        <div class="pr-1">
          <button @click="handleSave" class="cursor-pointer text-blue-400">
            {{ isSaving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </template>
    <template #content>
      <div class="flex flex-col">
        <!-- 顶部banner -->
        <div
          class="group relative h-40 w-full cursor-pointer bg-gray-200 dark:bg-gray-800"
          @click="triggerBannerUpload"
        >
          <img
            class="h-full w-full object-cover"
            :src="bannerPreview || userStore.currentUserProfile?.bannerUrl || '/banner.gif'"
          />

          <div
            class="bg-opacity-40 absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <input type="file" ref="bannerInputRef" @change="onBannerFileSelected" class="hidden" accept="image/*" />
        </div>
        <!-- 头像 -->
        <div
          class="group relative -mt-14 flex h-28 w-28 cursor-pointer items-center justify-center rounded-full border-4 border-white bg-gray-100 dark:border-black dark:bg-gray-900"
          @click="triggerAvatarUpload"
        >
          <img
            class="h-full w-full rounded-full object-cover"
            :src="avatarPreview || userStore.currentUserProfile?.avatarUrl || '/cat.svg'"
          />

          <div
            class="bg-opacity-40 absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <input type="file" ref="avatarInputRef" @change="onAvatarFileSelected" class="hidden" accept="image/*" />
        </div>
        <!-- 资料 -->
        <div class="flex flex-col gap-6">
          <div class="min-h-[4rem] w-full rounded-[0.5rem] border-0 dark:border-1 dark:border-[#333639]"></div>
          <div class="relative">
            <label
              for="displayName"
              class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-500 dark:bg-black"
              >昵称</label
            >
            <input
              type="text"
              id="displayName"
              v-model="formData.displayName"
              maxlength="50"
              class="block w-full rounded-md border-1 border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-transparent"
            />
          </div>
          <div class="relative">
            <label
              for="bio"
              class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-500 dark:bg-black"
              >简介</label
            >
            <textarea
              id="bio"
              v-model="formData.bio"
              maxlength="160"
              rows="3"
              class="block w-full resize-none rounded-md border-1 border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-transparent"
            ></textarea>
          </div>
          <div class="relative">
            <label
              for="location"
              class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-500 dark:bg-black"
              >位置</label
            >
            <input
              type="text"
              id="location"
              v-model="formData.location"
              maxlength="30"
              class="block w-full rounded-md border-1 border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-transparent"
            />
          </div>
          <div class="relative">
            <label
              for="website"
              class="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-500 dark:bg-black"
              >网站</label
            >
            <input
              type="text"
              id="website"
              v-model="formData.website"
              maxlength="100"
              class="block w-full rounded-md border-1 border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-transparent"
            />
          </div>
        </div>
      </div>
    </template>
    <template #footer></template>
  </FormModal>
</template>
<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { onMounted, onUnmounted, reactive, ref } from 'vue'

import FormModal from './FormModal.vue'

import { handleFileUpload } from '@/composables/useMediaUpload'
import { useMessage } from '@/composables/useMessage'
import { useUserStore } from '@/stores'
import { type UserProfile } from '@/types'

const userStore = useUserStore()
const message = useMessage()

const isSaving = ref(false)

// 保存的表单数据
const formData = reactive({
  displayName: '',
  bio: '',
  location: '',
  website: '',
})

const bannerInputRef = ref<HTMLInputElement | null>(null)
const avatarInputRef = ref<HTMLInputElement | null>(null)

// 本地预览URL
const bannerPreview = ref<string | null>(null)
const avatarPreview = ref<string | null>(null)

// 上传的文件
let bannerFile: File | null = null
let avatarFile: File | null = null

const triggerBannerUpload = () => bannerInputRef.value?.click()
const triggerAvatarUpload = () => avatarInputRef.value?.click()

const onBannerFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    bannerFile = target.files[0]
    bannerPreview.value && URL.revokeObjectURL(bannerPreview.value)
    bannerPreview.value = URL.createObjectURL(bannerFile)
  }
}

const onAvatarFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    avatarFile = target.files[0]
    avatarPreview.value && URL.revokeObjectURL(avatarPreview.value)
    avatarPreview.value = URL.createObjectURL(avatarFile)
  }
}

const handleSave = async () => {
  if (isSaving.value) return
  isSaving.value = true

  message.info('更新中...')

  try {
    const updatedProfileData: Partial<UserProfile> = { ...formData }

    if (bannerFile) {
      const [uploaded] = await handleFileUpload([bannerFile])
      if (uploaded) {
        updatedProfileData.bannerUrl = uploaded.url
      }
    }
    if (avatarFile) {
      const [uploaded] = await handleFileUpload([avatarFile])
      if (uploaded) {
        updatedProfileData.avatarUrl = uploaded.url
      }
    }
    // 图片上传并返回URL后
    await userStore.updateUserProfile(updatedProfileData)

    message.success('个人资料已更新')
  } catch (error) {
    console.error('更新用户资料失败:', error)
    message.success('处理失败，请稍后重试')
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  if (userStore.currentUserProfile) {
    formData.displayName = userStore.currentUserProfile.displayName || ''
    formData.bio = userStore.currentUserProfile.bio || ''
    formData.location = userStore.currentUserProfile.location || ''
    formData.website = userStore.currentUserProfile.website || ''
  }
})

onUnmounted(() => {
  bannerPreview.value && URL.revokeObjectURL(bannerPreview.value)
  avatarPreview.value && URL.revokeObjectURL(avatarPreview.value)
})

const handleClose = () => {
  emit('close')
}
const emit = defineEmits(['close'])
</script>
