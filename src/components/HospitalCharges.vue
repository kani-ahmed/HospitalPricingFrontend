<template>
  <div class="hospital-charges">
    <h1>Query Hospital Charges</h1>
    <div class="logo-container">
      <img src="@/assets/logo.webp" alt="Logo" class="logo">
    </div>
    <div class="heart-rate">
      <svg version="1.0" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
           width="150px" height="73px" viewBox="0 0 150 73" enable-background="new 0 0 150 73" xml:space="preserve">
    <polyline fill="none" stroke="#009B9E" stroke-width="3" stroke-miterlimit="10"
              points="0,45.486 38.514,45.486 44.595,33.324 50.676,45.486 57.771,45.486 62.838,55.622 71.959,9 80.067,63.729 84.122,45.486 97.297,45.486 103.379,40.419 110.473,45.486 150,45.486"/>
  </svg>
      <div class="fade-in"></div>
      <div class="fade-out"></div>
    </div>
    <form @submit.prevent="fetchHospitalCharges" class="search-form">
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
      <button type="submit" class="btn search-btn" :disabled="loading">
        <div style="display: flex; align-items: center; justify-content: center;">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Search</span>
        </div>
      </button>
    </form>
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
          <td>{{ result.Cash_Discount }}</td>
          <td>{{ result.Deidentified_Min_Allowed }}</td>
          <td>{{ result.Deidentified_Max_Allowed }}</td>
          <td>{{ result.payer }}</td>
          <td>{{ result.iobSelection }}</td>
        </tr>
        </tbody>
      </table>
      <pagination :current-page="page" :total-pages="totalPages" @change-page="fetchHospitalChargesWithPage"></pagination>
    </div>
  </div>
</template>



<script>
import axios from 'axios';
import Pagination from './Pagination.vue'; // Ensure you have a Pagination component
import VueMultiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import AutoComplete from 'primevue/autocomplete';
import { debounce } from 'lodash';

export default {
  components: {
    Pagination,
    VueMultiselect, // Correct component registration
    AutoComplete

  },
  data() {
    return {
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
        const response = await axios.get('http://54.166.226.221/api/cities');
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
        const response = await axios.get('http://54.166.226.221/api/zipcodes', {
          params: { city: this.city }
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
        const response = await axios.get('http://54.166.226.221/api/hospitals', {
          params: { zipcode: this.zipcode }
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
      const params = { zipcode: this.zipcode };
      if (this.filterQueries.Hospital) {
        params.hospital = this.filterQueries.Hospital;
      }
      try {
        const response = await axios.get('http://54.166.226.221/api/payers', { params });
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
    async fetchHospitalCharges() {
      await this.fetchHospitalChargesWithPage(1);
    },
    async fetchHospitalChargesWithPage(page) {
      this.loading = true;
      this.page = page;
      const filters = this.selectedFilters.map(filter => ({
        filterType: filter.name,
        filterQuery: this.filterQueries[filter.name]
      }));
      try {
        const response = await axios.post('http://54.166.226.221/api/hospital_charges', {
          city: this.city,
          zipcode: this.zipcode,
          page: this.page,
          per_page: this.per_page,
          filters,
        });
        this.results = response.data.results;
        console.log(response.data.results)
        this.totalPages = response.data.total_pages;
      } catch (error) {
        console.error('There was an error fetching the hospital charges:', error);
        this.results = [];
      } finally {
        this.loading = false;
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
  },
};
</script>
<style scoped>
.hospital-charges {
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 2.5rem;
  color: #3c4c69;
  font-weight: bold;
  text-align: center;
  margin-bottom: 2rem;
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
  width: 190px;  /* Adjust to fit the logo */
  height: 190px;
  margin: 10px auto;
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
  top: 10px;  /* Adjust positioning based on desired glow size */
  left: 10px;
  width: 170px;  /* Same size as the logo */
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

.heart-rate {
  width: 150px;
  height: 73px;
  position: relative;
  margin: 20px auto;
  background-color: white;
}

.fade-in {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: white;
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
  background: rgb(255, 255, 255); /* Adjusted rgba value to match #f5f5f5 */
  background: -moz-linear-gradient(left, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 50%, rgba(245, 245, 245, 0) 100%);
  background: -webkit-linear-gradient(left, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 50%, rgba(245, 245, 245, 0) 100%);
  background: -o-linear-gradient(left, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 50%, rgba(245, 245, 245, 0) 100%);
  background: -ms-linear-gradient(left, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 50%, rgba(245, 245, 245, 0) 100%);
  background: linear-gradient(to right, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 80%, rgba(245, 245, 245, 0) 100%);
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


.search-form {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  margin-right: 15px;
}

.form-group:not(:last-child) {
  margin-right: 15px;
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


.results-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.results-table, .results-table td {
  border: 1px solid #dee2e6;
  padding: 12px;
  text-align: left;
  word-wrap: break-word;
}

th {
  border: 1px solid #dee2e6;
  padding: 8px;
  text-align: left;
  word-wrap: break-word;
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

.pagination-container .pagination {
  padding-left: 0;
  margin-top: 20px;
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


@media (max-width: 768px) {
  .form-group {
    margin-right: 0; /* Remove margin on smaller screens if needed */
  }
}
</style>




