<template>
  <!-- Social media component template -->
  <div class="social-media-component">
    <!-- Main section for buttons -->
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
    <main>
      <div class="button-class">
        <div class="button-group-top">
          <!-- Buttons for adding friends, creating a post, and sending a message -->
          <button class="square-button" @click="addfriends">Add Friends</button>
          <button class="square-button" @click="openPostModal()">Create Post</button>
          <button class="square-button" @click="openSendMessage()">Send Message</button>
        </div>
        <div class="button-group-bottom">
          <!-- Buttons for viewing friend list and all posts -->
          <button class="square-button" @click="Friends">Friend List</button>
          <button class="square-button" @click="getAllPosts()">View Posts</button>
        </div>
      </div>
    </main>
  </div>

  <!-- Modal for creating a post -->
  <div v-if="showPostModal" class="modal">
    <div class="modal-content">
      <span class="close" @click="showPostModal = false">&times;</span>
      <h2>Create Post</h2>
      <!-- Text area for writing the post content -->
      <textarea v-model="postContent" placeholder="Write your post here" class="post-textarea"></textarea>
      <!-- Button to submit the post -->
      <button @click="createPost()" class="submit-button">Submit</button>
    </div>
  </div>

  <!-- Add Friends -->
  <div v-if="showAddFriendModal" class="modal">
    <div class="modal-content">
      <span class="close" @click="showAddFriendModal = false">&times;</span>
      <h2>Add Friends </h2>
      <div class="filter-container">
        <label for="filterBy">Filter By:</label>
        <select id="filterBy" v-model="selectedFilter">
          <option value="People">People</option>
          <option value="Action">Action</option>
          <option value="Status">Status</option>
        </select>
        <input type="text" v-model="searchQuery" placeholder="Search people...">
      </div>
      <div class="add-friends-table-container">
        <table class="add-friends-table">
          <thead>
          <tr>
            <th>People</th>
            <th>Action</th>
            <th>Friendship Status</th>
            <th>Requested Date</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="user in filteredUsers" :key="user.user_id">
            <td>{{ user.username }}</td>
            <td>
              <button class="friendship-button" :class="{
                    'requested': getFriendshipStatus(user.user_id) === 'requested',
                    'not-requested': getFriendshipStatus(user.user_id) === 'None',
                    'accepted': getFriendshipStatus(user.user_id) === 'Accepted'
                  }" :disabled="getFriendshipStatus(user.user_id) === 'Accepted'"
                      @click="toggleFriendRequest(user.user_id)">
                {{
                  getFriendshipStatus(user.user_id) === 'requested' ? 'Cancel Request' :
                      getFriendshipStatus(user.user_id) === 'Accepted' ? 'Friends' : 'Send Request'
                }}
              </button>
            </td>
            <td>{{ getFriendshipStatus(user.user_id) }}</td>
            <td>{{ getFriendshipRequestedDate(user.user_id) }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Send Message 
    <div v-if="showSendMessageModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showSendMessageModal = false">&times;</span>
        <h2>Send Message</h2>
        <textarea v-model="messageContent" placeholder="Write your message here"></textarea>
        <button @click="sendMessage()">Send</button>
      </div>
    </div>
    -->

    <div v-if="showViewPostsModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showViewPostsModal = false">&times;</span>
        <h2>View All Posts</h2>
        <div class="posts-container">
          <table>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Time</th>
              <th>Content</th>
            </tr>
            <tr v-for="post in posts" :key="post.post_id">
              <td>{{ post.post_id }}</td>
              <td>{{ post.username }}</td>
              <td>{{ post.created_at }}</td>
              <td>{{ post.content }}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal for displaying send messages -->
  <div v-if="showSendMessageModal" class="modal">
    <div class="modal-content">
      <!-- Close button for the modal -->
      <span class="close" @click="closeSendMessageModal">&times;</span>
      <!-- Title for the modal -->
      <h2>Messages</h2>
      <!-- Buttons for switching between sent messages, received messages, and send message -->
      <div class="toggle-button">
        <button class="toggle-btn" @click="fetchSentMessages" :class="{ active: selectedMessageCategory === 'sent' }">
          Sent Messages
        </button>
        <button class="toggle-btn" @click="fetchReceivedMessages"
                :class="{ active: selectedMessageCategory === 'received' }">
          Received Messages
        </button>
        <button class="toggle-btn" @click="showSendMessage" :class="{ active: selectedMessageCategory === 'send' }">
          Send Message
        </button>
      </div>
      <!-- Search field -->
      <div v-if="selectedMessageCategory !== 'send'" class="search-fields">
        <input v-model="searchQuery" placeholder="Search messages...">
      </div>
      <!-- Table to display sent messages -->
      <table v-if="selectedMessageCategory === 'sent'">
        <thead>
        <tr>
          <th>Recipient</th>
          <th>Message</th>
          <th>Date Sent</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="filteredSentMessages.length === 0">
          <td colspan="3">No sent messages to display.</td>
        </tr>
        <tr v-else v-for="message in filteredSentMessages" :key="message.id">
          <td>{{ message.recipient_name }}</td>
          <td>{{ message.content }}</td>
          <td>{{ formatDate(message.timestamp) }}</td>
        </tr>
        </tbody>
      </table>
      <!-- Table to display received messages -->
      <table v-else-if="selectedMessageCategory === 'received'">
        <thead>
        <tr>
          <th>Sender</th>
          <th>Message</th>
          <th>Date Received</th>
          <th>Action</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="filteredReceivedMessages.length === 0">
          <td colspan="4">No received messages to display.</td>
        </tr>
        <tr v-else v-for="message in filteredReceivedMessages" :key="message.id">
          <td>{{ message.sender_name }}</td>
          <td>{{ message.content }}</td>
          <td>{{ formatDate(message.timestamp) }}</td>
          <td>
            <button class="reply-button" @click="replyToMessage(message.sender_id)">Reply</button>
          </td>
        </tr>
        </tbody>
      </table>
      <!-- Form to send a message -->
      <div v-else-if="selectedMessageCategory === 'send'">
        <div class="form-group">
          <label for="recipient">Recipient:</label>
          <select id="recipient" v-model="selectedRecipient">
            <option value="" disabled>Select a recipient</option>
            <option v-for="user in users" :key="user.id" :value="user.user_id">
              {{ user.username }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label for="message">Message:</label>
          <textarea id="message" class="post-textarea" v-model="messageContent"
                    placeholder="Type your message..."></textarea>
        </div>
        <button class="submit-button" @click="sendMessage">Send</button>
      </div>
    </div>
  </div>


  <div v-if="showViewPostsModal" class="modal">
    <div class="modal-content">
      <span class="close" @click="showViewPostsModal = false">&times;</span>
      <h2>View All Posts</h2>
      <div class="posts-container">
        <table>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Time</th>
            <th>Content</th>
          </tr>
          <tr v-for="post in posts" :key="post.post_id">
            <td>{{ post.post_id }}</td>
            <td>{{ post.username }}</td>
            <td>{{ post.created_at }}</td>
            <td>{{ post.content }}</td>
          </tr>
        </table>
      </div>
    </div>
  </div>

  <!-- Friend List -->
  <div v-if="showFriendListModal" class="modal">
    <div class="modal-content">
      <span class="close" @click="showFriendListModal = false">&times;</span>
      <h2>Friend List</h2>
      <div class="filter-container">
        <label for="filterBy">Filter By:</label>
        <select id="filterBy" v-model="selectedFriendFilter">
          <option value="All">All</option>
          <option value="Friends">Friends</option>
          <option value="Incoming">Incoming Requests</option>
          <option value="Outgoing">Outgoing Requests</option>
        </select>
        <input type="text" v-model="friendSearchQuery" placeholder="Search friends...">
      </div>
      <div class="add-friends-table-container">
        <table class="add-friends-table">
          <thead>
          <tr>
            <th>Friends</th>
            <th>Friendship Status</th>
            <th>Action</th>
            <th>Request Date</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="friendship in filteredFriends" :key="friendship.id">
            <td>{{ friendship.friend_name }}</td>
            <td>
                <span class="friendship-status" :class="{
                  'accepted': friendship.status === 'accepted',
                  'incoming-request': friendship.request_type === 'incoming' && friendship.status !== 'accepted',
                  'outgoing-request': friendship.request_type === 'outgoing' && friendship.status !== 'accepted'
                }">
                  {{
                    friendship.status === 'accepted' ? 'Friends' :
                        friendship.request_type === 'incoming' ? 'Incoming Request' :
                            friendship.request_type === 'outgoing' ? 'Outgoing Request' : ''
                  }}
                </span>
            </td>
            <td>
              <button v-if="friendship.status === 'accepted'" class="friendship-button requested"
                      @click="cancelFriendRequest(friendship.friend_id)">
                Remove
              </button>
              <div v-else-if="friendship.request_type === 'incoming'" class="dropdown">
                <button class="friendship-button requested dropdown-toggle" type="button" data-toggle="dropdown">
                  Action
                </button>
                <div class="dropdown-menu">
                  <a class="dropdown-item" @click="respondToFriendRequest(friendship.friend_id, 'accept')">Accept</a>
                  <a class="dropdown-item"
                     @click="respondToFriendRequest(friendship.friend_id, 'decline')">Decline</a>
                </div>
              </div>
              <button v-else-if="friendship.request_type === 'outgoing'"
                      class="friendship-button requested-friendslist"
                      @click="cancelFriendRequest(friendship.friend_id)">
                Cancel Request
              </button>
            </td>
            <td>{{ friendship.created_at }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  <!-- Toast component for displaying messages -->
  <toast-component ref="toast" :message="toastMessage"/>
</template>

<script>

import axios from 'axios';
import {mapGetters} from 'vuex';
import ToastComponent from './ToastComponent.vue';


export default {
  components: {
    ToastComponent, // Register the ToastComponent
  },
  // Importing computed properties from Vuex store
  computed: {
    ...mapGetters(['currentUser']),
    // Compute the user ID from currentUser
    userID() {
      return this.currentUser ? this.currentUser.userId : null;
    },
    filteredUsers() {
      let filtered = this.users;

      if (this.searchQuery) {
        filtered = filtered.filter(user =>
            user.username.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }

      if (this.selectedFilter === 'Action') {
        filtered = filtered.filter(user =>
            this.getFriendshipStatus(user.user_id) !== 'None' &&
            this.getFriendshipRequestType(user.user_id) !== 'incoming'
        );
      } else if (this.selectedFilter === 'Status') {
        filtered = filtered.filter(user =>
            this.getFriendshipStatus(user.user_id) !== 'None' &&
            this.getFriendshipRequestType(user.user_id) !== 'incoming'
        );
      }

      // Exclude users who have sent an incoming friend request
      filtered = filtered.filter(user =>
          this.getFriendshipRequestType(user.user_id) !== 'incoming'
      );

      return filtered;
    },
    filteredFriends() {
      let filtered = this.friendships;

      if (this.friendSearchQuery) {
        filtered = filtered.filter(friendship =>
            friendship.friend_name.toLowerCase().includes(this.friendSearchQuery.toLowerCase())
        );
      }

      if (this.selectedFriendFilter === 'Friends') {
        filtered = filtered.filter(friendship => friendship.status === 'accepted');
      } else if (this.selectedFriendFilter === 'Incoming') {
        filtered = filtered.filter(friendship => friendship.request_type === 'incoming');
      } else if (this.selectedFriendFilter === 'Outgoing') {
        filtered = filtered.filter(friendship => friendship.request_type === 'outgoing');
      }

      return filtered;
    },

    filteredSentMessages() {
      return this.sentMessages.filter(message =>
          message.content.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
    filteredReceivedMessages() {
      return this.receivedMessages.filter(message =>
          message.content.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    },
  },
  created() {
    this.fetchUsers();
  },

  name: 'SocialMedia',
  data() {
    // Data properties for managing state
    return {
      showPostModal: false,
      postContent: '',
      showAddFriendModal: false,
      showSendMessageModal: false,

      showViewPostsModal: false,
      posts: [],  // Array to store all posts
      users: [],
      friendships: [],
      selectedFilter: 'People',
      searchQuery: '',
      showFriendListModal: false,
      friendList: [],
      selectedFriendFilter: 'People',
      friendSearchQuery: '',
      toastMessage: '',


      selectedMessageCategory: 'sent',
      sentMessages: [],
      receivedMessages: [],
      selectedRecipient: '',
      messageContent: '',


    };
  },

  methods: {
    addfriends() {
      if (!this.userID) {
        console.error('Id is empty');
        return;
      }
      this.getAllUsers();
      this.getUserFriendships();
      this.showAddFriendModal = true;
    },

    getAllUsers() {
      const url = 'http://3.211.246.7/api/get_users';
      axios.get(url)
          .then(response => {
            if (response.status === 200) {
              // Filter out the logged-in user from the list of users
              this.users = response.data.filter(user => user.user_id !== this.userID);
            } else {
              console.error('Users not found.');
            }
          })
          .catch(error => {
            console.error('Error:', error.response);
          });
    },

    getUserFriendships() {
      const url = `http://3.211.246.7/api/get_friendships/${this.userID}`;
      axios.get(url)
          .then(response => {
            if (response.status === 200) {
              this.friendships = response.data;
            } else {
              console.error('Friendships not found.');
            }
          })
          .catch(error => {
            console.error('Error:', error.response);
          });
    },

    getFriendshipStatus(userId) {
      const friendship = this.friendships.find(
          friendship => (friendship.user_id === this.userID && friendship.friend_id === userId) ||
              (friendship.user_id === userId && friendship.friend_id === this.userID)
      );
      return friendship ? (friendship.status === 'accepted' ? 'Accepted' : friendship.status) : 'None';
    },

    getFriendshipRequestedDate(userId) {
      const friendship = this.friendships.find(
          friendship => (friendship.user_id === this.userID && friendship.friend_id === userId) ||
              (friendship.user_id === userId && friendship.friend_id === this.userID)
      );
      return friendship ? friendship.created_at : 'None';
    },

    toggleFriendRequest(userId) {
      const friendship = this.friendships.find(
          friendship => (friendship.user_id === this.userID && friendship.friend_id === userId) ||
              (friendship.user_id === userId && friendship.friend_id === this.userID)
      );

      if (friendship) {
        if (friendship.status === 'requested') {
          this.cancelFriendRequest(userId);
        }
      } else {
        this.sendFriendRequest(userId);
      }
    },

    sendFriendRequest(userId) {
      const url = `http://3.211.246.7/api/add_friend/${this.userID}/${userId}`;
      axios.post(url)
          .then(response => {
            if (response.status === 201) {
              this.getUserFriendships();
            }
          })
          .catch(error => {
            console.error('Error:', error.response);
          });
    },

    cancelFriendRequest(userId) {
      const url = `http://3.211.246.7/api/remove_friend/${this.userID}/${userId}`;
      axios.delete(url)
          .then(response => {
            if (response.status === 200) {
              this.getUserFriendships();
            }
          })
          .catch(error => {
            console.error('Error:', error.response);
          });
    },

    showMessage() {
      // Add logic to show the add friends modal
      if (!this.userID) {
        console.error('Id is empty');
        return;
      }
      this.showSendMessageModal = true;

    },

    // Method to create a post
    createPost() {
      // Add logic to show the create post modal
      if (!this.userID) {
        console.error('Id is empty');
        return;
      }
      const url = `http://3.211.246.7/api/create_post`;

      axios.post(url, {
        user_id: this.userID,
        content: this.postContent
      }).then(response => {
        if (response.status === 201) {
          console.log(response.data);
          this.content = response.data;
          console.log(this.content);
          this.toastMessage = "Successfuly Created Post.";
          this.$refs.toast.showToast(3000, 'success', this.toastMessage);
          this.postContent = '';
        } else {
          console.error('Post could not be created.');
          this.toastMessage = "Post could not be created.";
          this.$refs.toast.showToast(3000, 'error', this.toastMessage);
        }
      })
          .catch(error => {
            console.error("Error:", error.response);
          });
    },

    // Method to open the create post modal
    openPostModal() {
      this.showPostModal = true;
    },


    // Method to get all posts
    getAllPosts() {
      if (!this.userID) {
        console.error('Id is empty');
        return;
      }

      console.log("Getting all posts")

      const url = `http://3.211.246.7/api/view_my_posts/${this.userID}`;

      axios.get(url, {
        user_id: this.userID,
      }).then(response => {
        if (response.status === 200) {
          console.log(response.data);
          this.posts = response.data;
          this.showViewPostsModal = true;
          console.log(this.posts);
        } else {
          console.error('Posts not found.');
        }
      })
          .catch(error => {
            console.error("Error:", error.response);
          });
    },

    openSendMessage() {
      this.showSendMessageModal = true;
    },

    // Method to view friend list
    Friends() {
      this.getUserFriendships();
      this.showFriendListModal = true;
    },
    viewPosts() {
      // Add logic to show the view posts modal
    },

    respondToFriendRequest(userId, action) {
      console.log('Responding to friend request');
      const url = `http://3.211.246.7/api/respond_friend_request/${this.userID}/${userId}`;
      axios.post(url, {action})
          .then(response => {
            if (response.status === 200) {
              this.getUserFriendships();
            }
          })
          .catch(error => {
            console.error('Error:', error.response);
          });
    },

    getFriendshipRequestType(userId) {
      const friendship = this.friendships.find(
          friendship => (friendship.user_id === this.userID && friendship.friend_id === userId) ||
              (friendship.user_id === userId && friendship.friend_id === this.userID)
      );
      return friendship ? friendship.request_type : 'None';
    },

    closeSendMessageModal() {
      this.showSendMessageModal = false;
      this.resetMessageData();
    },
    resetMessageData() {
      this.selectedMessageCategory = 'sent';
      this.searchQuery = '';
      this.selectedRecipient = '';
      this.messageContent = '';
    },
    fetchSentMessages() {
      this.selectedMessageCategory = 'sent';
      const url = `http://3.211.246.7/api/sent_messages/${this.userID}`;
      axios.get(url)
          .then(response => {
            if (response.status === 200) {
              this.sentMessages = response.data.sent_messages;
            } else {
              console.error('Sent messages not found.');
            }
          })
          .catch(error => {
            console.error('Error:', error.response);
          });
    },
    fetchReceivedMessages() {
      this.selectedMessageCategory = 'received';
      const url = `http://3.211.246.7/api/received_messages/${this.userID}`;
      axios.get(url)
          .then(response => {
            if (response.status === 200) {
              this.receivedMessages = response.data.received_messages;
            } else {
              console.error('Received messages not found.');
            }
          })
          .catch(error => {
            console.error('Error:', error.response);
          });
    },
    showSendMessage() {
      this.selectedMessageCategory = 'send';
    },
    sendMessage() {
      const url = 'http://3.211.246.7/api/send_message';
      axios.post(url, {
        sender_id: this.userID,
        recipient_id: this.selectedRecipient,
        content: this.messageContent
      })
          .then(response => {
            if (response.status === 201) {
              console.log('Message sent successfully.');
              this.resetMessageData();
            } else {
              console.error('Failed to send message.');
            }
          })
          .catch(error => {
            console.error('Error:', error.response);
          });
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    },
    fetchUsers() {
      const url = 'http://3.211.246.7/api/get_users';
      axios.get(url)
          .then(response => {
            if (response.status === 200) {
              this.users = response.data.filter(user => user.user_id !== this.userID);
            } else {
              console.error('Users not found.');
            }
          })
          .catch(error => {
            console.error('Error:', error.response);
          });
    },
    replyToMessage(senderId) {
      this.selectedRecipient = senderId;
      this.selectedMessageCategory = 'send';
    },

  }
}

</script>

<style scoped>
/* Scoped styles for the social media component */


.social-media-component {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f5f5f5;
}

main {
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5f5f5;
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.button-group {
  display: flex;
  justify-content: center;
  padding: 10px;
  margin-bottom: 20px;
}

/* Styles for buttons */
.square-button {
  width: 150px;
  height: 150px;
  margin: 10px;
  border: none;
  background-color: #8BC34A;
  cursor: pointer;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s, transform 0.1s;
  justify-content: center;
  align-items: center;
  color: #4563e1;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.square-button:hover {
  background-color: #7CB342;
  transform: translateY(-2px);
}

/* Styles for modal */
.modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

/* Styles for modal content */
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 700px;
  border: 1px solid #4CAF50;
}

.posts-container {
  overflow-y: auto;
  /* Only vertical scrolling */
  max-height: 300px;
  /* Adjust based on your needs */
  margin-top: 20px;
  /* Space between header and table */
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #4CAF50;
}

.close {
  float: right;
  font-size: 28px;
  cursor: pointer;
}

.add-friends-table-container {
  max-height: 400px;
  overflow-y: auto;
  margin-top: 20px;
}

.add-friends-table {
  width: 100%;
  border-collapse: collapse;
}

.add-friends-table th,
.add-friends-table td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

.add-friends-table th {
  background-color: #4CAF50;
  font-weight: bold;
}

.add-friends-table tbody tr:nth-child(even) {
  background-color: #f9f9f9;
}

.add-friends-table tbody tr:hover {
  background-color: #e9e9e9;
}

.friendship-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: #4CAF50;
}

.friendship-button.requested {
  background-color: #b52f7c;
  color: white;
}

.friendship-button.requested:hover {
  background-color: #FF0000;
}

.friendship-button.not-requested {
  background-color: #2196F3;
  color: white;
}

.friendship-button.not-requested:hover {
  background-color: #1976D2;
}

.filter-container {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.filter-container label {
  margin-right: 10px;
}

.filter-container select,
.filter-container input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.filter-container input {
  margin-left: 10px;
}

.friendship-button.accepted {
  background-color: #4CAF50;
  color: white;
  cursor: default;
}

.friendship-status {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 4px;
}

.friendship-status.accepted {
  background-color: #4CAF50;
  color: white;
}

.friendship-status.incoming-request {
  background-color: #18b4ec;
  color: white;
}

.friendship-status.outgoing-request {
  background-color: #4555a8;
  color: white;
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: #b52f7c;
  color: white;
}

.dropdown-menu {
  display: none;
  position: absolute;
  background-color: #f9f9f9;
  min-width: 120px;
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
  z-index: 1;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  padding: 8px 16px;
  text-decoration: none;
  display: block;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f1f1f1;
}

.requested-friendslist {
  background-color: #FF0000;
  color: white;
}

/* Text area style */
.post-textarea {
  width: 90%;
  height: 150px;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  resize: none;
}

/* Placeholder text style */
.post-textarea::placeholder {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px; /* Adjust font size as needed */
  color: #999; /* Adjust placeholder text color as needed */
}

/* Submit button style */
.submit-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
  display: block;
  margin: 0 auto;
}

.submit-button:hover {
  background-color: #45a049;
}

.toggle-button {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.toggle-btn {
  padding: 10px 20px;
  margin: 0 10px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-btn.active {
  background-color: #4CAF50;
  color: white;
}

.reply-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  background-color: #4CAF50;
  color: white;
}


.search-fields {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.search-fields input {
  width: 100%;
  max-width: 400px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  outline: none;
  transition: all 0.3s ease;
}

.search-fields input:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
}

.search-fields input:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 8px rgba(76, 175, 80, 0.5);
}

select {
  width: 100%;
  padding: 12px 40px 12px 15px;
  margin: 10px 0;
  border: 2px solid #4CAF50;
  border-radius: 8px;
  background-color: white;
  font-size: 16px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  appearance: none;
  position: relative;
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 30px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234CAF50" width="36px" height="36px"><path d="M7 10l5 5 5-5z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
}

select:hover {
  border-color: #367B25;
}

select:focus {
  outline: none;
  border-color: #88C057;
  box-shadow: 0 0 0 2px rgba(136, 192, 87, 0.5);
}

.option {
  padding: 10px;
  background-color: white;
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

/* Fade-in animation keyframes */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
