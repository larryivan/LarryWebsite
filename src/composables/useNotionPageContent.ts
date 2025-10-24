import { computed, ref } from 'vue'
import { DEFAULT_NOTION_API_BASE_URL, extractPlainText, sanitizeBaseUrl, stripNotionId } from '../utils/notion'

type NotionBlockMapEntry = {
  role: string
  value: NotionRawBlock
}

type NotionRawBlock = {
  id: string
  type: string
  properties?: Record<string, unknown>
  content?: string[]
  format?: Record<string, unknown>
  parent_id?: string
  created_time?: number
  last_edited_time?: number
}

export type NotionContentBlockType =
  | 'paragraph'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'quote'
  | 'code'
  | 'image'
  | 'divider'
  | 'callout'
  | 'bulleted_list_item'
  | 'numbered_list_item'

export type NotionContentBlock = {
  id: string
  type: NotionContentBlockType | 'unsupported'
  text?: string
  language?: string
  caption?: string
  source?: string
  icon?: string
  children: NotionContentBlock[]
}

const resolveCaption = (properties?: Record<string, unknown>) =>
  properties ? extractPlainText(properties, 'caption') : ''

const normaliseBlock = (
  blockId: string,
  blockMap: Record<string, NotionBlockMapEntry>
): NotionContentBlock | null => {
  const mapEntry = blockMap[blockId]
  if (!mapEntry) return null

  const block = mapEntry.value
  const { type } = block
  const properties = block.properties as Record<string, unknown> | undefined
  const format = block.format as Record<string, unknown> | undefined

  // Prevent accidental recursion on the page node
  if (type === 'page') {
    return null
  }

  const children = Array.isArray(block.content)
    ? block.content
        .map(childId => normaliseBlock(childId, blockMap))
        .filter((child): child is NotionContentBlock => Boolean(child))
    : []

  switch (type) {
    case 'text':
    case 'paragraph':
      return {
        id: blockId,
        type: 'paragraph',
        text: extractPlainText(properties),
        children
      }
    case 'sub_header':
    case 'heading_2':
      return {
        id: blockId,
        type: 'heading_2',
        text: extractPlainText(properties),
        children
      }
    case 'sub_sub_header':
    case 'heading_3':
      return {
        id: blockId,
        type: 'heading_3',
        text: extractPlainText(properties),
        children
      }
    case 'header':
    case 'heading_1':
      return {
        id: blockId,
        type: 'heading_1',
        text: extractPlainText(properties),
        children
      }
    case 'quote':
      return {
        id: blockId,
        type: 'quote',
        text: extractPlainText(properties),
        children
      }
    case 'bulleted_list':
      return {
        id: blockId,
        type: 'bulleted_list_item',
        text: extractPlainText(properties),
        children
      }
    case 'numbered_list':
      return {
        id: blockId,
        type: 'numbered_list_item',
        text: extractPlainText(properties),
        children
      }
    case 'code': {
      const caption = resolveCaption(properties)
      const languageProperty = properties?.language
      const language = Array.isArray(languageProperty)
        ? languageProperty.map(segment => (Array.isArray(segment) ? segment[0] : '')).join('')
        : format?.code_lang
      return {
        id: blockId,
        type: 'code',
        text: extractPlainText(properties),
        language: typeof language === 'string' ? language : undefined,
        caption,
        children
      }
    }
    case 'image': {
      const formatSource = typeof format?.display_source === 'string' ? (format.display_source as string) : ''
      const propertySource = typeof properties?.source === 'string' ? (properties.source as string) : ''
      const source = formatSource || propertySource
      return {
        id: blockId,
        type: 'image',
        source,
        caption: resolveCaption(properties),
        children
      }
    }
    case 'divider':
      return {
        id: blockId,
        type: 'divider',
        children
      }
    case 'callout': {
      const icon = typeof format?.page_icon === 'string' ? (format.page_icon as string) : undefined
      return {
        id: blockId,
        type: 'callout',
        text: extractPlainText(properties),
        icon,
        children
      }
    }
    default:
      return {
        id: blockId,
        type: 'unsupported',
        text: extractPlainText(properties) || `Unsupported block type: ${type}`,
        children
      }
  }
}

const findPageRoot = (blockMap: Record<string, NotionBlockMapEntry>) =>
  Object.values(blockMap).find(entry => entry?.value?.type === 'page') || null

export const useNotionPageContent = () => {
  const blocks = ref<NotionContentBlock[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPageId = ref('')

  const apiBaseUrl = computed(() =>
    sanitizeBaseUrl(process.env.VUE_APP_NOTION_API_BASE_URL) || DEFAULT_NOTION_API_BASE_URL
  )

  const fetchPage = async (pageId: string) => {
    const trimmed = stripNotionId(pageId)
    if (!trimmed) {
      error.value = '无效的 Notion 页面 ID。'
      blocks.value = []
      return
    }

    if (isLoading.value && trimmed === currentPageId.value) return

    isLoading.value = true
    error.value = null
    currentPageId.value = trimmed

    try {
      const response = await fetch(`${apiBaseUrl.value}/v1/page/${trimmed}`)
      if (!response.ok) {
        throw new Error(`加载文章内容失败（状态 ${response.status}）。`)
      }

      const payload = (await response.json()) as Record<string, NotionBlockMapEntry>
      const rootEntry = findPageRoot(payload)
      if (!rootEntry || !Array.isArray(rootEntry.value.content)) {
        throw new Error('未找到页面内容。')
      }

      const contentBlocks = rootEntry.value.content
        .map(blockId => normaliseBlock(blockId, payload))
        .filter((block): block is NotionContentBlock => Boolean(block))

      blocks.value = contentBlocks
    } catch (err) {
      const message = err instanceof Error ? err.message : '文章内容加载失败。'
      error.value = message
      blocks.value = []
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    blocks.value = []
    error.value = null
    currentPageId.value = ''
  }

  return {
    blocks,
    isLoading,
    error,
    fetchPage,
    reset
  }
}
