<template>
  <div class="RegisterPage">
    <!-- Header section of the page containing the title -->
    <header>
      <h1>Green Wave</h1>
    </header>

    <div class="register-form">
      <!-- Form for user registration -->
      <form @submit.prevent="register">
        <div class="form-group">
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <!-- Form group for the email input -->
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <!-- Form group for the password input -->
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <!-- Submit button for the registration form -->
        <button type="submit">Register</button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    // Data properties for storing user input
    return {
      username: '',
      email: '',
      password: ''
    };
  },
  methods: {
    register() {
      // Method to handle user registration
      const apiUrl = 'https://heroku-project-backend-staging-ffb8722f57d5.herokuapp.com/register';
      const userData = {
        username: this.username,
        email: this.email,
        password: this.password
      };

       // Making a POST request to register the user
      axios.post(apiUrl, userData)
          .then(response => {
            // Handling successful registration
            if (response.status === 201) {
              console.log("Registration successful!");
              // Redirecting user to the calculator page upon successful registration
              this.$router.push('/calculator');
            } else {
              // Handling registration error
              console.error('Registration failed:', response.data);
              alert('Registration failed');
            }
          })
          .catch(error => {
            console.error('Error during registration:', error.response.data);
            alert('Error during registration');
          });
    }
  }
};
</script>

<style scoped>
/* Styling for the register page */
header {
  position: relative;
  text-align: center;
  padding: 20px;
  background-color: #4CAF50;
  color: white;
  margin: 0;
}

/* Styling for the header background image */
header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('@/assets/background.png');
  opacity: 0.2;
  border-radius: 8px 8px 0 0;
}

/* Styling for the register page container */
.RegisterPage {
  font-family: 'Roboto', sans-serif;
  color: #333;
  background: #e4fcec;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 2rem auto;
}

/* Styling for the register form */
.register-form {
  background: white;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin: 50px auto;
  width: 300px;
}

/* Styling for form groups */
.form-group {
  margin-bottom: 15px;
}

/* Styling for form labels */
.form-group label {
  display: block;
}

/* Styling for form inputs */
.form-group input {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

/* Styling for the register button */
button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
}

/* Styling for hover effect on the register button */
button:hover {
  opacity: 0.8;
}
</style>