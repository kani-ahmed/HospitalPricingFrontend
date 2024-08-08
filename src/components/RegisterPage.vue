<template>
  <div class="RegisterPage">
    <!-- Header section of the page containing the title -->
    <header>
      <h1>Hospital Recommendation App</h1>
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
      const apiUrl = 'http://127.0.0.1:5000/api/register';
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
              this.$router.push('/');
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
  background: #e4fcec;
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