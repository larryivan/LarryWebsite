import { computed, ref } from 'vue'
import { DEFAULT_NOTION_API_BASE_URL, sanitizeBaseUrl, stripNotionId } from '../utils/notion'

type RawNotionRow = Record<string, unknown> & {
  id: string
  Name?: string
  Summary?: string
  Description?: string
  Date?: string
  Slug?: string
  Tags?: string[]
  Published?: string | boolean
  url?: string
  Cover?: string
}

export type BlogPost = {
  id: string
  pageId: string
  slug: string
  title: string
  summary: string
  date?: string
  externalUrl: string
  tags: string[]
  cover?: string
}

const coerceBoolean = (value: unknown) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ['true', '1', 'yes', 'y', 'published'].includes(normalized)
  }
  if (typeof value === 'number') return value !== 0
  return true
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const normalizeRow = (row: RawNotionRow, postBaseUrl: string): BlogPost => {
  const title = typeof row.Name === 'string' && row.Name.trim() ? row.Name.trim() : 'Untitled Post'
  const summarySource = typeof row.Summary === 'string' && row.Summary.trim() ? row.Summary : row.Description
  const summary = typeof summarySource === 'string' && summarySource.trim()
    ? summarySource.trim()
    : 'Click through to read the full article.'
  const rawDate = typeof row.Date === 'string' ? row.Date : undefined
  const slug = typeof row.Slug === 'string' ? row.Slug.trim() : ''
  const slugCandidate = slug || slugify(title) || stripNotionId(row.id)
  const normalisedSlug = slugCandidate || stripNotionId(row.id)
  const pageId = stripNotionId(row.id)
  const sanitisedBase = sanitizeBaseUrl(postBaseUrl)

  let url = ''
  if (typeof row.url === 'string' && row.url.trim()) {
    url = row.url.trim()
  } else if (sanitisedBase && slug) {
    url = `${sanitisedBase}/${slug}`
  } else {
    url = `https://www.notion.so/${row.id.replace(/-/g, '')}`
  }

  const tags = Array.isArray(row.Tags)
    ? row.Tags.filter((tag): tag is string => typeof tag === 'string')
    : []

  return {
    id: row.id,
    pageId,
    slug: normalisedSlug,
    title,
    summary,
    date: rawDate,
    externalUrl: url,
    tags,
    cover: typeof row.Cover === 'string' ? row.Cover : undefined
  }
}

const isPublished = (row: RawNotionRow) => coerceBoolean(row.Published)

export const useNotionBlogPosts = () => {
  const posts = ref<BlogPost[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const apiBaseUrl = computed(() =>
    sanitizeBaseUrl(process.env.VUE_APP_NOTION_API_BASE_URL) || DEFAULT_NOTION_API_BASE_URL
  )

  const databaseId = computed(() => process.env.VUE_APP_NOTION_BLOG_DATABASE_ID?.trim() || '')
  const postBaseUrl = computed(() => process.env.VUE_APP_NOTION_POST_BASE_URL?.trim() || '')

  const requestUrl = computed(() => {
    if (!databaseId.value) return ''
    return `${apiBaseUrl.value}/v1/table/${databaseId.value}`
  })

  const fetchPosts = async () => {
    if (!databaseId.value) {
      error.value = 'Notion database ID is not configured.'
      posts.value = []
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(requestUrl.value)
      if (!response.ok) {
        throw new Error(`Failed to load posts (status ${response.status}).`)
      }

      const payload = await response.json()
      if (!Array.isArray(payload)) {
        throw new Error('Unexpected response received from Notion API proxy.')
      }

      posts.value = payload
        .filter((item): item is RawNotionRow => typeof item === 'object' && item !== null && 'id' in item)
        .filter(isPublished)
        .map(item => normalizeRow(item, postBaseUrl.value))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load blog posts.'
      error.value = message
      posts.value = []
    } finally {
      isLoading.value = false
    }
  }

  return {
    posts,
    isLoading,
    error,
    fetchPosts,
    getPostBySlug: (slug: string) => posts.value.find(post => post.slug === slug)
  }
}
