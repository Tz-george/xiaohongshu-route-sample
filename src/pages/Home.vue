<script setup lang="ts">
import {computed} from "vue";
import {useRoute, useRouter} from "vue-router";

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
</script>

<template>
  <div>Home
    <router-link to="/home/1234">
      <button>to Detail</button>
    </router-link>
  <el-dialog title="Detail" v-model="dialogVisible">
    <router-view></router-view>
  </el-dialog>
  </div>
</template>
