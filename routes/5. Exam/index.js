const express = require("express")

const GET_ALL_EXAM = require("../../Controllers/5. Exam/1. GET")
const GET_SINGLE_EXAM = require("../../Controllers/5. Exam/2. GET_SINGLE")

const Authenticate = require("../../Middlewares/authenticate")
const Authorize = require("../../Middlewares/authorization")
const INSERT_EXAM = require("../../Controllers/5. Exam/3. INSERT")
const DELETE_EXAM = require("../../Controllers/5. Exam/4. DELETE")
const UPDATE_TEST = require("../../Controllers/5. Exam/5. UPDATE")

const router = express.Router()

router.route("/exam")
.get(Authenticate, Authorize(["admin"]), GET_ALL_EXAM)
.post(Authenticate, INSERT_EXAM)

router.route("/exam/:id")
.get(GET_SINGLE_EXAM)
.delete(Authenticate, DELETE_EXAM)
.put(UPDATE_TEST)

module.exports = router