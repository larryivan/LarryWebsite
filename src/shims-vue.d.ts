declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// eslint-disable-next-line no-unused-vars
declare const process: {
  env: Record<string, string | undefined>
}
