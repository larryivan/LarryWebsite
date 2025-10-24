import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Life from '../views/Life.vue'
import Blog from '../views/Blog.vue'
import About from '../views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/life',
    name: 'Life',
    component: Life
  },
  {
    path: '/blog',
    name: 'Blog',
    component: Blog
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
