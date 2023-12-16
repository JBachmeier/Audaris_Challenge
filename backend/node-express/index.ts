/**
 * TODO:
 * - Refactor Database!
 * - Refactor Events (POST,GET,...)
 */

import {Schema} from 'mongoose';
import { Request, Response } from 'express';
import Hasher from './hash';

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const hasher = new Hasher();

const app = express();
const port = 3000;

let errorMessage: string = "";

let users: any = null;

const userSchema = new Schema({
  first_name: {type: String, maxlength: [50, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']},
  last_name: {type: String, maxlength: [50, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']},
  password_hash: {type: String, maxlength: [32, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']},
  email: {type: String, maxlength: [75, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']},
  created_at: Date,
  updated_at: Date,
});

// MULTIPLE MODELS
const addressSchema = new Schema({
  company_name: {type: String, maxlength: [50, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']}, //Set this field only if type is COMPANY or DEALER
  country: {type: String, maxlength: [50, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']},
  city: {type: String, maxlength: [50, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']},
  zip: {type: String, maxlength: [5, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']},
  fax: {type: String, maxlength: [20, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']}, //Set this field only if type is COMPANY or DEALER
  phone: {type: String, maxlength: [20, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']}, //Set this field only if type is COMPANY or DEALER
  street: {type: String, maxlength: [100, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']},
  email: {type: String, maxlength: [50, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']} //Set this field only if type is COMPANY or DEALER
});

    
const contactPersonSchema = new Schema({
  first_name: {type: String, maxlength: [50, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']},
  last_name: {type: String, maxlength: [50, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']},
  email: {type: String, maxlength: [50, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']},
  mobile_phone: {type: String, maxlength: [20, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']},
  birth_date: Date,
  address: { type: Schema.Types.ObjectId, ref: 'Address', default: null },
});

const customerSchema = new Schema({
  intnr: {type: String, maxlength: [10, 'The value of path `{PATH}` (`{VALUE}`) exceeds the maximum allowed length ({MAXLENGTH}).']},
  type: {
    type: String,
    enum: {
      values: ['PRIVATE', 'COMPANY', 'DEALER'],
      message: '`{VALUE}` is not a valid enum value for path `{PATH}`.'
    },
  },
  contact_persons: [contactPersonSchema],
  addresses: [addressSchema],
  created_at: Date,
  updated_at: Date,
});

const customersModel = mongoose.model('Customer', customerSchema);
//const addressModel = new mongoose.model('Address', addressSchema);

async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect("mongodb://127.0.0.1:27017/sellcars").then(() => {console.log("connected to DB!")});

    users = mongoose.model('User', userSchema);

    // Start the Express server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

// Middleware to parse JSON in the request body
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));



// Route to handle the POST request
app.post('/userLogin', async (req: Request, res: Response) => {
  const { usrname, password } = req.body;

  try {

    const hashedPW = hasher.hashPassword(password)
    
    // Find the user
    const user = await users.findOneAndUpdate({ 'email': usrname, 'password_hash':  hashedPW}, {'updated_at': new Date()}, {returnDocument: 'before'}).exec();
    
    if (user) {
      console.log('User found:', user.first_name);
      res.status(200).json({
        message: 'User found', 
        user: {
          // Only return necessary user information
          id: user._id,
          username: user.email,
          lastLogin: user.updated_at,
        }
      });    } else {
      console.log('User not found');
      res.status(401).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * TODO:
 * - Implement validation system
 * - Implement error handling
 */
app.post('/customersUpload',async (req: Request, res: Response) => {
  const receivedCSV = req.body;
  let allCustomersFormatted = [];
  errorMessage = "";

  const allCustomersPre = await customersModel.find();

  console.log("all Customers Pre", allCustomersPre)
  try {
    console.log('Received data:', receivedCSV);

    for (let row of receivedCSV) {
      if(allCustomersPre){
        console.log("model found");
        if(allCustomersPre.find((customer: any) => customer.intnr == row.intnr)){
          console.log("Customer with ID: " + row.intnr + " already exists");
          errorMessage += "Customer with ID: " + row.intnr + " already exists\n";
          continue;
        }
      }
    /*const address = new mongoose.model('Address', addressSchema)({
      company_name: row.company_name,
      country: row.country,
      city: row.city,
      zip: row.zip,
      fax: row.fax,
      phone: row.phone,
      street: row.street,
      email: row.email_1
    });
    await address.save();*/

    const address = {
      company_name: row.company_name,
      country: row.country,
      city: row.city,
      zip: row.zip,
      fax: row.fax,
      phone: row.phone,
      street: row.street,
      email: row.email_1
    };

    //const createdAddress = await addressModel.create(address);

    // Create the customer with a reference to the address
    const customer = {
        intnr: row.intnr,
        type: row.type,
        contact_persons: [{
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            mobile_phone: row.mobile_phone,
            birth_date: row.birth_date,
        }],
        addresses: address, // Add the Address to the addresses array directly instead of referencing (see asignment)
        created_at: new Date(),
        updated_at: new Date(),
      };

    allCustomersFormatted.push(customer);

    }

    await customersModel.insertMany(allCustomersFormatted);    

    const allCustomers = await customersModel.find();

    console.log("all Customers", allCustomers);

    // Add the address-reference to the contact person
    // this has to be done AFTER the customers are created, due to the creation of the id by MongoDB
    for (let customer of allCustomers) {
      customer.contact_persons[0].address = customer.addresses[0]._id;
      await customer.save();
    }

    

    //console.log("all Customers", allCustomersFormatted);
    //console.log("first Customer", allCustomersFormatted[0]);
    //console.log("first Customers contact Persons", allCustomersFormatted[0].contact_persons);
    res.status(200).json({ message: 'CSV uploaded' , allCustomers, errorMessage: errorMessage});

  } catch (error){
    console.error(error)
  }
});

/**
 * TODO:
 * - Implement error handling
 */

app.post('/contactsUpload',async (req: Request, res: Response) => {
  const receivedCSV = req.body;
  errorMessage = "";
   

  try {
    console.log('Received data:', receivedCSV);

    for (let row of receivedCSV) {
     
    // Create the contact person (types have to be declared, so address can be null)
    const contact_person: {
      first_name: string;
      last_name: string;
      email: string;
      mobile_phone: string;
      birth_date: string;
      address: string | null;
    } = {
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      mobile_phone: row.mobile_phone,
      birth_date: row.birth_date,
      address: null,
    };

    const customer = await customersModel.findOne({ intnr: row.intnr });

    if (!customer) {
      //res.status(404).json({ message: 'Customer not found' });
      //return;
      errorMessage += "Customer not found for ID: " + row.intnr + "\n";
      continue;
    } else{
      console.log("customer found");
      customer.contact_persons.push(contact_person);
      customer.updated_at = new Date();
      await customer.save();
    }

    }

    const allCustomers = await customersModel.find();

    console.log("all Customers", allCustomers);

    console.log("first Customers contact", allCustomers[0].contact_persons);
    res.status(200).json({ message: 'Contacs uploaded' , allCustomers, errorMessage: errorMessage});

  } catch (error){
    console.error(error)
  }
});

/**
 * TODO:
 * - Implement error handling
 */

app.post('/addressesUpload',async (req: Request, res: Response) => {
  const receivedCSV = req.body;
  errorMessage = "";

  try {
    console.log('Received data:', receivedCSV);

    for (let row of receivedCSV) {
     
    const address = {
      company_name: row.company_name,
      country: row.country,
      city: row.city,
      zip: row.zip,
      fax: row.fax,
      phone: row.phone,
      street: row.street,
      email: row.email
    };

    const customer = await customersModel.findOne({ intnr: row.intnr });

    if (!customer) {
      //res.status(404).json({ message: 'Customer not found' });
      //return;
      errorMessage += "Customer not found for ID: " + row.intnr + "\n";
      continue;
    } else{
      customer.addresses.push(address);
      customer.updated_at = new Date();
      await customer.save();
    }

    }

    const allCustomers = await customersModel.find();

    console.log("all Customers", allCustomers);

    console.log("all addresses", receivedCSV);
    console.log("first address", receivedCSV[0]);
    res.status(200).json({ message: 'addresses uploaded' , allCustomers, errorMessage: errorMessage});

  } catch (error){
    console.error(error)
  }
});

app.delete('/deleteRow',async (req: Request, res: Response) => {
  const rowToDelete = req.body;
  errorMessage = "";

  try {
    console.log('Received row:', rowToDelete.intnr);

    // Delete the contact person from contact_persons array
    // if the contact person is the only one, delete the whole customer
    const customer = await customersModel.findOne({ intnr: rowToDelete.intnr });
    console.log(customer.contact_persons.length);
    if(customer.contact_persons.length == 1){
      await customersModel.deleteOne({ intnr: rowToDelete.intnr });
    } else{
      customer.contact_persons.pull({ _id: rowToDelete._id });
      await customer.save();
    }

    //await customersModel.deleteOne({ intnr: rowToDelete.data.intnr });

    const allCustomers = await customersModel.find();
    
    res.status(200).json({ message: 'row deleted', allCustomers});

  } catch (error){
    console.error(error)
  }
});

// Start the server
startServer();