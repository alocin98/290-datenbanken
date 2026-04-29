<script setup lang="ts">
import DefaultTheme from "vitepress/theme";
import { onMounted } from "vue";
import { bootSharedClient } from "./shared/global";

const { Layout } = DefaultTheme;

onMounted(() => {
  bootSharedClient();
});
</script>

<template>
  <div class="site-shell">
    <Layout />
  </div>
</template>
