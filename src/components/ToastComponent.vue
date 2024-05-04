<template>
  <!-- Toast component template with transition effect -->
  <transition name="fade"> <!-- Apply fade transition effect -->
    <div v-if="isVisible" class="toast" :style="{ backgroundColor: toastColor }"> <!-- Display toast if isVisible is true -->
      {{ displayMessage }} <!-- Display the message inside the toast -->
    </div>
  </transition>
</template>

<script>
export default {
  props: ['message'], // Define props to accept message from parent component
  data() {
    return {
      isVisible: false, // Flag to control toast visibility
      toastColor: 'black', // Background color of the toast
      displayMessage: '' // Message to be displayed in the toast
    };
  },
  methods: {
    showToast(duration = 3000, type = 'success', message) {
      this.displayMessage = message; // Set the message to be displayed
      this.toastColor = type === 'success' ? 'green' : 'red'; // Set background color based on type
      this.isVisible = true; // Show the toast
      setTimeout(() => {
        this.isVisible = false; // Hide the toast after the specified duration
      }, duration);
    }
  }
}
</script>

<style scoped>
.toast {
  position: fixed; /* Fixed position for the toast */
  bottom: 20px; /* Distance from the bottom */
  left: 50%; /* Center horizontally */
  transform: translateX(-50%); /* Center horizontally */
  color: white; /* Text color */
  padding: 10px; /* Padding around the text */
  border-radius: 5px; /* Rounded corners */
  animation: fade 0.5s; /* Apply fade animation */
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s; /* Apply opacity transition */
}

.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */
{
  opacity: 0; /* Initial opacity of 0 for fade-in effect */
}
</style>
