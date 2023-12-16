<template>
    <div class="w-screen h-screen bg-white grid grid-cols-4">
        <div class="fixed grid justify-self-stretch">
            <p>User</p>
            <p>{{ user.username }}</p>
            <p>Last Login: {{ user.lastLogin }}</p><br>
            <input type="file" id="customersfile" ref="customersfile" accept=".csv" maxlength="512000" class="hidden" @change="handleFileUpload"/>
            <button @click="$refs.customersfile.click()" class="bg-gray-500 p-2 border-2 rounded-md">Import customers (.cvs)</button>
            <input type="file" id="contactfile" ref="contactfile" accept=".csv" maxlength="512000" class="hidden" @change="handleFileUpload"/>
            <button @click="$refs.contactfile.click()" class="bg-gray-500 p-2 border-2 rounded-md">Import contact persons (.cvs)</button>
            <input type="file" id="addressfile" ref="addressfile" accept=".csv" maxlength="512000" class="hidden" @change="handleFileUpload"/>
            <button @click="$refs.addressfile.click()" class="bg-gray-500 p-2 border-2 rounded-md">Import addresses (.cvs)</button>
        </div>
        <div class="w-full col-start-2 col-span-3 bg-gray-200 mt-12">
            <p class="mb-3 pt-5">Customers</p>
            <input class="justify-self-start border py-1 pl-1 mb-3 rounded-sm" type="text" id="customer" placeholder="Search by all columns" >
            <table class="">
                <tr>
                    <th class="px-3" v-for="(header, index) in headers" :key="index">{{ header }}</th>
                </tr>
                <tr v-for="(row, index) in displayedCustomerData" :key="index">
                    <template v-for="(cell, key, index) in row">
                        <td :key="index" v-if="key !== 'contact_person_id'">{{ cell }}</td>
                    </template>
                    <button class="bg-gray-500 p-2 border-2 rounded-md" @click="deleteRow(row.intnr, row.contact_person_id)">Delete</button>

                </tr>
            </table>
            <div v-if="customerNotfound"  class="absolute top-0 justify-self-center p-4 mt-8 text-sm text-yellow-900 rounded-lg bg-yellow-100/80" role="alert">
                <span class="font-medium">Warning!</span><br> {{errorMessage}}
            </div>
        </div>
        
    </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';
import Papa from 'papaparse';

/**
 * TODO:
 * - Add search function
 * - Add Sorting
 * - Refactor code
 */
export default {
    setup() {
        const store = useStore();
        const user = store.getters.getUser;
        const customerData = ref([]);
        const headers = ['Internal number', 'First name', 'Last name', 'Company name', 'Country', 'Zip/City', 'Address', 'Actions'];
        const customerNotfound = ref(false);
        const errorMessage = ref("");
        // Changes the data everytime the customerData changes
        /**
         * TODO:
         * - Change the adress to the reference inside the contact_person array
         
        const displayedCustomerData = computed(() => 
        
        customerData.value.map(customer => ({
            intnr: customer.intnr,
            first_name: customer.first_name,
            last_name: customer.last_name,
            company_name: customer.company_name,
            country: customer.country,
            zip_city: customer.zip,
            street: customer.street,
        })));*/

        const displayedCustomerData = computed(() => 
            customerData.value.flatMap(customer => 
                customer.contact_persons.map(contact_person => {
                    // Find the address that corresponds to the contact person's address ID
                    const address = customer.addresses.find(addr => addr._id === contact_person.address);
                    return {
                        intnr: customer.intnr,
                        first_name: contact_person.first_name,
                        last_name: contact_person.last_name,
                        company_name: address ? address.company_name : '',
                        country: address ? address.country : '',
                        zip_city: address ? address.zip : '',
                        street: address ? address.street : '',
                        contact_person_id: contact_person._id,
                    };
                })
            )
        );


        console.log(user);

        const handleFileUpload = async (event) => {
            console.log("event:", event);
            const selectedFile = event.target.files[0];
            console.log(selectedFile);
            if (selectedFile.size > 0) {
                console.log("File name:", selectedFile.name);
                console.log("File size:", selectedFile.size, "bytes");
                try {
                    const result = await new Promise((resolve) => {
                        Papa.parse(selectedFile, {
                            complete: (result) => resolve(result),
                            header: true, // Set to true if the CSV file has a header row
                        });
                    });

                    console.log(result);
                    if(event.target.id === "customersfile"){
                        await emitCustomersToServer(result.data);
                    } else if(event.target.id === "contactfile"){
                        await emitContactsToServer(result.data);
                    } else if(event.target.id === "addressfile"){
                        await emitAddressesToServer(result.data);
                    }
                } catch (error) {
                    console.error("Error parsing CSV:", error);
                }
            } else {
                console.warn("No file selected.");
            }

            event.target.value = null;
        };

        const emitCustomersToServer = async (csvData) => {
            try {
                console.log("adding customers")
                const response = await axios.post('http://localhost:3000/customersUpload', csvData);

                console.log("repsonseData:", response.data);
                customerData.value = response.data.allCustomers;

                if(response.data.errorMessage !== ""){
                    customerNotfound.value = true;
                    errorMessage.value = response.data.errorMessage;
                }

            } catch (error) {
            console.log(error);
            }
        };
        const emitContactsToServer = async (csvData) => {
            try {
                const response = await axios.post('http://localhost:3000/contactsUpload', csvData);

                if(response.data.errorMessage !== ""){
                    customerNotfound.value = true;
                    errorMessage.value = response.data.errorMessage;
                }

                console.log("repsonseData:", response.data);
                customerData.value = response.data.allCustomers;
                console.log("customerData:", customerData.value);

            } catch (error) {
            console.log(error);
            }
        };
        const emitAddressesToServer = async (csvData) => {
            try {
                const response = await axios.post('http://localhost:3000/addressesUpload', csvData);

                if(response.data.errorMessage !== ""){
                    customerNotfound.value = true;
                    errorMessage.value = response.data.errorMessage;
                }
                console.log("repsonseData:", response.data);
                customerData.value = response.data.allCustomers;

            } catch (error) {
            console.log(error);
            }
        };

        const deleteRow = async (intnr, _id) => {
            try {
                const response = await axios.delete('http://localhost:3000/deleteRow', {
                    data: {
                        intnr: intnr,
                        _id: _id,
                    }
                });
                console.log(response);
                console.log("deleteRow");
                customerData.value = response.data.allCustomers;
            } catch (error) {
                console.log(error);
            }
        };

        return { user, handleFileUpload, deleteRow, customerData, headers, displayedCustomerData, customerNotfound, errorMessage };
    },
};
</script>

<style>

</style>