import { createApp } from 'vue'
import App from './App.vue'
import { router } from "./pages";
import ElementPlus from 'element-plus'
import "element-plus/dist/index.css"
import './style.css'

createApp(App).use(router).use(ElementPlus).mount('#app')
