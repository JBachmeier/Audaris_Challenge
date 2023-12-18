<template>
    <div class="content-center grid">
        <!-- Button to open the modal -->
        <button @click="openModal" class="hover:text-gray-700 text-gray-500 font-bold justify-self-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
        </button>


        <div v-if="showModal" class="bg-gray-800/70 fixed inset-0 grid items-center justify-center" @click="closeModal">
            <div @click.stop class="bg-white p-4 mx-4 rounded grid">
                <form @submit.prevent="submitChanges" class="grid">
                    <p class="col-span-2 mb-3 text-lg">Customer: #{{ newCustomerData.intnr }}</p>
                    <label>Type</label>
                    <select class="border rounded px-2" v-model="newCustomerData.type" required>
                        <option value="PRIVATE">Private</option>
                        <option value="COMPANY">Company</option>
                        <option value="DEALER">Dealer</option>
                    </select>
                    <label for="firstname">First Name</label>
                    <input class="border rounded px-3" type="text" id="firstname" v-model="contact_person.first_name" required >
                    <label for="lastname">Last Name</label>
                    <input class="border rounded px-3" type="text" id="lastname" v-model="contact_person.last_name" required >
                    <label for="email">Email</label>
                    <input class="border rounded px-3" type="text" id="email" v-model="contact_person.email" required >
                    <label for="phone">Phone</label>
                    <input class="border rounded px-3" type="text" id="phone" v-model="contact_person.mobile_phone" required >
                    <label for="birth">Birthdate</label>
                    <input class="border rounded px-3" type="text" id="birth" v-model="contact_person.birth_date" required >
                    <label for="address">Address</label>
                    <select class="border rounded px-2 overflow-hidden" v-model="contactAddress" required>
                        <option v-for="(data, index) in newCustomerData.addresses" :key="index" :value="data._id">{{newCustomerData.addresses[index].company_name}}, {{newCustomerData.addresses[index].zip}} {{newCustomerData.addresses[index].city}}, {{newCustomerData.addresses[index].street}}</option>
                    </select>
                    <label>Created at: </label><p>{{ newCustomerData.created_at }}</p>
                    <label>Update at: </label><p>{{ newCustomerData.updated_at }}</p>
                    <button class="mr-10 shadow-xl border rounded-xl px-5 py-2 hover:bg-gray-200" type="submit">Save</button>
                    <button class="shadow-xl border rounded-xl px-5 py-2 hover:bg-gray-200" @click="closeModal">Cancel</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from "vue";
export default {
    methods: {
        logIndex(index) {
            console.log("index: ", index);
        }
    },
    props: {
        customerProp: {
            type: Object,
            required: true
        },
        headersProp: {
            type: Object,
            required: true
        },
        contact_person_idProp: {
            type: String,
            required: true
        }
    },
    name: "EditCustomer",
   setup(props , { emit }) {
        const showModal = ref(false);
        const contact_person = ref([]);
        const newCustomerData = ref([]);
        const contactAddress = ref("");

        const openModal = () => {
            newCustomerData.value = JSON.parse(JSON.stringify(props.customerProp));
            console.log("Customer details: ", props.customerProp);
            console.log("Contact Person ID: ", props.contact_person_idProp);
            contact_person.value = newCustomerData.value.contact_persons.find((contact) => contact._id === props.contact_person_idProp);
            console.log("Contact Person : ", contact_person.value);
            let address = newCustomerData.value.addresses.find((address) => address._id === contact_person.value.address);
            if(address !== undefined) {
                contactAddress.value = address._id;
            }
            console.log("Contact Address: ", contactAddress.value)
            // Set the customer details here based on the parameter passed
            showModal.value = true;
        };
        const closeModal = () => {
            // Close the modal without saving
            showModal.value = false;
        };

        /**
         * TODO:
         * - Check for false input!
         */
        const submitChanges = () => {
            // Save the changes to the database
            console.log("Contact Address: ", contactAddress.value);
            contact_person.value.address = newCustomerData.value.addresses.find((address) =>address._id === contactAddress.value)._id;
            console.log("New Customer Data: ", newCustomerData.value);
            emit('update-customer', newCustomerData.value);
            showModal.value = false;
        };

        return {
            newCustomerData,
            showModal,
            contact_person,
            openModal,
            closeModal,
            submitChanges,
            headers: props.headersProp,
            contactAddress,
        };
    }
};
</script>

<style>
label {
    justify-self: start;
}
</style>
