<template>
  <div id="app">
    <div class="page-container">
      <h1 class="title">HealthMap Recommendation App</h1>
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
                 :class="{ bot: message.type === 'bot' }">
              <span class="message-timestamp" :class="message.type">{{ message.timestamp }}</span>
              <div class="message" :class="{ user: message.type === 'user', bot: message.type === 'bot' }">
                <span class="message-label" :class="message.type">{{ message.type.toUpperCase() }}</span>
                <p>{{ message.text }}</p>
              </div>
            </div>
          </div>
          <div class="response-container">
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
              <div v-for="filter in selectedFilters.filter(f => f.name !== 'Hospital' && f.name !== 'Payer')" :key="filter.name" class="form-group">
                <label :for="`filter-${filter.name}`">{{ filter.name }}:</label>
                <input :id="`filter-${filter.name}`" v-model="filterQueries[filter.name]" class="input" :placeholder="`Enter ${filter.name}`" ref="`filter-${filter.name}Input`">
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
              <button type="button" class="reset-button" @click="resetForm">Reset</button>
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
import { debounce } from 'lodash';

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
        { name: 'Hospital' },
        { name: 'CPT Code' },
        { name: 'Description' },
        { name: 'Cash Discount' },
        { name: 'Min Allowed' },
        { name: 'Max Allowed' },
        { name: 'Payer' },
        { name: 'IOB Selection' }
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
  },
  computed: {
    dynamicMessages() {
      // Check if we need to filter or search
      if (this.filterType || this.searchTerm) {
        return this.messages.filter(message => {
          const typeMatch = this.filterType ? message.type === this.filterType : true;
          const textMatch = this.searchTerm ? message.text.toLowerCase().includes(this.searchTerm.toLowerCase()) : true;
          return typeMatch && textMatch;
        });
      }
      // If no filterType and no searchTerm, return all messages
      return this.messages;
    },
  },
  methods: {
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
      }
    },

    fetchPayersOnFocus() {
      if ((!this.payerSuggestions.length || this.payerSuggestions.length) || this.filterQueries.Hospital || this.zipcode) {
        this.debouncedFetchPayers();
      }
    },
    async fetchCities() {
      try {
        const response = await axios.get('http://ec2-3-84-37-171.compute-1.amazonaws.com/api/cities');
        this.allCities = response.data;
        this.filterCitySuggestions();
      } catch (error) {
        console.error('Error fetching cities:', error);
      }
    },
    selectCity(city) {
      this.city = city;
    },
    async fetchZipcodes() {
      try {
        const response = await axios.get('http://ec2-3-84-37-171.compute-1.amazonaws.com/api/zipcodes', {
          params: { city: this.city }
        });
        this.allZipcodes = response.data;
        this.filterZipcodeSuggestions();
      } catch (error) {
        console.error('Error fetching zipcodes:', error);
      }
    },
    selectZipcode(zipcode) {
      this.zipcode = zipcode;
    },
    async fetchHospitals() {
      if (!this.zipcode) {
        console.error("Zipcode is required to fetch hospitals");
        return;
      }
      try {
        const response = await axios.get('http://ec2-3-84-37-171.compute-1.amazonaws.com/api/hospitals', {
          params: { zipcode: this.zipcode }
        });
        this.allHospitals = response.data;
        this.filterHospitalSuggestions();
      } catch (error) {
        console.error('Error fetching hospitals:', error);
      }
    },
    selectHospital(hospital) {
      this.filterQueries.Hospital = hospital;
    },
    async fetchPayers() {
      const params = { zipcode: this.zipcode };
      if (this.filterQueries.Hospital) {
        params.hospital = this.filterQueries.Hospital;
      }
      try {
        const response = await axios.get('http://ec2-3-84-37-171.compute-1.amazonaws.com/api/payers', { params });
        this.allPayers = response.data;
        this.filterPayerSuggestions();
      } catch (error) {
        console.error('Error fetching payers:', error);
      }
    },
    selectPayer(payer) {
      this.filterQueries.Payer = payer;
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
        const timestamp = new Date().toLocaleTimeString();
        this.messages.push({
          type: 'user',
          text: this.description,
          timestamp,
        });

        // Send request to the backend
        const response = await axios.post('http://ec2-3-84-37-171.compute-1.amazonaws.com/api/comprehend-medical', {
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
          this.messages.push({
            type: 'bot',
            text: 'Hospital charges have been fetched successfully. Please see below for details.',
            timestamp: new Date().toLocaleTimeString(),
          });
          this.loading = false;
        }
        else {
          // Handle the case when the API call fails
          console.error('API call failed with status:', response.status);
          this.messages.push({type: 'bot', text: 'Oops! Something went wrong. Please try again later.'});
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    // async fetchHospitalCharges() {
    //   await this.fetchHospitalChargesWithPage(1);
    // },
    // async fetchHospitalChargesWithPage(page) {
    //   this.loading = true;
    //   this.page = page;
    //   const filters = this.selectedFilters.map(filter => ({
    //     filterType: filter.name,
    //     filterQuery: this.filterQueries[filter.name]
    //   }));
    //   try {
    //     const response = await axios.post('http://ec2-3-84-37-171.compute-1.amazonaws.com/api/hospital_charges', {
    //       city: this.city,
    //       zipcode: this.zipcode,
    //       page: this.page,
    //       per_page: this.per_page,
    //       filters,
    //     });
    //     this.results = response.data.results;
    //     console.log(response.data.results)
    //     this.totalPages = response.data.total_pages;
    //   } catch (error) {
    //     console.error('There was an error fetching the hospital charges:', error);
    //     this.results = [];
    //   } finally {
    //     this.loading = false;
    //   }
    // },
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
        this.fetchHospitals();
      }
    },
    'filterQueries.Hospital'(newValue) {
      this.debouncedFetchHospitals();
    },
    'filterQueries.Payer'(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.debouncedFetchPayers();
      }
    },
  },


    resetForm() {
      this.state = '';
      this.city = '';
      this.zipcode = '';
      this.description = '';
      this.messages = [];
    },
};
</script>

<style scoped>
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

.chat-container {
  display: flex;
  justify-content: space-between; /* Keeps children on opposite ends */
  flex-direction: row; /* Organizes children in a row */
  align-items: flex-start; /* Aligns items at the start */
  max-width: 100%;
  margin: 2rem auto;
  border: 2px solid #eaeaea;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  background: white;
}

.chat-input .input-form {
  width: 45%;
}

.chat-section {
  width: 55%;
}

.message-container {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
  margin-top: 20px;
}

.message-container.user {
  justify-content: flex-start;
}

.message-container.user .message-timestamp {
  order: 1;
}

.message-container.bot {
  justify-content: flex-end;
}

.message-container.bot .message-timestamp {
  order: 2;
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
  width: 100%; /* You can adjust this if necessary */
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column; /* Ensures messages are stacked vertically */
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

.message.user {
  margin-right: 10px;
  margin-left: auto;
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
  top: -20px;
  right: 25px; /* Align the label to the right */
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
  margin-right: 5px; /* Ensures the label and select are closely packed */
}

.filter-search-container input[type="text"] {
  justify-content: space-between;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 40%;
}

.user {
  text-align: left;
}

.bot {
  text-align: left;
  color: rgb(15, 36, 196);
}

.chat-input .input-form {
  display: grid;
  grid-gap: 1rem;
  padding: 1rem;
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

.form-group .submit-button {
  flex-direction: column;
  min-width: 200px;
  margin-right: 15px;
  padding: 0.8rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  overflow: auto;
  transition: background-color 0.3s ease;
  display: block;
  width: 40%;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-group .submit-button:hover {
  background-color: #0056b3;
}

.form-group .reset-button {
  padding: 0.8rem 1.5rem;
  margin-left: 1rem; /* Spacing between submit and reset buttons */
  background-color: #ff6347; /* A red color for the reset button */
  color: white;
  max-width: 150px;
  max-height: 40px;
  margin-top: 17px;
  display: block;

  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;

  text-transform: uppercase;
  letter-spacing: 1px;
}

.form-group .reset-button:hover {
  background-color: #cc5233; /* Darker shade on hover */
}

.button-group {
  display: flex;
  flex-direction: row; /* Change to row to align buttons next to each other */
  justify-content: space-between; /* This will ensure the buttons are spread out */
  width: 25%;
}

.button-group .reset-button {
  flex: 1; /* Adjust this as needed, or use specific widths */
  margin: 0 5px; /* Provide some spacing between the buttons */
  padding: 10px 1px 10px 1px; /*positions are in the order of top, right, bottom, left*/
  margin-top: 17px;
}


.form-row {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
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

.suggestions {
  list-style-type: none;
  padding: 0;
  margin: 0;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-top: none;
  max-height: 200px;
  overflow-y: auto;
}

.suggestions li {
  padding: 10px;
  cursor: pointer;
}

.suggestions li:hover {
  background-color: #f8f9fa;
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


/* Specifically target dynamically generated input containers */
.dynamic-filter-inputs .form-group {
  margin-top: 10px; /* Ensure vertical spacing between dynamically generated inputs */
}

.spinner {
  border: 5px solid rgba(255, 255, 255, 0.2); /* Lighter border for spinner */
  border-top-color: #ffffff; /* White color for the spinning part */
  border-radius: 50%;
  width: 24px; /* Increased size for better visibility */
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
.chat-section, .chat-input .input-form {
    width: 100%; /* Allows each section to expand to full width */
  }

@media (max-width: 768px) {
  .chat-container {
    flex-direction: column;
  }

  .chat-section, .chat-input .input-form {
    width: 100%; /* Each section takes full width on smaller screens */
    max-width: 100%; /* Prevents any overflow */
  }
}
</style>
