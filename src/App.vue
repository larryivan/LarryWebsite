<template>
  <div id="app">
    <NavBar
      :logo="logo"
      logoAlt="Logo"
      :items="[
        { label: 'Home', href: '/' },
        { label: 'Life', href: '/life' },
        { label: 'Blog', href: '/blog' },
        { label: 'About', href: '/about' }
      ]"
      :activeHref="currentRoute"
      ease="power2.easeOut"
      baseColor="#000000"
      pillColor="#ffffff"
      hoveredPillTextColor="#ffffff"
      pillTextColor="#000000"
    />
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import logo from './assets/logo.png'

const route = useRoute()
const currentRoute = computed(() => {
  const path = route.path
  if (path.startsWith('/blog')) return '/blog'
  if (path.startsWith('/life')) return '/life'
  if (path.startsWith('/about')) return '/about'
  return '/'
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
