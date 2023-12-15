<template>
    <div class="w-screen h-screen grid place-content-center">
      <div class="bg-gray-500 p-10 rounded-lg drop-shadow-xl">
        <p class="text-white mb-3 text-xl">SellCars</p>
        <form @submit.prevent="emitLoginToServer" class="grid">
          <input class="border py-1 pl-1 rounded-sm" type="text" id="usrname" placeholder="Username" v-model="usrname" maxlength="75"/><br>
          <input class="border py-1 pl-1 rounded-sm" type="password" id="password" placeholder="Password" v-model="password" maxlength="75"/><br>
          <p class="text-red-500 mb-5" :class="{'invisible': wrongInput}">Wrong Username or Password!</p>
          <button class="bg-white w-1/2 rounded-md justify-self-end" type="submit">Login</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useStore } from 'vuex';
  
  export default {
    setup() {
      const router = useRouter()
      const usrname = ref('');
      const password = ref('');
      const store = useStore();

      let wrongInput = ref(true);
  
      /**
       * Sends an asynchronous event to the Server for Logging in
       */
      const emitLoginToServer = async () => {
        try {
          console.log(wrongInput.value)
          const eventData = { usrname: usrname.value, password: password.value };
          const response = await axios.post('http://localhost:3000/userLogin', eventData);

          if (response.status === 200) {
            wrongInput.value = true;

            store.commit('setUser', response.data);
            router.push('/customers-page');
          } else {
            store.commit('setUser', null);
          }

        } catch (error) {
          wrongInput.value = false;
          store.commit('setUser', null);
        }
      };
  
      return { usrname, password, emitLoginToServer, wrongInput };
    },
  };
  </script>
  
  <style>

  </style>
  