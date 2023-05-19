// DB confuguratiuon
const mongoose = require('mongoose');
const URI = 'mongodb://127.0.0.1:27017/otpLogin';


mongoose.connect(URI);

const db = mongoose.connection;

db.on('error', console.error.bind(console, "Error in connecting to DB"));

db.on('open', ()=>console.log("Suesfully connected to DB"));