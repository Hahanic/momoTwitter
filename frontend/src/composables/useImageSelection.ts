import { ref, computed } from 'vue'

export interface SelectedImage {
  file: File
  preview: string
}

export function useImageSelection(options?: { max?: number }) {
  const max = options?.max ?? 4
  const selectedImages = ref<SelectedImage[]>([])

  const count = computed(() => selectedImages.value.length)

  function addFiles(files: File[]) {
    for (const file of files) {
      if (selectedImages.value.length >= max) break
      const preview = URL.createObjectURL(file)
      selectedImages.value.push({ file, preview })
    }
  }

  function removeImage(idx: number) {
    const img = selectedImages.value[idx]
    if (img) URL.revokeObjectURL(img.preview)
    selectedImages.value.splice(idx, 1)
  }

  // 拖曳排序图片
  function reorderImages(payload: { from: number; to: number }) {
    const { from, to } = payload
    const updatedImages = [...selectedImages.value]
    const [movedItem] = updatedImages.splice(from, 1)
    updatedImages.splice(to, 0, movedItem)
    selectedImages.value = updatedImages
  }

  function clearAll() {
    selectedImages.value.forEach((i) => URL.revokeObjectURL(i.preview))
    selectedImages.value = []
  }

  return {
    selectedImages,
    count,
    max,
    addFiles,
    removeImage,
    reorderImages,
    clearAll,
  }
}
