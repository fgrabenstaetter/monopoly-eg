import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
    state: {
      apiUrl: 'http://localhost:3000/api',
      serverUrl: 'http://localhost:3000',
      jwt: localStorage.getItem('jwt'),
      isLoggedIn: !!localStorage.getItem('jwt'),
      pending: false,
      loggedUser: JSON.parse(localStorage.getItem('loggedUser'))
    },
    mutations: {
      loggedIn (state, data) {
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('loggedUser', JSON.stringify(data.user));
        state.jwt = data.jwt
        state.loggedUser = data.user;
        state.isLoggedIn = true;
        state.pending = false;
      },
      loggedOut (state) {
        state.isLoggedIn = false;
      },
      settingsUpdated (state, data) {
        state.loggedUser.settings = data;
        const user = state.loggedUser;
        localStorage.setItem('loggedUser', JSON.stringify(user));
      }
    },
    actions: {
      login ({ commit }, data) {
        console.log("LOGGING IN WITH ", data);
        commit('loggedIn', data);
      },
      logout ({ commit }) {
        commit('loggedOut');
      },
      updateSettings ({ commit }, data) {
        commit('settingsUpdated', data);
      }
    },
    getters: {
      isLoggedIn: state => {
        return state.isLoggedIn;
      },
      loggedUser: state => {
        return state.loggedUser;
      },
      apiUrl: state => {
        return state.apiUrl;
      },
      serverUrl: state => {
        return state.serverUrl;
      },
      jwt: state => {
          return state.jwt;
      }
    }
  })