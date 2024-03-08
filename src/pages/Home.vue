<script setup lang="ts">
import {computed, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import axios from "axios";
import {randomSize} from "../utils/randomSize.ts";

const route = useRoute()
const router = useRouter()
const lastRoute = computed(() => route.matched[route.matched.length - 1])
const dialogVisible = computed({
  get() {
    return lastRoute.value.name == 'Detail'
  },
  set(val) {
    if (!val) {
      router.go(-1)
    }
  },
})

const dataList = ref([])
const loading = ref(false)
function getList() {
  loading.value = true
  axios.get('https://picsum.photos/v2/list')
      .then(({ data }) => {
        dataList.value = data.map(item => ({
          id: item.url.split('/').pop(),
          url: randomSize(item.download_url)
        }))
        localStorage.setItem('imageData', JSON.stringify(data))
  })
      .finally(() => {
        loading.value = false
      })
}
getList()
</script>

<template>
  <div>
    <div class="text-red-700">Home</div>
    <div class="w-full flex flex-wrap gap-3">
      <router-link v-for="item in dataList" :to="`/home/${item.id}`">
        <img :src="item.url" alt="">
      </router-link>
    </div>
  <el-dialog title="Detail" v-model="dialogVisible">
    <router-view></router-view>
  </el-dialog>
  </div>
</template>
