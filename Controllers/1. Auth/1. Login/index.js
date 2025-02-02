const prisma = require("../../../Middlewares/prisma")
const bcrypt = require("bcrypt")
require("dotenv").config()
const jwt = require("jsonwebtoken")

const LOGIN = async (req, res) => {
    try 
    {
        const {username, password} = req.body;

        // 1. Талбар шалгах
        if(!username)
        {
            return res.status(404).json({
                success:false,
                data: [],
                message: "Хэрэглэгчийн нэр оруулна уу."
            })
        } 

        if(!password)
        {
            return res.status(400).json({
                success:false,
                data: [],
                message: "Нууц үг оруулна уу."
            })
        }

        // 2. Бүртгэлтэй хэрэглэгч эсэхийг шалгах
        const user = await prisma.users.findFirst({
            where: {
              username: username,
            },
        });

        if(!user)
        {
            return res.status(404).json({
                success:false,
                data: [],
                message: "Хэрэглэгчийн бүртгэл устсан эсвэл байхгүй байна."
            })
        }

        // 3. Хэрэглэгчийн хандах хугацааг шалгах
        const today = new Date()

        if(user.end_date <= today)
        {
            return res.status(403).json({
                success:false,
                data: [],
                message: "Таны ашиглах хугацаа дууссан байна."
            })
        }

        // 4. Нууц үгийг шалгах

        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword)
        {
            return res.status(403).json({
                success:false,
                data: [],
                message: "Хэрэглэгчийн нууц үг буруу байна."
            })
        }

        // 5. Токен бэлтгэх
        const key = process.env.TOKEN_SECRET
        
        const expiresIn = "12h"

        const data = {
            id:user.id,
            role:user.role,
            endDate:user.end_date
        }

        const token = jwt.sign(data, key, {expiresIn: expiresIn})


        return res.status(200).json({
            success:true,
            data: token,
            message: "Амжилттай нэвтэрлээ."
        })
    }
    catch(err)
    {
        return res.status(500).json({
            success:false,
            data: [],
            message: "Серверийн алдаа гарлаа." + " " + err
        })
    }
} 

module.exports = LOGIN