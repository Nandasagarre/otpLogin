const express = require('express');
const db = require('./Config/Db');
const port = 4000;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', require('./Routers/index'));

app.listen(port, (err) => {
    if (err) {
      return  console.log('Error in connecting to port');
    }
    console.log(`Connected to ${port}`);
})