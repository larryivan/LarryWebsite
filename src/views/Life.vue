<template>
  <section class="life">
    <div class="content">
      <h1>Life</h1>
      <p>Stories and reflections on daily living.</p>
      <div class="details">
        <p>
          Explore personal experiences, wellness tips, and insights into balancing work and play.
          This space highlights the moments that shape our lives.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>

<style scoped>
.life {
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
