<template>
  <div class="sans-serif">
    <!-- <NuxtWelcome /> -->
    <!-- Use Nuxt Pages for routing -->
    <NuxtPage />
  </div>
</template>
<style>
html {
  /* add webkit font smoothing */
  -webkit-font-smoothing: antialiased;
  /* optimize legibility for text rendering */
  text-rendering: optimizeLegibility;
}

body {
  
  /* font-family: 'Roboto', sans-serif !important; */
  /* font-family: 'Courier New', Courier, monospace !important; */
}

.sans-serif {
  font-family: 'Kumbh Sans', sans-serif !important;
}

.monospace {
  font-family: 'Inconsolata', 'Courier New', Courier, monospace !important;
}

/* h1,h2,h3,h4,h5,h6 {
  font-family: 'Martel Sans', sans-serif !important;
} */

</style>
