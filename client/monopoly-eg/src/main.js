import Vue from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import {store} from '@/store/store'

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './assets/css/anime.min.css';
import './assets/css/fontawesome.min.css';

import VueAnime from 'vue-animejs';
Vue.use(VueAnime);

Vue.config.productionTip = false
Vue.prototype.$http = axios;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
