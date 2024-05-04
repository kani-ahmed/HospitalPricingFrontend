<template>
  <nav class="navigation">
    <div class="toggle-buttons">
      <button class="toggle-btn" :class="{ active: activeButton === 'home' }" @click="setActiveButton('home')">HealthMap Chat</button>
      <button class="toggle-btn" :class="{ active: activeButton === 'hospital-charges' }" @click="setActiveButton('hospital-charges')">Query Hospital Charges</button>
    </div>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      activeButton: 'home',
    };
  },
  methods: {
    setActiveButton(button) {
      this.activeButton = button;
      if (button === 'home') {
        this.$router.push('/');
      } else if (button === 'hospital-charges') {
        this.$router.push('/hospital-charges');
      }
    },
  },
};
</script>

<style scoped>
.navigation {
  background-color: #f8f9fa;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.toggle-btn {
  padding: 10px 20px;
  margin: 0 10px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-btn:hover {
  background-color: #e0e0e0;
}

.toggle-btn.active {
  background-color: #4CAF50;
  color: white;
}
</style>