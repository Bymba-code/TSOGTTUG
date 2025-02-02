const express = require("express")

const GET_ALL_TEST = require("../../Controllers/4. Test/1. GET")
const GET_SINGLE_TEST = require("../../Controllers/4. Test/2. GET_SINGLE")
const INSERT_TEST = require("../../Controllers/4. Test/3. INSERT")
const DELETE_TEST = require("../../Controllers/4. Test/4. DELETE")
const UPDATE_TEST = require("../../Controllers/4. Test/5. UPDATE")

const Authenticate = require("../../Middlewares/authenticate")
const Authorize = require("../../Middlewares/authorization")


const router = express.Router()

router.route("/test")
.get(GET_ALL_TEST)
.post(Authenticate, Authorize(["admin"]), INSERT_TEST)

router.route("/test/:id")
.get(GET_SINGLE_TEST)
.delete(Authenticate, Authorize(["admin"]), DELETE_TEST)
.put(Authenticate, Authorize(["admin"]), UPDATE_TEST)


module.exports = router