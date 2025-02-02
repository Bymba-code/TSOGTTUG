const express = require("express")
const LOGIN = require("../../Controllers/1. Auth/1. Login")
const REGISTER = require("../../Controllers/1. Auth/2. Register")
const Authenticate = require("../../Middlewares/authenticate")
const Authorize = require("../../Middlewares/authorization")

const router = express.Router()

router.route("/login").post(LOGIN)

router.route("/register").post(Authenticate, Authorize(["admin"]), REGISTER)

module.exports = router