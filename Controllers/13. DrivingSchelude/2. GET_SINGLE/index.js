const prisma = require('../../../Middlewares/prisma')

const GET_SINGLE_DRIVING_SCHELUDE = async (req, res) => {
    try 
    {
        const {id} = req.params;

        if(!id || isNaN(id) || id === undefined)
        {
            return res.status(403).json({
                success:false,
                data:[],
                message: "Хүсэлтийн мэдээлэл дутуу байна эсвэл буруу байна."
            })
        }

        const data = await prisma.driving_schelude.findUnique({
            where:
            {
                id: parseInt(id)
            },
            include: {
                teacher_driving_schelude_teacherToteacher:true,
                category_driving_schelude_categoryTocategory:true,
                users:true
            }
        })
        
        if(!data)
        {
            return res.status(404).json({
                success:false,
                data:[],
                message: "Мэдээлэл олдсонгүй."
            })
        }
        
        return res.status(200).json({
            success:true,
            data:data,
            message:"Амжилттай"
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

module.exports = GET_SINGLE_DRIVING_SCHELUDE