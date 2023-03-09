// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/devtools',
    '@vueuse/nuxt',
    ['@nuxtjs/google-fonts', {
      families: {
        'Kumbh Sans': [200, 400, 700, 900],
        Inconsolata: [400],
        // 'Martel Sans': [900],
      },
    }],
  ],
  // buildModules: ['@nuxtjs/google-fonts'],
  // googleFonts: {
  //   families: {
  //   'Kumbh Sans': [200, 400, 700, 900],
  // }},
  // add the font stylesheet to the head instead
  // head: {
  //   link: [
  //     {
  //       rel: 'stylesheet',
  //       href: 'https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@200;400;700;900&display=swap',
  //     },
  //   ],
  // },

  // set up opengraph tags to use public/images/og-share-image.png as share image
  app: {
    head: {
      meta: [
        { property: "og:title", content: "Ukraine's grain farming amidst the conflict with Russia" },
        {
          property: "og:description",
          content:
            "by The Plotline",
        },
        {
          name: 'og:image',
          content: 'images/og-share-image.png',
        },
        {
          name: 'twitter:image',
          content: 'images/og-share-image.png',
        },
      ],
    },
  },


  // add tachyons CSS framework
  css: ['tachyons/css/tachyons.min.css'],
  vite: {
    define: {
      'process.env.POLYGON_CLIPPING_MAX_QUEUE_SIZE': '1000000',
      'process.env.POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS': '1000000',
    },
  },
})
