<template>
  <nav class="navigation">
    <div class="nav-links">
      <router-link to="/" class="nav-link">Home</router-link>
      <router-link to="/hospital-charges" class="nav-link">Hospital Charges</router-link>
    </div>
  </nav>
</template>

<style scoped>
.navigation {
  background-color: #f8f9fa;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-links {
  display: flex;
  justify-content: center; /* Center the navigation links */
  align-items: center;
  gap: 20px; /* Space between links */
}

.nav-link {
  text-decoration: none;
  color: #007bff; /* Primary blue color */
  padding: 0.5rem 1rem; /* Padding for larger click area */
  border-radius: 5px; /* Rounded corners for a modern look */
  transition: background-color 0.2s, color 0.2s; /* Smooth transition for hover effect */
}

.nav-link:hover, .nav-link.router-link-active {
  background-color: #007bff; /* Blue background on hover/active */
  color: #ffffff; /* White text on hover/active */
}
</style>
