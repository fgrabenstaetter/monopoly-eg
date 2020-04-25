import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
// import Vuex from 'vuex'
import {store} from '@/store/store'

// import VueSocketIO from 'vue-socket.io'

import 'bootstrap'
// import 'bootstrap/dist/css/bootstrap.min.css'
// import '@fortawesome/fontawesome-free/css/all.css'
// import '@fortawesome/fontawesome-free/js/all.js'

import VueAnime from 'vue-animejs';
Vue.use(VueAnime);

// library.add(faUserSecret)

// Vue.component('font-awesome-icon', FontAwesomeIcon)
 
// Vue.use(new VueSocketIO({
//     debug: true,
//     connection: store.getters.serverUrl,
//     vuex: {
//         store,
//         actionPrefix: 'SOCKET_',
//         mutationPrefix: 'SOCKET_'
//     },
//     options: {
//       query: `token=${store.getters.jwt}`,
//       path: '/socket.io',
//       secure: true
//     }
// }))

Vue.mixin({
  methods: {
    toast: str => alert('TOAST MIXIN ' + str)
  }
});

Vue.config.productionTip = false
Vue.prototype.$http = axios;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
