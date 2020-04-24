import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
    state: {
      apiUrl: 'http://localhost:3000/api',
      serverUrl: 'http://localhost:3000',
      jwt: localStorage.getItem('jwt'),
      isLoggedIn: !!localStorage.getItem('jwt'),
      peding: false,
      loggedUser: JSON.parse(localStorage.getItem('loggedUser'))
    },
    mutations: {
      loginPending (state) {
        state.pending = true;
      },
      loggedIn (state, loggedUser) {
        localStorage.setItem('loggedUser', JSON.stringify(loggedUser));
        state.loggedUser = loggedUser;
        state.isLoggedIn = true;
        state.pending = false;
      },
      loggedOut (state) {
        state.isLoggedIn = false;
      }
    },
    actions: {
      login ({ commit }, data) {
        commit('loginPending');
        console.log("LOGGING IN WITH ", data);
        localStorage.setItem('jwt', data.jwt);
        commit('loggedIn', data.user);
      },
      logout ({ commit }) {
        commit('loggedOut');
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