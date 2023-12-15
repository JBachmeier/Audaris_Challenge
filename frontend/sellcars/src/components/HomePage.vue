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
            <h2>processed CSV Data:</h2>
            <table>
                <tr>
                    <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
                </tr>
                <tr v-for="(row, index) in customerData" :key="index">
                    <td v-for="(cell, index) in row" :key="index">{{ cell }}</td>
                </tr>
            </table>
            
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useStore } from 'vuex';
import axios from 'axios';
import Papa from 'papaparse';

export default {
    setup() {
        const store = useStore();
        const user = store.getters.getUser;
        const customerData = ref([]);
        const headers = ['intnr', 'type', 'contact_person', 'address'];

        console.log(user);

        const handleFileUpload = async (event) => {
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
                    await emitCustomersToServer(result.data);
                } catch (error) {
                    console.error("Error parsing CSV:", error);
                }
            } else {
                console.warn("No file selected.");
            }
        };

        const emitCustomersToServer = async (csvData) => {
        try {
          const response = await axios.post('http://localhost:3000/customersUpload', csvData);

          console.log("repsonseData:", response.data.allCustomers[0]);
          customerData.value = response.data.allCustomers;

        } catch (error) {
          console.log(error);
        }
      };

        return { user, handleFileUpload, emitCustomersToServer, customerData, headers };
    },
};


/*export default {
    setup(){
        const store = useStore();
        const user = store.getters.getUser;
        const csvData = ref([]);
        const parsed = ref(false);

        console.log(user)

        const handleFileUpload = async (event) => {
            const selectedFile = event.target.files[0];
            console.log(selectedFile)
            if (selectedFile.size > 0) {
                console.log("File name:", selectedFile.name);
                console.log("File size:", selectedFile.size, "bytes");
                await Papa.parse(selectedFile, {
                    complete: (result) => {
                        console.log("Parsing...")
                        csvData.value = result;
                        parsed.value = true;
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
        };


        return { user, handleFileUpload };
    }
}*/
</script>

<style>

</style>