<template>
<main class="sm:w-[38rem] sm:min-h-screen w-[100vw] border-x-1 dark:border-borderDark border-borderWhite">
  <div class="w-full h-[250px] mt-10 flex flex-col items-center">
    <p class="text-[#71767b]">这个页面不存在，或许可以看看其他的</p>
    <RouterLink to="/" class="text-blue-500 hover:underline mt-3">去探索</RouterLink>
  </div>
</main>

<aside class=" md:block lg:w-[25rem] w-[15rem] ml-7 h-screen hidden transition-all sticky top-0">
  <div class="flex flex-col items-center justify-center mt-10">
    <h1>404</h1>
    <p>咕咕咕...你怎么跑这里来了</p>
  </div>
</aside>
</template>

<script setup lang="ts">
</script>