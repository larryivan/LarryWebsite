<template>
  <section class="blog">
    <div class="content">
      <h1>Blog</h1>
      <p>Latest articles, updates, and creative thoughts.</p>
      <div class="details">
        <p>
          Dive into posts covering technology, lifestyle, and personal projects.
          Stay tuned for new stories and ideas shared regularly.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
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
  max-width: 800px;
  text-align: center;
}

.content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.content > p {
  font-size: 1.5rem;
  color: #666;
  margin-bottom: 2rem;
}

.details p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #555;
}
</style>
