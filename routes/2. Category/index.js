const express = require("express")
const Authenticate = require("../../Middlewares/authenticate")
const Authorize = require("../../Middlewares/authorization")

const GET_ALL_CATEGORY = require("../../Controllers/2. Category/1.GET_ALL")
const GET_SINGLE_CATEGORY = require("../../Controllers/2. Category/2. GET_SINGLE")
const INSERT_CATEGORY = require("../../Controllers/2. Category/3. INSERT")
const DELETE_CATEGORY = require("../../Controllers/2. Category/4. DELETE")
const UPDATE_CATEGORY = require("../../Controllers/2. Category/5. UPDATE")

const router = express.Router()

router.route("/category")
.get(Authenticate, GET_ALL_CATEGORY)
.post(Authenticate, Authorize(["admin"]), INSERT_CATEGORY)


router.route("/category/:id")
.get(GET_SINGLE_CATEGORY)
.delete(Authenticate, Authorize(["admin"]), DELETE_CATEGORY)
.put(Authenticate, Authorize(["admin", "student"]) , UPDATE_CATEGORY)

module.exports = router