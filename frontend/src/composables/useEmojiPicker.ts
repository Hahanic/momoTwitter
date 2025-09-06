import { onClickOutside } from '@vueuse/core'
import { ref } from 'vue'

export function useEmojiPicker() {
  const showEmojiPicker = ref(false)
  const emojiWrapperRef = ref(null)

  const handleToggleEmoji = async () => {
    showEmojiPicker.value = !showEmojiPicker.value
  }

  const handleEmojiSelected = (emoji: any, editorRef: { insertEmoji: (unicode: string) => void } | null) => {
    if (editorRef) {
      editorRef.insertEmoji(emoji.unicode)
    }
  }

  const closeEmojiPicker = () => {
    showEmojiPicker.value = false
  }

  // 点击外部关闭表情选择器
  onClickOutside(emojiWrapperRef, closeEmojiPicker)

  return {
    showEmojiPicker,
    emojiWrapperRef,
    handleToggleEmoji,
    handleEmojiSelected,
    closeEmojiPicker,
  }
}
