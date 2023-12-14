<template>
    <div class="w-screen h-screen bg-white grid grid-cols-4">
        <div class="">
            <p>User</p>
            <p>{{ user.email }}</p>
            <p>Last Login: {{ user.updated_at }}</p><br>
            <input type="file" ref="file" accept=".csv" maxlength="512000" class="hidden" @change="handleFileUpload"/>
            <button @click="$refs.file.click()" class="bg-gray-500 p-2 border-2 rounded-md">Import customers (.cvs)</button>
        </div>
        <div class="w-full col-span-3 bg-gray-200">
            <p>Customers</p>
            <input class="border py-1 pl-1 rounded-sm" type="text" id="customer" placeholder="Search by all columns" >
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
//import axios from 'axios';
import Papa from 'papaparse';


export default {
    setup(){
        const store = useStore();
        const user = store.getters.getUser;
        const csvData = ref(null);

        console.log(user)

        const handleFileUpload = (event) => {
            const selectedFile = event.target.files[0];
            console.log(selectedFile)
            if (selectedFile.size > 0) {
                console.log("File name:", selectedFile.name);
                console.log("File size:", selectedFile.size, "bytes");
                Papa.parse(selectedFile, {
                    complete: (result) => {
                    csvData.value = result.data;
                    },
                    header: true, // Set to true if the CSV file has a header row
                });
            } else {
                console.warn("No file selected.");
            }
            console.log(csvData)
        }
        /* This is for getting the CustomerData (no Data avialable yet so not implemented!) 
        const getCustomersFromServer = async () => {
            try {
                const response = await axios.get('http://localhost:3000/userLogin');
                console.log(response)
            } catch (error) {
                console.log(error);
            }
        };*/


        return { user, handleFileUpload };
    }
}
</script>

<style>

</style>