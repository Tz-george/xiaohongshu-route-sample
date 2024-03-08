<script setup lang="ts">
import {computed} from "vue";
import {useRoute} from "vue-router";

const route = useRoute()
const routeName = computed(() => route.name)
const id = computed(() => route.params.id)
const dataItem = computed(() => {
  const imageData = JSON.parse(localStorage.getItem('imageData'))
  return imageData.find(item => item.url.split('/').pop() === id.value)
})
</script>

<template>
  <div>
    <div class="flex items-center mb-3">
      <router-link v-if="routeName === 'DetailId'" :to="{
      name: 'Home'
    }">
        <button>Home</button>
      </router-link>
      <span class="ml-auto mr-auto">{{ id }}</span>
    </div>
    <div>
      <img :src="dataItem.download_url" alt="">
    </div>
  </div>
</template>
