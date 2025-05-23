/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

// import '../../resources/scss/app.scss'
import { createSSRApp, h } from 'vue'
import type { DefineComponent } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'

const appName = import.meta.env.VITE_APP_NAME || 'Winner'

createInertiaApp({
  progress: { color: '#ff5484' },

  title: (title) => `${title} - ${appName}`,

  resolve: (name) => {
    return resolvePageComponent(
      `../pages/${name}.vue`,
      import.meta.glob<DefineComponent>('../pages/**/*.vue')
    )
  },

  setup({ el, App, props, plugin }) {
    const vueApp = createSSRApp({ render: () => h(App, props) })
    vueApp.use(plugin).mount(el)
    vueApp.config.globalProperties.test = '1'
  },
})
