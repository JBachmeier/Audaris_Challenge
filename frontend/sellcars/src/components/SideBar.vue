<template>
    <div class="flex flex-col h-full items-start">
      <p class="ml-3 mt-3 text-lg text-gray-600 font-bold">{{ user.username }}</p>
      <p class="text-xs ml-3 text-gray-600">Last Login: {{ user.lastLogin }}</p><br><br>
      <p class="self-center">Customer CSV uploads</p>
      <div class="grid flex-grow self-center">
          <input type="file" id="customersfile" ref="customersfile" accept=".csv" maxlength="512000" class="hidden" @change="handleFileUpload"/>
          <button @click="$refs.customersfile.click()" class="bg-gray-500 p-2 border-2 rounded-md m-5">Upload customers</button>
          <input type="file" id="contactfile" ref="contactfile" accept=".csv" maxlength="512000" class="hidden" @change="handleFileUpload"/>
          <button @click="$refs.contactfile.click()" class="bg-gray-500 p-2 border-2 rounded-md m-5">Upload contact persons</button>
          <input type="file" id="addressfile" ref="addressfile" accept=".csv" maxlength="512000" class="hidden" @change="handleFileUpload"/>
          <button @click="$refs.addressfile.click()" class="bg-gray-500 p-2 border-2 rounded-md m-5">Upload addresses</button>
      </div>
    </div>
  </template>

<script>
import axios from 'axios';
import Papa from 'papaparse';

export default {
    name: 'SideBar',
    emits: ['update:customerDataProp', 'update:customerNotfoundProp', 'update:fatalErrorProp', 'update:errorMessageProp'],
    props: {
        userProp: {
            type: Object,
        },
        customerDataProp: {
            type: Array,
        },
        customerNotfoundProp: {
            type: Boolean,
        },
        fatalErrorProp: {
            type: Boolean,
        },
        errorMessageProp: {
            type: String,
        }
    },
    setup(props, {emit} ) {

        const handleFileUpload = async (event) => {
            const selectedFile = event.target.files[0];
            if (selectedFile.size > 0) {
                try {
                    const result = await new Promise((resolve) => {
                        Papa.parse(selectedFile, {
                            complete: (result) => resolve(result),
                            header: true,
                        });
                    });

                    if(event.target.id === "customersfile"){
                        await emitCustomersToServer(result.data, props, emit);
                    } else if(event.target.id === "contactfile"){
                        await emitContactsToServer(result.data, props, emit);
                    } else if(event.target.id === "addressfile"){
                        await emitAddressesToServer(result.data, props, emit);
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
                const response = await axios.post('http://localhost:3000/customersUpload', csvData);

                console.log("Response: ", response);
                emit('update:customerDataProp', response.data.allCustomers);

                if(response.data.errorMessage !== ""){
                    emit('update:customerNotfoundProp', true);
                    emit('update:errorMessageProp', response.data.errorMessage)
                }

            } catch (error) {
                console.log(error);
                emit('update:fatalErrorProp', true);
                emit('update:errorMessageProp', error.response.data.error.message);
                console.log(error.response.data.error.errors.type);
            }
        };

        const emitContactsToServer = async (csvData) => {
            try {
                const response = await axios.post('http://localhost:3000/contactsUpload', csvData);

                if(response.data.errorMessage !== ""){
                    emit('update:customerNotfoundProp', true);
                    emit('update:errorMessageProp', response.data.errorMessage)
                }

                emit('update:customerDataProp', response.data.allCustomers);

            } catch (error) {
            console.log(error);
            }
        };
        const emitAddressesToServer = async (csvData) => {
            try {
                const response = await axios.post('http://localhost:3000/addressesUpload', csvData);

                if(response.data.errorMessage !== ""){
                    emit('update:customerNotfoundProp', true);
                    emit('update:errorMessageProp', response.data.errorMessage)
                }
                emit('update:customerDataProp', response.data.allCustomers);

            } catch (error) {
            console.log(error);
            }
        };

        return { handleFileUpload, user: props.userProp };
    },
}
</script>

<style>

</style>