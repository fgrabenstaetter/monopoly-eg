import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Signin from '../views/Signin.vue'
import ResetPassword from '../views/ResetPassword.vue'
import Lobby from '../views/Lobby.vue'
import Game from '../views/Game.vue'
import {store} from '../store/store'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/signin',
    name: 'Signin',
    component: Signin
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/lobby',
    name: 'Lobby',
    component: Lobby
  },
  {
    path: '/game',
    name: 'Game',
    component: Game
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {  
  const unrestrictedRoutes = ['Home', 'Login', 'Signin', 'ResetPassword'];
  if (!unrestrictedRoutes.includes(to.name) && !store.getters.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
})

export default router
