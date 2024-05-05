<template>
  <div id="app">
    <div class="page-container">
      <h1 class="title">HealthMap Recommendation App</h1>
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
      <div class="chat-container">
        <div class="chat-section">
          <!-- Filter and Search UI -->
          <div class="filter-search-container">
            <div class="filter-group">
              <label for="messageFilter">Filter By:</label>
              <select v-model="filterType">
                <option value="">All</option>
                <option value="user">User</option>
                <option value="bot">HealthMap</option>
              </select>
              <input type="text" v-model="searchTerm" placeholder="Search messages...">
            </div>
          </div>
          <div class="chat-messages">
            <!-- Now using dynamicMessages for displaying -->
            <div v-for="(message, index) in dynamicMessages" :key="index" class="message-container"
                 :class="{ bot: message.message_type === 'bot' }">
              <span class="message-timestamp" :class="message.message_type">{{ message.timestamp }}</span>
              <div class="message" :class="{ user: message.message_type === 'user', bot: message.message_type === 'bot' }">
                <span class="message-label" :class="message.message_type">{{ message.message_type.toUpperCase() }}</span>
                <p>{{ message.content }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-input">
          <form @submit.prevent="submitForm" class="input-form">
            <div class="form-row">
              <div class="form-group">
                <label for="state">State:</label>
                <select id="state" v-model="state" required>
                  <option value="">Select State</option>
                  <!-- Add state options -->
                  <option value="Ohio">Ohio</option>
                </select>
              </div>
              <div class="form-group">
                <label for="city">City:</label>
                <AutoComplete
                    id="city"
                    v-model="city"
                    dropdown
                    :suggestions="citySuggestions"
                    :virtualScrollerOptions="{ itemSize: 38 }"
                    @input="debouncedFetchCities"
                    @focus="fetchCitiesOnFocus"
                    @select="selectCity"
                    placeholder="City"
                    required
                />
              </div>
              <div class="form-group">
                <label for="zipcode">Zipcode:</label>
                <AutoComplete
                    id="zipcode"
                    v-model="zipcode"
                    dropdown
                    :suggestions="zipcodeSuggestions"
                    :virtualScrollerOptions="{ itemSize: 38 }"
                    @input="debouncedFetchZipcodes"
                    @focus="fetchZipcodesOnFocus"
                    @select="selectZipcode"
                    placeholder="Zipcode"
                    required
                />
              </div>
              <div class="form-group">
                <label for="filterTypes">Filter Types:</label>
                <VueMultiselect
                    v-model="selectedFilters"
                    :options="filterOptions"
                    :multiple="true"
                    :close-on-select="false"
                    :clear-on-select="false"
                    :preserve-search="true"
                    placeholder="Pick some filters"
                    label="name"
                    track-by="name"
                    :preselect-first="true">
                </VueMultiselect>
              </div>
              <!-- Dynamic input fields based on selected filters, excluding Hospital and Payer for specific handling -->
              <div v-for="filter in selectedFilters.filter(f => f.name !== 'Hospital' && f.name !== 'Payer')"
                   :key="filter.name" class="form-group dynamic-filter-inputs">
                <label :for="`filter-${filter.name}`">{{ filter.name }}:</label>
                <input :id="`filter-${filter.name}`" v-model="filterQueries[filter.name]" class="input"
                       :placeholder="`Enter ${filter.name}`" ref="`filter-${filter.name}Input`">
              </div>
              <!-- Hospital input with autosuggestion -->
              <div v-if="selectedFilters.some(f => f.name === 'Hospital')" class="form-group">
                <label for="hospital">Hospital:</label>
                <AutoComplete
                    id="hospital"
                    v-model="filterQueries.Hospital"
                    dropdown
                    :suggestions="hospitalSuggestions"
                    @input="debouncedFetchHospitals"
                    @focus="fetchHospitalsOnFocus"
                    @select="selectHospital"
                    placeholder="Enter Hospital"
                />
              </div>
              <!-- Payer input with autosuggestion -->
              <div v-if="selectedFilters.some(f => f.name === 'Payer')" class="form-group">
                <label for="payer">Payer:</label>
                <AutoComplete
                    id="payer"
                    v-model="filterQueries.Payer"
                    dropdown
                    :suggestions="payerSuggestions"
                    @input="debouncedFetchPayers"
                    @focus="fetchPayersOnFocus"
                    @select="selectPayer"
                    placeholder="Enter Payer"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="description">Chat Box:</label>
              <textarea id="description" v-model="description" required></textarea>
            </div>
            <div class="form-group button-group">
              <button type="submit" class="btn search-btn" :disabled="loading">
                <div style="display: flex; align-items: center; justify-content: center;">
                  <span v-if="loading" class="spinner"></span>
                  <span v-else>Search</span>
                </div>
              </button>
              <button type="button" class="btn reset-button" @click="resetForm">Reset</button>
            </div>
          </form>
        </div>
      </div>
      <div v-if="results.length" class="results-container">
        <h2>Results</h2>
        <table class="results-table">
          <thead>
          <tr>
            <th>Hospital</th>
            <th>CPT Code</th>
            <th>Description</th>
            <th>Cash Discount</th>
            <th>Min Allowed</th>
            <th>Max Allowed</th>
            <th>Payer</th>
            <th>IOB Selection</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(result, index) in results" :key="index">
            <td>{{ result.Hospital }}</td>
            <td>{{ result['CPT Code'] }}</td>
            <td>{{ result.Description }}</td>
            <td>{{ result["Cash Discount"] }}</td>
            <td>{{ result["Min Allowed"] }}</td>
            <td>{{ result["Max Allowed"] }}</td>
            <td>{{ result.Payer }}</td>
            <td>{{ result["IOB Selection"] }}</td>
          </tr>
          </tbody>
        </table>
        <div class="pagination-container">
          <pagination :current-page="page" :total-pages="totalPages" @change-page="submitFormWithPage"></pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import axios from 'axios';
import Pagination from './Pagination.vue';
import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import AutoComplete from 'primevue/autocomplete';
import {debounce} from 'lodash';
import {mapGetters} from "vuex";

export default {
  components: {
    Pagination,
    VueMultiselect,
    AutoComplete,
  },
  data() {
    return {
      state: '',
      description: '',
      messages: [],
      filterType: '',
      searchTerm: '',
      hospitalCharges: [],
      citiesByState: {
        'Ohio': ['Cleveland', 'Dayton']
      },
      city: '',
      zipcode: '',
      page: 1,
      per_page: 10,
      totalPages: 0,
      results: [],
      selectedFilters: [],
      filterQueries: {},
      citySuggestions: [],
      zipcodeSuggestions: [],
      hospitalSuggestions: [],
      payerSuggestions: [],
      allCities: [],
      allZipcodes: [],
      allHospitals: [],
      allPayers: [],
      filterOptions: [
        {name: 'Hospital'},
        {name: 'CPT Code'},
        {name: 'Description'},
        {name: 'Cash Discount'},
        {name: 'Min Allowed'},
        {name: 'Max Allowed'},
        {name: 'Payer'},
        {name: 'IOB Selection'}
      ],
      loading: false,
      required: true,
    };
  },
  created() {
    // Debounce methods
    this.debouncedFetchCities = debounce(this.fetchCities, 300);
    this.debouncedFetchZipcodes = debounce(this.fetchZipcodes, 300);
    this.debouncedFetchHospitals = debounce(this.fetchHospitals, 300);
    this.debouncedFetchPayers = debounce(this.fetchPayers, 300);
    this.fetchChatbotMessages();
  },
  computed: {
    ...mapGetters(['currentUser']),
    // Compute the user ID from currentUser
    userID() {
      return this.currentUser ? this.currentUser.userId : null;
    },
    dynamicMessages() {
      if (this.filterType || this.searchTerm) {
        return this.messages.filter(message => {
          const typeMatch = this.filterType ? message.message_type === this.filterType : true;
          const textMatch = this.searchTerm ? message.content.toLowerCase().includes(this.searchTerm.toLowerCase()) : true;
          return typeMatch && textMatch;
        });
      }
      return this.messages;
    }
  },
  methods: {
    resetForm() {
      this.state = '';
      this.city = '';
      this.zipcode = '';
      this.description = '';
      this.results = [];
      this.filterQueries = {};
    },

    async fetchChatbotMessages() {
      const userId = localStorage.getItem('currentUser'); // Assuming you store the user ID in local storage
      if (userId) {
        try {
          const response = await axios.get(`http://3.211.246.7/api/get_chatbot_messages/${this.userID}`);
          this.messages = response.data;
        } catch (error) {
          console.error('Error fetching chatbot messages:', error);
        }
      }
    },
    fetchCitiesOnFocus() {
      if (!this.citySuggestions.length || this.allCities.length) {
        // Only fetch if suggestions are empty to avoid unnecessary requests
        this.fetchCities();
      }
    },
    fetchZipcodesOnFocus() {
      if (!this.zipcodeSuggestions.length || this.allZipcodes.length) {
        this.debouncedFetchZipcodes();
      }
    },

    fetchHospitalsOnFocus() {
      // Trigger fetch only if the zipcode is set and hospital suggestions are empty or not yet fetched
      if (this.zipcode && (!this.hospitalSuggestions.length || this.allHospitals.length)) {
        this.fetchHospitals(); // Directly call fetch without debounce to immediately show suggestions
      } else {
        this.hospitalSuggestions = [];
      }
    },

    fetchPayersOnFocus() {
      if ((this.filterQueries.Hospital || this.zipcode) && (!this.payerSuggestions.length || this.payerSuggestions.length)) {
        this.debouncedFetchPayers();
      }
    },
    async fetchCities() {
      try {
        const response = await axios.get('http://3.211.246.7/api/cities');
        this.allCities = response.data;
        this.filterCitySuggestions();
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    },
    selectCity(event) {
      this.city = event.value || '';
      if (!event.value) {
        this.citySuggestions = [];
      }
    },
    async fetchZipcodes() {
      try {
        const response = await axios.get('http://3.211.246.7/api/zipcodes', {
          params: {city: this.city}
        });
        this.allZipcodes = response.data;
        this.filterZipcodeSuggestions();
      } catch (error) {
        console.error('Error fetching zipcodes:', error);
      }
    },
    selectZipcode(event) {
      this.zipcode = event.value || '';
      if (!event.value) {
        this.zipcodeSuggestions = [];
      }
    },
    async fetchHospitals() {
      if (!this.zipcode) {
        console.error("Zipcode is required to fetch hospitals");
        return;
      }
      try {
        const response = await axios.get('http://3.211.246.7/api/hospitals', {
          params: {zipcode: this.zipcode}
        });
        this.allHospitals = response.data;
        this.filterHospitalSuggestions();
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    },
    selectHospital(event) {
      this.filterQueries.Hospital = event.value || '';
      if (!event.value) {
        this.hospitalSuggestions = [];
      }
    },
    async fetchPayers() {
      const params = {zipcode: this.zipcode};
      if (this.filterQueries.Hospital) {
        params.hospital = this.filterQueries.Hospital;
      }
      try {
        const response = await axios.get('http://3.211.246.7/api/payers', {params});
        this.allPayers = response.data;
        this.filterPayerSuggestions();
      } catch (error) {
        console.error('Error fetching payers:', error);
      }
    },
    selectPayer(event) {
      this.filterQueries.Payer = event.value || '';
      if (!event.value) {
        this.payerSuggestions = [];
      }
    },
    async submitForm() {
      await this.submitFormWithPage(1);
    },
    async submitFormWithPage(page) {
      this.loading = true;
      this.page = page;
      const filters = this.selectedFilters.map(filter => ({
        filterType: filter.name,
        filterQuery: this.filterQueries[filter.name]
      }));
      try {
        // Add user message to chat
        const userMessage = {
          user_id: this.userID,
          content: this.description,
          message_type: 'user',
        };
        await axios.post('http://3.211.246.7/api/add_chatbot_message', userMessage);
        this.messages.push({
          message_type: 'user',
          content: this.description,
          timestamp: new Date().toLocaleTimeString(),
        });

        // Send request to the backend
        const response = await axios.post('http://3.211.246.7/api/comprehend-medical', {
          user_chatbox_data: JSON.stringify({
            //state: this.state,
            city: this.city,
            zipcode: this.zipcode,
            description: this.description,
            page: this.page,
            per_page: this.per_page,
            filters,
          }),
        });
        this.results = response.data.results;
        console.log(response.data.results)
        this.totalPages = response.data.total_pages;
        if (response.status === 200) {
          console.log(response.data)
          // Construct the bot response for hospital charges
          let botResponse = 'Hospital Charges:\n';
          this.results.forEach((charge, index) => {
            botResponse += `
          Charge ${index + 1}:
          Hospital: ${charge.Hospital}
          Description: ${charge.Description}
          Cash Discount: ${charge["Cash Discount"]}
          Max Allowed: ${charge["Max Allowed"]}
          Min Allowed: ${charge["Min Allowed"]}
          Payer: ${charge.Payer}
          IOB Selection: ${charge["IOB Selection"]}
        `;
          });

          // Construct and push a message indicating that the results are displayed below
          const botMessage = {
            user_id: this.userID,
            content: 'Hospital charges have been fetched successfully. Please see below for details.',
            message_type: 'bot',
          };
          await axios.post('http://3.211.246.7/api/add_chatbot_message', botMessage);
          this.messages.push({
            message_type: 'bot',
            content: 'Hospital charges have been fetched successfully. Please see below for details.',
            timestamp: new Date().toLocaleTimeString(),
          });
          this.loading = false;
        } else {
          // Handle the case when the API call fails
          console.error('API call failed with status:', response.status);
          this.messages.push({
            message_type: 'bot',
            content: 'Oops! Something went wrong. Please try again later.',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    filterCitySuggestions() {
      this.citySuggestions = this.allCities.filter(city => city.toLowerCase().includes(this.city.toLowerCase()));
    },
    filterZipcodeSuggestions() {
      this.zipcodeSuggestions = this.allZipcodes.filter(zipcode => zipcode.toLowerCase().includes(this.zipcode.toLowerCase()));
    },
    filterHospitalSuggestions() {
      this.hospitalSuggestions = this.allHospitals.filter(hospital =>
          hospital && hospital.toLowerCase().includes(this.filterQueries.Hospital?.toLowerCase() || '')
      );
    },
    filterPayerSuggestions() {
      // Ensure this.allPayers is an array before calling .filter()
      this.payerSuggestions = Array.isArray(this.allPayers) ? this.allPayers.filter(payer =>
          payer && this.filterQueries.Payer && payer.toLowerCase().includes(this.filterQueries.Payer.toLowerCase())
      ) : [];
    }
  },
  watch: {
    // Convert direct method calls to debounced versions in your watchers or @input event bindings
    city(newValue) {
      this.debouncedFetchCities();
    },
    zipcode(newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal) {
          this.fetchHospitals();
        } else {
          this.hospitalSuggestions = [];
        }
      }
    },
    'filterQueries.Hospital'(newValue) {
      if (newValue) {
        this.debouncedFetchHospitals();
      } else {
        this.hospitalSuggestions = [];
      }
    },
    'filterQueries.Payer'(newValue, oldValue) {
      if (newValue !== oldValue) {
        if (newValue) {
          this.debouncedFetchPayers();
        } else {
          this.payerSuggestions = [];
        }
      }
    },
  }
};
</script>

<style scoped>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}


#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-container {
  flex: 1;
  background: #f5f5f5;
  width: 100%;
}

.title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.0rem;
  color: #333;
}

.heart-rate-right {
  width: 150px;
  height: 73px;
  position: relative;
  margin: 0 auto;
  top: -20px;
  left: 25%;
  background-color: #f5f5f5; /* Match background to page container */
}

.heart-rate-left {
  width: 150px;
  height: 73px;
  position: relative;
  margin: 0 auto;
  top: -100px;
  right: 25%;
  background-color: #f5f5f5; /* Match background to page container */
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
  z-index: 0;
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
  background-color: #f5f5f5; /* Adjusted from white to match the new container background */
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
  background: rgba(245, 245, 245, 1); /* Adjusted rgba value to match #f5f5f5 */
  background: -moz-linear-gradient(left, rgba(245, 245, 245, 1) 0%, rgba(245, 245, 245, 1) 50%, rgba(245, 245, 245, 0) 100%);
  background: -webkit-linear-gradient(left, rgba(245, 245, 245, 1) 0%, rgba(245, 245, 245, 1) 50%, rgba(245, 245, 245, 0) 100%);
  background: -o-linear-gradient(left, rgba(245, 245, 245, 1) 0%, rgba(245, 245, 245, 1) 50%, rgba(245, 245, 245, 0) 100%);
  background: -ms-linear-gradient(left, rgba(245, 245, 245, 1) 0%, rgba(245, 245, 245, 1) 50%, rgba(245, 245, 245, 0) 100%);
  background: linear-gradient(to right, rgba(245, 245, 245, 1) 0%, rgba(245, 245, 245, 1) 80%, rgba(245, 245, 245, 0) 100%);
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
    left: -120%;
  }
  30% {
    left: -120%;
  }
  100% {
    left: 0;
  }
}


.chat-container {
  display: flex;
  justify-content: space-between;
  max-width: 100%;
  margin: 0 auto;
  border: 2px solid #eaeaea;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  background: white;
}

.chat-section, .chat-input {
  width: 50%;
  box-sizing: border-box;
  padding: 0 1rem;
}

.chat-input .input-form {
  padding: 0;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1 0 calc(33.3% - 1rem);
  margin-right: 0;
}

.dynamic-filter-inputs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.dynamic-filter-inputs .form-group {
  flex: 1 0 calc(33.3% - 10px);
  margin-top: 10px;
}

.message-container {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
  margin-top: 20px;
}

.message-container.bot {
  justify-content: flex-end;
}

.message-timestamp {
  font-size: 0.8rem;
  color: #666;
}

.message-timestamp.user {
  margin-left: 10px;
  margin-right: 10px;
}

.message-timestamp.bot {
  margin-right: 10px;
  margin-left: 10px;
}

.chat-messages {
  max-height: 600px;
  overflow-y: auto;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
}

.message {
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #eaeaea;
  background: #f9f9f9;
  flex: 1;
  word-wrap: break-word;
  max-width: 100%;
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #169ebd #251b1b;
}

.message.bot {
  background: #e5e7eb;
}

.message-label {
  display: inline-block;
  background-color: #eaeaea;
  color: #38b48d;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
}

.message-label.user {
  position: absolute;
  top: -20px;
  left: 15px;
}

.message-label.bot {
  background-color: #eaeaea;
  color: #b4387a;
  position: absolute;
  top: -22px;
  right: 2px;
}

.chat-messages::-webkit-scrollbar {
  width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background-color: #555;
}

.filter-search-container {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.filter-group {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  width: 100%;
}

.filter-search-container select,
.filter-search-container input {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.filter-group label,
.filter-group select {
  margin-right: 5px;
}

.filter-search-container input[type="text"] {
  justify-content: space-between;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 40%;
}

.bot {
  text-align: left;
  color: rgb(15, 36, 196);
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  margin-right: 15px;
  width: 100%;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  color: #555;
}

.form-group input,
.form-group select {
  padding: 0.8rem;
  border: 2px solid #eaeaea;
  border-radius: 8px;
  font-size: 0.9rem;
}

.form-group textarea {
  padding: 0.8rem;
  border: 2px solid #eaeaea;
  border-radius: 8px;
  font-size: 0.9rem;
  width: 100%;
  min-height: 300px;
  overflow: auto;
  resize: vertical;
}

.button-group {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 35%;
  margin: 0 auto;
}

.button-group .reset-button {
  flex: 0 0 auto;
  margin: 0 5px;
  padding: 10px;
  margin-top: 17px;
  background-color: #ae4f59;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  width: 150px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  font-weight: bold;
}

.button-group .reset-button:hover {
  background-color: #c82333;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  border: 1px solid #dee2e6;
}

.results-table th,
.results-table td {
  padding: 12px;
  text-align: left;
  word-wrap: break-word;
  border: 1px solid #dee2e6;
}

.search-btn {
  max-width: 150px;
  max-height: 40px;
  margin-top: 17px;
  display: block;
}

.input, .btn, .vue-multiselect {
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  width: 100%;
}

.btn {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn:hover {
  background-color: #0056b3;
}

.results-table th {
  background-color: #1675de;
  color: white;
  border: solid 1px;
  border-radius: 10px;
  position: sticky;
  top: 0;
  z-index: 1;
}

.results-table tbody tr:nth-child(odd) {
  background-color: #f8f9fa;
}

.pagination-container {
  margin-top: 20px;
}

.pagination {
  padding-left: 0;
  list-style: none;
  display: flex;
  justify-content: center;
}

.pagination .page-item .page-link {
  border-radius: 0.25rem;
  margin: 0 4px;
}

.pagination .page-item.active .page-link {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.pagination .page-item:not(.active) .page-link:hover {
  color: #0056b3;
  background-color: #e2e6ea;
  border-color: #dae0e5;
}

.dynamic-filter-inputs .form-group {
  margin-top: 10px;
}

.spinner {
  border: 5px solid rgba(255, 255, 255, 0.2);
  border-top-color: #ffffff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
  }

  .chat-section, .chat-input {
    width: 100%;
    padding: 0;
  }

  .form-row .form-group,
  .dynamic-filter-inputs .form-group {
    flex: 0 0 100%;
  }
}
</style>