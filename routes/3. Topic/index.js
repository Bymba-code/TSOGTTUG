const express   = require("express")
const GET_ALL_TOPIC = require("../../Controllers/3. Topic/1. GET")
const GET_SINGLE_TOPIC = require("../../Controllers/3. Topic/2. GET_SINGLE")
const INSERT_TOPIC = require("../../Controllers/3. Topic/3. INSERT")
const Authenticate = require("../../Middlewares/authenticate")
const Authorize = require("../../Middlewares/authorization")
const DELETE_TOPIC = require("../../Controllers/3. Topic/4. DELETE")
const UPDATE_TOPIC = require("../../Controllers/3. Topic/5. UPDATE")

const router = express.Router()

router.route("/topic")
.get(GET_ALL_TOPIC)
.post(Authenticate, Authorize(["admin"]), INSERT_TOPIC)

router.route("/topic/:id")
.get(GET_SINGLE_TOPIC)
.delete(Authenticate, Authorize(["admin"]), DELETE_TOPIC)
.put(Authenticate, Authorize(["admin"]), UPDATE_TOPIC)

module.exports = router