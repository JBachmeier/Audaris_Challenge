<template>
    <div class="h-screen bg-white grid lg:grid-cols-5 overflow-hidden">
        <div class="w-auto hidden lg:grid content-start justify-center">
            <p>User</p>
            <p>{{ user.username }}</p>
            <p>Last Login: {{ user.lastLogin }}</p><br><br>
            <p>Customer CSV uploads</p>
            <input type="file" id="customersfile" ref="customersfile" accept=".csv" maxlength="512000" class="hidden" @change="handleFileUpload"/>
            <button @click="$refs.customersfile.click()" class="bg-gray-500 p-2 border-2 rounded-md">Upload customers</button>
            <input type="file" id="contactfile" ref="contactfile" accept=".csv" maxlength="512000" class="hidden" @change="handleFileUpload"/>
            <button @click="$refs.contactfile.click()" class="bg-gray-500 p-2 border-2 rounded-md">Upload contact persons</button>
            <input type="file" id="addressfile" ref="addressfile" accept=".csv" maxlength="512000" class="hidden" @change="handleFileUpload"/>
            <button @click="$refs.addressfile.click()" class="bg-gray-500 p-2 border-2 rounded-md">Upload addresses</button>
        </div>
        <div class="lg:hidden fixed right-0 mt-3 mr-3 ">
            <button @click="showMenu = !showMenu" class="text-black bg-white  ml-5 p-2 shadow-lg rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                    <path fill-rule="evenodd" d="M3 6.75A.75.75 0 013.75 6h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 6.75zM3 12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75A.75.75 0 013 12zm0 5.25a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
                </svg>
            </button>
        </div>
        <!--<div v-if="showMenu" class="fixed top-0 right-0 h-full w-64 bg-white overflow-auto p-4 shadow-2xl z-10">
            <button @click="showMenu = false" class="mb-4 p-2 text-black bg-gray-200 rounded">
                X
            </button>
             Menu items go here 
        </div>-->
        <div v-if="showMenu" class="fixed w-full h-full bg-gray-500/50 z-10" @click="showMenu = false">
            <div @click.stop class="fixed top-0 right-0 h-full w-64 bg-white overflow-auto p-4 shadow-2xl z-20">
                <button @click="showMenu = false" class="mb-4 p-2 text-black bg-gray-200 rounded">
                    X
                </button>
                <p>User</p>
                <p>{{ user.username }}</p>
                <p>Last Login: {{ user.lastLogin }}</p><br><br>
                <p>Customer CSV uploads</p>
                <input type="file" id="customersfile" ref="customersfile" accept=".csv" maxlength="512000" class="hidden" @change="handleFileUpload"/>
                <button @click="$refs.customersfile.click()" class="bg-gray-500 p-2 border-2 rounded-md">Upload customers</button>
                <input type="file" id="contactfile" ref="contactfile" accept=".csv" maxlength="512000" class="hidden" @change="handleFileUpload"/>
                <button @click="$refs.contactfile.click()" class="bg-gray-500 p-2 border-2 rounded-md">Upload contact persons</button>
                <input type="file" id="addressfile" ref="addressfile" accept=".csv" maxlength="512000" class="hidden" @change="handleFileUpload"/>
                <button @click="$refs.addressfile.click()" class="bg-gray-500 p-2 border-2 rounded-md">Upload addresses</button>
            </div>
        </div>
        <div class="col-start-2 col-span-4 bg-gray-200 lg:mt-12 grid">
            <p class=" justify-self-start mx-3 mb-3 pt-5 text-lg">Customers</p>
            <input class="justify-self-stretch border py-1 px-3 mx-3 mb-3 rounded-md" type="text" id="customer" placeholder="Search by all columns" v-model="search">
            
            <div class="overflow-auto h-screen pb-10">
                <table class="table-fixed lg:w-full lg:h-screen text-center bg-white">
                    <thead class="bg-gray-300 text-gray-600 sticky top-0">
                        <tr>
                            <th class="px-4 py-2" v-for="(header, index) in headers" :key="index" @click="sort(header)">{{ header }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(row, index) in filteredCustomerData" :key="index" class="text-gray-700" :class="{ 'bg-gray-100': index % 2 === 1}">
                            <template v-for="(cell, key, index) in row">
                                <td class="px-4 py-2" :key="index" v-if="key !== 'contact_person_id'">{{ cell }}</td>
                            </template>
                            <td class="px-4 py-2">
                                <div class="h-full">
                                    <button class="hover:text-red-700 text-red-500 font-bold py-2 px-4 rounded" @click="deleteRow(row.intnr, row.contact_person_id)">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                                            <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clip-rule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="customerNotfound"  class="absolute top-0 justify-self-center p-4 mt-8 text-sm text-yellow-900 rounded-lg bg-yellow-100/80" role="alert">
                <span class="font-medium">Warning!</span><br> <span v-html="errorMessage"></span>
            </div>
        </div>
        
    </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';
import Papa from 'papaparse';

// Headers is used to display the table headers in a more readable way
const headers = ['#', 'First name', 'Last name', 'Company name', 'Country', 'Zip/City', 'Address', 'Actions'];

// Maps the headers to the corresponding database column so the sorting can be applied
const headersToDBMapping = {
    '#': 'intnr',
    'First name': 'first_name',
    'Last name': 'last_name',
    'Company name': 'company_name',
    'Country': 'country',
    'Zip/City': 'zip',
    'Address': 'street',
};

// Has do be defined outside of setup() because it is used in the beforeMount() property
let customerData = ref([]);
let filteredCustomerData = ref([]);
/**
 * TODO:
 * - Refactor code
 */
export default {
    beforeMount() {
        const response = axios.get('http://localhost:3000/getCustomers');
        response.then((response) => {
            console.log("all: ", response.data.allCustomers)
            customerData.value = response.data.allCustomers;
        });
    },
    setup() {
        const store = useStore();
        const user = store.getters.getUser;
        const customerNotfound = ref(false);
        const errorMessage = ref("");
        let search = ref("");
        let sortColumn = '';
        let sortOrder = 'asc';
        let sortableData = ref([]);
        const showMenu = ref(false);

  
        // Changes the data everytime the customerData changes
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

        /**
         * Watches the displayedCustomerData and updates the sortableData
         * This is necessary because the displayedCustomerData is a computed property but the Data has to be changed in order to sort it
         * and sorting cannot be done on the basic customerData because it is not in the correct format
         */
        watch(displayedCustomerData, (newVal) => {
            sortableData.value = [...newVal];
        }, { immediate: true });

        /**
         * Filters the data based on the search input
         * This is put in a separate computed property so the Code is more readable
         */
        filteredCustomerData = computed(() => {
            return sortableData.value.filter(row =>
                Object.values(row).some(value =>
                value.toString().toLowerCase().includes(search.value.toLowerCase())
                )
            );
        });

        /**
         * Sorts the data based on the column that is clicked
         * If its ascending and descending is depending on the last sort
         * 
            TODO:
            - represent sort order in UI

         * @param {string} column The column that is clicked
         */
        const sort = (column) => {
            if (sortColumn === column) {
            sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
            sortColumn = column;
            sortOrder = 'asc';
            }

            sortableData.value.sort((a, b) => {
                const valueA = a[headersToDBMapping[column]];
                const valueB = b[headersToDBMapping[column]];
                if (sortOrder === 'asc') {
                    return valueA < valueB ? -1 : 1;
                } else {
                    return valueA > valueB ? -1 : 1;
                }
            });
        };


        /*const sort = (column) => {
            console.log("sortorder:", sortOrder);
            if (sortColumn === column) {
                sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortOrder = 'asc';
            }

            filteredCustomerData.value.sort((a, b) => {
                console.log("sorting: ", headersToDBMapping[column], " ", sortOrder, " ", a[headersToDBMapping[column]], " ", b[headersToDBMapping[column]]);
                const valueA = a[column];
                const valueB = b[column];
                if (sortOrder === 'asc') {
                return valueA < valueB ? -1 : 1;
                } else {
                return valueA > valueB ? -1 : 1;
                }
            });
        }*/

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

        return { user, handleFileUpload, deleteRow, customerData, headers, displayedCustomerData, customerNotfound, errorMessage, search, filteredCustomerData, sort, showMenu };
    },
};
</script>

<style>

</style>