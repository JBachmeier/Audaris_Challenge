<template>
    <div class="w-screen h-screen bg-white">
        <p>{{ user }}</p>
    </div>
</template>

<script>
import { useStore } from 'vuex';

export default {
    setup() {
        const store = useStore();
        const user = store.getters.getUserMail;

        console.log(user)

        return { user };
    }
}
</script>

<style>

</style>