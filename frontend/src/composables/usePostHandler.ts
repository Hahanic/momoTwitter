import { useMessage, type MessageReactive } from 'naive-ui'
import { ref, computed } from 'vue'

import { useImageSelection } from '@/composables/useImageSelection'
import { handleFileUpload } from '@/composables/useMediaUpload'
import { useUserStore } from '@/stores'

export type MediaItem = {
  type: 'image' | 'video' | 'gif'
  url: string
}

// 提交操作的函数
type SubmitAction = (payload: { content: string; media?: MediaItem[] }) => Promise<void>

// 定义组合式函数的选项
interface UsePostHandlerOptions {
  submitAction: SubmitAction
  maxImages?: number
  additionalCanSubmitChecks?: () => boolean
}

export function usePostHandler(options: UsePostHandlerOptions) {
  const { submitAction, maxImages = 4, additionalCanSubmitChecks } = options

  const message = useMessage()
  const userStore = useUserStore()

  const messageContent = ref<string>('')
  const isUploading = ref(false)

  const {
    selectedImages,
    count: imageCount,
    max,
    removeImage,
    addFiles,
    clearAll: clearImages,
    reorderImages,
  } = useImageSelection({ max: maxImages })

  const MAX_IMAGES = max

  const handleFilesSelected = (files: File[]) => addFiles(files)
  const handleFileRejected = (info: { file: File; reason: string }) => {
    message.warning(info.reason)
  }

  const canSubmit = computed(() => {
    const baseChecks =
      (messageContent.value.trim() || imageCount.value > 0) && userStore.isAuthenticated && !isUploading.value

    const additionalChecks = additionalCanSubmitChecks ? additionalCanSubmitChecks() : true

    return baseChecks && additionalChecks
  })

  const handlePosting = async () => {
    if (!canSubmit.value) {
      if (!userStore.isAuthenticated) message.warning('请先登录！')
      else if (isUploading.value) message.warning('图片正在上传，请稍后再试')
      else message.warning('内容不能为空')
      return
    }

    let uploadingMessage: MessageReactive | null = null

    try {
      let mediaData: MediaItem[] = []

      // 图片上传流程
      if (selectedImages.value.length > 0) {
        isUploading.value = true
        console.log(1)
        uploadingMessage = message.info(`正在上传${selectedImages.value.length}张图片...`, {
          duration: 0,
          closable: true,
        })
        console.log(2)

        try {
          const files = selectedImages.value.map((i) => i.file)
          mediaData = await handleFileUpload(files)
        } catch (error: any) {
          message.error(error.message || '图片上传失败')
          throw error
        }
      }

      await submitAction({
        content: messageContent.value,
        media: mediaData.length > 0 ? mediaData : undefined,
      })

      message.success('发布成功！')

      messageContent.value = ''
    } catch (error: any) {
      message.error(error.message || '操作失败，请稍后再试')
      console.error('发布失败:', error)
    } finally {
      clearImages()
      if (uploadingMessage) uploadingMessage.destroy()
      isUploading.value = false
    }
  }

  const handleReorderImages = (payload: { from: number; to: number }) => {
    reorderImages(payload)
  }

  return {
    messageContent,
    isUploading,
    canSubmit,
    handlePosting,

    // 图片相关
    selectedImages,
    MAX_IMAGES,
    handleFilesSelected,
    handleFileRejected,
    removeImage,
    handleReorderImages,
  }
}
