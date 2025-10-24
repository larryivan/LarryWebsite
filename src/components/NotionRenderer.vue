<template>
  <div class="notion-renderer">
    <template v-for="block in structuredBlocks" :key="block.id">
      <component
        v-if="block.type === 'paragraph'"
        :is="'p'"
        class="notion-paragraph"
      >
        {{ block.text }}
        <NotionRenderer v-if="block.children.length" :blocks="block.children" />
      </component>

      <component
        v-else-if="block.type === 'heading_1'"
        :is="'h1'"
        class="notion-heading notion-heading--1"
      >
        {{ block.text }}
      </component>

      <component
        v-else-if="block.type === 'heading_2'"
        :is="'h2'"
        class="notion-heading notion-heading--2"
      >
        {{ block.text }}
      </component>

      <component
        v-else-if="block.type === 'heading_3'"
        :is="'h3'"
        class="notion-heading notion-heading--3"
      >
        {{ block.text }}
      </component>

      <blockquote v-else-if="block.type === 'quote'" class="notion-quote">
        {{ block.text }}
        <NotionRenderer v-if="block.children.length" :blocks="block.children" />
      </blockquote>

      <div v-else-if="block.type === 'code'" class="notion-code">
        <div v-if="block.language" class="notion-code__lang">{{ block.language }}</div>
        <pre><code>{{ block.text }}</code></pre>
        <p v-if="block.caption" class="notion-caption">{{ block.caption }}</p>
      </div>

      <figure v-else-if="block.type === 'image'" class="notion-figure">
        <img :src="block.source" alt="" loading="lazy" />
        <figcaption v-if="block.caption" class="notion-caption">{{ block.caption }}</figcaption>
      </figure>

      <hr v-else-if="block.type === 'divider'" class="notion-divider" />

      <div v-else-if="block.type === 'callout'" class="notion-callout">
        <span v-if="block.icon" class="notion-callout__icon">{{ block.icon }}</span>
        <div class="notion-callout__body">
          <p>{{ block.text }}</p>
          <NotionRenderer v-if="block.children.length" :blocks="block.children" />
        </div>
      </div>

      <ul
        v-else-if="block.type === 'list' && block.listType === 'bulleted'"
        class="notion-list notion-list--bulleted"
      >
        <li v-for="item in block.items" :key="item.id">
          <span>{{ item.text }}</span>
          <NotionRenderer v-if="item.children.length" :blocks="item.children" />
        </li>
      </ul>

      <ol
        v-else-if="block.type === 'list' && block.listType === 'numbered'"
        class="notion-list notion-list--numbered"
      >
        <li v-for="item in block.items" :key="item.id">
          <span>{{ item.text }}</span>
          <NotionRenderer v-if="item.children.length" :blocks="item.children" />
        </li>
      </ol>

      <div v-else-if="block.type === 'unsupported'" class="notion-unsupported">
        {{ block.text }}
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue'
import type { NotionContentBlock } from '../composables/useNotionPageContent'

type ListBlock = {
  id: string
  type: 'list'
  listType: 'bulleted' | 'numbered'
  items: NotionContentBlock[]
}

export default defineComponent({
  name: 'NotionRenderer',
  props: {
    blocks: {
      type: Array as PropType<NotionContentBlock[]>,
      default: () => []
    }
  },
  setup(props) {
    const structuredBlocks = computed<(NotionContentBlock | ListBlock)[]>(() => {
      const result: (NotionContentBlock | ListBlock)[] = []
      let pendingList: ListBlock | null = null

      const flushPending = () => {
        if (pendingList) {
          result.push(pendingList)
          pendingList = null
        }
      }

      props.blocks.forEach(block => {
        if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
          const listType = block.type === 'bulleted_list_item' ? 'bulleted' : 'numbered'
          if (!pendingList || pendingList.listType !== listType) {
            flushPending()
            pendingList = {
              id: `${block.id}-list`,
              type: 'list',
              listType,
              items: [block]
            }
          } else {
            pendingList.items.push(block)
          }
        } else {
          flushPending()
          result.push(block)
        }
      })

      flushPending()

      return result
    })

    return {
      structuredBlocks
    }
  }
})
</script>

<style scoped>
.notion-renderer {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
  font-size: 1.02rem;
  line-height: 1.8;
  color: #1f2937;
}

.notion-paragraph {
  margin: 0;
}

.notion-heading {
  margin: 0;
  line-height: 1.25;
  color: #0f172a;
}

.notion-heading--1 {
  font-size: 2.4rem;
}

.notion-heading--2 {
  font-size: 2rem;
}

.notion-heading--3 {
  font-size: 1.6rem;
}

.notion-quote {
  margin: 0;
  padding: 1rem 1.25rem;
  border-left: 4px solid rgba(15, 23, 42, 0.2);
  background: rgba(15, 23, 42, 0.04);
  border-radius: 8px;
  color: #0f172a;
}

.notion-code {
  background: #0f172a;
  color: #f8fafc;
  border-radius: 12px;
  padding: 1.2rem 1.4rem;
  overflow-x: auto;
  font-family: 'Fira Code', Menlo, Consolas, Monaco, 'Courier New', monospace;
}

.notion-code__lang {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(248, 250, 252, 0.6);
  margin-bottom: 0.7rem;
}

.notion-caption {
  font-size: 0.9rem;
  color: #64748b;
  margin-top: 0.5rem;
  text-align: center;
}

.notion-figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.notion-figure img {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
}

.notion-divider {
  border: none;
  height: 1px;
  background: rgba(15, 23, 42, 0.08);
  margin: 0;
}

.notion-callout {
  display: flex;
  gap: 0.75rem;
  padding: 1.1rem 1.2rem;
  background: rgba(14, 165, 233, 0.1);
  border-radius: 12px;
}

.notion-callout__icon {
  font-size: 1.5rem;
}

.notion-callout__body {
  flex: 1;
}

.notion-list {
  margin: 0;
  padding-left: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.notion-list--bulleted {
  list-style-type: disc;
}

.notion-list--numbered {
  list-style-type: decimal;
}

.notion-unsupported {
  padding: 1rem;
  border: 1px dashed rgba(220, 38, 38, 0.5);
  border-radius: 8px;
  color: #b91c1c;
  background: rgba(254, 226, 226, 0.6);
}

@media (max-width: 640px) {
  .notion-heading--1 {
    font-size: 2.1rem;
  }

  .notion-heading--2 {
    font-size: 1.75rem;
  }

  .notion-heading--3 {
    font-size: 1.4rem;
  }
}
</style>
