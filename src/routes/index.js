const express = require('express');
const { getAllAttendee, register, login, attendee } = require('../api/userData');
const router = express.Router();
const { verifyToken } = require('../helper/autenticateToken')

const path = "/api";
router
    // GET
    // .get(`${path}/attendee`, getAllAttendee)
    // POST
    .post(`${path}/register`, register)
    .post(`${path}/login`, login)
    .get(`${path}/attendee`, verifyToken, attendee)

module.exports = router;