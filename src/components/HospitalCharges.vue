<template>
  <div class="hospital-charges">
    <h1>Query Hospital Charges</h1>
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
        const response = await axios.post('http://ec2-3-84-37-171.compute-1.amazonaws.com/api/hospital_charges', {
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




