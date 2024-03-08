<script setup lang="ts">
import {computed} from "vue";
import {useRoute} from "vue-router";

const route = useRoute()
const id = computed(() => route.params.id)
console.log('Detail')
</script>

<template>
  <div>
    <router-link :to="{
      name: 'Home'
    }">
      <button >back</button>
    </router-link>
    <div>{{ id }}</div>
  </div>
</template>

<style scoped>

</style>
