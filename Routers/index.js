const express = require('express');
const routes = express.Router();

const userController = require('../Controllers/index');

routes.get('/', (req, res) => {
    res.json({
        message: 'site is up and set up done'
        })
});

routes.post('/create', userController.createUser);
routes.post('/verify', userController.verifyOtp);
routes.get('/getotp', userController.getOtp)
module.exports = routes;