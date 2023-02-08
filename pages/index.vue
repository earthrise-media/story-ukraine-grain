<template>
  <main>
    <!-- a list of prototypes created so far -->
    <ul>
      <li v-for="prototype in prototypes" :key="prototype">
        <NuxtLink :to="`/${prototype}`">{{ prototype }}</NuxtLink>
      </li>
    </ul>
  </main>
</template>
<script setup>
const prototypes = ["map", "scatterplot", "scrollytelling"];
</script>
