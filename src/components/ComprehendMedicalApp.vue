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
                  <option value="Alabama">Alabama</option>
                  <option value="Alaska">Alaska</option>
                  <option value="Arizona">Arizona</option>
                  <option value="Arkansas">Arkansas</option>
                  <option value="California">California</option>
                  <option value="Colorado">Colorado</option>
                  <option value="Connecticut">Connecticut</option>
                  <option value="Delaware">Delaware</option>
                  <option value="Florida">Florida</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Hawaii">Hawaii</option>
                  <option value="Idaho">Idaho</option>
                  <option value="Illinois">Illinois</option>
                  <option value="Indiana">Indiana</option>
                  <option value="Iowa">Iowa</option>
                  <option value="Kansas">Kansas</option>
                  <option value="Kentucky">Kentucky</option>
                  <option value="Louisiana">Louisiana</option>
                  <option value="Maine">Maine</option>
                  <option value="Maryland">Maryland</option>
                  <option value="Massachusetts">Massachusetts</option>
                  <option value="Michigan">Michigan</option>
                  <option value="Minnesota">Minnesota</option>
                  <option value="Mississippi">Mississippi</option>
                  <option value="Missouri">Missouri</option>
                  <option value="Montana">Montana</option>
                  <option value="Nebraska">Nebraska</option>
                  <option value="Nevada">Nevada</option>
                  <option value="New Hampshire">New Hampshire</option>
                  <option value="New Jersey">New Jersey</option>
                  <option value="New Mexico">New Mexico</option>
                  <option value="New York">New York</option>
                  <option value="North Carolina">North Carolina</option>
                  <option value="North Dakota">North Dakota</option>
                  <option value="Ohio">Ohio</option>
                  <option value="Oklahoma">Oklahoma</option>
                  <option value="Oregon">Oregon</option>
                  <option value="Pennsylvania">Pennsylvania</option>
                  <option value="Rhode Island">Rhode Island</option>
                  <option value="South Carolina">South Carolina</option>
                  <option value="South Dakota">South Dakota</option>
                  <option value="Tennessee">Tennessee</option>
                  <option value="Texas">Texas</option>
                  <option value="Utah">Utah</option>
                  <option value="Vermont">Vermont</option>
                  <option value="Virginia">Virginia</option>
                  <option value="Washington">Washington</option>
                  <option value="West Virginia">West Virginia</option>
                  <option value="Wisconsin">Wisconsin</option>
                  <option value="Wyoming">Wyoming</option>
                </select>
              </div>
              <div class="form-group">
                <label for="city">City:</label>
                <select id="city" v-model="city" required>
                  <option value="">Select City</option>
                  <option v-for="city in citiesByState[state]" :value="city">{{ city }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="zipcode">Zipcode:</label>
                <input type="text" id="zipcode" v-model="zipcode" required>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="bodyPart">Body Part:</label>
                <select id="bodyPart" v-model="bodyPart" required>
                  <option value="">Select Body Part</option>
                  <option value="Head">Head</option>
                  <option value="Leg">Leg</option>
                  <option value="Knee">Knee</option>
                  <!-- Add more body part options as needed -->
                </select>
              </div>
              <div class="form-group">
                <label for="sensation">Sensation:</label>
                <select id="sensation" v-model="sensation" required>
                  <option value="">Select Sensation</option>
                  <option value="Pain">Pain</option>
                  <option value="Numbness">Numbness</option>
                  <option value="Tingling">Tingling</option>
                  <!-- Add more sensation options as needed -->
                </select>
              </div>
            </div>
            <div class="form-group">
              <label for="description">Chat Box:</label>
              <textarea id="description" v-model="description" required></textarea>
            </div>
            <div class="form-group button-group">
              <button type="submit" class="submit-button">Send</button>
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
          <pagination :current-page="page" :total-pages="totalPages" @change-page="fetchHospitalChargesWithPage"></pagination>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Pagination from './Pagination.vue';

export default {
  components: {Pagination},
  data() {
    return {
      state: '',
      city: '',
      zipcode: '',
      bodyPart: '',
      sensation: '',
      description: '',
      messages: [],
      filterType: '',
      searchTerm: '',
      hospitalCharges: [],
      results: [],
      citiesByState: {
        'Alabama': [],
        'Alaska': [],
        'Arizona': [],
        'Arkansas': [],
        'California': [],
        'Colorado': [],
        'Connecticut': [],
        'Delaware': [],
        'Florida': [],
        'Georgia': [],
        'Hawaii': [],
        'Idaho': [],
        'Illinois': [],
        'Indiana': [],
        'Iowa': [],
        'Kansas': [],
        'Kentucky': [],
        'Louisiana': [],
        'Maine': [],
        'Maryland': [],
        'Massachusetts': [],
        'Michigan': [],
        'Minnesota': [],
        'Mississippi': [],
        'Missouri': [],
        'Montana': [],
        'Nebraska': [],
        'Nevada': [],
        'New Hampshire': [],
        'New Jersey': [],
        'New Mexico': [],
        'New York': [],
        'North Carolina': [],
        'North Dakota': [],
        'Ohio': ['Cleveland', 'Dayton'],
        'Oklahoma': [],
        'Oregon': [],
        'Pennsylvania': [],
        'Rhode Island': [],
        'South Carolina': [],
        'South Dakota': [],
        'Tennessee': [],
        'Texas': [],
        'Utah': [],
        'Vermont': [],
        'Virginia': [],
        'Washington': [],
        'West Virginia': [],
        'Wisconsin': [],
        'Wyoming': []
      }
    };
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
    async submitForm() {
      try {
        // Add user message to chat
        const timestamp = new Date().toLocaleTimeString();
        this.messages.push({
          type: 'user',
          text: this.description,
          timestamp,
        });

        // Send request to the backend
        const response = await axios.post('http://127.0.0.1:5000/api/comprehend-medical', {
          user_chatbox_data: JSON.stringify({
            state: this.state,
            city: this.city,
            zipcode: this.zipcode,
            bodyPart: this.bodyPart,
            sensation: this.sensation,
            description: this.description,
          }),
        });

        if (response.status === 200) {
          // Assign the response data to the results array
          this.results = response.data;

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
        } else {
          // Handle the case when the API call fails
          console.error('API call failed with status:', response.status);
          this.messages.push({type: 'bot', text: 'Oops! Something went wrong. Please try again later.'});
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },

    resetForm() {
      this.state = '';
      this.city = '';
      this.zipcode = '';
      this.bodyPart = '';
      this.sensation = '';
      this.description = '';
      this.messages = [];
    },
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
  //flex-grow: 1;
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
  padding: 0.8rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
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
  width: 40%;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
  display: inline-block; /* Align with the submit button */
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
  width: 100%;
}

.button-group .submit-button,
.button-group .reset-button {
  flex: 1; /* Adjust this as needed, or use specific widths */
  margin: 0 5px; /* Provide some spacing between the buttons */
  padding: 10px 1px 10px 1px; /*positions are in the order of top, right, bottom, left*/
  margin-top: 10px;
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


@media (max-width: 768px) {
  .chat-container {
    flex-direction: column-reverse; /* Stacks the form above the messages on smaller screens */
    width: 100%;
    padding: 1rem;
  }

  .chat-section, .chat-input .input-form {
    width: 100%; /* Allows each section to expand to full width */
  }
}
</style>
