<script setup lang="ts">
import { computed, ref } from 'vue'

type NavItem = {
  label: string
  href?: string
  ariaLabel?: string
}

interface NavBarProps {
  logo: string
  logoAlt?: string
  items: NavItem[]
  activeHref?: string
  className?: string
  baseColor?: string
  pillColor?: string
  hoveredPillTextColor?: string
  pillTextColor?: string
}

const props = withDefaults(defineProps<NavBarProps>(), {
  logoAlt: 'Logo',
  className: '',
  baseColor: '#0f172a',
  pillColor: 'transparent',
  hoveredPillTextColor: '#ffffff',
  pillTextColor: '#0f172a'
})

const isMobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
  if (isMobileMenuOpen.value) {
    isMobileMenuOpen.value = false
  }
}

const isExternalLink = (href?: string) => {
  if (!href) return false
  return /^(https?:\/\/|\/\/|mailto:|tel:|#)/.test(href)
}

const isRouterLink = (href?: string) => !!href && !isExternalLink(href)

const brandHref = computed(() => props.items.find(item => item.href)?.href ?? '/')
const brandUsesRouterLink = computed(() => isRouterLink(brandHref.value))

const cssVars = computed(() => ({
  '--nav-surface': 'rgba(255, 255, 255, 0.92)',
  '--nav-brand-bg': props.baseColor,
  '--nav-link-bg': props.pillColor,
  '--nav-link-color': props.pillTextColor ?? props.baseColor,
  '--nav-link-active-color': props.hoveredPillTextColor ?? '#ffffff'
}))
</script>

<template>
  <header class="navbar" :class="className" :style="cssVars">
    <div class="navbar__inner">
      <component
        :is="brandUsesRouterLink ? 'RouterLink' : 'a'"
        :to="brandUsesRouterLink ? brandHref : undefined"
        :href="brandUsesRouterLink ? undefined : brandHref"
        class="navbar__brand"
        aria-label="Home"
        @click="closeMobileMenu"
      >
        <img :src="logo" :alt="logoAlt" class="navbar__logo" />
      </component>

      <nav
        v-if="items?.length"
        class="navbar__links"
        :class="{ 'is-open': isMobileMenuOpen }"
        aria-label="Primary"
      >
        <ul class="navbar__list">
          <li v-for="(item, index) in items" :key="item.href || `nav-${index}`" class="navbar__item">
            <component
              :is="isRouterLink(item.href) ? 'RouterLink' : 'a'"
              :to="isRouterLink(item.href) ? item.href : undefined"
              :href="!isRouterLink(item.href) ? item.href : undefined"
              class="navbar__link"
              :class="{ 'is-active': activeHref === item.href }"
              :aria-label="item.ariaLabel || item.label"
              @click="closeMobileMenu"
            >
              {{ item.label }}
            </component>
          </li>
        </ul>
      </nav>

      <button
        type="button"
        class="navbar__toggle"
        :class="{ 'is-open': isMobileMenuOpen }"
        :aria-expanded="isMobileMenuOpen"
        aria-controls="primary-navigation"
        aria-label="Toggle navigation"
        @click="toggleMobileMenu"
      >
        <span />
        <span />
        <span />
      </button>
    </div>

    <nav
      v-if="items?.length"
      id="primary-navigation"
      class="navbar__mobile"
      :class="{ 'is-open': isMobileMenuOpen }"
      aria-label="Mobile primary"
    >
      <ul class="navbar__mobile-list">
        <li v-for="(item, index) in items" :key="item.href || `mobile-${index}`" class="navbar__mobile-item">
          <component
            :is="isRouterLink(item.href) ? 'RouterLink' : 'a'"
            :to="isRouterLink(item.href) ? item.href : undefined"
            :href="!isRouterLink(item.href) ? item.href : undefined"
            class="navbar__mobile-link"
            :class="{ 'is-active': activeHref === item.href }"
            :aria-label="item.ariaLabel || item.label"
            @click="closeMobileMenu"
          >
            {{ item.label }}
          </component>
        </li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: var(--nav-surface);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.navbar__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  margin: 0 auto;
  max-width: 1120px;
}

.navbar__brand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: var(--nav-brand-bg);
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.12);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.navbar__brand:hover,
.navbar__brand:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(15, 23, 42, 0.18);
}

.navbar__logo {
  width: 70%;
  height: auto;
  object-fit: contain;
}

.navbar__links {
  justify-self: center;
  display: flex;
  align-items: center;
}

.navbar__list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.navbar__item {
  display: flex;
}

.navbar__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.2rem;
  border-radius: 999px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-decoration: none;
  background: var(--nav-link-bg);
  color: var(--nav-link-color);
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.navbar__link:hover,
.navbar__link:focus-visible {
  background: var(--nav-brand-bg);
  color: var(--nav-link-active-color);
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.navbar__link.is-active {
  background: var(--nav-brand-bg);
  color: var(--nav-link-active-color);
}

.navbar__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-left: auto;
  padding: 0.25rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s ease;
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

.navbar__toggle:hover,
.navbar__toggle:focus-visible {
  background: rgba(15, 23, 42, 0.08);
}

.navbar__toggle span {
  display: block;
  width: 22px;
  height: 2px;
  border-radius: 999px;
  background: var(--nav-brand-bg);
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.navbar__toggle span + span {
  margin-top: 5px;
}

.navbar__toggle.is-open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.navbar__toggle.is-open span:nth-child(2) {
  opacity: 0;
}

.navbar__toggle.is-open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.navbar__mobile {
  display: none;
}

.navbar__mobile-list {
  list-style: none;
  margin: 0;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.navbar__mobile-link {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  text-align: center;
  font-weight: 600;
  text-decoration: none;
  background: var(--nav-link-bg);
  color: var(--nav-link-color);
  transition: background 0.2s ease, color 0.2s ease;
}

.navbar__mobile-link.is-active,
.navbar__mobile-link:hover,
.navbar__mobile-link:focus-visible {
  background: var(--nav-brand-bg);
  color: var(--nav-link-active-color);
}

@media (max-width: 768px) {
  .navbar {
    border-bottom: none;
  }

  .navbar__inner {
    grid-template-columns: auto auto;
    grid-template-rows: auto auto;
    row-gap: 0.5rem;
  }

  .navbar__links {
    display: none;
  }

  .navbar__toggle {
    visibility: visible;
    opacity: 1;
    pointer-events: auto;
  }

  .navbar__mobile {
    display: none;
    background: var(--nav-surface);
    border-top: 1px solid rgba(15, 23, 42, 0.06);
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
  }

  .navbar__mobile.is-open {
    display: block;
  }
}

@media (min-width: 769px) {
  .navbar__mobile {
    display: none !important;
  }
}
</style>
