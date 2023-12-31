/**
 * TODO:
 * - Refactor Database!
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

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));



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

app.get('/getCustomers', async (req: Request, res: Response) => {
  try {
    const allCustomers = await customersModel.find();
    console.log("all Customers", allCustomers);
    res.status(200).json({ message: 'Customers found' , allCustomers});

  } catch (error) {
    console.error('Error finding customers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * TODO:
 * - Implement validation system (email format correct, phone number, company_name + fax + phone + email only for type COMPANY or DEALER, ...)
 * - Implement error handling 
 */
app.post('/customersUpload',async (req: Request, res: Response) => {
  const receivedCSV = req.body;
  let allCustomersFormatted: { intnr: any; type: any; contact_persons: { first_name: any; last_name: any; email: any; mobile_phone: any; birth_date: any; }[]; addresses: { company_name: any; country: any; city: any; zip: any; fax: any; phone: any; street: any; email: any; }; created_at: Date; updated_at: Date; }[] = [];
  errorMessage = "";

  const allCustomersPre = await customersModel.find();

  console.log("all Customers Pre", allCustomersPre)
  try {
    console.log('Received data:', receivedCSV);

    for (let row of receivedCSV) {
      if(allCustomersPre){
        if(allCustomersPre.find((customer: any) => customer.intnr == row.intnr)){
          console.log("Customer with ID: " + row.intnr + " already exists");
          errorMessage += "Customer with ID: " + row.intnr + " already exists<br>";
          continue;
        }
      }
      if(allCustomersFormatted){
        if(allCustomersFormatted.some((customer: any) => customer.intnr == row.intnr)){
              console.log("Customer with ID: " + row.intnr + " can't be created mulitple times");
              errorMessage += "Customer with ID: " + row.intnr + " can't be created mulitple times<br>";
              continue;
        }
      }
      

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
        addresses: address,
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

    res.status(200).json({ message: 'CSV uploaded' , allCustomers, errorMessage: errorMessage});

  } catch (error){
    console.error(error)
    res.status(500).json({ message: 'Internal server error' , error: error});
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

    res.status(200).json({ message: 'Contacs uploaded' , allCustomers, errorMessage: errorMessage});

  } catch (error){
    res.status(500).json({ message: 'Internal server error' , error: error});
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
      errorMessage += "Customer not found for ID: " + row.intnr + "\n";
      continue;
    } else{
      customer.addresses.push(address);
      customer.updated_at = new Date();
      await customer.save();
    }

    }

    const allCustomers = await customersModel.find();

    res.status(200).json({ message: 'addresses uploaded' , allCustomers, errorMessage: errorMessage});

  } catch (error){
    console.error(error)
  }
});

app.delete('/deleteRow',async (req: Request, res: Response) => {
  const rowToDelete = req.body;
  console.log("rowToDelete", rowToDelete);
  errorMessage = "";

  try {
    console.log('Received row:', rowToDelete.intnr);

    const customer = await customersModel.findOne({ intnr: rowToDelete.intnr });

    // Delete the contact person from contact_persons array
    customer.contact_persons.pull({ _id: rowToDelete._id });
    await customer.save();

    const allCustomers = await customersModel.find();
    
    res.status(200).json({ message: 'row deleted', allCustomers});

  } catch (error){
    console.error(error)
  }
});

/**
 * TODO:
 * - Implement validation of data
 */
app.put('/updateCustomer',async (req: Request, res: Response) => {
  const customerToUpdate = req.body;
  console.log("customerToUpdate", customerToUpdate);

  try {
    let customer = await customersModel.findOneAndUpdate({ intnr: customerToUpdate.intnr }, customerToUpdate);

    customer.updated_at = new Date();

    const allCustomers = await customersModel.find();
    console.log("all Customers updated: ", allCustomers);
    res.status(200).json({ message: 'row deleted', allCustomers});
  } catch (error){
    console.error(error)
  }

  
});

// Start the server
startServer();