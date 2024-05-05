// store/index.js

import { createStore } from 'vuex';
import axios from 'axios';
import router from '../router';

const store = createStore({
  state() {
    return {
      currentUser: null,
      isLoading: false,
      loginError: null,
      activeButton: 'login'
    };
  },
  mutations: {
    setCurrentUser(state, userData) {
      state.currentUser = userData;
    },
    setLoading(state, status) {
      state.isLoading = status;
    },
    setLoginError(state, error) {
      state.loginError = error;
    },
    setActiveButton(state, button) {
      state.activeButton = button;
    }
  },
  actions: {
    loginUser({ commit }, credentials) {
      commit('setLoading', true);
      commit('setLoginError', null);
      const loginUrl = 'http://3.211.246.7/api/login';
      return axios.post(loginUrl, credentials, { withCredentials: true })
          .then(response => {
            commit('setLoading', false);
            if (response.data.user_id) {
              commit('setCurrentUser', {
                userId: response.data.user_id,
              });
              localStorage.setItem('currentUser', JSON.stringify({ userId: response.data.user_id }));
              commit('setActiveButton', 'home');
              router.push('/');
            } else {
              commit('setLoginError', 'Invalid login credentials.');
              return false;
            }
          })
          .catch(error => {
            commit('setLoading', false);
            commit('setLoginError', error.message);
            throw error;
          });
    },
    logoutUser({ commit }) {
      localStorage.removeItem('currentUser');
      commit('setCurrentUser', null);
      commit('setActiveButton', 'login');
      router.push('/login');
    }
  },
  getters: {
    currentUser: state => state.currentUser,
    isAuthLoading: state => state.isLoading,
    loginErrorMessage: state => state.loginError
  }
});

export default store;
