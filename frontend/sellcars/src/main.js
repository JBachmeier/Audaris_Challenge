import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'
import './styles/app.css';
import { createRouter, createWebHistory  } from 'vue-router';
import LoginPage from './components/LoginPage.vue';
import HomePage from './components/HomePage.vue';

const routes = [
    { path: '/login', component: LoginPage},
    { path: '/', component: HomePage, meta: { requiresAuth: true }}
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

const globalVars = createStore({
    state: {
        user: null,
    },
    mutations: {
        setUser(state, user) {
            state.user = user;
            console.log(user);
        }
    },
    getters: {
        getUserMail(state){
            return state.user.user.email
        }
    }
})

// Function to check if the user is logged in
const isAuthenticated = () => {
    return globalVars.state.user !== null;
  };
  
  // Navigation guard to check if the user is logged in before each navigation
router.beforeEach((to, from, next) => {
    // If the route requires authentication and the user is not authenticated, redirect to /login
    if (to.meta.requiresAuth && !isAuthenticated()) {
      next('/login');
    } else {
      next();
    }
});

const app = createApp(App)
// Make sure to _use_ the router instance to make the
// whole app router-aware.
app.use(router)
app.use(globalVars)

app.mount('#app')

