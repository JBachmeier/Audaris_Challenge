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
  // TODO: add address field referencing the Address in the addresses array
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

// Middleware to parse JSON in the request body
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true,
}));



// Route to handle the POST request
app.post('/userLogin', async (req: Request, res: Response) => {
  const receivedData = req.body;

  try {
    // Log the received data
    console.log('Received data:', receivedData);

    const { usrname } = receivedData;
    const { password } = receivedData;

    const hashedPW = hasher.hashPassword(password)
    let date: Date = new Date(); 
    
    // Find the user
    const user = await users.findOneAndUpdate({ 'email': usrname, 'password_hash':  hashedPW}, {'updated_at': date}, {returnDocument: 'before'}).exec();
    
    if (user) {
      console.log('User found:', user.first_name);
      console.log(date)
      res.status(200).json({lastLogin: user.updated_at, message: 'User found', user });
    } else {
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
 * - save data to DB
 */
app.post('/customersUpload',async (req: Request, res: Response) => {
  const receivedCSV = req.body;
  let allCustomers = [];
  
  try {
    console.log('Received data:', receivedCSV);

    /* if no header present:
    
    const csvHeader = receivedCSV[0];
    const csvData = receivedCSV.slice(1);
    */

    for (let row of receivedCSV) {
      /* if no header present:
      const customer = {
        intnr: row[0],
        type: row[1],
        contact_persons: [{
          first_name: row[2],
          last_name: row[3],
          email: row[4],
          mobile_phone: row[5],
          birth_date: row[6]
        }],
        addresses: [{
          company_name: row[7],
          country: row[8],
          city: row[9],
          zip: row[10],
          fax: row[11],
          phone: row[12],
          street: row[13],
          email: row[14]
        }]
      };*/

      
      const customer = {
        intnr: row.intnr,
        type: row.type,
        contact_persons: [{
            first_name: row.first_name,
            last_name: row.last_name,
            email: row.email,
            mobile_phone: row.mobile_phone,
            birth_date: row.birth_date
        }],
        addresses: [{
            company_name: row.company_name,
            country: row.country,
            city: row.city,
            zip: row.zip,
            fax: row.fax,
            phone: row.phone,
            street: row.street,
            email: row.email_1
        }]
    };

      allCustomers.push(customer);

    }
    
    

    customersModel.insertMany(allCustomers);

    console.log("all Customers", allCustomers);
    console.log("first Customer", allCustomers[0]);
    console.log("first Customers contact Persons", allCustomers[0].contact_persons);
    res.status(200).json({ message: 'CSV uploaded' , allCustomers});

  } catch (error){
    console.error(error)
  }
});

function validateCustomerData(customer: any): boolean {
  if(customer.intnr.length != 10){
    return false;
  }
  if(customer.type != "PRIVATE" && customer.type != "COMPANY" && customer.type != "DEALER"){
    return false;
  }
  if(customer.contact_persons.length != 1){
    return false;
  }
}

// Start the server
startServer();