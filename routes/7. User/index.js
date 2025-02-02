const express = require("express")
const GET_ALL_USERS = require("../../Controllers/7. Users/1. GET")

const Authenticate = require("../../Middlewares/authenticate")
const Authorize = require("../../Middlewares/authorization")
const GET_SINGLE_USERS = require("../../Controllers/7. Users/2. GET_SINGLE")
const INSERT_USERS = require("../../Controllers/7. Users/3. INSERT")
const DELETE_USERS = require("../../Controllers/7. Users/4. DELETE")
const UPDATE_USERS = require("../../Controllers/7. Users/5. UPDATE")

const router = express.Router()

router.route("/users")
.get(Authenticate, Authorize(["admin"]), GET_ALL_USERS)
.post(Authenticate, Authorize(["admin"]), INSERT_USERS)

router.route("/users/:id")
.get(GET_SINGLE_USERS)
.delete(Authenticate, Authorize(["admin"]), DELETE_USERS)
.put(Authenticate, Authorize(["admin"]), UPDATE_USERS)

module.exports = router