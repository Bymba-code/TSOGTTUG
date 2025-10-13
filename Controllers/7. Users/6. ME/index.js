const prisma = require("../../../Middlewares/prisma")
const bcrypt = require("bcrypt")

const USERS_ME = async (req , res) => {
    try 
    {
        const userId = req.user.id

        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                first_name: true,
                last_name: true,
                register: true,
                role: true,
                create_date: true,
                end_date: true
            }
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Хэрэглэгч олдсонгүй."
            })
        }

        return res.status(200).json({
            success: true,
            data: user,
            message: "Амжилттай."
        })
    }
    catch(err)
    {
        return res.status(500).json({
            success:false,
            data:[],
            message: "Серверийн алдаа гарлаа." + err
        })
    }
}

module.exports = USERS_ME