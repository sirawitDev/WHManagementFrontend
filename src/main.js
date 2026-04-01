import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import './style.css'
import { createPinia } from 'pinia'

const app = createApp(App)

document.title = 'WAREHOUSE'
const link = document.querySelector("link[rel~='icon']") || document.createElement('link')
link.rel = 'icon'
link.type = 'image/png'
link.href = '/src/assets/img/CNTITLE.png'
document.getElementsByTagName('head')[0].appendChild(link)

app.use(createPinia())
app.use(router)
app.mount('#app')