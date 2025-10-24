<template>
  <div class="about">
    <div class="content">
      <h1>About Us</h1>
      <p>Learn more about what we do and who we are.</p>
      <div class="description">
        <p>
          We are dedicated to providing excellent service and creating amazing experiences.
          Our team is passionate about innovation and excellence.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.about {
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

.description p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #555;
}
</style>
