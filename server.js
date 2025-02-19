require("dotenv").config()
const express = require("express")
const cors = require("cors")

const helmet = require("helmet");


const authRoutes = require("./routes/1. Auth")
const categoryRoutes = require("./routes/2. Category")
const topicRoutes = require("./routes/3. Topic")
const testRouter = require("./routes/4. Test")
const examRouter = require("./routes/5. Exam")
const answerRouter = require("./routes/6. Answers")
const userRouter = require("./routes/7. User")
const userCategoryRouter = require("./routes/8. UserCategory")

const app = express()


const corsOptions = {
    origin: ["http://localhost:5173", "https://omn1club.com", "https://system.tsogttsug.com", "https://admin.tsogttsug.com", "https://tsogttsug.com", "https://student.tsogttsug.com"], 
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization,",
};
app.use(cors(corsOptions));

app.use("/uploads", express.static("uploads"));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1" , authRoutes)
app.use("/api/v1", categoryRoutes)
app.use("/api/v1" , topicRoutes)
app.use("/api/v1", testRouter)
app.use("/api/v1", examRouter)
app.use("/api/v1", answerRouter)
app.use("/api/v1", userRouter)
app.use("/api/v1", userCategoryRouter)




app.listen(process.env.PORT , () => {
    console.log("APP LISTENING " + " " + process.env.PORT)
})
