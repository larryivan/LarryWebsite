<template>
  <section class="blog-post">
    <div class="container">
      <RouterLink to="/blog" class="back-link">← 返回博客</RouterLink>

      <div v-if="isLoadingPosts" class="status status--loading">正在加载文章列表...</div>
      <div v-else-if="postsError" class="status status--error">
        <p>{{ postsError }}</p>
        <button type="button" class="status__retry" @click="handleReloadPosts">重新加载</button>
      </div>
      <div v-else-if="!postMeta" class="status status--empty">没有找到对应的文章。</div>

      <article v-else class="post">
        <header class="post__header">
          <p v-if="postMeta.formattedDate" class="post__date">{{ postMeta.formattedDate }}</p>
          <h1 class="post__title">{{ postMeta.title }}</h1>
          <ul v-if="postMeta.tags.length" class="post__tags">
            <li v-for="tag in postMeta.tags" :key="`${postMeta.id}-${tag}`" class="post__tag">{{ tag }}</li>
          </ul>
          <img v-if="postMeta.cover" :src="postMeta.cover" :alt="postMeta.title" class="post__cover" />
        </header>

        <div v-if="isLoadingContent" class="status status--loading">正在加载文章内容...</div>
        <div v-else-if="contentError" class="status status--error">
          <p>{{ contentError }}</p>
          <button type="button" class="status__retry" @click="handleReloadContent">重新加载内容</button>
        </div>
        <NotionRenderer v-else-if="blocks.length" :blocks="blocks" />
        <div v-else class="status status--empty">文章暂无内容。</div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNotionBlogPosts } from '../composables/useNotionBlogPosts'
import { useNotionPageContent } from '../composables/useNotionPageContent'
import NotionRenderer from '../components/NotionRenderer.vue'

const route = useRoute()
const slug = computed(() => {
  const param = route.params.slug
  if (Array.isArray(param)) {
    return param[0] ?? ''
  }
  return typeof param === 'string' ? param : ''
})

const { posts, isLoading: isLoadingPosts, error: postsError, fetchPosts } = useNotionBlogPosts()
const { blocks, isLoading: isLoadingContent, error: contentError, fetchPage, reset } =
  useNotionPageContent()

const postMeta = computed(() => {
  const match = posts.value.find(post => post.slug === slug.value)
  if (!match) return null
  return {
    ...match,
    formattedDate: formatDate(match.date)
  }
})

const ensurePostsLoaded = async () => {
  if (!posts.value.length && !isLoadingPosts.value) {
    await fetchPosts()
  }
}

const ensureContentLoaded = async () => {
  if (!postMeta.value) return
  await fetchPage(postMeta.value.pageId)
}

const handleReloadPosts = async () => {
  await fetchPosts()
}

const handleReloadContent = async () => {
  if (postMeta.value) {
    await fetchPage(postMeta.value.pageId)
  }
}

watch(
  () => postMeta.value?.pageId,
  async newPageId => {
    if (newPageId) {
      await fetchPage(newPageId)
    } else {
      reset()
    }
  }
)

onMounted(async () => {
  await ensurePostsLoaded()
  await ensureContentLoaded()
})

function formatDate(value?: string) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.blog-post {
  min-height: 80vh;
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.container {
  width: 100%;
  max-width: 880px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1.5rem;
  text-decoration: none;
  color: #0f172a;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.back-link:hover {
  transform: translateX(-2px);
}

.status {
  text-align: center;
  border-radius: 12px;
  padding: 1.8rem 1.4rem;
  background: rgba(15, 23, 42, 0.04);
  color: #1f2937;
}

.status--error {
  background: rgba(220, 38, 38, 0.12);
  color: #991b1b;
}

.status--empty {
  background: rgba(15, 23, 42, 0.02);
}

.status__retry {
  margin-top: 1rem;
  padding: 0.45rem 1.4rem;
  border: none;
  border-radius: 999px;
  background: #0f172a;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.status__retry:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
}

.post__header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.post__date {
  font-size: 0.95rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.post__title {
  font-size: 2.8rem;
  color: #0f172a;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.post__tags {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.post__tag {
  background: rgba(15, 23, 42, 0.08);
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1f2937;
}

.post__cover {
  width: 100%;
  max-height: 420px;
  object-fit: cover;
  border-radius: 18px;
  margin-top: 2rem;
}

@media (max-width: 640px) {
  .blog-post {
    padding: 1.5rem;
  }

  .post__title {
    font-size: 2.1rem;
  }
}
</style>
