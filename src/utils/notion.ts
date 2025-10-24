export const DEFAULT_NOTION_API_BASE_URL = 'https://notion-api.splitbee.io'

export const sanitizeBaseUrl = (value?: string) => {
  if (!value) return ''
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export const stripNotionId = (id: string) => id.replace(/-/g, '').trim()

export const extractPlainText = (property: unknown, key = 'title'): string => {
  if (!property || typeof property !== 'object') return ''
  const propertyRecord = property as Record<string, unknown>
  const value = propertyRecord[key]
  if (!Array.isArray(value)) return ''

  return value
    .map(segment => {
      if (Array.isArray(segment)) {
        const [text] = segment
        return typeof text === 'string' ? text : ''
      }
      return ''
    })
    .join('')
    .trim()
}
