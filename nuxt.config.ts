// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools',
    '@vueuse/nuxt'
  ],

  
  // add google webfonts:
  // Martel Sans 400, 700, and 900
  // googleFonts: {
  //   families: {
  //     'Martel Sans': [400, 700, 900],
  //   },
  // },

  // add tachyons CSS framework
  css: ['tachyons/css/tachyons.min.css'],
  vite: {
    define: {
      'process.env.POLYGON_CLIPPING_MAX_QUEUE_SIZE': '1000000',
      'process.env.POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS': '1000000',
    },
  },
})
