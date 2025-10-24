<template>
  <section class="blog">
    <div class="content">
      <header class="intro">
        <h1>Blog</h1>
        <p>Latest articles, updates, and creative thoughts powered by Notion.</p>
      </header>

      <div v-if="isLoading" class="status status--loading">Loading posts...</div>
      <div v-else-if="error" class="status status--error">
        <p>{{ error }}</p>
        <button type="button" class="status__retry" @click="handleRetry">Retry</button>
      </div>
      <ul v-else-if="posts.length" class="post-list">
        <li v-for="post in posts" :key="post.id" class="post-card">
          <RouterLink :to="{ name: 'BlogPost', params: { slug: post.slug } }" class="post-card__inner">
            <div v-if="post.cover" class="post-card__cover" :style="{ backgroundImage: `url(${post.cover})` }" />
            <div class="post-card__body">
              <p v-if="post.formattedDate" class="post-card__date">{{ post.formattedDate }}</p>
              <h2 class="post-card__title">{{ post.title }}</h2>
              <p class="post-card__summary">{{ post.summary }}</p>
              <ul v-if="post.tags.length" class="post-card__tags">
                <li v-for="tag in post.tags" :key="`${post.id}-${tag}`" class="post-card__tag">{{ tag }}</li>
              </ul>
            </div>
          </RouterLink>
        </li>
      </ul>
      <div v-else class="status status--empty">No Notion posts published yet.</div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useNotionBlogPosts } from '../composables/useNotionBlogPosts'

const { posts: rawPosts, isLoading, error, fetchPosts } = useNotionBlogPosts()

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

const posts = computed(() =>
  rawPosts.value.map(post => ({
    ...post,
    formattedDate: formatDate(post.date)
  }))
)

const handleRetry = () => {
  if (!isLoading.value) {
    void fetchPosts()
  }
}

onMounted(() => {
  void fetchPosts()
})
</script>

<style scoped>
.blog {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.content {
  width: 100%;
  max-width: 960px;
}

.intro {
  text-align: center;
  margin-bottom: 2.5rem;
}

.intro h1 {
  font-size: 3rem;
  margin-bottom: 0.75rem;
  color: #2c3e50;
}

.intro p {
  font-size: 1.3rem;
  color: #555;
}

.status {
  text-align: center;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  background: rgba(15, 23, 42, 0.04);
  color: #2c3e50;
}

.status--error {
  background: rgba(220, 38, 38, 0.12);
  color: #991b1b;
}

.status--empty {
  background: rgba(15, 23, 42, 0.02);
}

.status__retry {
  margin-top: 1.5rem;
  padding: 0.5rem 1.5rem;
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

.post-list {
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.75rem;
}

.post-card {
  position: relative;
}

.post-card__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  text-decoration: none;
  color: inherit;
}

.post-card__inner:hover {
  transform: translateY(-6px);
  box-shadow: 0 25px 45px rgba(15, 23, 42, 0.12);
}

.post-card__cover {
  width: 100%;
  padding-top: 56%;
  background-size: cover;
  background-position: center;
}

.post-card__body {
  padding: 1.5rem;
}

.post-card__date {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.post-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.75rem;
}

.post-card__summary {
  font-size: 1rem;
  line-height: 1.6;
  color: #475569;
  margin-bottom: 1.25rem;
}

.post-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-card__tag {
  background: rgba(15, 23, 42, 0.08);
  color: #1f2937;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
}

@media (max-width: 640px) {
  .intro h1 {
    font-size: 2.4rem;
  }

  .intro p {
    font-size: 1.1rem;
  }

  .post-card__title {
    font-size: 1.3rem;
  }
}
</style>
