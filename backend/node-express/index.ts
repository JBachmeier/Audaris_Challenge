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


/**
 * TODO:
 * - Check for input lenght!
 */
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

// Start the server
startServer();