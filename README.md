# 起因

前两天看到小红书网页版的这个效果，感觉挺神奇的：

![112921709722546_.pic_hd.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/34b7edf45359431caaeb2fedb93a8e39~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2392&h=1828&s=2105401&e=png&a=1&b=141414)

![112941709722563_.pic_hd.jpg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/89ace147ddbf4b5e9866f812366579d8~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=2392&h=1828&s=1259419&e=png&a=1&b=121212)

就是它同一个url对应了两种不同的页面。

上面这个是从列表页点开一个文章的时候，浏览器的路由变了，但是页面没有发生跳转，而是以一个弹窗的模式显示文章，底下我们还能看到列表。

但是当我们把这个url发送给别人，或者刷新浏览器后，同一个url会显示为下面这一个文章详情页，这样就避免了查看详情的时候还需要加载背后的列表。并且小红书的列表和详情是有对应关系（hero效果），但是列表页是随机排列的，如果要加载列表后再加载详情，就很难定位到文章在列表中的位置（随机推荐逻辑就很难改），而且还会影响性能。

# 思考

解决方案我跟小伙伴思考了很久（基于vue-router），一开始我想的是通过路由守卫来控制，如果from来自列表，to就不跳转；如果from不是列表，则to跳转。但是这个方案会导致路由出现问题，因为如果没有跳转，则路由也不会变化。

另一个小伙伴想的是在路由表上，复用相同的组件，并使用keepAlive控制，来达到组件重用的目的。但是这个逻辑页有问题，keepAlive是路由的重用，其实不是组件的重用。

但当真正写起代码，才发现我们根本是想太多，其实解决方案简单到不足100行。

# 代码

## 第一步：搭建项目
这里我采用vite来搭建项目，其实小红书这种网站需要考虑SEO的需求，应该会采用nuxt或者next等同构解决方案，这里我们简化了一下，只考虑路由的变化，所以也就不使用nuxt来搭建项目了。

## 第二步，加入vue-router

routes.ts

``` ts
import { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: '/home'
  },
  {
    path: "/home",
    name: "Home",
    component: () => import("./Home.vue"),
    children: [
      {
        path: ':id',
        name: "Detail",
        component: () => import('./Detail.vue'),
      }
    ]
  },
]
```
router.ts
``` ts
import {createRouter, createWebHistory} from "vue-router";
import { routes } from './routes.ts'
export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

文件结构：

![image.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9bcf51affc9e4170a9ee6814f5cd7c76~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=358&h=304&s=29332&e=png&a=1&b=2b2d30)

我习惯吧routes和router分开两个文件，一个专心做路由表的编辑，另一个就可以专门做路由器（router）和路由守卫的编辑。

代码结构其实很简单，为了缩减代码量，我直接把page组件跟router放在一起了。

简单解释一下：

routes.ts 文件中我写了三个路由，一个是根路由`/`,一个是列表`/home`，一个是详情页Detail，这里使用了一个相对路由`:id`的小技巧，待会你们就会知道为什么要这样了。

## 第三步，编写Home.vue
``` html
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
  const data = localStorage.getItem('imageData')
  if (!data) {
    axios.get('https://picsum.photos/v2/list')
        .then(({data}) => setDataList(data))
        .then(data => localStorage.setItem('imageData', JSON.stringify(data)))
        .finally(() => {
          loading.value = false
        })
  } else {
    setDataList(JSON.parse(data))
  }
}
getList()

function setDataList(data) {
  dataList.value = data.map(item => ({
    id: item.url.split('/').pop(),
    url: randomSize(item.download_url)
  }))
  return data
}
</script>
```

这里重点看两个地方：

1. template里需要有显示detail视图的地方，因为Home.vue除了要显示列表，还需要显示弹窗中的Detail，所以我把列表做成了router-link，并且把router-view放在了dialog里。（这里借助了tailwindcss和element-plus）
2. 为了控制弹窗的显隐，我定义了一个dialogVisible计算对象，他的get来自router.matched列表中最后一个路由（最终命中的路由）是否为Detail，如果为Detail，就true，否则为false；它的set我们只需要处理false的情况，当false的时候，路由回退1。（其实是用push/replace还是用go我是有点纠结的，但是我看到小红书这里是用的回退，所以我也就用回退了，虽然回退在这种使用场景中存在一定的隐患）

剩下的代码就是获取数据相关的，我借用了picsum的接口，并且我也没有做小红书的瀑布流（毕竟还是有点难度的，等有空了再做个仿小红书瀑布流来水一篇文章）。

Detail.vue的代码就不贴了，它没有太多技术含量。

大概的页面效果是这样的：这里我就没有做数据加载优化之类功能了。（代码尽量简短）

![iShot_2024-03-09_12.09.51-ezgif.com-video-to-gif-converter.gif](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/9861ba8f7a1b4068871cca6e0cb85b3b~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=600&h=515&s=10106080&e=gif&f=168&b=f6f2f1)

我们可以看到，当点击详情的时候，浏览器右下角是有显示对应的路由，点开之后浏览器地址栏也变化了，详情内容在弹窗中出现，是我们想要的效果。

但是此时如果刷新页面，页面还是会一样先加载列表页，然后以Dialog显示详情。

# 刷新只显示详情
怎么做到刷新的时候只显示Detail页面而不显示列表页呢？我很快有一个想法：在路由表（routes.ts）的下面再增加一个路由，让它的路由路径跟详情的一样，这样刷新的时候会不会能够匹配到这个新路由呢？


``` ts
// route.ts
export const routes = [
  ...
  {
    path: '/home/:id',
    name: "DetailId",
    component: () => import('./Detail.vue')
  }
]
```

> 这个路由跟Home是同级的，使用了绝对路径来标记path（这就是上面detail采用相对路径的原因），同时为了避免name冲突，我换了一个name，component还是使用Detail.vue（这里我后来发现其实也可以使用其他的组件，其实真正起作用的是path，而不是component）。

但是不行，不论是将这个路由放在Home前面还是Home后面，都没法做到小红书的那种效果，放在home前面会导致从列表页直接跳转到详情页，不会在弹窗中显示；放在home后面又会因为匹配优先级的问题，匹配不到底下的DetailId

## 解决方案

但是前面的思考还是给了我灵感，添加一个路由守卫是不是就可以解决问题呢？于是我添加了这样一个全局路由守卫：

``` ts
// router.ts
router.beforeEach((to, from) => {
  if (to.name === 'Detail') {
    if (from.name === 'Home') {
      return true
    } else {
      return { name: 'DetailId', params: to.params }
    }
  }
})
```

这个守卫的作用是，当发生路由跳转时，如果to为Detail，则判断from是否为Home，如果from为Home，则可以正常跳转，如果from不为Home，则说明是刷新或者链接打开，这时跳转至DetailId页面，并且params保持不变。

短短十行代码，就解决了问题。

![iShot_2024-03-09_12.30.18-ezgif.com-video-to-gif-converter (1).gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/6cbb374c8026499e8eef7dece216acaa~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=600&h=515&s=12675710&e=gif&f=252&b=f7f3f2)

可以看到，正常从列表显示详情还是会正常从弹窗中显示，而如果此时刷新页面，就会直接进入到详情页面。

如此我们成功的模仿了小红书的路由逻辑。

# 总结

其实做完效果才会发现代码非常简单无非就是一个**路由守卫**，一个弹窗显示，加一起不到一百行代码。代码地址我贴在下方了，希望对大家有帮助。

https://github.com/Tz-george/xiaohongshu-route-sample
