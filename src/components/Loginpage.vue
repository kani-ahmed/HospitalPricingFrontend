<template>
  <!-- Homepage component template -->
  <div class="Homepage">
    <header>
      <!-- Header section -->
      <h1>Hospital Recommendation App</h1> <!-- Title of the website -->
    </header>
    <div class="logo-container">
      <img src="@/assets/logo.webp" alt="Logo" class="logo">
    </div>
    <div class="heart-rate-right">
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
           width="150px" height="73px" viewBox="0 0 150 73" enable-background="new 0 0 150 73" xml:space="preserve">
    <polyline fill="none" stroke="#009B9E" stroke-width="3" stroke-miterlimit="10"
              points="0,45.486 38.514,45.486 44.595,33.324 50.676,45.486 57.771,45.486 62.838,55.622 71.959,9 80.067,63.729 84.122,45.486 97.297,45.486 103.379,40.419 110.473,45.486 150,45.486"/>
  </svg>
      <div class="fade-in"></div>
      <div class="fade-out"></div>
    </div>
    <div class="heart-rate-left">
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
           width="150px" height="73px" viewBox="0 0 150 73" enable-background="new 0 0 150 73" xml:space="preserve">
    <polyline fill="none" stroke="#009B9E" stroke-width="3" stroke-miterlimit="10"
              points="0,45.486 38.514,45.486 44.595,33.324 50.676,45.486 57.771,45.486 62.838,55.622 71.959,9 80.067,63.729 84.122,45.486 97.297,45.486 103.379,40.419 110.473,45.486 150,45.486"/>
  </svg>
      <div class="fade-in"></div>
      <div class="fade-out"></div>
    </div>
    <!-- Login form section -->
    <div class="login-form">
      <form @submit.prevent="login"> <!-- Prevent form submission -->
        <div class="form-group">
          <label for="username">Username:</label> <!-- Username input label -->
          <input type="text" id="username" v-model="username" required> <!-- Username input field -->
        </div>
        <div class="form-group">
          <label for="password">Password:</label> <!-- Password input label -->
          <input type="password" id="password" v-model="password" required> <!-- Password input field -->
        </div>
        <button type="submit" :disabled="isAuthLoading">Login</button> <!-- Login button -->
        <div v-if="isAuthLoading">Logging in...</div> <!-- Loading message -->
        <div v-if="loginErrorMessage">{{ loginErrorMessage }}</div> <!-- Error message -->
      </form>
    </div>
    <button @click="goToRegister">Register</button> <!-- Register button -->
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'; // Importing Vuex mapActions and mapState

export default {
  data() {
    return {
      username: '', // Initialize username
      password: '' // Initialize password
    };
  },
  computed: {
    ...mapState({
      isAuthLoading: state => state.isLoading, // Get loading state from Vuex store
      loginErrorMessage: state => state.loginError // Get login error message from Vuex store
    })
  },
  methods: {
    ...mapActions(['loginUser']), // Map Vuex actions

    login() {
      this.loginUser({ // Dispatch loginUser action with username and password
        username: this.username,
        password: this.password
      }).catch(error => {
        console.error('Login error:', error.message); // Log login error if any
      });
    },

    goToRegister() {
      this.$store.commit('setActiveButton', 'register');
      this.$router.push('/register'); // Redirect to register page
    }
  }
}
</script>



<style scoped>
/* Scoped styles for Homepage component */
  header {
    position: relative;
    text-align: center;
    padding: 20px;
    background-color: #4CAF50; /* Primary green background */
    color: white;
    margin: 0;
  }

  /* Background overlay for header */
  header::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    /* background-image: url('@/assets/background.png'); /* Verify this path */
    opacity: 0.2; 
    border-radius: 8px 8px 0 0; /* Match the border-radius of your header if any */
  }

  .Homepage {
    font-family: 'Roboto', sans-serif;
    color: #333; /* Text color */
    background: #e4fcec; /* Light green background for the whole page */
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1); /* Shadow effect */
    max-width: 800px; /* Maximum width of the component */
    margin: 2rem auto; /* Center the component horizontally with some margin */
  }

  .login-form {
    background: #e4fcec; /* Background color for the login form */
    padding: 20px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1); /* Shadow effect for the login form */
    border-radius: 8px; /* Rounded corners for the login form */
    margin: 50px auto; /* Center the login form horizontally with some margin */
    width: 300px; /* Width of the login form */
  }

  .form-group {
    margin-bottom: 15px; /* Margin between form groups */
  }

  .form-group label {
    display: block; /* Display labels as blocks */
  }

  .form-group input {
    width: 100%; /* Input fields take up full width */
    padding: 10px; /* Padding for input fields */
    box-sizing: border-box; /* Include padding and border in the width */
  }

  button {
    width: 100%; /* Button takes up full width */
    padding: 10px; /* Padding for the button */
    background-color: #4CAF50; /* Background color for the button */
    color: white; /* Text color for the button */
    border: none; /* No border */
    cursor: pointer; /* Cursor style */
  }

  button:hover {
    opacity: 0.8; /* Opacity change on button hover */
  }

.heart-rate-right {
  width: 150px;
  height: 73px;
  position: relative;
  margin: 0 auto;
  top: -20px;
  left: 25%;
  background: #e4fcec; /* Match background to page container */
}

.heart-rate-left {
  width: 150px;
  height: 73px;
  position: relative;
  margin: 0 auto;
  top: -100px;
  right: 25%;
  background: #e4fcec; /* Match background to page container */
}

@keyframes glowing {
  0%, 100% {
    box-shadow: 0 0 5px 5px rgba(128, 0, 128, 0.7);
  }
  50% {
    box-shadow: 0 0 20px 20px rgba(128, 0, 128, 0.2);
  }
}

.logo-container {
  display: flex;
  justify-content: center;
  position: relative;
  width: 190px;
  height: 190px;
  margin: 0 auto;
  margin-bottom: -120px;
}

.logo {
  width: 170px;
  height: 170px;
  position: relative;
  z-index: 1;
}

/* Pseudo-element for the rotating glow */
.logo-container::before {
  content: '';
  position: absolute;
  top: 10px;
  left: 10px;
  width: 170px;
  height: 170px;
  border-radius: 50%;
  animation: glowing 3s infinite ease-in-out, rotate 10s linear infinite;
  z-index: 1;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fade-in {
  position: absolute;
  width: 100%;
  height: 100%;
  background: #e4fcec; /* Adjusted from white to match the new container background */
  top: 0;
  right: 0;
  animation: heartRateIn 2.5s linear infinite;
}

.fade-out {
  position: absolute;
  width: 120%;
  height: 100%;
  top: 0;
  left: -120%;
  animation: heartRateOut 2.5s linear infinite;
  background: rgba(228, 252, 236, 1); /* Adjusted rgba value to match #e4fcec */
  background: -moz-linear-gradient(left, rgba(228, 252, 236, 1) 0%, rgba(228, 252, 236, 1) 50%, rgba(228, 252, 236, 0) 100%);
  background: -webkit-linear-gradient(left, rgba(245, 245, 245, 1) 0%, rgba(228, 252, 236, 1) 50%, rgba(228, 252, 236, 0) 100%);
  background: -o-linear-gradient(left, rgba(228, 252, 236, 1) 0%, rgba(228, 252, 236, 1) 50%, rgba(228, 252, 236, 0) 100%);
  background: -ms-linear-gradient(left, rgba(228, 252, 236, 1) 0%, rgba(228, 252, 236, 1) 50%, rgba(228, 252, 236, 0) 100%);
  background: linear-gradient(to right, rgba(228, 252, 236, 1) 0%, rgba(228, 252, 236, 1) 80%, rgba(228, 252, 236, 0) 100%);
}

@keyframes heartRateIn {
  0% {
    width: 100%;
  }
  50% {
    width: 0;
  }
  100% {
    width: 0;
  }
}

@keyframes heartRateOut {
  0% {
    left: -80%;
  }
  30% {
    left: -80%;
  }
  100% {
    left: 0;
  }
}
</style>
