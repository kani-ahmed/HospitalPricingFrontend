<template>
  <!-- Homepage component template -->
  <div class="Homepage">
    <header>
      <!-- Header section -->
      <h1>Hospital Recommendation App</h1> <!-- Title of the website -->
    </header>

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
    background: white; /* Background color for the login form */
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
</style>
