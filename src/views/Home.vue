<template>
  <div class="home">
    <div class="hero">
      <h1>Welcome to My Website</h1>
      <p>This is the home page</p>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.hero {
  text-align: center;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.hero p {
  font-size: 1.5rem;
  color: #666;
}
</style>
