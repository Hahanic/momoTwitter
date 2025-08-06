<template>
  <main class="dark:border-borderDark border-borderWhite w-[100vw] border-x-1 sm:min-h-screen sm:w-[38rem]">
    <div class="mt-10 flex h-[250px] w-full flex-col items-center">
      <p class="text-[#71767b]">这个页面不存在，或许可以看看其他的</p>
      <RouterLink to="/" class="mt-3 text-blue-500 hover:underline">去探索</RouterLink>
    </div>
  </main>

  <aside class="sticky top-0 ml-7 hidden h-screen w-[15rem] transition-all md:block lg:w-[25rem]">
    <div class="mt-10 flex flex-col items-center justify-center">
      <h1>404</h1>
      <p>咕咕咕...你怎么跑这里来了</p>
    </div>
  </aside>
</template>

<script setup lang="ts"></script>
